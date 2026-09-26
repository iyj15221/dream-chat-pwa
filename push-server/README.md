# 梦角聊天室 Web Push 后台

这是可选的后台推送服务。GitHub Pages 只托管前端；想让支持 Web Push 的设备在离开网页/锁屏后收到真正的梦角通知，需要把这个 Node 服务部署到支持 HTTPS 的主机。

## 本地准备

```bash
npm install
npx web-push generate-vapid-keys
```

把生成的 public/private key 写入环境变量 `VAPID_PUBLIC_KEY`、`VAPID_PRIVATE_KEY`，同时设置 `VAPID_SUBJECT` 和随机的 `ADMIN_TOKEN`。

然后运行 `npm start`。

## 前端连接

在聊天室“设置 → 锁屏后台推送”里填服务的 HTTPS 地址，然后点击“连接后台推送”。

## 主动推送

```http
POST /push
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

```json
{
  "clientId": "前端生成的 clientId",
  "title": "梦角聊天室",
  "body": "我刚刚突然想你了。"
}
```

示例服务把订阅存在内存中，重启后会丢失；长期使用请改成数据库/Redis 等持久化存储。
