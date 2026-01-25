import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getLeaderboard } from "../lib/db.js";

export const LeaderboardCommand = {
  data: new SlashCommandBuilder().setName("leaderboard").setDescription("Toon de voice time leaderboard"),

  async execute(interaction) {
    const topUsers = await getLeaderboard();

    const leaderboardText = await Promise.all(
      topUsers.map(async (entry, index) => {
        const user = await interaction.guild.members.fetch(entry.userId).catch(() => null);
        const seconds = entry.totalSec ?? 0;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const userName = user ? user.user.username : "Unknown User";
        return `${index + 1}. **${userName}** - ${hours}u ${minutes}m`;
      }),
    );

    const embed = new EmbedBuilder()
      .setTitle("🏆 Voice Time Leaderboard")
      .setDescription(leaderboardText.join("\n") || "Geen data beschikbaar")
      .setColor(0x5865f2)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
