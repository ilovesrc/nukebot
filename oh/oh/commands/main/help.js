const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays all the commands available on the bot')
    .setIntegrationTypes(0, 1)
    .setContexts(0, 1, 2),
  async execute(interaction) {

    const helpEmbed = new EmbedBuilder()
      .setColor('#ff00c8') 
      .addFields(
        { name: '/help', value: 'Displays all the commands available on the bot.', inline: !true },
        { name: '/ping', value: 'Check the bot\'s latency.', inline: !true },
        { name: '/crash', value: 'Crash a realm with your choice of method.', inline: !true },
        { name: '/bedspam', value: 'Spams that someone is spamming in and out of bed.', inline: !true },
        { name: '/checkcode', value: 'Checks if the realm code is valid.', inline: !true },
        { name: '/dump', value: 'Grabs a bunch of info about the specified realm', inline: !true },
        { name: `/host`, value: 'Grabs the realm IP and Port', inline: !true },
        { name: `/link`, value: 'Links your xbox live account too the bot. (this is encrypted)', inline: !true },
        { name: `/unlink`, value: 'Unlinks all stored data from the bot.', inline: !true },
        { name: `/account`, value: 'Shows stats about your xbox live account linked.', inline: !true },
      )

    await interaction.reply({ embeds: [helpEmbed], ephemeral: !true });
  },
};