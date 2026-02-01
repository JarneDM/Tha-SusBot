import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import { getArkToggle, setArkToggle } from "../lib/db.js";

export const ArkToggleCommand = {
  data: new SlashCommandBuilder()
    .setName("arktoggle")
    .setDescription("Zet Ark events aan of uit")
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("Kies of Ark events aan of uit moeten")
        .setRequired(true)
        .addChoices(
          { name: "on", value: "true" },
          { name: "off", value: "false" }
        )
    ),

  async execute(interaction) {
    const status = interaction.options.getString("status", true);
    const isOn = status === "true";

    await setArkToggle(isOn);
    const current = await getArkToggle();

    await interaction.reply({
      content: `Ark events staan nu ${current ? "aan" : "uit"}.`,
    });
  },
};
