const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { gethostandport } = require('../../functions/bedrockrealms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('host')
        .setDescription('Get the host and port of a minecraft realm.')
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
            .setDescription(`Fetching ip and port this may take a second.`)
            .setColor('#ff00c8')
            .setFooter({ text: 'stressed'})
            .setTimestamp();
        await interaction.reply({ embeds: [embed] })
    } catch(error){
        if (error.code === 10008 || error.message.includes('Unknown Message')) {
            return; 
        } else {
            console.log(error.message);
        }
    }
        try {
            const ipandport = await gethostandport(inviteCode);

            if (!ipandport) {
                try{

                const embed = new EmbedBuilder()
                .setTitle('stressed')
                .setDescription(`Invalid code given. Please check if that is a valid code, **/checkcode**.`)
                .setColor('#5865F2')
                .setFooter({ text: 'stressed'})
                .setTimestamp();

                return  interaction.editReply({ embeds: [embed] })
            } catch(error){
                if (error.code === 10008 || error.message.includes('Unknown Message')) {
                    return; 
                } else {
                    console.log(error.message);
                }
            }
            }

            try{

            const embed = new EmbedBuilder()
            .setTitle('stressed')
            .setDescription(`Successfully fetched realm host and port details.`)
            .addFields(
                { name: '` 🖥️ ` Host', value: `\`${ipandport.host ?? "Not Available"}\``, inline: false },
                { name: '` 🔌 ` Port', value: `\`${ipandport.port ?? "Not Available"}\``, inline: false },
                { name: '` 🏷️ ` Name', value: `\`${ipandport.name ?? "Not Available"}\``, inline: false }
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
            console.log(error)
            try{

            const embed = new EmbedBuilder()
                .setTitle('stressed')
                .setDescription(`\`\`\`json\n${JSON.stringify(error.message, null, 2)}\`\`\``)
                .setColor('#ff00c8')
                .setFooter({ text: 'stressed'})
                .setTimestamp();
                
            return interaction.editReply({ embeds: [embed] })
        } catch(error){
            if (error.code === 10008 || error.message.includes('Unknown Message')) {
                return; 
            } else {
                console.log(error.message);
            }
        }
        }
    },
};
