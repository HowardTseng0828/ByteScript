const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const music = require('../utils/music');
const play = require('play-dl');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('播放音樂')
		.addStringOption(option => option.setName('query').setDescription('請提供影片關鍵字或網址或播放清單').setRequired(true)),
	async execute(interaction) {
		const guildId = interaction.guildId;
		if (interaction.member.voice.channel === null) {
			const embed = new EmbedBuilder()
				.setColor('#ff0000')
				.setTitle("失敗 ❌")
				.setDescription('請先進入頻道')
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
			return;
		} else {
			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('成功 🎉')
				.setDescription(`正在搜尋歌曲`)
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
			let query = interaction.options.getString('query').trim();
			music.connection[guildId] = joinVoiceChannel({
				channelId: interaction.member.voice.channel.id,
				guildId: guildId,
				adapterCreator: interaction.guild.voiceAdapterCreator
			});
			try {
				if (!music.queue[guildId]) {
					music.queue[guildId] = [];
				}
				const isYT = music.isYT(query);
				const isYTPlayList = music.isYTPlayList(query);
				const isSpot = music.isSpot(query);
				const isSpotPlayList = music.isSpotPlayList(query);
				const isSpotAlbum = music.isSpotAlbum(query);
				// Spotify驗證
				if (isSpot) {
					if (play.is_expired()) {
						await play.refreshToken()
					}
					const track = await play.spotify(query);
					const searchResults = await play.search(`${track.artists[0].name} ${track.name}`, { limit: 1 });
					const res = await play.video_basic_info(searchResults[0].id);
					if (searchResults.length > 0) {
						if (track.thumbnail) {
							music.queue[guildId].push({
								id: res.video_details.id,
								name: `${track.artists[0].name} - ${track.name}`,
								url: res.video_details.url,
								spoturl: track.url,
								thumbnail: `http://img.youtube.com/vi/${res.video_details.id}/0.jpg`
							});
						} else {
							music.queue[guildId].push({
								id: res.video_details.id,
								name: `${track.artists[0].name} - ${track.name}`,
								url: res.video_details.url,
								spoturl: track.url,
								thumbnail: track.thumbnail.url
							});
						}
						if (music.isPlaying[guildId]) {
							const embed = new EmbedBuilder()
								.setColor('#1DB954')
								.setTitle('播放清單 💽')
								.setDescription(`新增歌曲`)
								.addFields({ name: `${track.artists[0].name} ${track.name}`, value: track.url })
								.setThumbnail(track.thumbnail.url)
								.setAuthor({
									url: `https://discord.com/users/${interaction.user.id}`,
									iconURL: interaction.user.displayAvatarURL(),
									name: interaction.user.tag
								})
								.setFooter({
									iconURL: 'https://imgur.com/cvYVpKR.jpg',
									text: 'Spotify Music'
								});
							interaction.channel.send({ embeds: [embed] });
						} else {
							music.isPlaying[guildId] = true;
							music.playMusic(interaction, music.queue[guildId][0]);
						}
					}
				} else if (isSpotPlayList) {
					if (play.is_expired()) {
						await play.refreshToken();
					}
					const playlist = await play.spotify(query);
					const fetchedTracks = playlist.fetched_tracks.get('1');
					await Promise.all(fetchedTracks.map(async (track) => {
						const searchResults = await play.search(`${track.artists[0].name} ${track.name}`, { limit: 1 });
						const res = await play.video_basic_info(searchResults[0].id);
						if (track.thumbnail) {
							music.queue[guildId].push({
								id: res.video_details.id,
								name: `${track.artists[0].name} - ${track.name}`,
								url: res.video_details.url,
								spoturl: track.url,
								thumbnail: track.thumbnail.url
							});
						} else {
							music.queue[guildId].push({
								id: res.video_details.id,
								name: `${track.artists[0].name} - ${track.name}`,
								url: res.video_details.url,
								spoturl: track.url,
								thumbnail: `http://img.youtube.com/vi/${res.video_details.id}/0.jpg`
							});
						}
					}));
					const videoTitles = fetchedTracks.map((track, i) => `${i + 1}.   ${track.artists[0].name} - ${track.name}`).slice(0, 10).join('\n');
					if (music.isPlaying[guildId]) {
						if (fetchedTracks.length - 10 < 0) {
							const embed = new EmbedBuilder()
								.setColor('#1DB954')
								.setTitle('播放清單 💽')
								.addFields(
									{ name: `新增歌單: ${playlist.name}`, value: `...` },
									{ name: `歌曲清單:`, value: `\n${videoTitles}` }
								)
								.setThumbnail(playlist.thumbnail.url)
								.setAuthor({
									url: `https://discord.com/users/${interaction.user.id}`,
									iconURL: interaction.user.displayAvatarURL(),
									name: interaction.user.tag
								})
								.setFooter({
									iconURL: 'https://imgur.com/cvYVpKR.jpg',
									text: 'Spotify Music'
								});
							interaction.channel.send({ embeds: [embed] });
						} else {
							const embed = new EmbedBuilder()
								.setColor('#1DB954')
								.setTitle('播放清單 💽')
								.addFields(
									{ name: `新增歌單: ${playlist.name}`, value: `...` },
									{ name: `歌曲清單:`, value: `\n${videoTitles}` },
									{ name: `與其他${fetchedTracks.length - 10} 首歌`, value: `...` }
								)
								.setThumbnail(playlist.thumbnail.url)
								.setAuthor({
									url: `https://discord.com/users/${interaction.user.id}`,
									iconURL: interaction.user.displayAvatarURL(),
									name: interaction.user.tag
								})
								.setFooter({
									iconURL: 'https://imgur.com/cvYVpKR.jpg',
									text: 'Spotify Music'
								});
							interaction.channel.send({ embeds: [embed] });
						}
					} else {
						if (fetchedTracks.length - 10 < 0) {
							music.isPlaying[guildId] = true;
							const embed = new EmbedBuilder()
								.setColor('#1DB954')
								.setTitle('播放清單 💽')
								.addFields(
									{ name: `新增歌單: ${playlist.name}`, value: `...` },
									{ name: `歌曲清單:`, value: `\n${videoTitles}` }
								)
								.setThumbnail(playlist.thumbnail.url)
								.setAuthor({
									url: `https://discord.com/users/${interaction.user.id}`,
									iconURL: interaction.user.displayAvatarURL(),
									name: interaction.user.tag
								})
								.setFooter({
									iconURL: 'https://imgur.com/cvYVpKR.jpg',
									text: 'Spotify Music'
								});
							interaction.channel.send({ embeds: [embed] });
							music.playMusic(interaction, music.queue[guildId][0]);
						} else {
							music.isPlaying[guildId] = true;
							const embed = new EmbedBuilder()
								.setColor('#1DB954')
								.setTitle('播放清單 💽')
								.addFields(
									{ name: `新增歌單: ${playlist.name}`, value: `...` },
									{ name: `歌曲清單:`, value: `\n${videoTitles}` },
									{ name: `與其他${fetchedTracks.length - 10} 首歌`, value: `...` }
								)
								.setThumbnail(playlist.thumbnail.url)
								.setAuthor({
									url: `https://discord.com/users/${interaction.user.id}`,
									iconURL: interaction.user.displayAvatarURL(),
									name: interaction.user.tag
								})
								.setFooter({
									iconURL: 'https://imgur.com/cvYVpKR.jpg',
									text: 'Spotify Music'
								});
							interaction.channel.send({ embeds: [embed] });
							music.playMusic(interaction, music.queue[guildId][0]);
						}
					}
				} else if (isSpotAlbum) {
					if (play.is_expired()) {
						await play.refreshToken();
					}
					const playlist = await play.spotify(query);
					const fetchedTracks = playlist.fetched_tracks.get('1');
					await Promise.all(fetchedTracks.map(async (track) => {
						const searchResults = await play.search(`${track.artists[0].name} ${track.name}`, { limit: 1 });
						const res = await play.video_basic_info(searchResults[0].id);
						if (track.thumbnail) {
							music.queue[guildId].push({
								id: res.video_details.id,
								name: `${track.artists[0].name} - ${track.name}`,
								url: res.video_details.url,
								spoturl: track.url,
								thumbnail: track.thumbnail.url
							});
						} else {
							music.queue[guildId].push({
								id: res.video_details.id,
								name: `${track.artists[0].name} - ${track.name}`,
								url: res.video_details.url,
								spoturl: track.url,
								thumbnail: `http://img.youtube.com/vi/${res.video_details.id}/0.jpg`
							});
						}
					}));
					const videoTitles = fetchedTracks.map((track, i) => `${i + 1}.   ${track.artists[0].name} - ${track.name}`).slice(0, 10).join('\n');
					if (music.isPlaying[guildId]) {
						if (fetchedTracks.length - 10 < 0) {
							const embed = new EmbedBuilder()
								.setColor('#1DB954')
								.setTitle('播放清單 💽')
								.addFields(
									{ name: `新增歌單: ${playlist.name}`, value: `...` },
									{ name: `歌曲清單:`, value: `\n${videoTitles}` }
								)
								.setThumbnail(playlist.thumbnail.url)
								.setAuthor({
									url: `https://discord.com/users/${interaction.user.id}`,
									iconURL: interaction.user.displayAvatarURL(),
									name: interaction.user.tag
								})
								.setFooter({
									iconURL: 'https://imgur.com/cvYVpKR.jpg',
									text: 'Spotify Music'
								});
							interaction.channel.send({ embeds: [embed] });
						} else {
							const embed = new EmbedBuilder()
								.setColor('#1DB954')
								.setTitle('播放清單 💽')
								.addFields(
									{ name: `新增歌單: ${playlist.name}`, value: `...` },
									{ name: `歌曲清單:`, value: `\n${videoTitles}` },
									{ name: `與其他${fetchedTracks.length - 10} 首歌`, value: `...` }
								)
								.setThumbnail(playlist.thumbnail.url)
								.setAuthor({
									url: `https://discord.com/users/${interaction.user.id}`,
									iconURL: interaction.user.displayAvatarURL(),
									name: interaction.user.tag
								})
								.setFooter({
									iconURL: 'https://imgur.com/cvYVpKR.jpg',
									text: 'Spotify Music'
								});
							interaction.channel.send({ embeds: [embed] });
						}
					} else {
						if (fetchedTracks.length - 10 < 0) {
							music.isPlaying[guildId] = true;
							const embed = new EmbedBuilder()
								.setColor('#1DB954')
								.setTitle('播放清單 💽')
								.addFields(
									{ name: `新增歌單: ${playlist.name}`, value: `...` },
									{ name: `歌曲清單:`, value: `\n${videoTitles}` }
								)
								.setThumbnail(playlist.thumbnail.url)
								.setAuthor({
									url: `https://discord.com/users/${interaction.user.id}`,
									iconURL: interaction.user.displayAvatarURL(),
									name: interaction.user.tag
								})
								.setFooter({
									iconURL: 'https://imgur.com/cvYVpKR.jpg',
									text: 'Spotify Music'
								});
							interaction.channel.send({ embeds: [embed] });
							music.playMusic(interaction, music.queue[guildId][0]);
						} else {
							music.isPlaying[guildId] = true;
							const embed = new EmbedBuilder()
								.setColor('#1DB954')
								.setTitle('播放清單 💽')
								.addFields(
									{ name: `新增歌單: ${playlist.name}`, value: `...` },
									{ name: `歌曲清單:`, value: `\n${videoTitles}` },
									{ name: `與其他${fetchedTracks.length - 10} 首歌`, value: `...` }
								)
								.setThumbnail(playlist.thumbnail.url)
								.setAuthor({
									url: `https://discord.com/users/${interaction.user.id}`,
									iconURL: interaction.user.displayAvatarURL(),
									name: interaction.user.tag
								})
								.setFooter({
									iconURL: 'https://imgur.com/cvYVpKR.jpg',
									text: 'Spotify Music'
								});
							interaction.channel.send({ embeds: [embed] });
							music.playMusic(interaction, music.queue[guildId][0]);
						}
					}
				} else if (isYT) {
					const res = await play.video_basic_info(query);
					if (isYTPlayList) {
						const res = await play.playlist_info(query);
						res.videos.forEach(v => {
							music.queue[guildId].push({
								id: v.id,
								name: v.title,
								url: v.url
							});
						});
						const videoTitles = res.videos.map((v, i) => `${i + 1}.   ${v.title}`).slice(0, 10).join('\n');
						if (music.isPlaying[guildId]) {
							if (res.videos.length - 10 < 0) {
								const embed = new EmbedBuilder()
									.setColor('#ff0000')
									.setTitle('播放清單 💽')
									.addFields(
										{ name: `新增歌單: ${res.title}`, value: `...` },
										{ name: `歌曲清單:`, value: `\n${videoTitles}` }
									)
									.setThumbnail(`http://img.youtube.com/vi/${res.videos[0].id}/0.jpg`)
									.setAuthor({
										url: `https://discord.com/users/${interaction.user.id}`,
										iconURL: interaction.user.displayAvatarURL(),
										name: interaction.user.tag
									})
									.setFooter({
										iconURL: 'https://imgur.com/tZ045hM.jpg',
										text: 'YouTube Music'
									});
								interaction.channel.send({ embeds: [embed] });
							} else {
								const embed = new EmbedBuilder()
									.setColor('#ff0000')
									.setTitle('播放清單 💽')
									.addFields(
										{ name: `新增歌單: ${res.title}`, value: `...` },
										{ name: `歌曲清單:`, value: `\n${videoTitles}` },
										{ name: `與其他${res.videos.length - 10} 首歌`, value: `...` }
									)
									.setThumbnail(`http://img.youtube.com/vi/${res.videos[0].id}/0.jpg`)
									.setAuthor({
										url: `https://discord.com/users/${interaction.user.id}`,
										iconURL: interaction.user.displayAvatarURL(),
										name: interaction.user.tag
									})
									.setFooter({
										iconURL: 'https://imgur.com/tZ045hM.jpg',
										text: 'YouTube Music'
									});
								interaction.channel.send({ embeds: [embed] });
							}
						} else {
							if (res.videos.length - 10 < 0) {
								music.isPlaying[guildId] = true;
								const embed = new EmbedBuilder()
									.setColor('#ff0000')
									.setTitle('播放清單 💽')
									.addFields(
										{ name: `新增歌單: ${res.title}`, value: `...` },
										{ name: `歌曲清單:`, value: `\n${videoTitles}` }
									)
									.setThumbnail(`http://img.youtube.com/vi/${res.videos[0].id}/0.jpg`)
									.setAuthor({
										url: `https://discord.com/users/${interaction.user.id}`,
										iconURL: interaction.user.displayAvatarURL(),
										name: interaction.user.tag
									})
									.setFooter({
										iconURL: 'https://imgur.com/tZ045hM.jpg',
										text: 'YouTube Music'
									});
								interaction.channel.send({ embeds: [embed] });
								music.playMusic(interaction, music.queue[guildId][0]);
							} else {
								music.isPlaying[guildId] = true;
								const embed = new EmbedBuilder()
									.setColor('#ff0000')
									.setTitle('播放清單 💽')
									.addFields(
										{ name: `新增歌單: ${res.title}`, value: `...` },
										{ name: `歌曲清單:`, value: `\n${videoTitles}` },
										{ name: `與其他${res.videos.length - 10} 首歌`, value: `...` }
									)
									.setThumbnail(`http://img.youtube.com/vi/${res.videos[0].id}/0.jpg`)
									.setAuthor({
										url: `https://discord.com/users/${interaction.user.id}`,
										iconURL: interaction.user.displayAvatarURL(),
										name: interaction.user.tag
									})
									.setFooter({
										iconURL: 'https://imgur.com/tZ045hM.jpg',
										text: 'YouTube Music'
									});
								interaction.channel.send({ embeds: [embed] });
								music.playMusic(interaction, music.queue[guildId][0]);
							}
						}
					} else {
						music.queue[guildId].push({
							id: res.video_details.id,
							name: res.video_details.title,
							url: query,
						});
						if (music.isPlaying[guildId]) {
							const embed = new EmbedBuilder()
								.setColor('#ff0000')
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
									iconURL: 'https://imgur.com/tZ045hM.jpg',
									text: 'YouTube Music'
								});
							interaction.channel.send({ embeds: [embed] });
						} else {
							music.isPlaying[guildId] = true;
							music.playMusic(interaction, music.queue[guildId][0]);
						}
					}
				} else {
					const searchResults = await play.search(query, { limit: 10 });
					const options = searchResults.map((res) => ({
						label: res.title,
						value: res.url,
					}));
					const embed = new EmbedBuilder()
						.setColor('#ff0000')
						.setTitle("搜尋篩選器")
						.setDescription(`以下是搜尋到關於 「 ${query} 」 的10筆資料`)
						.setAuthor({
							url: `https://discord.com/users/${interaction.user.id}`,
							iconURL: interaction.user.displayAvatarURL(),
							name: interaction.user.tag
						})
						.setFooter({
							iconURL: 'https://imgur.com/tZ045hM.jpg',
							text: 'YouTube Music'
						});
					const selectMenu = new ActionRowBuilder().addComponents(
						new StringSelectMenuBuilder()
							.setCustomId("music")
							.setPlaceholder("選擇您搜尋的音樂")
							.setMinValues(1)
							.setMaxValues(1)
							.addOptions(options)
					);
					const selectMenuMessage = await interaction.channel.send({ embeds: [embed], components: [selectMenu] });
					music.selectMenuMessage = selectMenuMessage.id;
				}
			} catch (e) {
				console.log(e);
				const embed = new EmbedBuilder()
					.setColor('#ff0000')
					.setTitle("失敗 ❌")
					.setDescription('撥放歌曲時，發生錯誤')
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
			}
		}
	}
}