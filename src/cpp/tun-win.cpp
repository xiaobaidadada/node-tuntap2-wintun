
#ifdef _WIN32

#include "tuntap-methods.h"
#include "wintun.h"

extern wchar_t * wintunn_path ;
extern int th_doing;

HMODULE initAnGetWintun(void) {
    HMODULE Wintun =
            LoadLibraryExW(wintunn_path, NULL,
                           LOAD_LIBRARY_SEARCH_APPLICATION_DIR | LOAD_LIBRARY_SEARCH_SYSTEM32);
    if (!Wintun)
        return NULL;
#define X(Name) ((*(FARPROC *)&Name = GetProcAddress(Wintun, #Name)) == NULL)
    if (X(WintunCreateAdapter) || X(WintunCloseAdapter) || X(WintunOpenAdapter) || X(WintunGetAdapterLUID) ||
        X(WintunGetRunningDriverVersion) || X(WintunDeleteDriver) || X(WintunSetLogger) || X(WintunStartSession) ||
        X(WintunEndSession) || X(WintunGetReadWaitEvent) || X(WintunReceivePacket) || X(WintunReleaseReceivePacket) ||
        X(WintunAllocateSendPacket) || X(WintunSendPacket))
#undef X
    {
        DWORD LastError = GetLastError();
        FreeLibrary(Wintun);
        SetLastError(LastError);
        return NULL;
    }
    return Wintun;
}

WINTUN_ADAPTER_HANDLE createAdapter(const wchar_t *name) {
    // 创建适配器(网卡)
    GUID ExampleGuid = {0xdeadbabe, 0xcafe, 0xbeef, {0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef}};
    WINTUN_ADAPTER_HANDLE Adapter = WintunCreateAdapter(name, name, &ExampleGuid);
    return Adapter;
}

WINTUN_SESSION_HANDLE getSession(WINTUN_ADAPTER_HANDLE adapter) {
    // 先用默认值
    WINTUN_SESSION_HANDLE Session = WintunStartSession(adapter, 0x400000);
    return Session;
}

int setIpv4AddrMask(WINTUN_ADAPTER_HANDLE adapter, const char *ipStr, int maskLen) {
    // 本地网络通信的ip地址
    MIB_UNICASTIPADDRESS_ROW AddressRow;
    InitializeUnicastIpAddressEntry(&AddressRow);
    WintunGetAdapterLUID(adapter, &AddressRow.InterfaceLuid);
    AddressRow.Address.Ipv4.sin_family = AF_INET;
    // 将点分十进制 IP 地址转换为 unsigned long 类型的网络字节序表示
    // 将点分十进制 IPv4 地址转换为网络字节序表示
    struct in_addr addr;
    int result = inet_pton(AF_INET, ipStr, &addr);
    if (result != 1) {
        return -1;
    }
    AddressRow.Address.Ipv4.sin_addr.S_un.S_addr = addr.s_addr;
    AddressRow.OnLinkPrefixLength = maskLen; /* This is a /24 network 也就是255.255.255.0*/
    AddressRow.DadState = IpDadStatePreferred;
    DWORD LastError = CreateUnicastIpAddressEntry(&AddressRow);
    if (LastError != ERROR_SUCCESS && LastError != ERROR_OBJECT_ALREADY_EXISTS) {
        return -1;
    }
    return 0;
}

int close(WINTUN_ADAPTER_HANDLE adapter,WINTUN_SESSION_HANDLE Session,HMODULE Wintun) {
    // 使用平台特定的函数终止线程，这里是 Windows 示例
//    TerminateThread(threadHandle, 0);
    WintunEndSession(Session);
    WintunCloseAdapter(adapter);
    FreeLibrary(Wintun);
    return 0;
}
void receivePacket(WINTUN_SESSION_HANDLE session ,Napi::Env env,Napi::ThreadSafeFunction tsfn) {
      // 创建子线程
        std::thread thread([session](Napi::ThreadSafeFunction tsfn,Napi::Env env) {
            while (th_doing !=0 ) {
                DWORD PacketSize;
                BYTE *Packet = WintunReceivePacket(session, &PacketSize);
                if (Packet) {
                    tsfn.BlockingCall([Packet,PacketSize](Napi::Env env, Napi::Function jsCallback) {
                        // 但是这里是可以使用 env的
                        Napi::HandleScope scope(Napi::Env);
                        // 创建 Buffer 对象
                        // 创建 Napi::Buffer 对象，传入数据指针和长度
                        Napi::Buffer<byte> buffer = Napi::Buffer<byte>::New(env, reinterpret_cast<byte*>(Packet), PacketSize);
                        // 内部线程调用jsFunc(就是外部传进来的handler)子函数
                        jsCallback.Call({ buffer});
                    });
                    WintunReleaseReceivePacket(session, Packet);
                }
    //            Sleep(500); 不能暂停，网速就算是很小的时间间隔，多个流量包造成的最后的时间累计还是很大的
            };
        }, tsfn,env);
         // 不等待子线程结束
        thread.detach();

}

#endif