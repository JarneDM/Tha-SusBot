import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { addWarning, getWarnings, warningLeaderboard } from "../lib/db.js";


export const WarnCommand = {
  data: new SlashCommandBuilder().setName("warn").setDescription("Waarschuw een user.").addUserOption(option =>
    option.setName('user')
      .setDescription('De user die je wilt waarschuwen')
      .setRequired(true)
  ).addStringOption(option =>
    option.setName('reason')
      .setDescription('De reden voor de waarschuwing')
      .setRequired(false)
  ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Geen reden opgegeven';

    await addWarning(user.id, user.username, reason);

    const embed = new EmbedBuilder()
      .setTitle("Waarschuwing gegeven")
      .setDescription(`Je hebt ${user.tag} gewaarschuwd.`)
      .addFields(
        { name: "Reden", value: reason }
      )
      .setColor("Yellow");

    await interaction.reply({ embeds: [embed] });
  },
};

export const GetWarningsCommand = {
  data: new SlashCommandBuilder().setName("getwarnings").setDescription("Bekijk de waarschuwingen van een user.").addUserOption(option =>
    option.setName('user')
      .setDescription('De user waarvan je de waarschuwingen wilt bekijken')
      .setRequired(true)
  ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const warnings = await getWarnings(user.id);

    if (warnings.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle("Geen waarschuwingen")
        .setDescription(`${user.tag} heeft geen waarschuwingen.`)
        .setColor("Green");

      await interaction.reply({ embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`Waarschuwingen voor ${user.tag}`)
      .setColor("Orange");

    warnings.forEach((warning, index) => {
      embed.addFields({ name: `Waarschuwing ${index + 1}`, value: `Reden: ${warning.reason}\nDatum: ${new Date(warning.warnedAt).toLocaleString()}` });
    });

    await interaction.reply({ embeds: [embed] });
    // let reply = `Waarschuwingen voor ${user.tag}:\n`;
    // warnings.forEach((warning, index) => {
    //   reply += `${index + 1}. Reden: ${warning.reason} - Datum: ${new Date(warning.warnedAt).toLocaleString()}\n`;
    // });

    // await interaction.reply(reply);
  },
};

export const WarningLeaderboardCommand = {
  data: new SlashCommandBuilder().setName("warningleaderboard").setDescription("Bekijk de waarschuwing leaderboard."),

  async execute(interaction) {
    const leaderboard = await warningLeaderboard(10);

    if (leaderboard.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle("Geen waarschuwingen")
        .setDescription("Er zijn nog geen waarschuwingen gegeven.")
        .setColor("Green");

      await interaction.reply({ embeds: [embed] });
      return;
    }
      
    const embed = new EmbedBuilder()
      .setTitle("🏆 Waarschuwing Leaderboard")
      .setColor("Red");

    leaderboard.forEach((entry, index) => {
      // show name of user not id
      embed.addFields({ name: `${index + 1}. ${entry.name}`, value: `Aantal waarschuwingen: ${entry.count}` });
    });

    await interaction.reply({ embeds: [embed] });

    // let reply = "Waarschuwing Leaderboard:\n";
    // for (let i = 0; i < leaderboard.length; i++) {
    //   const entry = leaderboard[i];
    //   reply += `${i + 1}. <@${entry.userId}> - ${entry.count} waarschuwingen\n`;
    // }

    // await interaction.reply(reply);
  },
};

