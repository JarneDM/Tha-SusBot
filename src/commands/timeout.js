import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";

const TIMEOUT_MS = 60_000;

export const TimeoutCommand = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout een gebruiker voor 1 minuut")
    .addUserOption((option) => option.setName("user").setDescription("De gebruiker die je wil timeouten").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reden voor de timeout").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason") ?? "Geen reden opgegeven";

    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "Dit command kan alleen in een server gebruikt worden.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (targetUser.id === interaction.user.id) {
      await interaction.reply({
        content: "Je kan jezelf niet timeouten.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (targetUser.id === interaction.client.user?.id) {
      await interaction.reply({
        content: "Ik kan mezelf niet timeouten.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      await interaction.editReply({ content: "Kon die gebruiker niet vinden in deze server." });
      return;
    }

    if (!member.moderatable) {
      await interaction.editReply({ content: "Ik heb geen rechten om deze gebruiker te timeouten." });
      return;
    }

    await member.timeout(TIMEOUT_MS, reason);

    await interaction.editReply({
      content: `${targetUser.tag} is getimeout voor 1 minuut. Reden: ${reason}`,
    });
  },
};
