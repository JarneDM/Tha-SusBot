import { Events } from "discord.js";
import { Player } from "discord-player";

const TARGET_CHANNEL = "1458172952938811425";
const VOICE_CHANNEL = "1458162280784068703";
const TRIGGER_TEXT = "destroyed";
const EXCLUDE_TEXT = "lol";
const ARK_STARTUP_SONG = "https://www.youtube.com/watch?v=-i46eHm8gTs&list=RD-i46eHm8gTs&start_radio=1";

export function setupArkEvents(client) {
  const player = new Player(client);

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    if (message.channelId !== TARGET_CHANNEL) return;

    const messageContent = message.content.toLowerCase();

    if (messageContent.includes(TRIGGER_TEXT.toLowerCase()) && !messageContent.includes(EXCLUDE_TEXT.toLowerCase())) {
      try {
        const voiceChannel = await client.channels.fetch(VOICE_CHANNEL);

        if (!voiceChannel?.isVoiceBased()) {
          console.error("Target channel is not a voice channel.");
          return;
        }

        const existingConnection = player.nodes.get(voiceChannel.guild.id);
        if (existingConnection?.isConnected()) {
          console.log("Bot is already playing in a voice channel.");
          return;
        }

        const queue = player.nodes.create(voiceChannel.guild.id, {
          metadata: voiceChannel,
        });

        if (!queue.connection) {
          await queue.connect(voiceChannel);
        }

        const track = await player.search(ARK_STARTUP_SONG, {
          requestedBy: message.author,
        });

        if (!track.tracks.length) {
          console.error("Could not find Ark theme song.");
          return;
        }

        queue.addTrack(track.tracks[0]);

        if (!queue.isPlaying()) {
          await queue.node.play();
        }

        console.log(`Playing Ark startup song in ${voiceChannel.name}`);
      } catch (error) {
        console.error("Error playing Ark startup song:", error);
      }
    }
  });
}
