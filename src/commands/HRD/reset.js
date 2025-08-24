import { SlashCommandBuilder } from "discord.js";
import User from "../../models/User.js";

export default {
  data: new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Force a weekly reset of activity (HR only)"),

  async execute(interaction, client) {
    if (interaction.guild.id !== process.env.HR_SERVER_ID) {
      return interaction.reply({
        content: "❌ This command can only be used in the HR server.",
        ephemeral: true
      });
    }

    const users = await User.find();
    const logChannel = await client.channels.fetch(process.env.HR_LOG_CHANNEL_ID);

    let passed = [];
    let failed = [];

    for (const u of users) {
      if (u.minutes >= 300) { // Example: 300 minutes = 5 hrs required
        passed.push(`<:check:123456789> ${u.robloxUsername} (${u.discordId})`);
        try {
          const member = await client.users.fetch(u.discordId);
          await member.send(`✅ You passed this week’s quota with **${u.minutes} minutes**!`);
        } catch {}
      } else {
        failed.push(`<:cross:123456789> ${u.robloxUsername} (${u.discordId})`);
        try {
          const member = await client.users.fetch(u.discordId);
          await member.send(`❌ You failed this week’s quota with only **${u.minutes} minutes**.`);
        } catch {}
      }

      u.minutes = 0; // reset
      await u.save();
    }

    await logChannel.send({
      content: `📊 **Weekly HR Report**\n\n✅ Passed:\n${passed.join("\n") || "None"}\n\n❌ Failed:\n${failed.join("\n") || "None"}`
    });

    await interaction.reply({
      content: "✅ Weekly reset completed!",
      ephemeral: true
    });
  }
};
