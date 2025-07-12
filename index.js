require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const stockMessage = () => {
  return `🌱 **Grow A Garden Stock Update** 🌱

**🫘 SEEDS:**
- Carrot Seed 🥕 — 45
- Tomato Seed 🍅 — 62
- Cabbage Seed 🥬 — 53
- Sunflower Seed 🌻 — 27
- Onion Seed 🧅 — 31
- Lettuce Seed 🥗 — 44
- Corn Seed 🌽 — 39
- Potato Seed 🥔 — 36
- Pepper Seed 🌶️ — 20
- Watermelon Seed 🍉 — 18
- Strawberry Seed 🍓 — 24
- Radish Seed ❤️ — 11

**🛠️ GEAR:**
- Watering Can 💧 — 28
- Golden Watering Can ✨ — 5
- Shovel 🪣 — 17
- Super Shovel 🔥 — 3
- Scarecrow 🪆 — 9
- Compost Bag 🧤 — 14
- Sprinkler 💦 — 7
- Magic Fertilizer ✨ — 2
- Greenhouse 🌿 — 1

🕒 **Updated every 10 minutes**
📅 Last synced: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}
`;
};

const STOCK_INTERVAL = 10 * 60 * 1000;

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const guilds = await client.guilds.fetch();

  for (const [guildId] of guilds) {
    const guild = await client.guilds.fetch(guildId);
    const channels = await guild.channels.fetch();

    const stockChannel = channels.find(
      (channel) => channel.name === process.env.CHANNEL_NAME && channel.isTextBased()
    );

    if (!stockChannel) {
      console.error(`❌ Channel "${process.env.CHANNEL_NAME}" not found in ${guild.name}`);
      continue;
    }

    stockChannel.send(stockMessage());

    setInterval(() => {
      stockChannel.send(stockMessage());
    }, STOCK_INTERVAL);
  }
});

client.login(process.env.DISCORD_TOKEN);
