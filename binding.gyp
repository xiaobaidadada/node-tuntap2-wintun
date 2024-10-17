{
  "targets": [
    {
     "target_name": "tuntap2Addon",
           "sources": [
             "src/cpp/tuntap-napi.cpp",
             "src/cpp/tuntap-linux.cpp",
             "src/cpp/tun-win.cpp",
             "src/cpp/wintun.h",
             "src/cpp/tuntap-methods.h"
           ],
     'includes': [
            './common.gypi'
          ]
    },
  ]
}
