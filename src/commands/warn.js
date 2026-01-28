import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { addWarning, getWarnings, warningLeaderboard } from "../lib/db.js";

// command to issue a warning to a user
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
    // get the target user and reason from command options
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "Geen reden opgegeven";

    // store the warning in the database
    await addWarning(user.id, user.username, reason);

    // create a nice embed to show the warning was issued
    const embed = new EmbedBuilder()
      .setTitle("Waarschuwing gegeven")
      .setDescription(`Je hebt ${user.tag} gewaarschuwd.`)
      .addFields({ name: "Reden", value: reason })
      .setColor("Yellow");

    await interaction.reply({ embeds: [embed] });
  },
};

// command to check warnings for a specific user
export const GetWarningsCommand = {
  data: new SlashCommandBuilder().setName("getwarnings").setDescription("Bekijk de waarschuwingen van een user.").addUserOption(option =>
    option.setName('user')
      .setDescription('De user waarvan je de waarschuwingen wilt bekijken')
      .setRequired(true)
  ),

  async execute(interaction) {
    // fetch warnings for the specified user
    const user = interaction.options.getUser("user");
    const warnings = await getWarnings(user.id);

    // if no warnings, let them know
    if (warnings.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle("Geen waarschuwingen")
        .setDescription(`${user.tag} heeft geen waarschuwingen.`)
        .setColor("Green");

      await interaction.reply({ embeds: [embed] });
      return;
    }

    // build embed with all warnings
    const embed = new EmbedBuilder().setTitle(`Waarschuwingen voor ${user.tag}`).setColor("Orange");

    // add each warning to the embed
    warnings.forEach((warning, index) => {
      embed.addFields({
        name: `Waarschuwing ${index + 1}`,
        value: `Reden: ${warning.reason}\nDatum: ${new Date(warning.warnedAt).toLocaleString()}`,
      });
    });

    await interaction.reply({ embeds: [embed] });
    // let reply = `Waarschuwingen voor ${user.tag}:\n`;
    // warnings.forEach((warning, index) => {
    //   reply += `${index + 1}. Reden: ${warning.reason} - Datum: ${new Date(warning.warnedAt).toLocaleString()}\n`;
    // });

    // await interaction.reply(reply);
  },
};

// command to display the warning leaderboard (top warned users)
export const WarningLeaderboardCommand = {
  data: new SlashCommandBuilder().setName("warningleaderboard").setDescription("Bekijk de waarschuwing leaderboard."),

  async execute(interaction) {
    // fetch top 10 most warned users
    const leaderboard = await warningLeaderboard(10);

    // handle empty leaderboard
    if (leaderboard.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle("Geen waarschuwingen")
        .setDescription("Er zijn nog geen waarschuwingen gegeven.")
        .setColor("Green");

      await interaction.reply({ embeds: [embed] });
      return;
    }

    // create the leaderboard embed
    const embed = new EmbedBuilder().setTitle("🏆 Waarschuwing Leaderboard").setColor("Red");

    // add each users warning count to the leaderboard
    leaderboard.forEach((entry, index) => {
      embed.addFields({ name: `${index + 1}. ${entry.name}`, value: `Aantal waarschuwingen: ${entry.count}` });
    });

    await interaction.reply({ embeds: [embed] });
  },
};

