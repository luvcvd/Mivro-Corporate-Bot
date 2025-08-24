import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link a Discord user to a Roblox username.")
    .addUserOption(opt =>
      opt.setName("discord_user").setDescription("Discord user to link").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("roblox_username").setDescription("Roblox username").setRequired(true)
    )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log("✅ Slash commands registered globally.");
  } catch (err) {
    console.error(err);
  }
})();
