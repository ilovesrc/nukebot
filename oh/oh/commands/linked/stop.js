const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
const {c} = require('../../functions/Lmao');
const timestamp = new Date();



const formattedTime = `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}:${timestamp.getSeconds().toString().padStart(2, '0')}`;
const adminUsers = new Set([
    ''
]);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('restarts server')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2),

    execute: async (interaction) => {
        await interaction.deferReply();

        if (!adminUsers.has(interaction.user.id)) {
            const embed = new EmbedBuilder()
                .setColor('#ff00c8')
                .setTitle('invalid perms')
                .setDescription('you are not an dev.');
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        const embedStopping = new EmbedBuilder()
            .setColor('#ff00c8')
            .setTitle('success')
            .setDescription('the server has restarted');
        await interaction.editReply({ embeds: [embedStopping], ephemeral: false });
        process.exit(1);
    }
};