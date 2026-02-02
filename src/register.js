import { REST, Routes } from "discord.js";
import { config } from "dotenv";
import { LeaderboardCommand } from "./commands/leaderboard.js";
import { VoicetimeCommand } from "./commands/voicetime.js";
import { WarnCommand, GetWarningsCommand, WarningLeaderboardCommand } from "./commands/warn.js";
import { NewsCommand } from "./commands/news.js";
import { TimeoutCommand } from "./commands/timeout.js";
import { ArkToggleCommand } from "./commands/arktoggle.js";
// import { TestArkCommand } from "./commands/testark.js";
config();

// config({ path: new URL("../../.env", import.meta.url).pathname });

const commands = [
  LeaderboardCommand.data.toJSON(),
  VoicetimeCommand.data.toJSON(),
  WarnCommand.data.toJSON(),
  GetWarningsCommand.data.toJSON(),
  WarningLeaderboardCommand.data.toJSON(),
  NewsCommand.data.toJSON(),
  TimeoutCommand.data.toJSON(),
  ArkToggleCommand.data.toJSON(),
  // TestArkCommand.data.toJSON(),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

rest
  .put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
  .then(() => console.log("Guild commands registered."))
  .catch(console.error);

rest
  .put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] })
  .then(() => console.log("Global commands cleared."))
  .catch(console.error);