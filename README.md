# 梦角聊天室 PWA 完整版

## GitHub Pages

把仓库根目录全部上传到 GitHub，开启 `Settings → Pages → Deploy from a branch → main → /(root)`。

前端无需服务器即可运行，数据保存在设备本地。

## 功能

- 梦角/用户昵称、头像、状态
- 字卡分类、批量添加、编辑、删除、搜索
- 延迟回复、已读不回、主动消息
- 图片消息、拍一拍、模拟视频通话界面
- 聊天记录 JSON 导入/导出
- PWA 安装、Service Worker 离线缓存
- 后台保活：持久化待回复/主动任务，回到网页后恢复
- 可选 Web Push：`push-server/` 提供锁屏后台通知能力

## 关于“后台保活”

浏览器和手机系统不会允许普通网页在锁屏或被系统挂起后无限执行 JavaScript。因此“后台保活”开关做的是可靠保存任务、页面恢复时补发，以及网页可见时尝试 Wake Lock；它不能绕过系统限制。

如果需要真正的锁屏主动通知，请部署 `push-server/` 并在设置里连接它。

## Web Push 后台

进入 `push-server/`：

```bash
npm install
npx web-push generate-vapid-keys
npm start
```

将生成的 VAPID keys 和 `ADMIN_TOKEN` 配置成环境变量，再把服务部署到 HTTPS 主机。之后在网站设置里填写服务地址并点击“连接后台推送”。

注意：示例服务的订阅存于内存，重启会丢失。正式长期使用建议换 Redis / SQLite / Postgres。
