const { createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const play = require('play-dl');

let activityTimer;

class Music {

    constructor() {
        this.queue = {};
        this.isPlaying = {};
        this.connection = {};
        this.dispatcher = {};
        this.targetMessage = {};
        this.selectMenuMessage = {};
    }

    isYTPlayList(query) {
        const ytRegex = /[?&]list=/;
        return ytRegex.test(query);
    }

    isYT(query) {
        const ytRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be|music.youtube\.com))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
        return ytRegex.test(query);
    }

    isSpot(query) {
        const spotRegex = /^https?:\/\/(?:open\.spotify\.com|spotify)\/(track)\/[a-zA-Z0-9]+/;
        return spotRegex.test(query);
    }

    isSpotPlayList(query) {
        const spotRegex = /^https?:\/\/(?:open\.spotify\.com|spotify)\/(playlist)\/[a-zA-Z0-9]+/;
        return spotRegex.test(query);
    }

    isSpotAlbum(query) {
        const spotRegex = /^https?:\/\/(?:open\.spotify\.com|spotify)\/(album)\/[a-zA-Z0-9]+/;
        return spotRegex.test(query);
    }

    isSpotArtist(query) {
        const spotRegex = /^https?:\/\/(?:open\.spotify\.com|spotify)\/(artist)\/[a-zA-Z0-9]+/;
        return spotRegex.test(query);
    }

    async playMusic(interaction, musicInfo) {
        const guildId = interaction.guildId;
        if (musicInfo && !musicInfo.spoturl) {
            try {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('正在播放音樂 🎵')
                    .addFields({ name: musicInfo.name, value: musicInfo.url })
                    .setImage(`http://img.youtube.com/vi/${musicInfo.id}/0.jpg`)
                    .setAuthor({
                        url: `https://discord.com/users/${interaction.user.id}`,
                        iconURL: interaction.user.displayAvatarURL(),
                        name: interaction.user.tag
                    })
                    .setFooter({
                        iconURL: 'https://imgur.com/tZ045hM.jpg',
                        text: 'YouTube Music'
                    });
                const menu = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('pause')
                        .setLabel('暫停播放')
                        .setEmoji({ name: '⏸' })
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('skip')
                        .setLabel('下一首')
                        .setEmoji({ name: '⏭' })
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('queue')
                        .setLabel('播放清單')
                        .setEmoji({ name: '💽' })
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('delete')
                        .setLabel('刪除播放清單')
                        .setEmoji({ name: '🗑️' })
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('leave')
                        .setLabel('離開')
                        .setEmoji({ name: '🚪' })
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Danger)
                );
                const reply = await interaction.channel.send({ embeds: [embed], components: [menu] });
                this.targetMessage = reply.id;
                const stream = await play.stream(musicInfo.url);
                const resource = createAudioResource(stream.stream, {
                    inputType: stream.type
                });
                const player = createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Play
                    }
                });
                player.play(resource);
                this.connection[guildId].subscribe(player);
                this.dispatcher[guildId] = player;
                this.queue[guildId].shift();
                clearTimeout(activityTimer);
                player.on('stateChange', (oldState, newState) => {
                    if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                        this.playNextMusic(interaction);
                    }
                });
            } catch (e) {
                console.log(e);
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('歌曲發生錯誤... ❌')
                    .setAuthor({
                        url: `https://discord.com/users/${interaction.user.id}`,
                        iconURL: interaction.user.displayAvatarURL(),
                        name: interaction.user.tag
                    })
                    .setFooter({
                        iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbo0K7qI9b935NfImOxBEfDZPwBADK3eN8Q&usqp=CAU',
                        text: 'Byte Script'
                    });
                const reply = await interaction.channel.send({ embeds: [embed], ephemeral: true });
                setTimeout(() => {
                    reply.delete();
                }, 3000);
                this.queue[guildId].shift();
                this.playNextMusic(interaction);
            }
        } else if (musicInfo && musicInfo.spoturl) {
            try {
                const embed = new EmbedBuilder()
                    .setColor('#1DB954')
                    .setTitle('正在播放音樂 🎵')
                    .addFields({ name: musicInfo.name, value: musicInfo.spoturl })
                    .setImage(musicInfo.thumbnail)
                    .setAuthor({
                        url: `https://discord.com/users/${interaction.user.id}`,
                        iconURL: interaction.user.displayAvatarURL(),
                        name: interaction.user.tag
                    })
                    .setFooter({
                        iconURL: 'https://imgur.com/cvYVpKR.jpg',
                        text: 'Spotify Music'
                    });
                const menu = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('pause')
                        .setLabel('暫停播放')
                        .setEmoji({ name: '⏸' })
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('skip')
                        .setLabel('下一首')
                        .setEmoji({ name: '⏭' })
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('queue')
                        .setLabel('播放清單')
                        .setEmoji({ name: '💽' })
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('delete')
                        .setLabel('刪除播放清單')
                        .setEmoji({ name: '🗑️' })
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('leave')
                        .setLabel('離開')
                        .setEmoji({ name: '🚪' })
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Danger)
                );
                const reply = await interaction.channel.send({ embeds: [embed], components: [menu] });
                this.targetMessage = reply.id;
                const stream = await play.stream(musicInfo.url);
                const resource = createAudioResource(stream.stream, {
                    inputType: stream.type
                });
                const player = createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Play
                    }
                });
                player.play(resource);
                this.connection[guildId].subscribe(player);
                this.dispatcher[guildId] = player;
                this.queue[guildId].shift();
                clearTimeout(activityTimer);
                player.on('stateChange', (oldState, newState) => {
                    if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                        this.playNextMusic(interaction);
                    }
                });
            } catch (e) {
                console.log(e);
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('歌曲發生錯誤... ❌')
                    .setAuthor({
                        url: `https://discord.com/users/${interaction.user.id}`,
                        iconURL: interaction.user.displayAvatarURL(),
                        name: interaction.user.tag
                    })
                    .setFooter({
                        iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbo0K7qI9b935NfImOxBEfDZPwBADK3eN8Q&usqp=CAU',
                        text: 'Byte Script'
                    });
                const reply = await interaction.channel.send({ embeds: [embed], ephemeral: true });
                setTimeout(() => {
                    reply.delete();
                }, 3000);
                this.queue[guildId].shift();
                this.playNextMusic(interaction);
            }
        }
    }

    async playNextMusic(interaction) {

        const targetMessage = await interaction.channel.messages.fetch(this.targetMessage);
        if (!(targetMessage === undefined)) {
            if (targetMessage.embeds) {
                const editEmbed = targetMessage.embeds[0];
                editEmbed.data.title = '歷史播放紀錄 :clipboard:';
                editEmbed.data.thumbnail = {
                    url: editEmbed.data.image.url
                };
                editEmbed.data.image = null;
                await targetMessage.edit({ embeds: [editEmbed], components: [] });
            }
        }
        const guildId = interaction.guildId;
        if (this.queue[guildId] && this.queue[guildId].length > 0) {
            this.playMusic(interaction, this.queue[guildId][0]);
        } else {
            this.isPlaying[guildId] = false;
            this.targetMessage = {};
            activityTimer = setTimeout(() => {
                if (this.connection[guildId]) {
                    this.connection[guildId].disconnect();
                    this.connection = {};
                }
            }, 5 * 60 * 1000);
        }
    }

}

module.exports = new Music();