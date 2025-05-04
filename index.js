require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Create commands directory if it doesn't exist
const commandsPath = path.join(__dirname, "commands");
if (!fs.existsSync(commandsPath)) {
  console.log("Creating commands directory...");
  fs.mkdirSync(commandsPath);
}

// Load commands
client.commands = new Collection();
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

console.log(
  `Found ${commandFiles.length} command files: ${commandFiles.join(", ")}`
);

const commands = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  try {
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
      console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing required "data" or "execute" property.`
      );
    }
  } catch (error) {
    console.error(`❌ Error loading command from ${filePath}:`, error);
  }
}

// Register Slash Commands
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("⏳ Registering slash commands...");
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log("✅ Slash commands registered.");
  } catch (error) {
    console.error(error);
  }
})();

// Bot logic
client.on("ready", () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "Ada kesalahan saat menjalankan perintah ini!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "Ada kesalahan saat menjalankan perintah ini!",
        ephemeral: true,
      });
    }
  }
});

client.login(token);
