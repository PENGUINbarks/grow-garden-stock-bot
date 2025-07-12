async function updateStock() {
  try {
    const channel = await client.channels.fetch('YOUR_CHANNEL_ID_HERE'); // use ID here

    const res = await fetch('https://api.growagarden.com/stock'); // change to real API
    const data = await res.json();

    const stockMessage = `
🌾 **Grow A Garden Stock Update**
🪴 Seeds: ${data.seeds.join(', ')}
⚙️ Gear: ${data.gear.join(', ')}
⏰ Last updated: <t:${Math.floor(Date.now() / 1000)}:R>
    `.trim();

    // Optional: delete old messages
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessages = messages.filter(msg => msg.author.id === client.user.id);
    await Promise.all(botMessages.map(msg => msg.delete()));

    await channel.send(stockMessage);
    console.log("✅ Stock posted!");
  } catch (err) {
    console.error("❌ Error updating stock:", err);
  }
}
