# 记一次 Windows 11 更新卡在"等待下载"的排查经历

> 日期：2026-10-09 · 环境：Windows 11（Build 26200）· 症状：Windows 更新长时间停留在"正在等待下载"，卡了数天

## 一、现象

设置 → Windows 更新显示"正在等待下载"，数天无进展。手动点击"检查更新"能扫到更新，但下载始终不开始。

初步观察：

- 无代理/VPN（实际机器上有 xray 监听 127.0.0.1:10808，但仅做显式代理，无 TUN 网卡，不接管系统流量）
- 系统盘空间充足
- 网络连接正常

## 二、排查过程

### 第 1 步：常规重置（未解决）

清空 `SoftwareDistribution\Download`、重启 `wuauserv`/`BITS`/`cryptSvc`、重建 `catroot2`、重置传递优化缓存、`bitsadmin /reset /allusers`。

结果：服务全部正常运行，扫描可触发，**但 120 秒内下载目录零增长、事件日志零下载事件、`Get-DeliveryOptimizationStatus` 无任务**。

关键矛盾点浮出水面：

- 21:36 事件日志出现 `id=41 已下载更新`（说明管道本身能工作）
- 21:51 之后我手动触发的 `usoclient StartScan` **不产生任何事件**
- WU Agent 的同步查询（`Microsoft.Update.Session` COM 搜索）直接**挂死 300 秒超时**

### 第 2 步：发现可疑策略（当时低估了它）

```powershell
HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU
  NoAutoUpdate = 1    # 关闭自动更新
  AUOptions    = 2    # "通知但不下载"
```

典型的"禁用自动更新"优化工具残留。同时排查了：

- 挂起重启（CBS `RebootPending` / `RebootRequired`）：均为 False
- 按流量计费连接：WinRT 实测 `NetworkCostType = Unrestricted`，排除
- 组策略其余项、更新暂停设置：干净

### 第 3 步：网络层深挖（重要副产物，最终证明是"红鲱鱼"）

扫描端点 `fe2.update.microsoft.com` 正常，但 4 个载荷 CDN 域名 TLS 全部失败：

```
download.windowsupdate.com / dl.delivery.mp.microsoft.com /
tlu.dl.delivery.mp.microsoft.com / ctldl.windowsupdate.com
→ schannel: SEC_E_WRONG_PRINCIPAL（对端证书与域名不匹配）
```

逐 IP 抓证书，发现中国区 CDN 边缘节点对 HTTPS SNI 返回自家默认证书：

| 域名 | 解析到 | 返回的证书 |
|---|---|---|
| dl.delivery.mp.microsoft.com | 112.47.47.43 | `*.a.bdydns.com`（百度云）|
| download.windowsupdate.com | 112.48.x.x | `default.chinanetcenter.com`（网宿）|
| tlu.dl.delivery.mp.microsoft.com | 39.134.97.x | ZTE 视频缓存盒默认证书 |
| fe2.update.microsoft.com | 130.213.x | ✅ 真 Microsoft 证书 |

用 **DoH（阿里 223.5.5.5）验证 DNS 未被污染** —— 这是微软官方中国分发链（`delivery.microsoft.com → trafficmanager.net → mwcname.com`）。

决定性测试：**80 端口 HTTP 完全正常**（`download.windowsupdate.com` 返回微软标志性 200 页面，`tlu...` 返回带微软 `Request-Id` 头的 403）。说明 443 证书问题是真实的网络怪象，但 WU 载荷下载走 HTTP 80，**不影响下载本身**。

### 第 4 步：实时网络取证（锁定真因）

触发下载后实时抓 `Get-NetTCPConnection`：

- **零下载失败事件**（如果连了被拒，几秒内必记错误事件）→ 说明引擎**根本没发起尝试**
- 这把嫌疑重新拉回第 2 步发现的 AU 策略

## 三、根因与修复

**根因**：`NoAutoUpdate=1 + AUOptions=2` 组策略让下载编排永远排队，扫描放行、下载永不启动。该策略很可能是某款"Windows 优化/禁用更新"工具设置的。

**修复**（管理员权限）：

```powershell
# 1. 备份策略（可回滚）
reg export "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate" wu-policy-backup.reg /y

# 2. 删除 AU 策略子键
Remove-Item 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU' -Recurse -Force

# 3. 重启更新栈并触发
Restart-Service wuauserv, UsoSvc
usoclient StartScan
usoclient StartDownload
```

## 四、验证结果

删除策略后 **3 分钟内**：

| 指标 | 修复前 | 修复后 |
|---|---|---|
| 下载目录 | 27 KB（冻结数天） | 198 MB 持续增长 |
| 下载事件 | 零 | MSRT(88MB)、SecurityHealthSetup(22MB) 落盘 |
| 待处理更新 | 4 个全部未下载 | 2 个完成，2 个（.NET + 25H2 累积更新）下载中 |

最终：**更新全部下载并安装成功**。

## 五、排除清单（供参考）

| 嫌疑 | 结论 | 验证方法 |
|---|---|---|
| 缓存/服务损坏 | 已重置，非根因 | 清缓存 + 重启服务 |
| BITS 卡死 | 只有 Edge 的正常任务 | `bitsadmin /reset /allusers` |
| 挂起重启阻塞 | False | 注册表 CBS/RebootRequired |
| 按流量计费连接 | Unrestricted | WinRT `GetConnectionCost()` |
| hosts 劫持 | 干净 | 读 hosts 文件 |
| 代理拦截 | xray 仅显式代理 | `netsh winhttp show proxy` + 端口进程归属 |
| DNS 污染 | 官方链，未污染 | DoH 对比 UDP DNS |
| CDN 443 证书错配 | 真实存在但不阻塞 | 逐 IP SslStream 抓证书 + HTTP 80 实测 |
| **AU 组策略** | **根因** | 删除后 3 分钟恢复 |

## 六、经验教训

1. **"零错误"本身就是最强线索**。没有失败事件 = 没有尝试 = 问题在编排/策略层，不在网络层。差点被网络层的证书怪象带偏。
2. **查注册表策略要趁早**。`HKLM\SOFTWARE\Policies\...` 是各类优化工具的重灾区，第一轮就该看，而不是重置服务五连招之后。
3. **分层验证，每层拿实据**：服务状态 → 事件日志 → 注册表策略 → DNS(DoH 对照) → 逐 IP TLS 抓证书 → 端口 80/443 分流 → 实时 TCP 连接。每一层的证据都推翻或坐实一个假设。
4. **国内网络环境的两个特殊点**：更新载荷走 HTTP 80 而非 443（所以 CDN 证书错配不致命）；`8.8.8.8/1.1.1.1` 直连在国内应换成 `223.5.5.5/119.29.29.29`。
5. **破坏性操作先备份**：`reg export` 一份策略，随时可回滚。

---
*修复留档：`wu-policy-backup.reg`（策略回滚）、`wu-reset*.log`（执行日志）*
