import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import prisma from "../lib/client.js";

export const LeaderboardCommand = {
  data: new SlashCommandBuilder().setName("leaderboard").setDescription("Toon de voice time leaderboard"),
  async execute(interaction: any) {
    // find users who have only active sessions with no completed sessions
    const allUsers = await prisma.voiceSession.groupBy({
      by: ["userId"],
    });

    const usersWithCompletedSessions = await prisma.voiceSession.groupBy({
      by: ["userId"],
      where: { leftAt: { not: null } },
    });

    const usersWithOnlyActiveSessions = allUsers
      .filter((u) => !usersWithCompletedSessions.find((c) => c.userId === u.userId))
      .map((u) => u.userId);

    const topUsers = await prisma.voiceSession.groupBy({
      by: ["userId"],
      _sum: { durationSec: true },
      orderBy: { _sum: { durationSec: "desc" } },
      take: 10,
      where: { userId: { notIn: usersWithOnlyActiveSessions } },
    });

    console.log(
      "Leaderboard users:",
      topUsers.map((u) => ({ userId: u.userId, totalSeconds: u._sum.durationSec }))
    );

    const leaderboardText = await Promise.all(
      topUsers.map(async (entry, index) => {
        const user = await interaction.guild.members.fetch(entry.userId).catch(() => null);
        const seconds = entry._sum.durationSec ?? 0;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const userName = user ? user.user.username : "Unknown User";
        return `${index + 1}. **${userName}** - ${hours}u ${minutes}m`;
      })
    );

    const embed = new EmbedBuilder()
      .setTitle("🏆 Voice Time Leaderboard")
      .setDescription(leaderboardText.join("\n") || "Geen data beschikbaar")
      .setColor(0x5865f2)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
