const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const allowedRoleId = "";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("blacklist")
        .setDescription("manage blacklist status of a user.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("add")
                .setDescription("blacklist a user.")
                .addUserOption(option =>
                    option.setName("user").setDescription("The user to blacklist.").setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("remove")
                .setDescription("remove a user from the blacklist.")
                .addUserOption(option =>
                    option.setName("user").setDescription("the user to remove from the blacklist.").setRequired(true)
                )
        ),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(allowedRoleId)) {
            const embed = new EmbedBuilder()
                .setColor('#ff00c8')
                .setTitle('unauthorized')
                .setDescription('you do not have the required role to use this command.');

            return interaction.reply({
                embeds: [embed],
                ephemeral: false
            });
        }

        const subcommand = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser("user");
        const databasePath = path.resolve(__dirname, "../../data/user/database.json");

        if (!fs.existsSync(databasePath)) {
            const embed = new EmbedBuilder()
                .setColor('#ff00c8')
                .setTitle('error')
                .setDescription('database file not found.');

            return interaction.reply({
                embeds: [embed],
                ephemeral: false
            });
        }

        const database = JSON.parse(fs.readFileSync(databasePath));

        if (!database[targetUser.id]) {
            const embed = new EmbedBuilder()
                .setColor('#ff00c8')
                .setTitle('User Not Found')
                .setDescription(`User <@${targetUser.id}> is not in the database.`);

            return interaction.reply({
                embeds: [embed],
                ephemeral: false
            });
        }

        if (subcommand === "add") {
            database[targetUser.id].blacklisted = true;
            fs.writeFileSync(databasePath, JSON.stringify(database, null, 4));

            const embed = new EmbedBuilder()
                .setColor('#ff00c8')
                .setTitle('User Blacklisted')
                .setDescription(`User <@${targetUser.id}> has been blacklisted.`);

            return interaction.reply({
                embeds: [embed],
                ephemeral: false
            });
        }

        if (subcommand === "remove") {
            database[targetUser.id].blacklisted = false;
            fs.writeFileSync(databasePath, JSON.stringify(database, null, 4));

            const embed = new EmbedBuilder()
                .setColor('#ff00c8')
                .setTitle('User Unblacklisted')
                .setDescription(`User <@${targetUser.id}> has been removed from the blacklist.`);

            return interaction.reply({
                embeds: [embed],
                ephemeral: false
            });
        }
    }
};
