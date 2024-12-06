const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getDatabase, ref, child, get } = require('firebase/database');
const { GlobalFonts, createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require("node:path");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('查看角色資訊'),
	async execute(interaction) {
		const dbRef = ref(getDatabase());
		try {
			GlobalFonts.registerFromPath(path.join(__dirname, '../Cubic_11_1.010_R.ttf'), 'Cubic');
			const snapshot = await get(child(dbRef, `users/id/${interaction.user.id}`));
			if (snapshot.exists()) {
				const profile = Object.entries(snapshot.val()).map(([key, value]) => {
					if (key === 'role' && typeof value === 'object') {
						return {
							key: key,
							value: {
								name: value.name,
								url: value.url
							}
						};
					}
				}).filter(Boolean);
				for (const data of profile) {
					const canvas = createCanvas(400, 140);
					const context = canvas.getContext('2d');
					const backgroundPath = path.join(__dirname, '../BackGround.jpg');
					const background = await loadImage(backgroundPath);
					context.drawImage(background, 0, 0, canvas.width, canvas.height);
					const avatarSize = 100;
					const padding = 20;
					const borderWidth = 2;
					const borderColor = '#ffffff';
					context.fillStyle = '#ffffff';
					context.font = "16px Cubic";
					context.textAlign = "left";
					context.fillText(`${data.value.name}`, padding + 20, padding);
					context.strokeStyle = borderColor;
					context.lineWidth = borderWidth;
					context.strokeRect(padding, padding + 10, avatarSize, avatarSize);
					context.fillStyle = '#000000';
					context.fillRect(padding, padding + 10, avatarSize, avatarSize);
					const avatarImage = await loadImage(data.value.url);
					context.drawImage(avatarImage, padding, padding + 10, avatarSize, avatarSize);
					const barData = [
						{ label: '飽食度🍖', x: 150, y: padding + 20, width: 100, color: '#dddddd', progressColor: '#654321' },
						{ label: '生命值❤️', x: 150, y: padding + 80, width: 100, color: '#dddddd', progressColor: '#ff0000' },
						{ label: '肺活量🍖', x: 270, y: padding + 20, width: 100, color: '#dddddd', progressColor: '#808A87' }
					];
					for (const bar of barData) {
						context.strokeStyle = borderColor;
						context.lineWidth = borderWidth;
						context.strokeRect(bar.x, bar.y, bar.width, 20);

						context.fillStyle = bar.color;
						context.fillRect(bar.x, bar.y, bar.width, 20);

						context.fillStyle = bar.progressColor;
						context.fillRect(bar.x, bar.y, bar.width * 0.8, 20);

						context.fillStyle = '#ffffff';
						context.font = "16px Cubic";
						context.textAlign = "left";
						context.fillText(bar.label, bar.x, bar.y - 10);
					}
					const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'status.png' });
					const embed = new EmbedBuilder()
						.setColor('#ff0000')
						.setTitle("角色資訊")
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
					interaction.channel.send({ files: [attachment], ephemeral: true });
				}
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

				const reply = interaction.followUp({ embeds: [embed], ephemeral: true });
				setTimeout(() => {
					reply.delete();
				}, 3000);
			}
		} catch (error) {
			console.error(error);
		}
	}
}
