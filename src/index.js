import { Client, GatewayIntentBits, Collection, Events } from "discord.js";
import { config } from "dotenv";
import path from "path";
import * as db from "./lib/db.js"; // ons database bestand
import { VoicetimeCommand } from "./commands/voicetime.js";
import { TimeoutCommand } from "./commands/timeout.js";
import { LeaderboardCommand } from "./commands/leaderboard.js";
import { handleVoiceStateUpdate } from "./events/voiceStateUpdate.js";
import { WarnCommand, GetWarningsCommand, WarningLeaderboardCommand } from "./commands/warn.js";
import { NewsCommand } from "./commands/news.js";
import { setupArkEvents } from "./events/arkEvents.js";
import { Player } from "discord-player";
import extractorPkg from "@discord-player/extractor";
const { DefaultExtractors } = extractorPkg;
import { ruinCommand } from "./commands/ruinen.js";

// config({ path: new URL("../../.env", import.meta.url).pathname });
config();


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
export const player = new Player(client);

await player.extractors.loadMulti(DefaultExtractors);


client.commands = new Collection();
client.commands.set("voicetime", VoicetimeCommand);
client.commands.set("leaderboard", LeaderboardCommand);
client.commands.set("warn", WarnCommand);
client.commands.set("getwarnings", GetWarningsCommand);
client.commands.set("warningleaderboard", WarningLeaderboardCommand);
client.commands.set("news", NewsCommand);
client.commands.set("timeout", TimeoutCommand);
client.commands.set("update", ruinCommand);

client.once(Events.ClientReady, () => {
  console.log(`Logged in als ${client.user.tag}`);
  console.log("[ARK DEBUG] setupArkEvents is being called...");
});

// Setup Ark events BEFORE login
setupArkEvents(client);
console.log("[ARK DEBUG] setupArkEvents called");

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "Er is iets misgegaan bij het uitvoeren van het command!",
      ephemeral: true,
    });
  }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  try {
    await handleVoiceStateUpdate(client, oldState, newState);
  } catch (error) {
    console.error("Error in voiceStateUpdate handler:", error);
  }
});

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) throw new Error("DISCORD_TOKEN is not defined in environment variables.");

client.login(TOKEN).then(() => console.log("Bot is online!"));
