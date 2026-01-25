import { REST, Routes } from "discord.js";
import { config } from "dotenv";
import { LeaderboardCommand } from "./commands/leaderboard.js";
import { VoicetimeCommand } from "./commands/voicetime.js";

config({ path: new URL("../../.env", import.meta.url).pathname });

const commands = [
  LeaderboardCommand.data.toJSON(),
  VoicetimeCommand.data.toJSON(),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

rest
  .put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);