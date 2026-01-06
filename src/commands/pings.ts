import { REST, Routes } from "discord.js";

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // <-- add

if (!TOKEN) {
  throw new Error("DISCORD_TOKEN is not defined in environment variables.");
}
if (!CLIENT_ID) {
  throw new Error("CLIENT_ID is not defined in environment variables.");
}

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

export async function registerCommands() {
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

// `registerCommands` is exported; `src/register.ts` will invoke it.
