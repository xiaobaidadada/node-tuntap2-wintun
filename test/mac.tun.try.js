const { MacTunAddon } = require("../dist");
const { read } = require("node:fs");

// 创建 TUN
const { fd, name } = MacTunAddon.createTun();
console.log('TUN fd:', fd, 'name:', name);

// 设置虚拟 IP
MacTunAddon.setIPv4('10.0.0.1', '10.0.0.2');

// 配置全局路由 / mask
MacTunAddon.applyGlobalMask({ subnet: "192.168.100.0/24" }, name);

// 循环读取标志
let running = true;

// 解析 IPv4 包
function parseIPv4(ipBuf) {
    if (ipBuf.length < 20) return null;

    const version = ipBuf[0] >> 4;
    if (version !== 4) return null;

    const headerLength = (ipBuf[0] & 0x0f) * 4;
    const protocol = ipBuf[9];
    const srcIP = ipBuf.slice(12, 16).join('.');
    const dstIP = ipBuf.slice(16, 20).join('.');

    return { srcIP, dstIP, protocol, headerLength };
}

// 解析 IPv6 包
function parseIPv6(ipBuf) {
    if (ipBuf.length < 40) return null;

    const version = ipBuf[0] >> 4;
    if (version !== 6) return null;

    const payloadLength = ipBuf.readUInt16BE(4);
    const nextHeader = ipBuf[6];
    const srcIP = Array.from(ipBuf.slice(8, 24)).map(x => x.toString(16).padStart(2, '0')).join(':');
    const dstIP = Array.from(ipBuf.slice(24, 40)).map(x => x.toString(16).padStart(2, '0')).join(':');

    return { srcIP, dstIP, protocol: nextHeader, payloadLength };
}

// 异步循环读取数据包
function readLoop() {
    if (!running) return;

    const buffer = Buffer.alloc(2000);
    read(fd, buffer, 0, buffer.length, null, (err, bytesRead, buf) => {
        if (err) {
            console.error('Read error:', err);
            setImmediate(readLoop);
            return;
        }

        if (bytesRead > 0) {
            // macOS UTUN 每个包前 4 字节是 packet family
            const packetFamily = buf.readUInt32BE(0);
            const ipBuf = buf.slice(4, bytesRead);

            if (packetFamily === 2) { // AF_INET = IPv4
                const packet = parseIPv4(ipBuf);
                if (packet) {
                    const protoName = packet.protocol === 6 ? 'TCP'
                        : packet.protocol === 17 ? 'UDP'
                            : packet.protocol === 1 ? 'ICMP'
                                : 'Other';
                    console.log(`[IPv4] ${protoName} Packet: ${packet.srcIP} -> ${packet.dstIP}`);
                }
            } else if (packetFamily === 30) { // AF_INET6 = IPv6
                const packet = parseIPv6(ipBuf);
                if (packet) {
                    console.log(`[IPv6] NextHeader ${packet.protocol} Packet: ${packet.srcIP} -> ${packet.dstIP}`);
                }
            } else {
                console.log('Unknown packet family:', packetFamily);
            }
        }

        setImmediate(readLoop);
    });
}

readLoop();
console.log('TUN interface is ready, listening packets...');

// 优雅退出函数
function cleanup() {
    if (!running) return;
    running = false;

    console.log('Stopping TUN...');
    try {
        MacTunAddon.removeGlobalMask({ subnet: "192.168.100.0/24" }, name);
        MacTunAddon.closeTun();
    } catch (e) {
        console.error('Error during cleanup:', e);
    }

    console.log('TUN stopped, exiting process.');
    process.exit(0);
}

// 捕获 kill / Ctrl+C 信号
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
