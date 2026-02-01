import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { getLeaderboard, getVoiceChannels, getVoiceSessionsByUser } from "../lib/db.js";

// command to check how much time the user has spent in voice channels
export const VoicetimeCommand = {
  data: new SlashCommandBuilder()
    .setName("voicetime")
    .setDescription("Bekijk hoeveel tijd je in voice hebt doorgebracht")
    .addUserOption((option) => option.setName("user").setDescription("De user waarvan je de voice tijd wilt bekijken").setRequired(false)),

  async execute(interaction) {
    // defer reply immediately to prevent timeout
    const isEphemeral = !interaction.options.getUser("user");
    await interaction.deferReply({ flags: isEphemeral ? MessageFlags.Ephemeral : 0 });

    // get all users from the leaderboard
    const topUsers = await getLeaderboard(1000);
    const userEntry = topUsers.find((u) => u.userId === interaction.options.getUser("user")?.id || interaction.user.id);
    const totalSec = userEntry?.totalSec ?? 0;
    let embed = new EmbedBuilder()
      .setTitle(`Voice tijd voor ${interaction.options.getUser("user")?.username || interaction.user.username}`)
      .setColor("Blue");

    // fetch all voice channels and sessions for this user
    const voiceChannels = await getVoiceChannels();
    const userSessions = await getVoiceSessionsByUser(interaction.options.getUser("user")?.id || interaction.user.id);
    if (userSessions.length === 0) {
      embed.addFields({ name: "Geen voice tijd", value: "Deze gebruiker heeft nog geen tijd in voice kanalen doorgebracht." });
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (
      interaction.options.getUser("user")?.id === "773225555767590943" ||
      interaction.options.getUser("user")?.id === "1131728345931972649" ||
      interaction.options.getUser("user")?.id === "744923108170924075" ||
      interaction.options.getUser("user")?.id === "1210180970741891113" ||
      interaction.options.getUser("user")?.id === "606147559915782194" ||
      interaction.options.getUser("user")?.id === "1114678815281655909" ||
      interaction.options.getUser("user")?.id === "696711637440135209"
    ) {
      embed.setColor("Red");
      embed.addFields({
        name: "No permissions",
        value: "The bot does not have the right permissions to track the voice time of this user.",
      });
      await interaction.editReply({ embeds: [embed] });
      return;
    }
    // initialize a map to track time spent in each channel
    const channelTimeMap = {};
    for (const channel of voiceChannels) {
      channelTimeMap[channel.id] = 0;
    }

    // aggregate session durations by channel
    for (const session of userSessions) {
      if (session.channelId in channelTimeMap && session.durationSec) {
        channelTimeMap[session.channelId] += session.durationSec;
      }
    }

    // create embed with the user's voice time per channel

    for (const channel of voiceChannels) {
      const seconds = channelTimeMap[channel.id] || 0;
      // convert seconds to hours and minutes
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      // only show channels where the user has spent time
      if (hours > 0 || minutes > 0) {
        embed.addFields({ name: channel.name, value: `${hours} uur en ${minutes} minuten` });
      }
    }

    // const hours = Math.floor(totalSec / 3600);
    // const minutes = Math.floor((totalSec % 3600) / 60);

    await interaction.editReply({ embeds: [embed] });
  },
};
