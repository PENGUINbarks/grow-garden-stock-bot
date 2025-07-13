import { Client, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN;
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once('ready', () => {
  console.log(`🟢 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.channel.id !== TARGET_CHANNEL_ID) return;
  if (message.author.bot) return;

  // Delete messages with attachments (images, files) or stickers
  if (message.attachments.size > 0 || message.stickers.size > 0) {
    try {
      await message.delete();
      console.log(`🧹 Deleted media message from ${message.author.tag} in #${message.channel.name}`);
    } catch (err) {
      console.error(`Failed to delete message: ${err}`);
    }
  }
});

client.login(TOKEN);
