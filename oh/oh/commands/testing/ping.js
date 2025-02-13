const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Ping the bot and get latency info.')
    .setIntegrationTypes(0, 1)
    .setContexts(0, 1, 2),
  
  async execute(interaction) {
    try {
      const sentMessage = await interaction.reply({ content: '', fetchReply: true });

      const botLatency = sentMessage.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(interaction.client.ws.ping);

      const pingInfo = {
        botLatency: `${botLatency}ms`,
        apiLatency: `${apiLatency}ms`,
      };

      const pingInfoJson = `\`\`\`json\n${JSON.stringify(pingInfo, null, 2)}\n\`\`\``;

      const embed = new EmbedBuilder()
        .setTitle(' ')
        .setDescription(`\n${pingInfoJson}`)
        .setColor('#ff00c8')
        .setFooter({ text: ' ' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      if (error.code === 10008 || error.message.includes('Unknown Message')) {
        return;
      } else {
        console.log(error.message);
      }
    }
  },
};