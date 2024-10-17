# node-tuntap2

a opensource, asynchronized, napi-based, business friendly tuntap device driver addon for nodejs.

[![](https://img.shields.io/npm/v/tuntap2.svg?style=flat)](https://www.npmjs.org/package/tuntap2)
[![Node.js CI](https://github.com/PupilTong/node-tuntap2/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/PupilTong/node-tuntap2/actions/workflows/node.js.yml)
[![Node.js Package](https://github.com/PupilTong/node-tuntap2/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/PupilTong/node-tuntap2/actions/workflows/npm-publish.yml)
![](https://img.shields.io/badge/Coverage-93%25-83A603.svg?prefix=$coverage$)

[![Package quality](https://packagequality.com/shield/tuntap2.svg)](https://packagequality.com/#?package=tuntap2)


## TL; DR

```javascript
const {Tun, Tap} = require('tuntap2');

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
```js
// widnwos 
const {Wintun} = require("tuntap2")

const p2 = Wintun.get_wintun_dll_path();
Wintun.wintunSetPath(p2);
Wintun.wintunInit();
Wintun.wintunSetIpv4("tuntap2","10.6.7.7",24);
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

```

## install

```bash
npm i @xiaobaidadada/node-tuntap2
```

**Note:** 目前仅支持linux和windows ；本项目使用了预构建，建议使用Node18，不需要编译而是从github下载编译好的文件，如果你电脑上的网络安装的时候无法访问github则会退化成编译。在windows上编译可能遇到的问题可以参考这个链接https://blog.csdn.net/jjocwc/article/details/134152602

**Note:** Reading properties requires your interface in `up` status.

**Note:** For a `Tun` device, `mac` property is readonly.

**Node:** Please make sure the first 8bits is `00` for setting the mac address of a Tap device.

## Streams API

The tuntap object supports Node.js `Duplex` interface. However, almost all streams api methods is a wrapper of fs.ReadStream or fs.WriteStream. The writing and events are based on them.

## Performance

The writing and reading of tuntap is based on nodejs `fs` and `readingStream`. This means these methods is running on libuv threads pool. Please set the threads pool size properly for your application.




