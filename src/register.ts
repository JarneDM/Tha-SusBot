import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { REST, Routes } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID) {
  throw new Error("DISCORD_TOKEN and CLIENT_ID are required");
}

async function registerAllCommands() {
  const { registerCommands } = await import("./commands/pings.js");
  const { VoicetimeCommand } = await import("./commands/voicetime.js");
  const { LeaderboardCommand } = await import("./commands/leaderboard.js");

  const commands = [
    {
      name: "ping",
      description: "Replies with Pong!",
    },
    VoicetimeCommand.data.toJSON(),
    LeaderboardCommand.data.toJSON(),
  ];

  const rest = new REST({ version: "10" }).setToken(TOKEN as string);

  try {
    console.log("Started refreshing application (/) commands.");
    const route = GUILD_ID
      ? Routes.applicationGuildCommands(CLIENT_ID as string, GUILD_ID as string)
      : Routes.applicationCommands(CLIENT_ID as string);
    await rest.put(route, { body: commands });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Failed to register commands:", error);
    throw error;
  }
}

registerAllCommands().catch((err) => {
  console.error(err);
  process.exit(1);
});
