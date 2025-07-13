import { config } from 'dotenv';
config();

import { Client, GatewayIntentBits } from 'discord.js';
import puppeteer from 'puppeteer';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Grow a Garden bot is running!'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  fetchAndPostStock(); // run immediately on start
  setInterval(fetchAndPostStock, 5 * 60 * 1000); // every 5 minutes
});

async function fetchAndPostStock() {
  try {
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    const page = await browser.newPage();
    await page.setCookie({
      name: '.ROBLOSECURITY',
      value: process.env.ROBLOX_COOKIE,
      domain: '.roblox.com',
    });

    await page.goto('https://www.roblox.com/games/126884695634066/Grow-a-Garden', {
      waitUntil: 'networkidle2',
    });

    // Simulated scraping: replace with actual scraping logic
    const stockData = '🌱 Example seed: Carrot (Common)\n🔧 Example gear: Watering Can (Rare)';

    await browser.close();

    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    if (channel) {
      await channel.send(`📦 **Current Grow A Garden Stock:**\n${stockData}`);
    }
  } catch (err) {
    console.error('❌ Failed to fetch/post stock:', err);
  }
}

client.login(process.env.DISCORD_TOKEN);
