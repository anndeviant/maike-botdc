const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

// List of common anime genres with their IDs from Jikan API
const genres = [
  { name: "Action", id: 1 },
  { name: "Adventure", id: 2 },
  { name: "Comedy", id: 4 },
  { name: "Horror", id: 14 },
  { name: "Mystery", id: 7 },
  { name: "Romance", id: 22 },
  { name: "Sci-Fi", id: 24 },
  { name: "Slice of Life", id: 36 },
  { name: "Sports", id: 30 },
  { name: "Supernatural", id: 37 },
  { name: "Ecchi", id: 9 },
  { name: "Gore", id: 58 },
  { name: "Harem", id: 35 },
  { name: "Historical", id: 13 },
  { name: "Isekai", id: 62 },
  { name: "Mecha", id: 18 },
  { name: "Medical", id: 67 },
  { name: "Military", id: 38 },
  { name: "Parody", id: 20 },
  { name: "Psychological", id: 40 },
  { name: "School", id: 23 },
  { name: "Space", id: 29 },
  { name: "Super Power", id: 31 },
  { name: "Survival", id: 76 },
  { name: "Shounen", id: 27 }
]

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
      //halaman pertama untuk tahu total halaman
      const firstPage = await axios.get(
        `https://api.jikan.moe/v4/anime?genres=${genreId}&limit=25&page=1`
      );

      const totalPages = firstPage.data.pagination.last_visible_page;

      if (!totalPages || totalPages < 1) {
        await interaction.editReply("❌ Tidak ada anime ditemukan untuk genre ini.");
        return;
      }

      //pilih satu page secara acak
      const randomPage = Math.floor(Math.random() * totalPages) + 1;
      const response = await axios.get(
        `https://api.jikan.moe/v4/anime?genres=${genreId}&limit=25&page=${randomPage}`
      );

      const animeList = response.data.data;

      //pilih anime acak dari page yang tadi
      const shuffled = animeList.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 2);

      const embeds = selected.map((anime) =>
        new EmbedBuilder()
          .setTitle(anime.title)
          .setURL(anime.url)
          .setDescription(anime.synopsis?.slice(0, 200) + "..." || "Tidak ada sinopsis.")
          .setImage(anime.images.jpg.image_url)
          .addFields(
            { name: "Rating", value: anime.score?.toString() || "N/A", inline: true },
            { name: "Episodes", value: anime.episodes?.toString() || "N/A", inline: true },
            { name: "Status", value: anime.status || "N/A", inline: true }
          )
          .setFooter({ text: "Sumber: MyAnimeList via Jikan.moe" })
      );

      await interaction.editReply({ content: "", embeds });

    } catch (error) {
      console.error(error);
      await interaction.editReply("❌ Gagal mengambil data dari Jikan API.");
    }
  },
};
