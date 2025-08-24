import { SlashCommandBuilder } from "discord.js";
import User from "../../models/User.js";

export default {
  data: new SlashCommandBuilder()
    .setName("activity")
    .setDescription("Check activity minutes")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Check another user’s activity (HR only)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user") || interaction.user;

    const user = await User.findOne({ discordId: target.id });
    if (!user) {
      return interaction.reply({
        content: "❌ No data found for that user.",
        ephemeral: true
      });
    }

    await interaction.reply({
      content: `🕒 **${target.username}** has **${user.minutes} minutes** logged this week.`,
      ephemeral: true
    });
  }
};
