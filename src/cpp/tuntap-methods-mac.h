#pragma once
#include <string>

// 创建 TUN，返回文件描述符
int tun_create(std::string &tun_name);

// 设置 IPv4 地址，ip:本机, peer:对端
int tun_set_ipv4(const std::string &tun_name, const std::string &ip, const std::string &peer);

int tun_close(int fd);
