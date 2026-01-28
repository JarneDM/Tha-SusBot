import { SlashCommandBuilder, EmbedBuilder } from "discord.js";


export const NewsCommand = {
  data: new SlashCommandBuilder().setName("news").setDescription("Nieuws over de bot.").addStringOption(option =>
    option.setName('news')
      .setDescription('Het nieuws dat je wilt delen.')
      .setRequired(true)
  ),

  async execute(interaction) {
    if (interaction.user.id !== '855438022182436865') {
        return interaction.reply({ content: 'Je hebt geen toestemming om deze opdracht te gebruiken.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle("UPDATE!!")
      .addFields({ name: "Nieuws", value: `${interaction.options.getString('news')}` })
      .setColor("Blue");

    await interaction.reply({ embeds: [embed] });
  },
};