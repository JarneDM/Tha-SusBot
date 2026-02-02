import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } from "@discordjs/voice";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ruinCommand = {
  data: new SlashCommandBuilder().setName("update").setDescription("update something important (developer only)"),

  async execute(interaction) {
    try {
      // 🔒 dev-only
      if (interaction.user.id !== "855438022182436865") {
        return interaction.reply({
          content: "You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const voiceChannel = interaction.member?.voice.channel;
      if (!voiceChannel) {
        return interaction.reply({
          content: "You need to be in a voice channel!",
          flags: MessageFlags.Ephemeral,
        });
      }

      // 🔊 join VC
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      connection.subscribe(player);

      // 🎵 lokaal bestand
      const soundPath = path.join(__dirname, "../assets/sounds/ark-startup.mp3");

      const resource = createAudioResource(soundPath);
      player.play(resource);

      // ⏱ disconnect na 3 seconden (wat er ook gebeurt)
      setTimeout(() => {
        if (connection.state.status !== "destroyed") {
          connection.destroy();
        }
      }, 3000);

      return interaction.reply({
        content: "Ark update sound played 👀",
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("[RUIN COMMAND ERROR]", error);
      return interaction.reply({
        content: "Error playing sound.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
