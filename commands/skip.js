const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const music = require('../utils/music');

const skip = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('跳過這首歌'),
	async execute(interaction) {
		const guildId = interaction.guildId;
		if (music.dispatcher[guildId]) {
			if (music.isPlaying[guildId]) {
				music.dispatcher[guildId].unpause();
				music.dispatcher[guildId].stop();
				if (music.queue[guildId] && music.queue[guildId].length > 0) {
					const embed = new EmbedBuilder()
						.setColor('#0099ff')
						.setTitle("成功 🎉")
						.setDescription('已跳過歌曲...')
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
						.setColor('#0099ff')
						.setTitle("成功 🎉")
						.setDescription('已跳過歌曲，且沒有下一首歌囉 !')
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
				}
			}
		} else {
			const embed = new EmbedBuilder()
				.setColor('#ff0000')
				.setTitle("失敗 ❌")
				.setDescription('機器人未加入任何頻道 ❌')
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

module.exports = skip;