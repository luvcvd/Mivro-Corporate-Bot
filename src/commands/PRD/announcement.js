import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Send a public announcement")
    .addStringOption(option =>
      option.setName("title")
        .setDescription("Title of the announcement")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("message")
        .setDescription("The announcement message")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client) {
    if (interaction.guild.id !== process.env.PR_SERVER_ID) {
      return interaction.reply({
        content: "❌ This command can only be used in the PR server.",
        ephemeral: true
      });
    }

    const title = interaction.options.getString("title");
    const message = interaction.options.getString("message");
    const channel = await client.channels.fetch(process.env.PR_ANNOUNCE_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(message)
      .setColor("Blue")
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    await interaction.reply({
      content: "✅ Announcement sent!",
      ephemeral: true
    });
  }
};
