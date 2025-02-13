const { c } = require('../functions/Lmao');
const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        const timestamp = new Date(); 
        const formattedTime = `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}:${timestamp.getSeconds().toString().padStart(2, '0')}`;

        console.log(`${c.gray}${formattedTime}${c.red} >>${c.gray} client ${c.red}>> ${c.gray}${client.user.username} is in ${client.guilds.cache.size} server(s)${c.reset}`);
        console.log(`${c.gray}${formattedTime}${c.red} >>${c.gray} client ${c.red}>> ${c.gray}logged in as ${client.user.username}${c.reset}`);
        console.log(' ')
        await client.user.setStatus('idle');

        const counterPath = path.join(__dirname, '../data/user/counter.json');
        let counterData

        let index = 0;
        setInterval(() => {
            try {
                counterData = JSON.parse(fs.readFileSync(counterPath, 'utf-8'));
            } catch (err) {
                console.error(`${c.red}error reading counter file: ${err.message}${c.reset}`);
                return;
            }
    
            const activities = Object.entries(counterData).map(([key, value]) => {
                switch (key) {
                    case 'realmsnuked':
                        return `${value}`;
                    case 'accountslinked':
                        return `${value} accounts linked`;
                    case 'commandsused':
                        return `${value} commands used`;
                    case 'realmscrashed':
                        return `${value}`;
                    default:
                        return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
                }
            });
            client.user.setPresence({ activities: [{ name: activities[index], status: 'idle' }] });
            index = (index + 1) % activities.length; 
        }, 5000);
    }
};
