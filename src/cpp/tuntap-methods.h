
#include <uv.h>
#include <napi.h>
#include <cerrno>
#include <string>
#include <set>
#ifdef _WIN32
#pragma once
// Windows 的api部分
#include <WS2tcpip.h>
#include "wintun.h"
#include <netioapi.h>
#pragma comment(lib, "ws2_32.lib")
#pragma comment(lib, "iphlpapi.lib")
#pragma comment(lib, "Ntdll.lib")
static WINTUN_CREATE_ADAPTER_FUNC *WintunCreateAdapter;
static WINTUN_CLOSE_ADAPTER_FUNC *WintunCloseAdapter;
static WINTUN_OPEN_ADAPTER_FUNC *WintunOpenAdapter;
static WINTUN_GET_ADAPTER_LUID_FUNC *WintunGetAdapterLUID;
static WINTUN_GET_RUNNING_DRIVER_VERSION_FUNC *WintunGetRunningDriverVersion;
static WINTUN_DELETE_DRIVER_FUNC *WintunDeleteDriver;
static WINTUN_SET_LOGGER_FUNC *WintunSetLogger;
static WINTUN_START_SESSION_FUNC *WintunStartSession;
static WINTUN_END_SESSION_FUNC *WintunEndSession;
static WINTUN_GET_READ_WAIT_EVENT_FUNC *WintunGetReadWaitEvent;
static WINTUN_RECEIVE_PACKET_FUNC *WintunReceivePacket;
static WINTUN_RELEASE_RECEIVE_PACKET_FUNC *WintunReleaseReceivePacket;
static WINTUN_ALLOCATE_SEND_PACKET_FUNC *WintunAllocateSendPacket;
static WINTUN_SEND_PACKET_FUNC *WintunSendPacket;


void initAnGetWintun(void);
int createAdapter(const wchar_t *name,GUID* guidPtr);
// void SetNetworkCategoryPrivate(const wchar_t* name);
int setIpv4AddrMask(const char *ipStr, int maskLen);
int close();
void receivePacket(Napi::Env env,Napi::ThreadSafeFunction tsfn);
void send_data(byte * data,size_t data_len);

#else
#include <netinet/ether.h>
#include <netinet/if_ether.h>
// linux 的api部分
// 初始化适配器文件(修改)
int init(int fd, bool isTap, char* name);
// 获取适配器状态(传入值)
int getFlags(char* name, int* flag);
int setMac(char* name, char* mac);
// 开启关闭网卡
int setUp(char* name);
int setDown(char* name);
// 设置最大传输单元
int setMtu(char* name, int mtu);
int getMtu(char* name, int* mtu);
// 设置ipv4地址
int setIpv4Addr(char* name, char* ipStr);
int setIpv4Netmask(char* name, int maskLen);
int setIpv6(int ifIndex, char* ipStr, int prefix);
// 获取适配器文件位置
int getIfIndex(char* name, int* index);

#endif
