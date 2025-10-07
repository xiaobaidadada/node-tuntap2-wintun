#include "tuntap-methods-mac.h"
#include <unistd.h>
#include <fcntl.h>
#include <sys/socket.h>
#include <sys/ioctl.h>
#include <sys/kern_control.h>
#include <sys/sys_domain.h>
#include <net/if_utun.h>
#include <net/if.h>
#include <string.h>
#include <iostream>
#include <cstdlib>


int tun_create(std::string &tun_name) {
    int fd = socket(PF_SYSTEM, SOCK_DGRAM, SYSPROTO_CONTROL);
    if (fd < 0) {
        std::cerr << "[tun_create] socket error: errno=" << errno
                  << ", msg=" << strerror(errno) << std::endl;
        return -1;
    }

    struct ctl_info ctlInfo;
    memset(&ctlInfo, 0, sizeof(ctlInfo));
    strncpy(ctlInfo.ctl_name, UTUN_CONTROL_NAME, MAX_KCTL_NAME);

    if (ioctl(fd, CTLIOCGINFO, &ctlInfo) == -1) {
        std::cerr << "[tun_create] ioctl CTLIOCGINFO error: errno=" << errno
                  << ", msg=" << strerror(errno) << std::endl;
        close(fd);
        return -1;
    }

    struct sockaddr_ctl sc;
    memset(&sc, 0, sizeof(sc));
    sc.sc_len = sizeof(sc);
    sc.sc_family = AF_SYSTEM;
    sc.ss_sysaddr = AF_SYS_CONTROL;
    sc.sc_id = ctlInfo.ctl_id;
    sc.sc_unit = 0; // 系统自动分配 utun0/1/2

    if (connect(fd, (struct sockaddr *)&sc, sizeof(sc)) < 0) {
        std::cerr << "[tun_create] connect error: errno=" << errno
                  << ", msg=" << strerror(errno) << std::endl;
        close(fd);
        return -1;
    }

    char ifname[IFNAMSIZ];
    socklen_t len = sizeof(ifname);
    if (getsockopt(fd, SYSPROTO_CONTROL, UTUN_OPT_IFNAME, ifname, &len) < 0) {
        std::cerr << "[tun_create] getsockopt UTUN_OPT_IFNAME error: errno=" << errno
                  << ", msg=" << strerror(errno) << std::endl;
        close(fd);
        return -1;
    }

    tun_name = ifname;
    std::cerr << "[tun_create] TUN created: " << tun_name << std::endl;
    return fd;
}

int tun_set_ipv4(const std::string &tun_name, const std::string &ip, const std::string &peer) {
    std::string cmd = "sudo ifconfig " + tun_name + " " + ip + " " + peer + " up";
    int ret = system(cmd.c_str());
    if (ret != 0) {
        std::cerr << "[tun_set_ipv4] command failed, return=" << ret << std::endl;
    }
    return ret;
}

int tun_close(int fd) {
    if (fd > 0) {
        return close(fd);
    }
    return -1;
}
