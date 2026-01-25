import { SlashCommandBuilder } from "discord.js";
import { getLeaderboard } from "../lib/db.js";

export const VoicetimeCommand = {
  data: new SlashCommandBuilder().setName("voicetime").setDescription("Bekijk hoeveel tijd je in voice hebt doorgebracht"),

  async execute(interaction) {
    const topUsers = await getLeaderboard(1000); // haal alle users op
    const userEntry = topUsers.find((u) => u.userId === interaction.user.id);
    const totalSec = userEntry?.totalSec ?? 0;

    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);

    await interaction.reply(`Je hebt **${hours} uur en ${minutes} minuten** in voice doorgebracht!`);
  },
};
