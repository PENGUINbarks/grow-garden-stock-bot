import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';
import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

// Create a new Discord client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// ENV variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const ROBLOX_COOKIE = process.env.ROBLOX_COOKIE;
const CHANNEL_IDS = process.env.CHANNEL_IDS?.split(',') || [];

// Function to simulate fetching stock from Grow a Garden
async function fetchGrowAGardenStock() {
  try {
    const response = await fetch('https://api.growagarden.com/stock', {
      headers: {
        Cookie: `.ROBLOSECURITY=${ROBLOX_COOKIE}`,
      },
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch stock:', error);
    return null;
  }
}

// Function to post stock to Discord
async function postStockUpdate() {
  const stock = await fetchGrowAGardenStock();
  if (!stock) return;

  const message = `🌱 **Seed Stock**: ${stock.seeds.join(', ')}\n🛠️ **Gear Stock**: ${stock.gears.join(', ')}`;

  for (const channelId of CHANNEL_IDS) {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (channel) {
      channel.send(message).catch(err => console.error(`❌ Could not send to channel ${channelId}:`, err));
    }
  }
}

// Start bot
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // Post every 5 minutes
  postStockUpdate(); // run immediately on start
  setInterval(postStockUpdate, 5 * 60 * 1000);
});

client.login(DISCORD_TOKEN);
