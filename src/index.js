require("dotenv").config();const express=require("express"),db=require("./db"),wa=require("./whatsapp");
const ml=require("./providers/mercadolivre"),ali=require("./providers/aliexpress"),custom=require("./providers/custom");
const app=express();app.use(express.json());app.use(express.static("public"));const port=Number(process.env.PORT||3000);
const min=()=>Number(process.env.MIN_DISCOUNT||30),max=()=>Number(process.env.MAX_SEND_PER_SCAN||5);
function msg(o){const brl=v=>Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});return `🔥 *OFERTA DE PC* 🔥\n\n🖥️ *${o.title}*\n🏪 ${o.store}\n${o.oldPrice?`❌ De: ~${brl(o.oldPrice)}~\n`:""}💰 *Por: ${brl(o.price)}*\n📉 *${Math.round(o.discount)}% OFF*\n\n🔗 ${o.url}\n\n⚠️ Preço e estoque podem mudar.`}
function save(o){return db.prepare("INSERT OR IGNORE INTO offers(id,title,store,url,image,old_price,price,discount,found_at,raw) VALUES(?,?,?,?,?,?,?,?,?,?)").run(o.id,o.title,o.store,o.url,o.image,o.oldPrice,o.price,o.discount,new Date().toISOString(),JSON.stringify(o.raw)).changes>0}
async function scan(){
 const sets=await Promise.allSettled([ml.search(),ali.search(),custom.search()]);let offers=sets.flatMap(x=>x.status==="fulfilled"?x.value:[]);
 const seen=new Set();offers=offers.filter(o=>o.discount>=min()&&!seen.has(o.url)&&(seen.add(o.url),true)).sort((a,b)=>b.discount-a.discount);
 let added=0,sent=0;for(const o of offers){if(!save(o))continue;added++;if(String(process.env.AUTO_SEND).toLowerCase()==="true"&&sent<max()){try{await wa.send(msg(o),o.image);db.prepare("UPDATE offers SET sent_at=? WHERE id=?").run(new Date().toISOString(),o.id);sent++}catch(e){console.error("Envio:",e.message)}}}
 return {found:offers.length,added,sent};
}
function auth(req,res,next){if(req.headers["x-admin-key"]!==process.env.ADMIN_KEY)return res.status(401).json({error:"Chave inválida"});next()}
app.get("/health",(q,s)=>s.json({ok:true}));
app.get("/api/status",(q,s)=>s.json({whatsapp:wa.status(),minDiscount:min(),autoSend:String(process.env.AUTO_SEND).toLowerCase()==="true",ml:!!process.env.ML_ACCESS_TOKEN,aliexpress:!!(process.env.ALIEXPRESS_APP_KEY&&process.env.ALIEXPRESS_APP_SECRET&&process.env.ALIEXPRESS_TRACKING_ID),feed:!!process.env.CUSTOM_FEED_URL,total:db.prepare("SELECT count(*) n FROM offers").get().n}));
app.get("/api/offers",(q,s)=>s.json(db.prepare("SELECT * FROM offers ORDER BY found_at DESC LIMIT 100").all()));
app.post("/api/scan",auth,async(q,s)=>{try{s.json(await scan())}catch(e){s.status(500).json({error:e.message})}});
app.post("/api/send/:id",auth,async(q,s)=>{const o=db.prepare("SELECT * FROM offers WHERE id=?").get(q.params.id);if(!o)return s.sendStatus(404);try{await wa.send(msg({title:o.title,store:o.store,url:o.url,image:o.image,oldPrice:o.old_price,price:o.price,discount:o.discount}),o.image);db.prepare("UPDATE offers SET sent_at=? WHERE id=?").run(new Date().toISOString(),o.id);s.json({ok:true})}catch(e){s.status(500).json({error:e.message})}});
app.get("/whatsapp",(q,s)=>{const st=wa.status();s.send(`<!doctype html><meta charset=utf-8><style>body{font-family:system-ui;background:#101114;color:#fff;text-align:center;padding:40px}img{background:#fff;padding:15px;max-width:320px}.ok{color:#5fda8b}</style><h1>WhatsApp</h1>${st.ready?`<h2 class=ok>✅ Conectado</h2><p>Grupos: ${st.groups.map(g=>g.name).join(", ")||"aguardando cache"}</p>`:st.qrData?`<p>WhatsApp → Aparelhos conectados → Conectar aparelho</p><img src="${st.qrData}"><p>Atualize esta página depois de escanear.</p>`:"<p>Gerando QR... atualize em alguns segundos.</p>"}`)});
setInterval(()=>scan().catch(console.error),Math.max(1,Number(process.env.SCAN_MINUTES||15))*60000);
app.listen(port,"0.0.0.0",()=>console.log(`Bot Promo PC online: porta ${port}`));