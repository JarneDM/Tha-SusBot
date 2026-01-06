import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { Client, GatewayIntentBits, Collection } from "discord.js";
import prisma from "./lib/client.js";
import { VoicetimeCommand } from "./commands/voicetime.js";
import { LeaderboardCommand } from "./commands/leaderboard.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] }) as any;
console.log("DISCORD_TOKEN:", process.env.DISCORD_TOKEN ? "loaded" : "missing");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "loaded" : "missing");

client.commands = new Collection();
client.commands.set(VoicetimeCommand.data.name, VoicetimeCommand);
client.commands.set(LeaderboardCommand.data.name, LeaderboardCommand);

client.on("interactionCreate", async (interaction: any) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const reply = { content: "Er is een fout opgetreden!", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

client.on("voiceStateUpdate", async (oldState: any, newState: any) => {
  const userId = newState.id;
  const joinedVoice = !oldState.channel && newState.channel;
  const leftVoice = oldState.channel && !newState.channel;

  if (joinedVoice && newState.channel) {
    try {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId },
      });

      await prisma.voiceSession.create({
        data: { userId, channelId: newState.channel.id, joinedAt: new Date() },
      });
    } catch (error) {
      console.error("Error creating voice session:", error);
    }
  }

  if (leftVoice) {
    try {
      const session = await prisma.voiceSession.findFirst({
        where: { userId, leftAt: null },
        orderBy: { joinedAt: "desc" },
      });

      if (session) {
        const durationSec = Math.floor((Date.now() - session.joinedAt.getTime()) / 1000);
        await prisma.voiceSession.update({
          where: { id: session.id },
          data: { leftAt: new Date(), durationSec },
        });
      }
    } catch (error) {
      console.error("Error updating voice session:", error);
    }
  }
});

const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
  console.error("Error: DISCORD_TOKEN not found in environment variables!");
  console.error("Please create a .env.local file with your Discord token.");
  process.exit(1);
}

client
  .login(TOKEN)
  .then(() => {
    console.log("Bot is starting...");
  })
  .catch((error: any) => {
    console.error("Failed to login:", error);
    process.exit(1);
  });
