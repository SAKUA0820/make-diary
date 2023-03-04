const { Configuration, OpenAIApi } = require('openai');
const { App } = require('@slack/bolt');
require('dotenv').config();

// ChatGPTのAPIキー周り
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// SlackのAPIシークレットとかポートとか
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

// Slackでメッセージを受け取ったらChatGPT APIを叩いた結果をリプライする
app.message(async ({ message, say }) => {
  const input = message.text.toString().replace('/<@[A-Z0-9]+>/g', '');
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: '穏やかな敬語で200文字以内の文章を作成してください。'},
      { role: 'user', content: `${input}という単語を使って今日の日記を作って`}
    ],
  });
  let reply = `<@${message.user}> ${completion.data.choices[0].message.content}`;
  await say(reply);
});

// 起動
(async () => {
  await app.start();
  console.log('⚡️ Bolt app is running!');
})();