const { Client, GatewayIntentBits, Partials, Collection, REST, Routes,     DefaultWebSocketManagerOptions: { identifyProperties } } = require("discord.js")
const fs = require('fs')
const path = require('path')
const config = require('./data/config.json')
const {c} = require('./functions/Lmao')

console.log(`${c.red}
          $$\        
          $$ |       
 $$$$$$\  $$$$$$$\   
$$  __$$\ $$  __$$\  
$$ /  $$ |$$ |  $$ | 
$$ |  $$ |$$ |  $$ | 
\$$$$$$  |$$ |  $$ | 
 \______/ \__|  \__| 
    `)

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites,
    ],
    partials: [
        Partials.Channel
    ],
})


client.commands = new Collection()
client.prefixCommands = new Collection()

const commands = []
const slashCommandFolders = fs.readdirSync(path.join(__dirname, 'commands'))

for (const folder of slashCommandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`)
        if (command.data && command.execute) {
            client.commands.set(command.data.name, command)
            commands.push(command.data.toJSON()) 
        }
    }
}

const rest = new REST({ version: '10' }).setToken(config.token)

;(async () => {
    try {
        const timestamp = new Date(); 
        const formattedTime = `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}:${timestamp.getSeconds().toString().padStart(2, '0')}`; // Format to hh:mm:ss
        console.log(`${c.gray}${formattedTime}${c.red} >>${c.gray} client ${c.red}>> ${c.gray}reloading slash cmds${c.reset}`);        await rest.put(
            Routes.applicationCommands(config.clientid),
            { body: commands }
        )
        console.log(`${c.gray}${formattedTime}${c.red} >>${c.gray} client ${c.red}>> ${c.gray}reloaded slash cmds${c.reset}`);
    } catch (error) {
        console.error(error)
    }
})()


const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'))
for (const file of eventFiles) {
    const event = require(`./events/${file}`)
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client))
    } else {
        client.on(event.name, (...args) => event.execute(...args, client))
    }
}


client.on("error", (error) => {
	if (error.code === 1006) return;
	if (error.code === 10008) return;
	console.error(error);
});

client.login(config.token)
