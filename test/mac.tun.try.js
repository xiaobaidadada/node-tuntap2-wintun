const { MacTun } = require("../dist");
const fs = require("node:fs");

// 创建 TUN
const { fd, name } = MacTun.createTun();
console.log('TUN fd:', fd, 'name:', name);

// 设置虚拟 IP
MacTun.setIPv4('10.0.0.1', '10.0.0.1');

// 配置全局路由 / mask
MacTun.applyGlobalMask({ subnet: "192.168.100.0/24" }, name);

console.log('TUN interface ready, listening stream...');

// === 用 fs.createReadStream 包装 ===
const tunStream = fs.createReadStream(null, { fd, highWaterMark: 4096 });
const tunWriteStream = fs.createWriteStream(null, { fd });

// === 数据事件监听 ===
tunStream.on('data', (buf) => {
    if (buf.length < 24) return;

    // macOS UTUN 前 4 字节是协议族
    const family = buf.readUInt32BE(0);
    if (family !== 2) return; // 只处理 IPv4

    const ipBuf = buf.subarray(4);
    if (ipBuf.length < 20) return;

    const version = ipBuf[0] >> 4;
    if (version !== 4) return;

    const d1 = ipBuf[16], d2 = ipBuf[17], d3 = ipBuf[18], d4 = ipBuf[19];
    console.log(`Dest IP: ${d1}.${d2}.${d3}.${d4}`);
});

// === 错误处理 ===
tunStream.on('error', (err) => {
    console.error('TUN stream error:', err);
});

// === 优雅退出 ===
function cleanup() {
    console.log('Stopping TUN...');
    try {
        MacTun.removeGlobalMask({ subnet: "192.168.100.0/24" }, name);
        MacTun.closeTun();
        tunStream.destroy()
    } catch (e) {
        console.error('Error during cleanup:', e);
    }
    console.log('TUN stopped, exiting process.');
    process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
