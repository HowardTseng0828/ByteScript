# ByteScript 

The Discord Bot for Music Playback and Enhanced Features! Developed by Howard Tseng.

這是一個基於 Discord.js 開發的機器人（bot）。該機器人目前支援以下功能：

- 使用字串模糊搜尋 YouTube 音樂
- 支援 YouTube/YT Music 和 Spotify 的音樂網址
- 支援 YouTube/YT Music 和 Spotify 的播放清單
- 支援 Spotify 專輯網址
- 暫停/回復音樂的播放
- 查看目前播放清單(前十筆歌曲)
- 刪除播放清單中的所有歌曲
- 播放下一首歌曲

## 使用工具和模組

- [Discord.js](https://discord.js.org/)：用於與 Discord API 進行交互的 JavaScript 函式庫。
- [@discordjs/voice](https://www.npmjs.com/package/@discordjs/voice)：用於處理 Discord 語音連接的 Discord.js 函式庫。
- [libsodium-wrappers](https://www.npmjs.com/package/libsodium-wrappers)：用於加密語音資料的 libsodium JavaScript 封裝。
- [play-dl](https://www.npmjs.com/package/play-dl)：用於搜索和獲取音樂的 Node.js 模組。
- [dotenv](https://www.npmjs.com/package/dotenv)：用於從環境變量中加載機密配置的模組。

## 安裝和使用

1. clone repositories 到本地機器：

   - git clone https://github.com/HowardTseng0828/ByteScript.git

2. 在項目根目錄下安裝依賴：

   - npm i discord.js @discordjs/voice libsodium-wrappers play-dl dotenv

3. 複製 `.env.example` 文件並重命名為 `.env`，然後在其中設定的敏感信息，如 Discord Bot Token。

4. 要獲取 Spotify Token，你需要進行以下步驟：
   - 前往 [Spotify for Developers](https://developer.spotify.com/dashboard/login) 登錄你的帳號（如果沒有帳號，請先註冊）。
   - 建立一個新的應用程式。
   - 在應用程式設定中，獲取你的 Spotify Client ID 、 Client Secret 和 Redirect URIs。
   - 根據 [play-dl/instructions](https://github.com/play-dl/play-dl/tree/main/instructions) 介紹進行 Spotify Authorization 操作。

5. 啟動機器人：

   - node .

現在，機器人已經在Discord上線了！你可以通過添加機器人到你的 Discord 伺服器並使用相應的指令來使用它。

## 使用指令

- `/play <搜尋關鍵字>`：使用模糊搜尋播放 YouTube 音樂。
- `/play <YouTube/YT Music 音樂網址>`：播放指定的 YouTube/YT Music 音樂。
- `/play <Spotify 音樂網址>`：播放指定的 Spotify 音樂。
- `/play <YouTube/YT Music/Spotify 播放清單網址>`：播放指定的 YouTube/YT Music 或 Spotify 播放清單。
- `/play <Spotify 專輯網址>`：播放指定的 Spotify 專輯。
- `/skip`：播放下一首歌曲。

## 播放按鈕

- `暫停播放/恢復播放`：暫停和回復播放音樂。
- `下一首`：播放下一首歌曲。
- `播放清單`：顯示播放清單。
- `刪除播放清單`：從播放清單中刪除所有的歌曲。
- `離開`：離開並清空播放清單中所有的歌曲。

請根據你的需要修改和擴展這些指令，並根據你的環境配置相應的數據。

## 注意事項

請確保你已經安裝了 Node.js 環境和相應的函式庫。此外，請不要將 `.env` 文件或其他包含機密資料的文件提交到版本控制系統中，以免造成安全風險。

如果你對這個 Discord Bot 有任何問題或建議，請隨時向我詢問。祝你使用愉快！

## 更新日誌

[ByteScript Update Log](https://howardtseng0828.github.io/categories/ByteScript-Update-Log/)