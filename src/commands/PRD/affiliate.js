import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("affiliate")
    .setDescription("Submit an affiliate request")
    .addStringOption(option =>
      option.setName("group")
        .setDescription("Roblox Group Name or Link")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for affiliation")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    if (interaction.guild.id !== process.env.PR_SERVER_ID) {
      return interaction.reply({
        content: "❌ This command can only be used in the PR server.",
        ephemeral: true
      });
    }

    const group = interaction.options.getString("group");
    const reason = interaction.options.getString("reason");
    const logChannel = await client.channels.fetch(process.env.PR_LOG_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setTitle("📌 New Affiliate Request")
      .addFields(
        { name: "Submitted by", value: `${interaction.user} (${interaction.user.id})` },
        { name: "Group", value: group },
        { name: "Reason", value: reason }
      )
      .setColor("Yellow")
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });

    await interaction.reply({
      content: "✅ Your affiliate request has been submitted to PR staff.",
      ephemeral: true
    });
  }
};
