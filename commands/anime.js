const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anime")
    .setDescription("Cari info anime dari MyAnimeList")
    .addStringOption((option) =>
      option
        .setName("judul")
        .setDescription("Judul anime yang ingin dicari")
        .setRequired(true)
    ),

  async execute(interaction) {
    const title = interaction.options.getString("judul");
    await interaction.reply(`🔍 Mencari info anime: **${title}**...`);

    try {
      const response = await axios.get(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`
      );
      const anime = response.data.data[0];

      if (!anime) {
        await interaction.editReply("❌ Anime tidak ditemukan.");
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(anime.title)
        .setURL(anime.url)
        .setDescription(
          anime.synopsis
            ? anime.synopsis.slice(0, 300) + "..."
            : "Tidak ada sinopsis."
        )
        .setImage(anime.images.jpg.image_url)
        .addFields(
          {
            name: "Rating",
            value: anime.score?.toString() || "N/A",
            inline: true,
          },
          {
            name: "Episodes",
            value: anime.episodes?.toString() || "N/A",
            inline: true,
          },
          { name: "Status", value: anime.status || "N/A", inline: true }
        )
        .setFooter({ text: "Sumber: MyAnimeList via Jikan.moe" });

      await interaction.editReply({ content: "", embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply("❌ Gagal mengambil data dari Jikan API.");
    }
  },
};
