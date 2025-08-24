import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("event")
    .setDescription("Create a PR event log")
    .addStringOption(option =>
      option.setName("name")
        .setDescription("Event name")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("date")
        .setDescription("Event date & time")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("details")
        .setDescription("Details of the event")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

  async execute(interaction, client) {
    if (interaction.guild.id !== process.env.PR_SERVER_ID) {
      return interaction.reply({
        content: "❌ This command can only be used in the PR server.",
        ephemeral: true
      });
    }

    const name = interaction.options.getString("name");
    const date = interaction.options.getString("date");
    const details = interaction.options.getString("details");
    const channel = await client.channels.fetch(process.env.PR_EVENTS_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setTitle(`📅 Upcoming Event: ${name}`)
      .addFields(
        { name: "Date", value: date },
        { name: "Details", value: details }
      )
      .setColor("Green")
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    await interaction.reply({
      content: "✅ Event logged successfully.",
      ephemeral: true
    });
  }
};
