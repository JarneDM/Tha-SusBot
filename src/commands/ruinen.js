import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } from "@discordjs/voice";
// const play = require('play-dl');
import * as play from 'play-dl';

export const ruinCommand = {
  data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('update something important (developer only)'),
  async execute(interaction) {
    try {
      if (interaction.user?.id !== "855438022182436865") {
        return interaction.reply({
          content: "You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const voiceChannel = interaction.member?.voice.channel;

      if (!voiceChannel) {
        return interaction.reply({ content: 'You need to be in a voice channel to use this command!', flags: MessageFlags.Ephemeral });
      }

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      connection.subscribe(player);

      const stream = await play.stream('https://www.youtube.com/watch?v=GGrIg2-ydoM');
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });

      player.play(resource);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

              return interaction.reply({
                content: "Joining your voice channel and playing the video!",
                flags: MessageFlags.Ephemeral,
              });

    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Error playing video!', flags: MessageFlags.Ephemeral });
    }
  },
};