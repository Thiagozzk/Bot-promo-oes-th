const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const QRCode = require("qrcode");

let qrData = null;
let ready = false;
let groups = [];
let initializing = false;

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: process.env.WA_SESSION_PATH || ".wwebjs_auth"
  }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  }
});

client.on("qr", async (qr) => {
  qrData = await QRCode.toDataURL(qr);
  ready = false;
  console.log("WhatsApp QR gerado.");
});

client.on("authenticated", () => {
  console.log("WhatsApp autenticado.");
});

client.on("ready", async () => {
  ready = true;
  qrData = null;

  try {
    await refresh();
  } catch (e) {
    console.error("Erro ao carregar grupos:", e.message);
  }

  console.log(
    "WhatsApp pronto. Grupos:",
    groups.map((x) => x.name).join(", ") || "nenhum"
  );
});

client.on("auth_failure", (message) => {
  ready = false;
  console.error("WhatsApp falha de autenticação:", message);
});

client.on("disconnected", (reason) => {
  ready = false;
  qrData = null;
  console.log("WhatsApp desconectado:", reason);
});

async function refresh() {
  if (!ready) return;

  const wanted = String(process.env.TARGET_GROUPS || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const chats = await client.getChats();

  groups = chats
    .filter((c) => c.isGroup && wanted.includes(c.name))
    .map((c) => ({
      name: c.name,
      id: c.id._serialized
    }));
}

async function send(text, image) {
  if (!ready) {
    throw new Error("WhatsApp ainda não está conectado");
  }

  if (!groups.length) {
    await refresh();
  }

  if (!groups.length) {
    throw new Error("Nenhum TARGET_GROUPS encontrado");
  }

  for (const g of groups) {
    if (image) {
      try {
        const media = await MessageMedia.fromUrl(image, {
          unsafeMime: true
        });

        await client.sendMessage(g.id, media, {
          caption: text
        });
      } catch (e) {
        console.error("Erro ao enviar imagem:", e.message);
        await client.sendMessage(g.id, text);
      }
    } else {
      await client.sendMessage(g.id, text);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

async function initialize() {
  if (initializing || ready) return;

  initializing = true;

  console.log("Iniciando WhatsApp/Chromium...");

  try {
    await client.initialize();
  } catch (e) {
    console.error("WhatsApp init:", e);
  } finally {
    initializing = false;
  }
}

module.exports = {
  status: () => ({
    ready,
    qrData,
    groups,
    initializing
  }),
  initialize,
  refresh,
  send
};