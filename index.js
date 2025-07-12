// 🌱 Grow A Garden Stock Bot - Final Production Code

const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

// ✅ Keep-alive web server for Render
const app = express();
app.get('/', (req, res) => res.send('✅ Grow A Garden bot is running'));
app.listen(3000, () => console.log('🌐 Web server running on port 3000'));

// ✅ Self-ping every 5 minutes to stay awake
setInterval(() => {
  fetch('https://your-render-url.onrender.com'); // 🔁 Replace with your real Render URL
}, 5 * 60 * 1000);

// ✅ Create the Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ✅ Bot ready event
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  updateStock(); // Run once at startup
  setInterval(updateStock, 5 * 60 * 1000); // Repeat every 5 minutes
});

// ✅ Stock data fetch and posting
const STOCK_API = 'https://api.example.com/growagarden/stock'; // Replace this with your actual API
const CHANNEL_ID = '1393575119124697158'; // ✅ Your actual channel ID

async function updateStock() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return console.log("❌ Channel not found");

    const res = await fetch(STOCK_API);
    const data = await res.json();

    const stockMessage = `
🌾 **Grow A Garden Stock Update**
🪴 **Seeds**: ${data.seeds?.join(', ') || 'N/A'}
⚙️ **Gear**: ${data.gear?.join(', ') || 'N/A'}
⏰ Last updated: <t:${Math.floor(Date.now() / 1000)}:R>
    `.trim();

    // Optional: clean up recent bot messages
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessages = messages.filter(msg => msg.author.id === client.user.id);
    await Promise.all(botMessages.map(msg => msg.delete()));

    await channel.send(stockMessage);
    console.log("✅ Stock update posted successfully");
  } catch (err) {
    console.error("❌ Error during stock update:", err);
  }
}

// ✅ Log in with bot token
client.login(process.env.DISCORD_TOKEN);
