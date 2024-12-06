const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const music = require('./music');

const resume = {
    Name: 'resume',
    Description: '恢復播放',
    async execute(interaction) {
        const guildId = interaction.guildId;
        const targetMessage = await interaction.channel.messages.fetch(music.targetMessage);
        if (music.dispatcher[guildId]) {
            if (music.isPaused) {
                if (targetMessage.embeds) {
                    music.dispatcher[guildId].unpause();
                    const editMenu = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('pause')
                            .setLabel('暫停播放')
                            .setEmoji({ name: '⏯️' })
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
                    const editEmbed = targetMessage.embeds[0];
                    editEmbed.data.title = '正在播放音樂 🎵';
                    await targetMessage.edit({ embeds: [editEmbed], components: [editMenu] }).then(() => {
                        interaction.deferUpdate();
                    });
                }
                music.isPaused = false;
            }
        } else {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle("失敗 ❌")
                .setDescription('機器人未加入任何頻道')
                .setAuthor({
                    url: `https://discord.com/users/${interaction.user.id}`,
                    iconURL: interaction.user.displayAvatarURL(),
                    name: interaction.user.tag
                })
                .setFooter({
                    iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbo0K7qI9b935NfImOxBEfDZPwBADK3eN8Q&usqp=CAU',
                    text: 'Byte Script'
                });
            const reply = await interaction.reply({ embeds: [embed], ephemeral: true });
            setTimeout(() => {
                reply.delete();
            }, 3000);
        }
    }
}

module.exports = resume;