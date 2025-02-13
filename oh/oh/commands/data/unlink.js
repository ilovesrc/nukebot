const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unlink")
        .setDescription("Delete all personal data stored.")
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2),

    async execute(interaction) {
        const userId = interaction.user.id;
        const accountsPath = path.resolve(__dirname, '../../data/user/database.json');
        const counterpath = path.resolve(__dirname, '../../data/user/counter.json');
        let counterdata = {};

        let accountsData;
        try {
            accountsData = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
        } catch (error) {
            console.error(error);

            const errorId = uuidv4();
        
            const errorData = {
                id: errorId,
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            };
        
            fs.appendFileSync('./data/errors.json', JSON.stringify(errorData) + ',\n');
        
            try{

            const errorEmbed = new EmbedBuilder()
                .setColor('#7962b8')
                .setTitle(`stressed`)
                .setDescription(`An error occurred while deleting your account data. Please contact a developer if the issue keep happening.\n\n\`\`\`${errorId}\`\`\``)
        
            await interaction.editReply({ embeds: [errorEmbed] });
        } catch(error){
            if (error.code === 10008 || error.message.includes('Unknown Message')) {
                return; 
            } else {
                console.log(error.message);
            }
        }
            return;
        }

        const userAccount = accountsData[userId];

        if (userAccount.removed !== false) {
            try{

            const noDataEmbed = new EmbedBuilder()
                .setColor("#7962b8")
                .setTitle("stressed")
                .setDescription(`Your account is not inside of the database. To use this command do /link then /unlink :(`)

            await interaction.reply({ embeds: [noDataEmbed], ephemeral: true });
        } catch(error){
            if (error.code === 10008 || error.message.includes('Unknown Message')) {
                return; 
            } else {
                console.log(error.message);
            }
        }
            return;
        }

        const accountFolder = path.join(__dirname, `../../data/user/auth/${interaction.user.id}`);

        try{

        const startembed = new EmbedBuilder()
        .setColor('#7962b8')
        .setTitle(`stressed`)
        .setDescription(`Fetching your data, this may take a minute...`)

    await interaction.reply({ embeds: [startembed], ephemeral: true });
} catch(error){
    if (error.code === 10008 || error.message.includes('Unknown Message')) {
        return; 
    } else {
        console.log(error.message);
    }
}
        try {
            fs.rmSync(accountFolder, { recursive: true, force: true });
        } catch (error) {
            console.error(error);

            const errorId = uuidv4();
        
            const errorData = {
                id: errorId,
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            };
        
            fs.appendFileSync('./xoxo/data/errors.json', JSON.stringify(errorData) + ',\n');
        
            try{

            const errorEmbed = new EmbedBuilder()
                .setColor('#7962b8')
                .setTitle(`stressed`)
                .setDescription(`An error occurred while deleting your account data. Please contact a developer if the issue keep happening.\n\n\`\`\`${errorId}\`\`\``)
        
            await interaction.editReply({ embeds: [errorEmbed] });
        } catch(error){
            if (error.code === 10008 || error.message.includes('Unknown Message')) {
                return; 
            } else {
                console.log(error.message);
            }
        }
            return;
        }

        userAccount.removed = true; 
        userAccount.xbox.access = ""; 

        try {
            fs.writeFileSync(accountsPath, JSON.stringify(accountsData, null, 4));
            
            if (fs.existsSync(counterpath)) {
                counterdata = JSON.parse(fs.readFileSync(counterpath));
                counterdata.accountslinked -= 1;
                fs.writeFileSync(counterpath, JSON.stringify(counterdata, null, 4));
            }
        } catch (error) {
            console.error(error);

            const errorId = uuidv4();
        
            const errorData = {
                id: errorId,
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            };
        
            fs.appendFileSync('./xoxo/data/errors.json', JSON.stringify(errorData) + ',\n');
        
            try{

            const errorEmbed = new EmbedBuilder()
                .setColor('#ff00c8')
                .setTitle(`stressed`)
                .setDescription(`An error occurred while deleting your account data. Please contact a developer if the issue keep happening.\n\n\`\`\`${errorId}\`\`\``)
        
            await interaction.editReply({ embeds: [errorEmbed] });
        } catch(error){
            if (error.code === 10008 || error.message.includes('Unknown Message')) {
                return; 
            } else {
                console.log(error.message);
            }
        }
            return;
        }

        try{

        const successEmbed = new EmbedBuilder()
            .setColor('#ff00c8')
            .setTitle(`stressed`)
            .setDescription(`All data was wiped. We are currently only keep commands used and guilds you used the commands in. All personal data was deleted. Do /link to link again.`)

        await interaction.editReply({ embeds: [successEmbed], ephemeral: true });
    } catch(error){
        if (error.code === 10008 || error.message.includes('Unknown Message')) {
            return; 
        } else {
            console.log(error.message);
        }
    }
    }
};
