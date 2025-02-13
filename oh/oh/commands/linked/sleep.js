const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const bedrock = require('bedrock-protocol');
const { RealmAPI } = require('prismarine-realms');
const { Authflow } = require('prismarine-auth');
const { NIL, v3: uuidv3, v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bedspam')
        .setDescription('Sends sleep messages to a Minecraft Bedrock realm.')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2)
        .addStringOption(option =>
            option.setName('realmcode')
                .setDescription('The realm code to connect to.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration to send sleep messages (in seconds).')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('namespoof')
                .setDescription('The name to spoof as (optional).')),

    async execute(interaction) {
        const realmCode = interaction.options.getString('realmcode');
        const duration = interaction.options.getInteger('duration');
        const nameSpoof = interaction.options.getString('namespoof') || "DefaultSpoofName";

        const profilesFolder = path.resolve(`./xoxo/data/user/auth/${interaction.user.id}`);
        const authFlow = new Authflow();
        const realms = RealmAPI.from(authFlow, 'bedrock');
        let client;

        const embed = new EmbedBuilder()
            .setTitle("sleep spam")
            .setColor('#ff00c8')
            .setTimestamp();

        try {
            const realm = await realms.getRealmFromInvite(realmCode);
            const realmName = realm?.name || 'Unknown';

            embed.setDescription(`Connecting to realm **${realmName}** (${realmCode}) as **${nameSpoof}**.`);
            await interaction.reply({ embeds: [embed] });

            client = bedrock.createClient({
                profilesFolder,
                useRaknetWorkers: false,
                connectTimeout: 0,
                raknetBackend: false,
                flow: 'live',
                skipPing: true,
                offline: false,
                username: `${interaction.user.id}`,
                skinData: {
                    CurrentInputMode: 3,
                    DefaultInputMode: 3,
                    DeviceOS: 11,
                    DeviceId: uuidv3(uuidv4(), NIL),
                    PlatformOnlineId: generateRandomString(19, '1234567890'),
                    PrimaryUser: false,
                    SelfSignedId: uuidv4(),
                    ThirdPartyName: nameSpoof,
                    ThirdPartyNameOnly: true,
                    TrustedSkin: true,
                },
                skipPing: true,
                realms: {
                    [realmCode.length === 8 ? "realmId" : "realmInvite"]: realmCode,
                },
            });

            client.on('join', async () => {
                embed.setDescription(`Connected to realm **${realmName}**. Sending sleep messages for ${duration} seconds.`);
                await interaction.editReply({ embeds: [embed] });
            });

            client.on('start_game', async (packet) => {
                const startTime = Date.now();

                const action_packet = {
                    runtime_entity_id: packet.runtime_entity_id,
                    position: { x: 0, y: 0, z: 0 },
                    result_position: { x: 0, y: 0, z: 0 },
                    face: 0,
                  };

                const sendSleepPackets = () => {
                    client.write('player_action', { ...action_packet, action: 'start_sleeping' });
                    client.write('player_action', { ...action_packet, action: 'stop_sleeping' });
                };
            
                  const intervalId = setInterval(sendSleepPackets, 0);
          
                  setTimeout(() => {
                    clearInterval(intervalId);
                    client.disconnect();
                }, duration * 1000);  
            });

            client.on('kick', async (packet) => {
                embed.setDescription(`Kicked from the realm. Reason: **${packet.reason || 'Unknown'}**.`);
                await interaction.editReply({ embeds: [embed] });
            });

            client.on('error', async (err) => {
                embed.setDescription(`An error occurred: **${err.message || 'Unknown error'}**.`);
                await interaction.editReply({ embeds: [embed] });
            });
        } catch (error) {
            embed.setDescription(`An error occurred: **${error.message || 'Unknown error'}**.`);
            await interaction.reply({ embeds: [embed], ephemeral: true });
            if (client) client.disconnect();
        }
    }
};

function generateRandomString(length, charSet) {
    if (!charSet) charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_-';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    return result;
}
