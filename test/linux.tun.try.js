const {LinuxTun} = require("../dist");


const tun = new LinuxTun();
tun.mtu = 4096;
tun.ipv4 = '10.6.7.1/24';
tun.ipv6 = 'abcd:1:2:3::/64';
tun.on('data', (buf) => {
    console.log('received:', buf);
    // 发送消息到服务器
})
tun.isUp = true;
// console.log(`created tun: ${tun.name}, ip: ${tun.ipv4}, ${tun.ipv6}, mtu: ${tun.mtu}`);
// tun.release();
