const { c } = require('../functions/Lmao');
const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const counterPath = path.join(__dirname, '../data/user/counter.json');
        try {
            const counterData = JSON.parse(fs.readFileSync(counterPath, 'utf-8'));
            counterData.commandsused = (counterData.commandsused || 0) + 1;
            fs.writeFileSync(counterPath, JSON.stringify(counterData, null, 4));
        } catch (err) {
            console.error("Error updating counter:", err);
        }

        const accountsPath = path.resolve(__dirname, '../data/user/database.json');
        const accountData = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
        const user = interaction.user.id;

        if (accountData[user] && accountData[user].blacklisted) {
            const reason = accountData[user].reason || 'No reason specified';
            return interaction.reply({ content: `You are blacklisted from using commands. Reason: ${reason}`, ephemeral: true });
        }

        if (!accountData[user]) {
            accountData[user] = {
                obtainedOn: Date.now(),
                xbox: {
                    access: "",
                    pfp: "",
                    xuid: "",
                    userHash: ""
                },
                discord: {
                    user: interaction.user.username || null,
                    id: interaction.user.id || null,
                },
                removed: true,
                blacklisted: false,
            };
            fs.writeFileSync(accountsPath, JSON.stringify(accountData, null, 2), 'utf8');
            const timestamp = new Date();
            const formattedTime = `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}:${timestamp.getSeconds().toString().padStart(2, '0')}`;

        }

        const timestamp = new Date();
        const formattedTime = `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}:${timestamp.getSeconds().toString().padStart(2, '0')}`;
        console.log(`${c.gray}${formattedTime}${c.red} >>${c.gray} debug${c.red} >> ${c.gray}${interaction.user.username} is excuting ${interaction.commandName}${c.reset}`);

        try {
            await command.execute(interaction);
            console.log(`${c.gray}${formattedTime}${c.red} >>${c.gray} debug${c.red} >> ${c.gray}${interaction.user.username} excuted ${interaction.commandName}${c.reset}`);
        } catch (error) {
            console.error(error);

            if (error.code === 10008 || error.message.includes('Unknown Message')) {
                console.log(`${c.gray}[${formattedTime}] ${c.red}>> ${c.gray}${interaction.user.username} deleted a message. Couldn’t edit reply.${c.reset}`);
                return;
            }

            if (interaction.replied || interaction.deferred) {
                try {
                    await interaction.followUp({ content: 'There was an error executing this command.', ephemeral: true });
                } catch (followUpError) {
                    console.error(followUpError);
                }
            } else {
                try {
                    await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
                } catch (replyError) {
                    console.error(replyError);
                }
            }
        }
    }
};
