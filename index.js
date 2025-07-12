import { Client, GatewayIntentBits } from 'discord.js';
import puppeteer from 'puppeteer';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const ROBLOX_COOKIE = process.env.ROBLOX_COOKIE;
const CHANNEL_ID = process.env.CHANNEL_ID;

const app = express();
app.get('/', (_, res) => res.send('Bot is running.'));
app.listen(3000, () => console.log('🌐 Web server running on port 3000'));

// Utility to scrape stock
async function fetchGrowAGardenStock() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  // Set the Roblox cookie for authentication
  await page.setCookie({
    name: '.ROBLOSECURITY',
    value: ROBLOX_COOKIE,
    domain: '.roblox.com',
    httpOnly: true,
    secure: true,
  });

  try {
    // Load Grow a Garden game shop (adjust if incorrect)
    await page.goto('https://www.roblox.com/games/126884695634066/Grow-a-Garden', {
      waitUntil: 'networkidle2',
    });

    // Wait and capture in-game stock details
    // ❗ You must replace these selectors with the actual ones from the game's shop UI
    const stockData = await page.evaluate(() => {
      const seeds = Array.from(document.querySelectorAll('.seed-stock-item')).map(el => el.textContent.trim());
      const gear = Array.from(document.querySelectorAll('.gear-stock-item')).map(el => el.textContent.trim());
      return { seeds, gear };
    });

    await browser.close();
    return stockData;
  } catch (error) {
    console.error('❌ Failed to fetch stock:', error);
    await browser.close();
    return null;
  }
}

// Post stock to Discord
async function postStockUpdate() {
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel || !channel.isTextBased()) {
    console.error(`❌ Channel not found or not text-based: ${CHANNEL_ID}`);
    return;
  }

  const stock = await fetchGrowAGardenStock();
  if (!stock) {
    channel.send('⚠️ Failed to fetch stock.');
    return;
  }

  const seedList = stock.seeds.length ? stock.seeds.join('\n') : 'No seeds found.';
  const gearList = stock.gear.length ? stock.gear.join('\n') : 'No gear found.';

  const message = `🌱 **Grow a Garden Stock Update**\n\n**🪴 Seeds In Stock:**\n${seedList}\n\n🛠️ **Gear In Stock:**\n${gearList}`;
  await channel.send(message);
}

// Login and schedule
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  postStockUpdate(); // Initial run
  setInterval(postStockUpdate, 5 * 60 * 1000); // Every 5 minutes
});

client.login(DISCORD_TOKEN);

