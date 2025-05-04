const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

// List of common anime genres with their IDs from Jikan API
const genres = [
  { name: "Action", id: 1 },
  { name: "Adventure", id: 2 },
  { name: "Comedy", id: 4 },
  { name: "Drama", id: 8 },
  { name: "Fantasy", id: 10 },
  { name: "Horror", id: 14 },
  { name: "Mystery", id: 7 },
  { name: "Romance", id: 22 },
  { name: "Sci-Fi", id: 24 },
  { name: "Slice of Life", id: 36 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("genre")
    .setDescription("Cari anime berdasarkan genre")
    .addStringOption((option) =>
      option
        .setName("genre")
        .setDescription("Genre anime yang ingin dicari")
        .setRequired(true)
        .addChoices(
          ...genres.map((genre) => ({
            name: genre.name,
            value: String(genre.id),
          }))
        )
    ),

  async execute(interaction) {
    const genreId = interaction.options.getString("genre");
    const genreName =
      genres.find((g) => g.id === parseInt(genreId))?.name || "Unknown";

    await interaction.reply(
      `🔍 Mencari anime dengan genre: **${genreName}**...`
    );

    try {
      const response = await axios.get(
        `https://api.jikan.moe/v4/anime?genres=${genreId}&limit=5&order_by=popularity`
      );

      if (!response.data.data.length) {
        await interaction.editReply(
          "❌ Tidak ada anime ditemukan untuk genre ini."
        );
        return;
      }

      const animeList = response.data.data;

      const embed = new EmbedBuilder()
        .setTitle(`Top Anime dengan Genre: ${genreName}`)
        .setDescription(
          "Berikut adalah 5 anime populer dengan genre yang dipilih:"
        )
        .setColor("#0099ff");

      animeList.forEach((anime, index) => {
        embed.addFields({
          name: `${index + 1}. ${anime.title}`,
          value: `Rating: ${anime.score || "N/A"} | Episodes: ${
            anime.episodes || "N/A"
          }\n${
            anime.synopsis
              ? anime.synopsis.slice(0, 100) + "..."
              : "Tidak ada sinopsis."
          }`,
        });
      });

      embed.setFooter({ text: "Sumber: MyAnimeList via Jikan.moe" });

      await interaction.editReply({ content: "", embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply("❌ Gagal mengambil data dari Jikan API.");
    }
  },
};
