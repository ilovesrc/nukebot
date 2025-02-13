const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getrealminfo } = require('../../functions/bedrockrealms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkcode')
        .setDescription('Check a realm code.')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2)
        .addStringOption(option => 
            option.setName('invite')
                .setDescription('Realm invite code')
                .setRequired(true)
                .setMinLength(11)
                .setMaxLength(15)),
    async execute(interaction) {
        const inviteCode = interaction.options.getString('invite');

        try{

        const embed = new EmbedBuilder()
            .setTitle('stressed')
            .setDescription('Fetching realm data, this may take a second.')
            .setColor('#ff00c8')
            .setFooter({ text: 'stressed'})
            .setTimestamp(); 
        await interaction.reply({ embeds: [embed] });
    } catch(error){
        if (error.code === 10008 || error.message.includes('Unknown Message')) {
            return; 
        } else {
            console.log(error.message);
        }
    }

        try {
            const realmInfo = await getrealminfo(inviteCode);

            try{
                const embed = new EmbedBuilder()
                    .setTitle('stressed')
                    .addFields(
                        { name: 'Code', value: `\`${inviteCode ?? "Not Available"}\``, inline: true },
                        { name: 'Realm Name', value: `\`${realmInfo.name ?? "Not Available"}\``, inline: true },
                        { name: 'Realm State', value: `\`${realmInfo.state ?? "Not Available"}\``, inline: true },
                    )
                    .setColor('#ff00c8')
                    .setFooter({ text: 'stressed'})
                    .setTimestamp();   
                await interaction.editReply({ embeds: [embed] });
            } catch(error){
                if (error.code === 10008 || error.message.includes('Unknown Message')) {
                    return; 
                } else {
                    console.log(error.message);
                }
            }

        } catch (error) {
            try{

            const errorEmbed = new EmbedBuilder()
                .setTitle('stressed')
                .setDescription(`\`\`\`json\n${JSON.stringify(error.message, null, 2)}\n\`\`\``)
                .setColor('#ff00c8')
                .setFooter({ text: 'stressed'})
                .setTimestamp();
            await interaction.editReply({ embeds: [errorEmbed], components: [] });
        } catch(error){
            if (error.code === 10008 || error.message.includes('Unknown Message')) {
                return; 
            } else {
                console.log(error.message);
            }
        }
        }
    }
};
