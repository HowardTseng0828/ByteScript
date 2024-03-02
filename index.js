// npm i discord.js @discordjs/voice ffmpeg-static libsodium-wrappers play-dl dotenv

require('dotenv').config()

const { Client, Collection, GatewayIntentBits, PermissionsBitField, Events, EmbedBuilder, ActivityType } = require("discord.js");
const play = require('play-dl');
const fs = require("node:fs");
const path = require("node:path");
const skip = require("./commands/skip");
const leave = require("./utils/leave");
const pause = require("./utils/pause");
const queue = require("./utils/queue");
const resume = require("./utils/resume");
const music = require("./utils/music");

var http = require("http");
http.createServer(function (req, res) {
	res.write("I'm alive");
	res.end();
}).listen(8080)

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates
	],
});

const flagsPermissions = new PermissionsBitField([
	PermissionsBitField.Flags.ManageRoles,
	PermissionsBitField.Flags.ManageChannels,
	PermissionsBitField.Flags.ManageWebhooks,
	PermissionsBitField.Flags.ReadMessageHistory,
	PermissionsBitField.Flags.ViewChannel,
	PermissionsBitField.Flags.SendMessages,
	PermissionsBitField.Flags.ManageMessages,
	PermissionsBitField.Flags.EmbedLinks,
	PermissionsBitField.Flags.AttachFiles,
	PermissionsBitField.Flags.ReadMessageHistory,
	PermissionsBitField.Flags.UseExternalEmojis,
	PermissionsBitField.Flags.Connect,
	PermissionsBitField.Flags.Speak,
	PermissionsBitField.Flags.MuteMembers,
	PermissionsBitField.Flags.MoveMembers,
	PermissionsBitField.Flags.RequestToSpeak
]);

client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ("data" in command && "execute" in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[警告] ${filePath} 中的指令缺少必要的 "data" 或 "execute" 屬性。`);
	}
	commands.push(command.data.toJSON());
}

client.on(Events.InteractionCreate, async (interaction) => {

	if (!interaction.appPermissions.has(flagsPermissions)) {
		const embed = new EmbedBuilder()
			.setColor('#ff0000')
			.setTitle('失敗 ❌')
			.setDescription('請檢查 ByteScript 的權限')
			.setAuthor({
				url: `https://discord.com/users/${interaction.user.id}`,
				iconURL: interaction.user.displayAvatarURL(),
				name: interaction.user.tag
			})
			.setFooter({
				iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbo0K7qI9b935NfImOxBEfDZPwBADK3eN8Q&usqp=CAU',
				text: 'Byte Script'
			});
		return await interaction.reply({ embeds: [embed], ephemeral: true });
	}

	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`找不到指令 ${interaction.commandName}。`);
			return;
		}
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				const embed = new EmbedBuilder()
					.setColor('#ff0000')
					.setTitle('失敗 ❌')
					.setDescription('執行指令時發生錯誤！')
					.setAuthor({
						url: `https://discord.com/users/${interaction.user.id}`,
						iconURL: interaction.user.displayAvatarURL(),
						name: interaction.user.tag
					})
					.setFooter({
						iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbo0K7qI9b935NfImOxBEfDZPwBADK3eN8Q&usqp=CAU',
						text: 'Byte Script'
					});
				interaction.followUp({ embeds: [embed], ephemeral: true });
				setTimeout(() => {
					interaction.deleteReply();
				}, 3000);
			} else {
				const embed = new EmbedBuilder()
					.setColor('#ff0000')
					.setTitle('失敗 ❌')
					.setDescription('執行指令時發生錯誤！')
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

	if (interaction.isMessageComponent()) {
		if (interaction.member.voice.channel) {
			if (interaction.customId === 'skip') {
				await skip.execute(interaction);
			}
			if (interaction.customId === 'leave') {
				await leave.execute(interaction);
			}
			if (interaction.customId === 'queue') {
				await queue.execute(interaction);
			}
			if (interaction.customId === 'delete') {
				await queue.delete(interaction);
			}
			if (interaction.customId === 'pause') {
				await pause.execute(interaction);
			}
			if (interaction.customId === 'resume') {
				await resume.execute(interaction);
			}
		} else {
			const embed = new EmbedBuilder()
				.setColor('#ff0000')
				.setTitle('失敗 ❌')
				.setDescription('請先進入頻道內')
				.setAuthor({
					url: `https://discord.com/users/${interaction.user.id}`,
					iconURL: interaction.user.displayAvatarURL(),
					name: interaction.user.tag
				})
				.setFooter({
					iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbo0K7qI9b935NfImOxBEfDZPwBADK3eN8Q&usqp=CAU',
					text: 'Byte Script'
				});
			await interaction.reply({ embeds: [embed], ephemeral: true });
			setTimeout(() => {
				interaction.deleteReply();
			}, 3000);
		}
		if (interaction.customId === 'music') {
			const guildId = interaction.guildId;
			const res = await play.video_basic_info(interaction.values[0]);
			music.queue[guildId].push({
				title: res.video_details.channel.name,
				id: res.video_details.id,
				name: res.video_details.title,
				url: res.video_details.url,
				state: 'YT',
			});
			if (music.isPlaying[guildId]) {
				const embed = new EmbedBuilder()
					.setColor('#0099ff')
					.setTitle('播放清單 💽')
					.setDescription(`新增歌曲`)
					.addFields({ name: res.video_details.title, value: res.video_details.url })
					.setThumbnail(`http://img.youtube.com/vi/${res.video_details.id}/0.jpg`)
					.setAuthor({
						url: `https://discord.com/users/${interaction.user.id}`,
						iconURL: interaction.user.displayAvatarURL(),
						name: interaction.user.tag
					})
					.setFooter({
						iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbo0K7qI9b935NfImOxBEfDZPwBADK3eN8Q&usqp=CAU',
						text: 'Byte Script'
					});
				interaction.channel.send({ embeds: [embed] });
			} else {
				music.isPlaying[guildId] = true;
				music.playMusic(interaction, music.queue[guildId][0]);
			}
			const selectMenuMessage = await interaction.channel.messages.fetch(music.selectMenuMessage);
			if (!(selectMenuMessage === undefined)) {
				selectMenuMessage.delete();
				music.selectMenuMessage = {};
			}
			await interaction.deferUpdate();
		}
	}

});

const registerCommands = async (client) => {
	try {
		if (client.application) {
			console.log(`Started refreshing ${commands.length} application (/) commands.`);
			const data = await client.application.commands.set(commands);
			console.log(`Successfully reloaded ${data.size} application (/) commands.`);
		}
	} catch (e) {
		console.error(e);
	}
}

client.once(Events.ClientReady, async (client) => {
	await registerCommands(client);
	let activities = ['Roddy Ricch - Ballin (Burger King Parody)'];
	let i = 0;
	setInterval(() => {
		client.user.setActivity(activities[i++ % activities.length], {
			type: ActivityType.Streaming,
			url: 'https://www.youtube.com/watch?v=FDEiOHUxhOk&ab_channel=SaintBeDa'
		});
	}, 5000);
	console.log(`已就緒！已登入帳號：${client.user.tag}`);
});

client.login(process.env.token);