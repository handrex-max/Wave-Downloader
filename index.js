import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';




const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
    console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env file!');
    process.exit(1);
}


const client = new Client({
    intents: [GatewayIntentBits.Guilds] 
});


client.commands = new Collection();


const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commandsToRegister = [];

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);


    if ('data' in command.default && 'execute' in command.default) {
        const cmd = command.default;
        client.commands.set(cmd.data.name, cmd);
        commandsToRegister.push(cmd.data.toJSON());
        console.log(`Loaded command: /${cmd.data.name}`);
    } else {
        console.warn(`The command at ${file} is missing "data" or "execute"`);
    }
}


(async () => {
    try {
        console.log('Started refreshing application (/) commands...');

        const rest = new REST({ version: '10' }).setToken(TOKEN);

        await rest.put(
            Routes.applicationCommands(CLIENT_ID), 
            { body: commandsToRegister }
        );

        console.log(`Successfully registered ${commandsToRegister.length} command(s)!`);
    } catch (error) {
        console.error('Failed to register commands:', error);
    }
})();


client.once('ready', () => {
    console.log(`Bot is online as ${client.user.tag}`);
});


client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        
        const replyContent = { content: 'There was an error while executing this command!', ephemeral: true };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(replyContent);
        } else {
            await interaction.reply(replyContent);
        }
    }
});


client.login(TOKEN);