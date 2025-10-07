{
  "targets": [
    {
     "target_name": "tuntap2Addon",
           "sources": [
           ],
          'includes': [
            './common.gypi'
          ],
          'conditions': [
              ['OS=="mac"', {
                   "sources": [
                     "src/cpp/tun-mac.cpp",
                     "src/cpp/tuntap-napi-mac.cpp"
                   ]
              }],
              ['OS=="linux"', {
                "sources": [
                     "src/cpp/tuntap-linux.cpp",
                     "src/cpp/tuntap-napi.cpp"
                   ]
              }],
              ['OS=="win"', {
                  "sources": [
                      "src/cpp/tun-win.cpp",
                      "src/cpp/tuntap-napi.cpp"
                     ],
              }]
            ]
    },
  ]
}
