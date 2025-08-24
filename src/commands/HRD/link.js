import { SlashCommandBuilder } from "discord.js";
import User from "../../models/User.js";

export default {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link your Discord account with your Roblox username")
    .addStringOption(option =>
      option.setName("roblox")
        .setDescription("Your Roblox username")
        .setRequired(true)
    ),
    
  async execute(interaction) {
    const robloxUsername = interaction.options.getString("roblox");

    let user = await User.findOne({ discordId: interaction.user.id });
    if (!user) {
      user = new User({
        discordId: interaction.user.id,
        robloxUsername,
        minutes: 0
      });
    } else {
      user.robloxUsername = robloxUsername;
    }

    await user.save();

    await interaction.reply({
      content: `✅ Successfully linked **${interaction.user.username}** to Roblox: **${robloxUsername}**`,
      ephemeral: true
    });
  }
};
