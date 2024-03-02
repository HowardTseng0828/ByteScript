const { EmbedBuilder } = require('discord.js');
const music = require('./music');

const leave = {
	Name: 'leave',
	Description: '讓機器人離開語音頻道（會清空歌曲隊列）',
	async execute(interaction) {
		const guildId = interaction.guildId;
		if (music.connection[guildId]) {
			if (music.queue.hasOwnProperty(guildId)) {
				delete music.queue[guildId];
				music.isPlaying[guildId] = false;
			}
			const targetMessage = await interaction.channel.messages.fetch(music.targetMessage);
			if (!(targetMessage === undefined)) {
				if (targetMessage.embeds) {
					const editEmbed = targetMessage.embeds[0];
					editEmbed.data.title = '歷史播放紀錄 :clipboard:';
					editEmbed.data.thumbnail = {
						url: editEmbed.data.image.url
					};
					editEmbed.data.image = null;
					await targetMessage.edit({ embeds: [editEmbed], components: [] });
					music.targetMessage = {};
				}
			}
			const selectMenuMessage = await interaction.channel.messages.fetch(music.selectMenuMessage);
			if (!(selectMenuMessage === undefined)) {
				selectMenuMessage.delete();
				music.selectMenuMessage = {};
			}
			music.connection[guildId].disconnect();
			music.connection = {};
			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle("成功 🎉")
				.setDescription('離開並清空所有對列中歌曲')
				.setAuthor({
					url: `https://discord.com/users/${interaction.user.id}`,
					iconURL: interaction.user.displayAvatarURL(),
					name: interaction.user.tag
				})
				.setFooter({
					iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbo0K7qI9b935NfImOxBEfDZPwBADK3eN8Q&usqp=CAU',
					text: 'Byte Script'
				});
			interaction.reply({ embeds: [embed] });
		} else {
			const embed = new EmbedBuilder()
				.setColor('#ff0000')
				.setTitle("失敗 ❌")
				.setDescription('機器人未加入任何頻道誤')
				.setAuthor({
					url: `https://discord.com/users/${interaction.user.id}`,
					iconURL: interaction.user.displayAvatarURL(),
					name: interaction.user.tag
				})
				.setFooter({
					iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbo0K7qI9b935NfImOxBEfDZPwBADK3eN8Q&usqp=CAU',
					text: 'Byte Script'
				});
			interaction.reply({ embeds: [embed], ephemeral: true });
			setTimeout(() => {
				interaction.deleteReply();
			}, 3000);
		}
	}
}

module.exports = leave;