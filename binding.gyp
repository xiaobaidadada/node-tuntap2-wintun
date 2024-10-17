{
  "targets": [
    {
     "target_name": "tuntap2Addon",
           "sources": [
             "src/cpp/tuntap-napi.cpp",
             "src/cpp/tuntap-linux.cpp",
             "src/cpp/tun-win.cpp"
           ],
     'includes': [
            './common.gypi'
          ]
    },
  ]
}
