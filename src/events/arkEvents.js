import { Events } from "discord.js";
import { Player } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { getArkToggle } from "../lib/db.js";

const TARGET_CHANNEL = "1458172952938811425";
const VOICE_CHANNEL = "1458162280784068703";
const TRIGGER_TEXT = "destroyed";
const EXCLUDE_TEXT = "NEVER_MATCH_THIS_TEXT_12345";
const ARK_STARTUP_SONG = "https://www.youtube.com/watch?v=GGrIg2-ydoM";

export function setupArkEvents(client) {
  console.log("[ARK] Setting up Ark events listener...");
  const player = new Player(client);

  let cachedToggle = null;
  let lastToggleCheck = 0;
  const isArkEnabled = async () => {
    const now = Date.now();
    if (cachedToggle !== null && now - lastToggleCheck < 10000) return cachedToggle;
    const value = await getArkToggle();
    cachedToggle = value;
    lastToggleCheck = now;
    return value;
  };

  player.extractors.register(YoutubeiExtractor, {}).catch((error) => {
    console.error("[ARK] Failed to register YoutubeiExtractor:", error);
  });

  client.on(Events.MessageCreate, async (message) => {
    // console.log(`[ARK] Raw MessageCreate event fired`);

    const enabled = await isArkEnabled();
    if (!enabled) {
      return;
    }

    if (message.channelId !== TARGET_CHANNEL) {
      console.log(`[ARK] Message in wrong channel. Expected: ${TARGET_CHANNEL}, Got: ${message.channelId}`);
      return;
    }

    const messageContent = message.content.toLowerCase();
    console.log(`[ARK] Checking message: "${messageContent.substring(0, 50)}..."`);

    if (messageContent.includes(TRIGGER_TEXT)) {
      console.log(`[ARK] TRIGGER MATCHED! Starting join process...`);
      try {
        console.log(`[ARK] Fetching voice channel: ${VOICE_CHANNEL}`);
        const voiceChannel = await client.channels.fetch(VOICE_CHANNEL);
        console.log(`[ARK] Voice channel fetched: ${voiceChannel?.name || "NOT FOUND"}`);

        if (!voiceChannel?.isVoiceBased()) {
          console.error("[ARK] Target channel is not a voice channel.");
          return;
        }

        console.log(`[ARK] Got guild ID: ${voiceChannel.guild.id}`);
        const existingConnection = player.nodes.get(voiceChannel.guild.id);
        if (existingConnection?.isPlaying()) {
          console.log("[ARK] Bot is already playing in a voice channel.");
          return;
        }

        console.log(`[ARK] Attempting to play: ${ARK_STARTUP_SONG}`);
        await player.play(voiceChannel, ARK_STARTUP_SONG, {
          requestedBy: message.author,
          nodeOptions: {
            metadata: message,
          },
        });

        console.log(`[ARK] Playing Ark startup song in ${voiceChannel.name}`);

        setTimeout(() => {
          const node = player.nodes.get(voiceChannel.guild.id);
          if (node) {
            node.delete();
            console.log(`[ARK] Disconnected from ${voiceChannel.name} after 3 seconds`);
          }
        }, 3000);
      } catch (error) {
        console.error("[ARK]  Error playing Ark startup song:", error);
      }
    }
  });
}
