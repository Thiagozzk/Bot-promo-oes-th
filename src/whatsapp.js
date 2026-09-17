const {Client,LocalAuth,MessageMedia}=require("whatsapp-web.js");const QRCode=require("qrcode");
let qrData=null,ready=false,groups=[];
const client=new Client({authStrategy:new LocalAuth({dataPath:process.env.WA_SESSION_PATH||".wwebjs_auth"}),puppeteer:{headless:true,args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"]}});
client.on("qr",async qr=>{qrData=await QRCode.toDataURL(qr);ready=false;console.log("WhatsApp aguardando QR: abra /whatsapp")});
client.on("authenticated",()=>console.log("WhatsApp autenticado."));
client.on("ready",async()=>{ready=true;qrData=null;await refresh();console.log("WhatsApp pronto. Grupos:",groups.map(x=>x.name).join(", ")||"nenhum")});
client.on("disconnected",()=>{ready=false});
async function refresh(){if(!ready)return;const wanted=String(process.env.TARGET_GROUPS||"").split(",").map(x=>x.trim()).filter(Boolean);const chats=await client.getChats();groups=chats.filter(c=>c.isGroup&&wanted.includes(c.name)).map(c=>({name:c.name,id:c.id._serialized}))}
async function send(text,image){if(!ready)throw new Error("WhatsApp ainda não está conectado");if(!groups.length)await refresh();if(!groups.length)throw new Error("Nenhum TARGET_GROUPS encontrado");for(const g of groups){if(image){try{const m=await MessageMedia.fromUrl(image,{unsafeMime:true});await client.sendMessage(g.id,m,{caption:text})}catch{await client.sendMessage(g.id,text)}}else await client.sendMessage(g.id,text);await new Promise(r=>setTimeout(r,1500))}}
client.initialize().catch(e=>console.error("WhatsApp init:",e.message));
module.exports={status:()=>({ready,qrData,groups}),refresh,send};