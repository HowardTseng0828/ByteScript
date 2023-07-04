const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getDatabase, ref, child, get } = require('firebase/database');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create')
		.setDescription('創建角色'),
	async execute(interaction) {
		const dbRef = ref(getDatabase());
		const snapshot = await get(child(dbRef, `users/${interaction.user.id}/role`));
		if (!snapshot.exists()) {
			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle("角色持有人")
				.setDescription(interaction.user.tag)
				.setAuthor({
					url: `https://discord.com/users/${interaction.user.id}`,
					iconURL: interaction.user.displayAvatarURL(),
					name: interaction.user.tag
				})
				.setFooter({
					iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbo0K7qI9b935NfImOxBEfDZPwBADK3eN8Q&usqp=CAU',
					text: 'Byte Script'
				});
			const createButton = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('create-role')
					.setLabel('請點選進行創建角色')
					.setDisabled(false)
					.setStyle(ButtonStyle.Success)
			);
			interaction.reply({ embeds: [embed], components: [createButton], ephemeral: true });
			setTimeout(() => {
				interaction.deleteReply();
			}, 30000);
		} else {
			const embed = new EmbedBuilder()
				.setColor('#ff0000')
				.setTitle("失敗 ❌")
				.setDescription(`已有創建角色`)
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