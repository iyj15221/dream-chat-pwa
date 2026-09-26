const express = require("express");
const cors = require("cors");
const webpush = require("web-push");
const crypto = require("crypto");
const app = express();
app.use(cors());
app.use(express.json({limit:"256kb"}));
const PORT=Number(process.env.PORT||8787);
const ADMIN_TOKEN=process.env.ADMIN_TOKEN||"";
const VAPID_PUBLIC_KEY=process.env.VAPID_PUBLIC_KEY||"";
const VAPID_PRIVATE_KEY=process.env.VAPID_PRIVATE_KEY||"";
const VAPID_SUBJECT=process.env.VAPID_SUBJECT||"mailto:you@example.com";
if(!VAPID_PUBLIC_KEY||!VAPID_PRIVATE_KEY){console.error("Missing VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY. Generate with: npx web-push generate-vapid-keys");process.exit(1);}
webpush.setVapidDetails(VAPID_SUBJECT,VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY);
const subscriptions=new Map();
function auth(req,res,next){if(!ADMIN_TOKEN)return res.status(503).json({error:"ADMIN_TOKEN is not configured"});if(req.get("authorization")!==`Bearer ${ADMIN_TOKEN}`)return res.status(401).json({error:"unauthorized"});next();}
app.get("/health",(_req,res)=>res.json({ok:true,subscriptions:subscriptions.size}));
app.get("/vapid-public-key",(_req,res)=>res.json({publicKey:VAPID_PUBLIC_KEY}));
app.post("/subscribe",(req,res)=>{const {subscription,clientId}=req.body||{};if(!subscription?.endpoint)return res.status(400).json({error:"invalid subscription"});const id=clientId||crypto.createHash("sha256").update(subscription.endpoint).digest("hex");subscriptions.set(id,subscription);res.json({ok:true,clientId:id});});
app.post("/unsubscribe",(req,res)=>{const endpoint=req.body?.endpoint;for(const [id,sub] of subscriptions)if(sub.endpoint===endpoint)subscriptions.delete(id);res.json({ok:true});});
async function sendTo(clientId,payload){const sub=subscriptions.get(clientId);if(!sub)return {sent:false,reason:"not_found"};try{await webpush.sendNotification(sub,JSON.stringify(payload));return {sent:true};}catch(err){if(err.statusCode===404||err.statusCode===410)subscriptions.delete(clientId);return {sent:false,reason:err.message};}}
app.post("/test",async(req,res)=>{const result=await sendTo(req.body?.clientId,{title:"梦角聊天室",body:"后台推送测试成功啦。",url:"./"});if(!result.sent)return res.status(404).json(result);res.json(result);});
app.post("/push",auth,async(req,res)=>{const {clientId,title="梦角聊天室",body="梦角来找你啦。",url="./"}=req.body||{};if(!clientId)return res.status(400).json({error:"clientId required"});res.json(await sendTo(clientId,{title,body,url}));});
app.post("/broadcast",auth,async(req,res)=>{const {title="梦角聊天室",body="梦角来找你啦。",url="./"}=req.body||{};const results=[];for(const id of subscriptions.keys())results.push({clientId:id,...await sendTo(id,{title,body,url})});res.json({ok:true,results});});
app.listen(PORT,()=>console.log(`Dream Chat Push Server listening on ${PORT}`));
