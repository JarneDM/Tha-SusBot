import { SlashCommandBuilder } from "discord.js";
import prisma from "../../lib/client.ts";

export const VoicetimeCommand = {
  data: new SlashCommandBuilder().setName("voicetime").setDescription("Laat zien hoeveel tijd je in voice hebt doorgebracht"),
  async execute(interaction: any) {
    const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
    const userId = interactionUser.id;

    const total = await prisma.voiceSession.aggregate({
      where: { userId },
      _sum: { durationSec: true },
    });

    if (!total._sum.durationSec) {
      await interaction.reply("Je hebt nog geen voice tijd geregistreerd.");
      return;
    }

    const seconds = total._sum.durationSec ?? 0;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    await interaction.reply(`Je hebt ${hours}u ${minutes}m ${secs}s in voice gezeten.`);
  },
};
