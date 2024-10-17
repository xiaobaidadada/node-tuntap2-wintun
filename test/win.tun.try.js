const {Wintun} = require("../dist")
const {join} = require("node:path");


const p = join(__dirname,"..","wintun.dll");
const p2 = Wintun.get_wintun_dll_path();
Wintun.wintunSetPath(p2);
Wintun.wintunInit();
Wintun.wintunSetIpv4("filecat","10.6.7.7",24);
Wintun.wintunUpOn((buf)=>{
    // 解析 IP 头部
    const version = buf[0] >> 4;
    const headerLength = (buf[0] & 0x0f) * 4;
    const protocol = buf[9];
    if (version !== 4) {
        console.log('不是 IPv4');
        return;
    }
    const sourceIP = buf.slice(12, 16).join('.');
    const destIP = buf.slice(16, 20).join('.');
    console.log(`Source IP: ${sourceIP}`);
    console.log(`Destination IP: ${destIP}`);

    // console.log("数据:"+buf);
});
// Wintun.wintunSend(sessionHandle,buffer);
