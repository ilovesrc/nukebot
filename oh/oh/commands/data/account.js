const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("account")
        .setDescription("Shows linked account information."),

    async execute(interaction) {
        const user = interaction.user.id;
        const accountsPath = path.resolve(__dirname, '../../data/user/database.json');

        if (!fs.existsSync(accountsPath)) {
            const noDataEmbed = new EmbedBuilder()
                .setColor("#ff00c8")
                .setTitle("Account Information")
                .setDescription("No account data found.")
                .setTimestamp();

            return await interaction.reply({ embeds: [noDataEmbed], ephemeral: false });
        }

        const accountdata = JSON.parse(fs.readFileSync(accountsPath));

        if (!accountdata[user] || accountdata[user].removed) {
            const noAccountEmbed = new EmbedBuilder()
                .setColor("#ff00c8")
                .setTitle("Account Information")
                .setDescription("You haven't linked an account yet. Use **/link** to link your account.")
                .setTimestamp();

            return await interaction.reply({ embeds: [noAccountEmbed], ephemeral: false });
        }

        const userAccount = accountdata[user];
        const gamertag = userAccount.xbox.gamertag || "Unknown";
        const gamerScore = userAccount.xbox.gamerscore || 0;
        const premiumStatus = userAccount.premuim ? "Yes" : "No";
        const blacklistedStatus = userAccount.blacklisted ? "Yes" : "No";

        const accountEmbed = new EmbedBuilder()
            .setColor("#ff00c8")
            .setTitle("linked account info")
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "Gamertag", value: gamertag, inline: true },
                { name: "Gamer Score", value: `${gamerScore}`, inline: true },
                { name: "Premium", value: premiumStatus, inline: true },
                { name: "Blacklisted", value: blacklistedStatus, inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [accountEmbed], ephemeral: false });
    },
};
