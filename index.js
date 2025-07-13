
import puppeteer from 'puppeteer';
import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ROBLOX_COOKIE = process.env.ROBLOX_COOKIE;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  fetchAndPostStock();
  setInterval(fetchAndPostStock, 5 * 60 * 1000); // every 5 minutes
});

async function fetchAndPostStock() {
  console.log("⏳ Fetching Grow a Garden stock...");

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });

    const page = await browser.newPage();

    // Set .ROBLOSECURITY cookie
    await page.setCookie({
      name: '.ROBLOSECURITY',
      value: ROBLOX_COOKIE,
      domain: '.roblox.com',
      path: '/',
      httpOnly: true,
      secure: true,
    });

    // Go to the game page or some specific inventory page if available
    await page.goto('https://www.roblox.com/games/126884695634066/Grow-a-Garden', {
      waitUntil: 'networkidle2',
    });

    // Simulate or find shop GUI here — example placeholder
    const stock = await page.evaluate(() => {
      // Simulate extracting stock
      return [
        '🧄 Garlic Seed (Rare)',
        '🥕 Carrot Seed (Common)',
        '🔧 Super Sprinkler (Epic)',
        '❌ Flamethrower (Unavailable)',
      ].join('\n');
    });

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel && channel.isTextBased()) {
      await channel.send(`🌱 **Grow a Garden Stock Update:**\n\n${stock}`);
      console.log("✅ Posted stock update to Discord.");
    }

    await browser.close();
  } catch (err) {
    console.error("❌ Failed to fetch/post stock:", err);
  }
}

client.login(DISCORD_TOKEN);
