const Discord = require('discord.js');
module.exports = {
    name: 'unmute',
    aliases: ['언뮤트', '뮤트해제', 'ㅕㅜㅡㅕㅅㄷ', 'djsabxm', 'abxmgowp'],
    description: '유저를 뮤트 해제해요. (int Team 멤버만 사용 가능)',
    usage: 'i.unmute <유저 멘션>',
    run: async (client, message, args) => {
        if (!message.member.roles.cache.has('761464991340953621')) return message.channel.send('int Team 멤버만 사용할 수 있어요.');
        if (!message.mentions.users.first()) return message.channel.send('뮤트 해제할 유저를 멘션해주세요');
        if (!message.guild.member(message.mentions.users.first())) return message.channel.send('이 유저는 서버에 없는 것 같아요.');
        if (!message.guild.member(message.mentions.users.first()).manageable) return message.channel.send('이 유저는 제가 뮤트 해제할 수 없어요.');
        if (!message.guild.member(message.mentions.users.first()).roles.cache.has('761456849680597002')) return message.channel.send('이 유저는 뮤트되어있지 않아요.');
        const embed = new Discord.MessageEmbed()
            .setTitle('멤버를 뮤트 해제할까요?')
            .setColor('RANDOM')
            .addField('뮤트 해제할 멤버', message.mentions.users.first().toString())
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp();
        let m = await client.channels.cache.get(message.channel.id).send({
            embed: embed
        });
        await m.react('✅');
        await m.react('❌');
        const filter = (r, u) => u.id == message.author.id && (r.emoji.name == '✅' || r.emoji.name == '❌');
        const collector = m.createReactionCollector(filter, {
            max: 1
        });
        collector.on('end', async collected => {
            if (collected.first().emoji.name == '✅') {
                await message.mentions.users.first().send({
                    embed: new Discord.MessageEmbed()
                        .setTitle(`${message.guild.name}에서 뮤트 해제되었어요`)
                        .setColor('RANDOM')
                        .addField('뮤트 해제한 유저', message.author.tag)
                        .setFooter(message.author.tag, message.author.displayAvatarURL())
                        .setTimestamp()
                });
                await message.guild.member(message.mentions.users.first()).roles.remove('761456849680597002')
                embed.setTitle('멤버가 뮤트 해제되었어요')
                    .setColor('RANDOM')
                    .spliceFields(0, 1, {
                        name: '뮤트한 멤버',
                        value: message.mentions.users.first().toString()
                    })
                    .setTimestamp()
                await m.edit({
                    embed: embed
                });
            } else {
                embed.setTitle('멤버 뮤트 해제가 취소되었어요')
                    .setColor('RANDOM')
                    .setTimestamp()
                await m.edit({
                    embed: embed
                });
            }
        })
    }
}