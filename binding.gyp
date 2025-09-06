{
  "targets": [
    {
     "target_name": "tuntap2Addon",
           "sources": [
             "src/cpp/tuntap-napi.cpp",
             "src/cpp/tun-win.cpp"
           ],
          'includes': [
            './common.gypi'
          ],
          'conditions': [
              ['OS=="mac"', {

              }],
              ['OS=="linux"', {
                        "sources": [
                             "src/cpp/tuntap-linux.cpp",
                           ],
              }]
            ]
    },
  ]
}
