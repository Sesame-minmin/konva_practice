import { WebClient, KnownBlock } from '@slack/web-api';
import { createEventAdapter } from '@slack/events-api';
import { App, LogLevel } from '@slack/bolt';

// Slack APIトークンを設定します
const slackToken = 'YOUR_SLACK_API_TOKEN';
const slackSigningSecret = 'YOUR_SLACK_SIGNING_SECRET';

// Slack Web APIクライアントを作成します
const web = new WebClient(slackToken);

// Slack Events Adapterを作成します
const slackEvents = createEventAdapter(slackSigningSecret);

// 常室の開錠状態と開錠したユーザー名を格納する変数
let isRoomUnlocked = false;
let openUser = '';

// 入室者の配列
const participants: string[] = [];

// メッセージを送信する関数
async function sendMessage(channel: string, blocks: KnownBlock[]) {
  try {
    // メッセージを送信します
    const result = await web.chat.postMessage({ channel, blocks });
    console.log('Message sent:', result.ts);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// チャンネルのメンバーIDリストを取得する関数
async function getChannelMembers(channel: string): Promise<string[]> {
  try {
    // チャンネルのメンバーIDリストを取得します
    const response = await web.conversations.members({ channel });
    return response.members as string[];
  } catch (error) {
    console.error('Error getting channel members:', error);
    return [];
  }
}

// メインの処理
async function main() {
  try {
    // メッセージを送信するチャンネルを指定します
    const channel = 'CHANNEL_ID';

    // 特定のチャンネルのメンバーIDリストを取得します
    const channelMembers = await getChannelMembers(channel);

    // Slackアプリを作成します
    const app = new App({
      token: slackToken,
      signingSecret: slackSigningSecret,
      logLevel: LogLevel.INFO,
    });

    // /openroom コマンドのハンドラーを設定します
    app.command('/openroom', async ({ ack, command, context }) => {
      await ack();

      if (channelMembers.includes(command.user_id)) {
        isRoomUnlocked = true;
        openUser = command.user_id;

        // 入室者リストにユーザーを追加します
        participants.push(command.user_id);

        const blocks: KnownBlock[] = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `常室が開かれました。入室者: ${participants.length}人`,
            },
          },
        ];
        sendMessage(channel, blocks);
      }
    });

    // /close コマンドのハンドラーを設定します
    app.command('/close', async ({ ack, command, context }) => {
      await ack();

      if (channelMembers.includes(command.user_id)) {
        isRoomUnlocked = false;
        openUser = '';

        // 入室者リストを初期化します
        participants.length = 0;

        const blocks: KnownBlock[] = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '常室は閉まりました。',
            },
          },
        ];
        sendMessage(channel, blocks);
      }
    });

    // /inroom コマンドのハンドラーを設定します
    app.command('/inroom', async ({ ack, command, context }) => {
      await ack();

      if (isRoomUnlocked) {
        if (!participants.includes(command.user_id)) {
          participants.push(command.user_id);
        }

        const blocks: KnownBlock[] = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `入室しました。入室者: ${participants.length}人`,
            },
          },
        ];
        sendMessage(channel, blocks);
      }
    });

    // /outroom コマンドのハンドラーを設定します
    app.command('/outroom', async ({ ack, command, context }) => {
      await ack();

      if (isRoomUnlocked) {
        const index = participants.indexOf(command.user_id);
        if (index !== -1) {
          participants.splice(index, 1);
        }

        const blocks: KnownBlock[] = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `退室しました。入室者: ${participants.length}人`,
            },
          },
        ];
        sendMessage(channel, blocks);
      }
    });

    // Slackイベントのハンドラーを設定します
    app.event('message', async ({ event, context }) => {
      if (event.type === 'message') {
        const message = event.text;

        if (message === '/showroom') {
          const blocks: KnownBlock[] = [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `入室者: ${participants.length}人\n${participants.join('\n')}`,
              },
            },
          ];
          sendMessage(channel, blocks);
        }
      }
    });

    // アプリを起動します
    await app.start(process.env.PORT || 3000);
    console.log('Server started');
  } catch (error) {
    console.error('Error:', error);
  }
}

// メインの処理を実行します
main();
