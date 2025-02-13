const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Authflow, Titles } = require("prismarine-auth");
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axl = require("app-xbox-live")

const secretKey = 'c7f1d79a6b504c8bb2187dcb4e5c2f3d';
const iv = crypto.randomBytes(16);

function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

const isinlink = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("link")
        .setDescription("Links your account to stressed.")
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2),
    
    async execute(interaction) {
        const user = interaction.user.id;
        const accountsPath = path.resolve(__dirname, '../../data/user/database.json');
        const counterpath = path.resolve(__dirname, '../../data/user/counter.json');
        let accountdata = {};
        let counterdata = {};

        if (fs.existsSync(accountsPath)) {
            const fileContent = fs.readFileSync(accountsPath);
            accountdata = JSON.parse(fileContent);
        }

        if (accountdata[user] && accountdata[user].removed === false) {                
            try{

            const alreadyLinkedEmbed = new EmbedBuilder()
                .setColor('#ff00c8')
                .setTitle("stressed")
                .setDescription(`You have already linked **${accountdata[user].xbox.gamertag ?? "unknown"}**. If you want to relink do **/unlink** then rerun this command.`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            await interaction.reply({ embeds: [alreadyLinkedEmbed], ephemeral: true });
        } catch(error){
            if (error.code === 10008 || error.message.includes('Unknown Message')) {
                return; 
            } else {
                console.log(error.message);
            }
        }
            return;
        }

        if (isinlink.get(user)) {
            try{

            const embedAlreadyInProcess = new EmbedBuilder()
                .setColor('#ff00c8')
                .setTitle("stressed")
                .setDescription(`You are already in the linking process. Please complete that link or wait 5 minutes.`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            return interaction.reply({ embeds: [embedAlreadyInProcess], ephemeral: true });
        } catch(error){
            if (error.code === 10008 || error.message.includes('Unknown Message')) {
                return; 
            } else {
                console.log(error.message);
            }
        }
        }
        isinlink.set(user, true);

        try {
            accountdata[user] = {
                obtainedOn: Date.now(),
                xbox: {
                    access: "",
                    pfp: "",
                    xuid: "",
                    userHash: ""
                },
                discord: {
                    user: interaction.user.username || null,
                    id: interaction.user.id || null,
                },
                premuim: false,
                removed: true,
                blacklisted: false,
                drex: { coins: 0, itemsbought: 0 }
            };
            fs.writeFileSync(accountsPath, JSON.stringify(accountdata, null, 4));

            try{
            const signInEmbed = new EmbedBuilder()
                .setColor('#ff00c8')
                .setTitle(`stressed`)
                .setDescription(`Please wait while loading...`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            await interaction.reply({ embeds: [signInEmbed], ephemeral: true });

        } catch(error){
            if (error.code === 10008 || error.message.includes('Unknown Message')) {
                return; 
            } else {
                console.log(error.message);
            }
        }
            const auth = new Authflow(user, `./xoxo/data/user/auth/${interaction.user.id}`, {
                flow: "live",
                authTitle: Titles.MinecraftNintendoSwitch,
                deviceType: "Nintendo",
                doSisuAuth: true
            }, async (code) => {
                const url = code.verification_uri;
                const verifyCode = code.user_code;

                const signInEmbed = new EmbedBuilder()
                    .setColor('#7962b8')
                    .setTitle(`stressed`)
                    .setDescription(`To link your account, visit [Microsoft](${url}) and enter code **${verifyCode}**.`)
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Link Account')
                            .setStyle(ButtonStyle.Link)
                            .setURL(`http://microsoft.com/link?otc=${verifyCode}`)
                    );

                await interaction.editReply({ embeds: [signInEmbed], components: [row], ephemeral: true });

                setTimeout(async () => {
                    try {
                        await interaction.editReply({ components: [] });
                    } catch (error) {
                        if (error.code === 10008 || error.message.includes('Unknown Message')) {
                            console.log('The message was deleted or not found.');
                        } else {
                            console.error(error);
                        }
                    }
                }, 5 * 60 * 1000);
            });

            const token = await auth.getXboxToken();
            if (token) {
                const xl = new axl.Account(`XBL3.0 x=${token.userHash};${token.XSTSToken}`);
                const profileData = await xl.people.get(token.userXUID);

                if (!profileData || !profileData.people || profileData.people.length === 0) {
                    return // this never fails -> *update* - it failed
                }

                const userInfo = profileData.people[0];
                const gamertag = userInfo.gamertag;
                const displayName = userInfo.displayName;
                const gamerScore = userInfo.gamerScore;
                const presenceState = userInfo.presenceState;
                const presenceText = userInfo.presenceText;
                const profilePicture = userInfo.displayPicRaw;

                accountdata[user] = {
                    obtainedOn: Date.now(),
                    xbox: {
                        access: encrypt(token.XSTSToken),
                        gamertag: gamertag || "unknown",
                        gamerscore: gamerScore || 0,
                        pfp: "",
                        xuid: encrypt(token.userXUID),
                        userHash: encrypt(token.userHash)
                    },
                    discord: {
                        user: interaction.user.username || null,
                        id: interaction.user.id || null,
                    },
                    premuim: false,
                    removed: false,
                    blacklisted: false,
                };

                fs.writeFileSync(accountsPath, JSON.stringify(accountdata, null, 4));

                if (fs.existsSync(counterpath)) {
                    counterdata = JSON.parse(fs.readFileSync(counterpath));
                    counterdata.accountslinked += 1;
                    fs.writeFileSync(counterpath, JSON.stringify(counterdata, null, 4));
                }

                try{

                const successEmbed = new EmbedBuilder()
                    .setColor('#ff00c8')
                    .setTitle(`stressed`)
                    .setDescription(`${gamertag} was linked. If this was the wrong account do **/unlink** then relink.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [successEmbed], components: [] });
                } catch(error){
                    if (error.code === 10008 || error.message.includes('Unknown Message')) {
                        return; 
                    } else {
                        console.log(error.message);
                    }
                }
                isinlink.delete(user);
            }
        } catch (error) {
            isinlink.delete(user);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff00c8')
                .setTitle('stressed')
                .setDescription(`\`\`\`${error.message}\`\`\``)
                .setTimestamp();

            accountdata[user].removed = true;
            fs.writeFileSync(accountsPath, JSON.stringify(accountdata, null, 4));

            try {
                await interaction.editReply({ embeds: [errorEmbed], components: [] });
            } catch (editError) {
                console.error(editError.message);
            }
        }
    },
};
