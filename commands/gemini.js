const { SlashCommandBuilder } = require("discord.js");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_APIKEY,
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gemini")
    .setDescription("Tanya apa saja ke Gemini AI")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Pertanyaan untuk Gemini AI")
        .setRequired(true)
    ),

  async execute(interaction) {
    const pertanyaan = interaction.options.getString("prompt");
    await interaction.reply("⏳ Memproses petanyaan ke Gemini AI...");

    const system_instruction =
      "Mohon berikan jawaban yang ringkas namun komprehensif. Sampaikan dengan jelas dan langsung, fokus pada informasi yang paling penting, dan hindari penjelasan yang tidak perlu. Berusaha untuk memberikan jawaban menyeluruh dengan tetap menjaga agar respons sesingkat mungkin. Maksimal 2000 karakter.";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `${pertanyaan}\n${system_instruction}`,
      });

      // Jika response.text tidak ada, fallback ke JSON stringify
      let answer = response.text || JSON.stringify(response);

      // Batasi maksimal 2000 karakter (batas Discord)
      if (answer.length > 2000) {
        answer = answer.slice(0, 1997) + "...";
      }

      await interaction.editReply(answer);
    } catch (error) {
      console.error(error);
      await interaction.editReply(
        "❌ Gagal mendapatkan jawaban dari Gemini AI."
      );
    }
  },
};
