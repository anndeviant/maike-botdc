const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anime")
    .setDescription("Cari info dari MyAnimeList")
    .addSubcommand(sub =>
      sub
        .setName("judul")
        .setDescription("Cari anime berdasarkan judul")
        .addStringOption(opt =>
          opt
            .setName("judul")
            .setDescription("Judul anime")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("random")
        .setDescription("Tampilkan 2 anime secara acak")
    )
    .addSubcommand(sub =>
      sub
        .setName("people")
        .setDescription("Cari orang (seiyuu/kreator)")
        .addStringOption(opt =>
          opt
            .setName("people")
            .setDescription("Nama orang")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "judul") {
      const query = interaction.options.getString("judul");
      await interaction.reply(`🔍 Mencari anime: **${query}**...`);

      try {
        const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
        const anime = res.data.data[0];

        if (!anime) {
          await interaction.editReply("❌ Anime tidak ditemukan.");
          return;
        }

        const embed = new EmbedBuilder()
          .setTitle(anime.title)
          .setURL(anime.url)
          .setDescription(anime.synopsis?.slice(0, 300) + "..." || "Tidak ada sinopsis.")
          .setImage(anime.images.jpg.image_url)
          .addFields(
            { name: "Rating", value: anime.score?.toString() || "N/A", inline: true },
            { name: "Episodes", value: anime.episodes?.toString() || "N/A", inline: true },
            { name: "Status", value: anime.status || "N/A", inline: true }
          )
          .setFooter({ text: "Sumber: MyAnimeList via Jikan.moe" });

        await interaction.editReply({ content: "", embeds: [embed] });

      } catch (error) {
        console.error(error);
        await interaction.editReply("❌ Gagal mengambil data dari Jikan API.");
      }

    } else if (subcommand === "random") {
      await interaction.reply("🎲 Mengambil 2 anime acak...");

      try {
        const requests = Array.from({ length: 2 }, () =>
          axios.get("https://api.jikan.moe/v4/random/anime")
        );

        const responses = await Promise.all(requests);

        const embeds = responses.map(res => {
          const anime = res.data.data;
          return new EmbedBuilder()
            .setTitle(anime.title)
            .setURL(anime.url)
            .setDescription(anime.synopsis?.slice(0, 200) + "..." || "Tidak ada sinopsis.")
            .setImage(anime.images.jpg.image_url)
            .addFields(
              { name: "Rating", value: anime.score?.toString() || "N/A", inline: true },
              { name: "Episodes", value: anime.episodes?.toString() || "N/A", inline: true },
              { name: "Status", value: anime.status || "N/A", inline: true }
            )
            .setFooter({ text: "Sumber: MyAnimeList via Jikan.moe" });
        });

        await interaction.editReply({ content: "", embeds });

      } catch (error) {
        console.error(error);
        await interaction.editReply("❌ Gagal mengambil anime acak.");
      }

    } else if (subcommand === "people") {
      const query = interaction.options.getString("query");
      await interaction.reply(`🔍 Mencari orang: **${query}**...`);

      try {
        const res = await axios.get(`https://api.jikan.moe/v4/people?q=${encodeURIComponent(query)}&limit=1`);
        const person = res.data.data[0];

        if (!person) {
          await interaction.editReply("❌ Orang tidak ditemukan.");
          return;
        }

        const embed = new EmbedBuilder()
          .setTitle(person.name)
          .setURL(person.url)
          .setDescription(person.about?.slice(0, 300) + "..." || "Tidak ada deskripsi.")
          .setImage(person.images.jpg.image_url)
          .addFields(
            { name: "Favorit", value: person.favorites?.toString() || "N/A", inline: true },
            { name: "Tanggal Lahir", value: person.birthday?.split("T")[0] || "N/A", inline: true }
          )
          .setFooter({ text: "Sumber: MyAnimeList via Jikan.moe" });

        await interaction.editReply({ content: "", embeds: [embed] });

      } catch (error) {
        console.error(error);
        await interaction.editReply("❌ Gagal mengambil data orang dari Jikan API.");
      }
    }
  },
};
