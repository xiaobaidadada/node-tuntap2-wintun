# node-tuntap2-wintun
The fork  supporting WinTun for node-tuntap2.

a opensource, asynchronized, napi-based, business friendly tuntap device driver addon for nodejs.

## install
`npm install @xiaobaidadada/node-tuntap2-wintun`

```js
// widnwos  Only one adapter is currently supported
const {Wintun} = require("@xiaobaidadada/node-tuntap2-wintun")

const p2 = Wintun.get_wintun_dll_path(); // dll downloaded from https://www.wintun.net/
Wintun.set_dll_path(p2);
Wintun.init();
Wintun.set_ipv4("tuntap2","10.6.7.7",24);
Wintun.on_data((buf)=>{
    // 解析 IP 头部
    const version = buf[0] >> 4;
    const headerLength = (buf[0] & 0x0f) * 4;
    const protocol = buf[9];
    if (version !== 4) {
        console.log('not ipv4');
        return;
    }
    const sourceIP = buf.slice(12, 16).join('.');
    const destIP = buf.slice(16, 20).join('.');
    console.log(`Source IP: ${sourceIP}`);
    console.log(`Destination IP: ${destIP}`);

});
// Wintun.send_data(buffer);

```

```javascript
// linux
const {Tun, Tap} = require('@xiaobaidadada/node-tuntap2-wintun');

try {
    const tun = new Tun();
    tun.mtu = 1400;
    tun.ipv4 = '10.0.0.100/24';
    tun.ipv6 = 'abcd:1:2:3::/64';
    tun.on('data', (buf) => {
        console.log('received:', buf);
    })
    tun.isUp = true;
    console.log(`created tun: ${tun.name}, ip: ${tun.ipv4}, ${tun.ipv6}, mtu: ${tun.mtu}`);
    tun.release();

}
catch(e) {
	console.log('error: ', e);
	process.exit(0);
}
```

**Note:** windows requires wintun.dll If you do not trust this project `Wintun.get_wintun_dll_path()` provided dll can be downloaded to https://www.wintun.net/




