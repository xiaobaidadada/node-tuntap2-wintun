#ifdef _WIN32

#include "tuntap-methods.h"
#include "wintun.h"

extern wchar_t* wintunn_path;
extern int th_doing;
WINTUN_ADAPTER_HANDLE Adapter; // 适配器
WINTUN_SESSION_HANDLE Session; // 会话
HMODULE Wintun;

void initAnGetWintun(void)
{
    Wintun =
        LoadLibraryExW(wintunn_path, NULL,
                       LOAD_LIBRARY_SEARCH_APPLICATION_DIR | LOAD_LIBRARY_SEARCH_SYSTEM32);
    if (!Wintun)
        return;
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
    }
}

std::wstring toWstring(const std::string& str) {
    int len = MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, nullptr, 0);
    std::wstring result(len, 0);
    MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, &result[0], len);
    result.pop_back(); // remove null terminator
    return result;
}
//
// void SetNetworkCategoryPrivate(const wchar_t* name)
// {
//     // 构造 netsh 命令
//     std::wstring cmd = L"netsh interface set interface name=\"" + std::wstring(name)  + L"\" private";
//
//     // 执行 netsh 命令
//     system(std::string(cmd.begin(), cmd.end()).c_str());
// }


// 创建适配器(网卡)
int createAdapter(const wchar_t* name,GUID* guidPtr)
{
    // GUID ExampleGuid = {0xdeadbabe, 0xcafe, 0xbeef, {0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef}};
    // 参数为 名称 描述 唯一id(为空自动生成
//     WINTUN_ADAPTER_HANDLE adapter = WintunOpenAdapter(name);
//     if(adapter != NULL) return -1;
    Adapter = WintunCreateAdapter(name, name, guidPtr);
    return (Adapter != NULL) ? 0 : -2;
}


int setIpv4AddrMask(const char* ipStr, int maskLen)
{
    // 本地网络通信的ip地址
    MIB_UNICASTIPADDRESS_ROW AddressRow;
    InitializeUnicastIpAddressEntry(&AddressRow);

    // 获取适配器的 LUID
    WintunGetAdapterLUID(Adapter, &AddressRow.InterfaceLuid);

    // AF_INET iv4 AF_INET6 是ipv6 类型的
    AddressRow.Address.Ipv4.sin_family = AF_INET;
    struct in_addr addr;
    int result = inet_pton(AF_INET, ipStr, &addr);
    if (result != 1)
    {
        return -1;
    }

    AddressRow.Address.Ipv4.sin_addr.S_un.S_addr = addr.s_addr;
    AddressRow.OnLinkPrefixLength = maskLen; /* This is a /24 network 也就是255.255.255.0*/
    AddressRow.DadState = IpDadStatePreferred;

    // 在wintun 创建ip地址
    DWORD LastError = CreateUnicastIpAddressEntry(&AddressRow);
    if (LastError != ERROR_SUCCESS && LastError != ERROR_OBJECT_ALREADY_EXISTS)
    {
        return -1;
    }

    // 获取一个会话对象
    Session = WintunStartSession(Adapter, 0x400000);

    return 0;
}

int close()
{
    if (Session) {
        WintunEndSession(Session);
        Session = NULL;
    }

    if (Adapter) {
        WintunCloseAdapter(Adapter);
        Adapter = NULL;
    }

    if (Wintun) {
        FreeLibrary(Wintun);
        Wintun = NULL;
    }

    return 0;
}


void receivePacket(Napi::Env env, Napi::ThreadSafeFunction tsfn) {
    auto session = Session;
    HANDLE waitEvent = WintunGetReadWaitEvent(session);

    std::thread([session, tsfn, waitEvent]() {
        while (th_doing == 1) {
            DWORD waitResult = WaitForSingleObject(waitEvent, INFINITE);
            if (waitResult == WAIT_OBJECT_0) {
                DWORD PacketSize;
                BYTE *Packet;
                while ((Packet = WintunReceivePacket(session, &PacketSize)) != NULL) {
                    std::vector<byte> data(Packet, Packet + PacketSize); // 复制数据
                    tsfn.BlockingCall([data = std::move(data)](Napi::Env env, Napi::Function jsCallback) {
                        Napi::HandleScope scope(env);
                        auto buffer = Napi::Buffer<byte>::Copy(env, data.data(), data.size());
                        jsCallback.Call({ buffer });
                    });
                    WintunReleaseReceivePacket(session, Packet);
                }
            } else {
                // 你可以添加错误处理逻辑
                break;
            }
        }
        close();
        tsfn.Release(); // 确保释放 ThreadSafeFunction
    }).detach();
}



void send_data(byte* data, size_t buffer_len)
{
    BYTE* Packet = WintunAllocateSendPacket(Session, buffer_len);
    if (Packet)
    {
        // 将 recvBuffer 的数据复制到 Packet 中
        memcpy(Packet, data, buffer_len);
        WintunSendPacket(Session, Packet);
    }
}

#endif
