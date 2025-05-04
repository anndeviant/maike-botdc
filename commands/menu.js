const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("menu")
    .setDescription("Tampilkan semua perintah yang tersedia"),

  async execute(interaction) {
    const commandsPath = path.join(__dirname);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    const embed = new EmbedBuilder()
      .setTitle("🤖 Daftar Perintah Bot")
      .setDescription("Berikut adalah daftar semua perintah yang tersedia:")
      .setColor("#00ff00")
      .setTimestamp();

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      if ("data" in command) {
        embed.addFields({
          name: `/${command.data.name}`,
          value: command.data.description || "Tidak ada deskripsi",
        });
      }
    }

    await interaction.reply({ embeds: [embed] });
  },
};
