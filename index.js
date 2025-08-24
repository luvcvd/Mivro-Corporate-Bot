import { Client, GatewayIntentBits, Partials, Events, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import express from "express";
import schedule from "node-schedule";

dotenv.config();

// --- BOT CLIENT ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

const TOKEN = process.env.TOKEN;
const HR_SERVER_ID = process.env.HR_SERVER_ID;
const HR_LOG_CHANNEL = process.env.HR_LOG_CHANNEL;

// --- DATABASE FILE ---
const dataFile = path.join("./", "userdata.json");
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify({ users: [] }, null, 2));

function loadData() {
  return JSON.parse(fs.readFileSync(dataFile));
}
function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// --- READY EVENT ---
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// --- SLASH COMMAND HANDLER ---
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const data = loadData();

  if (interaction.commandName === "link") {
    const discordUser = interaction.options.getUser("discord_user");
    const robloxUsername = interaction.options.getString("roblox_username");

    let existing = data.users.find(u => u.discord_id === discordUser.id);
    if (existing) {
      existing.roblox_username = robloxUsername;
    } else {
      data.users.push({ discord_id: discordUser.id, roblox_username: robloxUsername, minutes: 0 });
    }
    saveData(data);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#5865F2")
          .setTitle("🔗 Link Successful")
          .setDescription(`Linked ${discordUser} to Roblox username **${robloxUsername}**.`)
          .setFooter({ text: "Avyra HR System" })
      ],
      ephemeral: true,
    });
  }
});

// --- EXPRESS SERVER TO RECEIVE ROBLOX LOGGING ---
const app = express();
app.use(express.json());

app.post("/log-activity", (req, res) => {
  const { discord_id, minutes } = req.body;
  const data = loadData();

  let user = data.users.find(u => u.discord_id === discord_id);
  if (user) {
    user.minutes += minutes;
    saveData(data);
    console.log(`⏱ Added ${minutes} minutes to ${user.roblox_username}`);
  }
  res.sendStatus(200);
});

app.listen(3000, () => console.log("📡 Listening on port 3000 for Roblox logs"));

// --- WEEKLY RESET (Sundays at 3PM EST) ---
schedule.scheduleJob({ dayOfWeek: 0, hour: 15, minute: 0, tz: "America/New_York" }, async () => {
  const data = loadData();
  const hrGuild = client.guilds.cache.get(HR_SERVER_ID);
  const logChannel = hrGuild.channels.cache.get(HR_LOG_CHANNEL);

  let embed = new EmbedBuilder()
    .setColor("#2ECC71")
    .setTitle("📊 Weekly HR Report")
    .setDescription("Here are the results for this week's activity check.")
    .setTimestamp()
    .setFooter({ text: "Avyra Corporate HR" });

  let passList = "";
  let failList = "";

  for (let user of data.users) {
    let discordUser = await client.users.fetch(user.discord_id).catch(() => null);
    if (!discordUser) continue;

    let passed = user.minutes >= 300; // quota in minutes
    let statusEmoji = passed ? "✅" : "❌";

    if (passed) {
      passList += `${statusEmoji} ${discordUser.tag} (${user.roblox_username}) — ${user.minutes} mins\n`;
    } else {
      failList += `${statusEmoji} ${discordUser.tag} (${user.roblox_username}) — ${user.minutes} mins\n`;
    }

    try {
      await discordUser.send(
        `${statusEmoji} Your weekly quota reset.\nYou ${passed ? "passed ✅" : "failed ❌"} with **${user.minutes} minutes** logged.`
      );
    } catch (err) {
      console.log(`⚠️ Couldn't DM ${discordUser.tag}`);
    }

    user.minutes = 0; // reset
  }

  if (passList !== "") embed.addFields({ name: "✅ Passed", value: passList });
  if (failList !== "") embed.addFields({ name: "❌ Failed", value: failList });

  saveData(data);
  if (logChannel) logChannel.send({ embeds: [embed] });
});

client.login(TOKEN);
