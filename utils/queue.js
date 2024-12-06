const { EmbedBuilder } = require('discord.js');
const music = require('./music');

const queue = {
	Name: 'queue',
	Description: '查看目前歌曲隊列',
	async execute(interaction) {
		const guildId = interaction.guildId;
		if (music.queue[guildId] && music.queue[guildId].length > 0) {
			let queueString = '';
			let queue = music.queue[guildId].map((item, index) => `${index + 1}.  ${item.name}`);
			if (queue.length - 10 < 0) {
				queue = queue.slice(0, 10);
				queueString = `\n${queue.join('\n')}`;
			} else {
				queue = queue.slice(0, 10);
				queueString = `\n${queue.join('\n')}\n\n與其他 ${Math.abs(music.queue[guildId].length - 10)} 首歌`;
			}
			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('播放清單 💽')
				.addFields(
					{ name: "順序：", value: queueString }
				)
				.setAuthor({
					url: `https://discord.com/users/${interaction.user.id}`,
					iconURL: interaction.user.displayAvatarURL(),
					name: interaction.user.tag
				})
				.setFooter({
					iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbo0K7qI9b935NfImOxBEfDZPwBADK3eN8Q&usqp=CAU',
					text: 'Byte Script'
				});
			const reply = await interaction.reply({ embeds: [embed] });
			setTimeout(() => {
				reply.delete();
			}, 10000);
		} else {
			const embed = new EmbedBuilder()
				.setColor('#ff0000')
				.setTitle('播放清單 💽')
				.setDescription('目前隊列中沒有歌曲')
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
	},

	async delete(interaction) {
		const guildId = interaction.guildId;
		if (music.queue[guildId] && music.queue[guildId].length > 0) {
			delete music.queue[guildId];
			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle("成功 🎉")
				.setDescription('已刪除所有對列中的歌曲')
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
				.setTitle("播放清單 💽")
				.setDescription('已無其他歌曲')
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

module.exports = queue;