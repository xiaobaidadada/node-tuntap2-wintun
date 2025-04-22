const {Wintun} = require("../dist")
const {join} = require("node:path");


const p = join(__dirname,"..","wintun.dll");
const p2 = Wintun.get_wintun_dll_path();
Wintun.set_dll_path(p2);
Wintun.init();
Wintun.set_ipv4("filecat","10.6.7.7",24);
Wintun.on_data((buf)=>{
    // 解析 IP 头部
    const version = buf[0] >> 4;
    const headerLength = (buf[0] & 0x0f) * 4;
    const protocol = buf[9];
    if (version !== 4) {
        // console.log('不是 IPv4');
        return;
    }
    const sourceIP = buf.slice(12, 16).join('.');
    const destIP = buf.slice(16, 20).join('.');
    console.log(`Source IP: ${sourceIP}`);
    console.log(`Destination IP: ${destIP}`);

    // console.log("数据:"+buf);
    // Wintun.close();
});
// function getTransBuffer(vir_ip, data) {
//     const ipBuf = Buffer.from(vir_ip, 'utf8');
//     if (ipBuf.length > 255) throw new Error('vir_ip too long');
//     return Buffer.concat([
//         Buffer.from([ipBuf.length]), // 1字节长度
//         ipBuf,                       // IP字符串
//         data                         // 实际 payload
//     ]);
// }
//
// // 👇 构造心跳 buffer
// const payload = Buffer.from('PING'); // 心跳内容
// const pingBuffer = getTransBuffer('10.1.1.3', payload);
// Wintun.send_data(pingBuffer);
