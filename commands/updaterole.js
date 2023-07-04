const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { getDatabase, ref, child, get } = require('firebase/database');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('變更角色資料'),
	async execute(interaction) {
		const dbRef = ref(getDatabase());
		const snapshot = await get(child(dbRef, `users/${interaction.user.id}/role`));
		if (snapshot.exists()) {
			const profile = Object.entries(snapshot.val()).map(([key, value]) => {
				return {
					key: key,
					value: value
				};
			}).filter(Boolean);
			const options = profile.map((data) => ({
				label: data.value,
				value: data.key
			}));

			const embed = new EmbedBuilder()
				.setColor('#ff0000')
				.setTitle("角色資料修改")
				.setDescription(`選擇要更改的資料`)
				.setAuthor({
					url: `https://discord.com/users/${interaction.user.id}`,
					iconURL: interaction.user.displayAvatarURL(),
					name: interaction.user.tag
				})
				.setFooter({
					iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbo0K7qI9b935NfImOxBEfDZPwBADK3eN8Q&usqp=CAU',
					text: 'Byte Script'
				});
			const selectMenu = new ActionRowBuilder().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId("update-role")
					.setPlaceholder("選擇要更改的資料")
					.setMinValues(1)
					.setMaxValues(1)
					.addOptions(options)
			);
			await interaction.reply({ embeds: [embed], components: [selectMenu], ephemeral: true });
			setTimeout(() => {
				interaction.deleteReply();
			}, 30000);
		} else {
			const embed = new EmbedBuilder()
				.setColor('#ff0000')
				.setTitle("失敗 ❌")
				.setDescription(`未查詢到任何角色`)
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
