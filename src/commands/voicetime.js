import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getLeaderboard, getVoiceChannels, getVoiceSessionsByUser } from "../lib/db.js";

export const VoicetimeCommand = {
  data: new SlashCommandBuilder().setName("voicetime").setDescription("Bekijk hoeveel tijd je in voice hebt doorgebracht"),

  async execute(interaction) {
    const topUsers = await getLeaderboard(1000); // haal alle users op
    const userEntry = topUsers.find((u) => u.userId === interaction.user.id);
    const totalSec = userEntry?.totalSec ?? 0;

    const voiceChannels = await getVoiceChannels();
    const userSessions = await getVoiceSessionsByUser(interaction.user.id);
    const channelTimeMap = {};
    for (const channel of voiceChannels) {
      channelTimeMap[channel.id] = 0;
    }
    for (const session of userSessions) {
      if (session.channelId in channelTimeMap && session.durationSec) {
        channelTimeMap[session.channelId] += session.durationSec;
      }
    }

    let embed = new EmbedBuilder().setTitle(`Voice tijd voor ${interaction.user.username}`).setColor("Blue");
    for (const channel of voiceChannels) {
      const seconds = channelTimeMap[channel.id] || 0;
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (hours > 0 || minutes > 0) {
        embed.addFields({ name: channel.name, value: `${hours} uur en ${minutes} minuten` });
      }
    }

    // const hours = Math.floor(totalSec / 3600);
    // const minutes = Math.floor((totalSec % 3600) / 60);

    await interaction.reply({ embeds: [embed] });
  },
};
