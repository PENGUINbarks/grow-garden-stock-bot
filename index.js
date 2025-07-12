// Required dependencies
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

// ✅ Create web server to keep bot alive on Render
const app = express();
app.get('/', (req, res) => res.send('🌱 Grow A Garden bot is alive!'));
app.listen(3000, () => {
  console.log('🌐 Web server running on port 3000');
});

// ✅ Self-ping every 5 minutes to keep bot active
setInterval(() => {
  fetch('https://your-render-url.onrender.com'); // ⬅️ Replace with your actual Render URL
}, 5 * 60 * 1000);

// ✅ Create Discord client with needed intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ✅ When bot is ready
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  updateStock(); // Run once at startup
  setInterval(updateStock, 5 * 60 * 1000); // Run every 5 minutes
});

// ✅ Stock update function
async function updateStock() {
  const channel = client.channels.cache.find(c => c.name === 'grow-a-garden-stock');
  if (!channel) return console.log("❌ Channel 'grow-a-garden-stock' not found");

  try {
    const res = await fetch('https://api.growagarden.com/stock'); // Replace with real API if available
    const data = await res.json();

    const stockMessage = `
🌾 **Grow A Garden Stock Update**
🪴 Seeds: ${data.seeds.join(', ')}
⚙️ Gear: ${data.gear.join(', ')}
⏰ Last updated: <t:${Math.floor(Date.now() / 1000)}:R>
    `.trim();

    // Delete previous messages (optional, if you want only one)
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessages = messages.filter(msg => msg.author.id === client.user.id);
    await Promise.all(botMessages.map(msg => msg.delete()));

    // Send new stock update
    await channel.send(stockMessage);
    console.log("✅ Stock posted successfully!");
  } catch (err) {
    console.error("❌ Failed to fetch/post stock:", err);
  }
}

// ✅ Log in with token from environment variable
client.login(process.env.DISCORD_TOKEN);

