{
  "targets": [
    {
      "target_name": "tuntap2Addon",
      "sources": [
        "src/cpp/tuntap-napi.cpp",
        "src/cpp/tuntap-linux.cpp",
        "src/cpp/tun-win.cpp"
      ],
      'cflags!': [ '-fno-exceptions', '--std=c++17', '-Wno-stringop-truncation' ],
      'cflags_cc!': [ '-fno-exceptions', '--std=c++17', '-Wno-stringop-truncation' ],
      "cflags+": [
        "-fvisibility=hidden",
        '--std=c++17',
        '-Wno-stringop-truncation'
      ],
      'cflags!': [ '-fno-exceptions' ],
            'cflags_cc!': [ '-fno-exceptions' ],
            'include_dirs': [
              "<!@(node -p \"require('node-addon-api').include\")"
            ],
            'dependencies': [
                "<!(node -p \"require('node-addon-api').gyp\")"
            ],
            'conditions': [
              ['OS=="win"', {
                "msvs_settings": {
                  "VCCLCompilerTool": {
                    "ExceptionHandling": 1
                  }
                }
              }],
              ['OS=="mac"', {
                "xcode_settings": {
                  "CLANG_CXX_LIBRARY": "libc++",
                  'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
                  #'MACOSX_DEPLOYMENT_TARGET': '10.7'
                }
              }]
            ]
    }
  ]
}
