const config = require('../data/config.json')
const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (!message.content.startsWith(config.prefix) || message.author.bot) return
        const args = message.content.slice(config.prefix.length).trim().split(/ +/)
        const commandName = args.shift().toLowerCase()
        const command = client.prefixCommands.get(commandName)
        if (!command) return
        try {
            await command.execute(message, args)
        } catch (error) {
            console.error(error)
            message.reply('there was an error executing that command.')
        }
    }
}
