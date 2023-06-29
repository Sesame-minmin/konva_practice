"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_api_1 = require("@slack/web-api");
// Slack APIトークンを設定します
const slackToken = 'xoxb-5238549613699-5458574210833-PkS5HuknCEwyxai1PuPVzGJn';
// Slack Web APIクライアントを作成します
const web = new web_api_1.WebClient(slackToken);
// 常室の開錠状態と開錠したユーザー名を格納する変数
let isRoomUnlocked = false;
let openUser = '';
// 入室者の配列
const participants = [];
// メッセージを送信する関数
function sendMessage(channel, blocks) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // メッセージを送信します
            const result = yield web.chat.postMessage({ channel, blocks });
            console.log('Message sent:', result.ts);
        }
        catch (error) {
            console.error('Error sending message:', error);
        }
    });
}
// チャンネルのメンバーIDリストを取得する関数
function getChannelMembers(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // チャンネルのメンバーIDリストを取得します
            const response = yield web.conversations.members({ channel });
            return response.members;
        }
        catch (error) {
            console.error('Error getting channel members:', error);
            return [];
        }
    });
}
// メインの処理
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // openroomコマンドを使用できるユーザーが参加しているチャンネルを指定します
            const openroomChannel = 'C05DWMSB5GQ';
            // botが活動するチャンネルを指定します
            const botChannel = 'C05ED5929F0';
            // openroomコマンドを使用できるユーザーが参加しているチャンネルのメンバーIDリストを取得します
            const openroomChannelMembers = yield getChannelMembers(openroomChannel);
            // Slackのイベントリスナーを設定します
            web.on("message", (event) => __awaiter(this, void 0, void 0, function* () {
                if (event.type === 'message') {
                    // 投稿されたメッセージを取得します
                    const message = event.message.text;
                    if (message === '/openroom') {
                        // メッセージが '/openroom' の場合
                        if (openroomChannelMembers.includes(event.user)) {
                            // ユーザーがopenroomコマンドを使用できるユーザーが参加しているチャンネルのメンバーリストに含まれている場合、常室を開錠します
                            isRoomUnlocked = true;
                            openUser = event.user;
                            // 入室者リストにユーザーを追加します
                            participants.push(event.user);
                            // メッセージを送信します
                            const blocks = [
                                {
                                    type: 'section',
                                    text: {
                                        type: 'mrkdwn',
                                        text: `*${event.user}* が常室を開錠しました`,
                                    },
                                },
                            ];
                            yield sendMessage(botChannel, blocks);
                        }
                    }
                    else if (message === '/closeroom') {
                        // メッセージが '/closeroom' の場合、常室を施錠します
                        if (isRoomUnlocked) {
                            // 入室者リストからすべてのユーザーを削除します
                            participants.length = 0;
                            isRoomUnlocked = false;
                            if (event.user === openUser) {
                                // 開錠したユーザーが '/closeroom' を使用した場合
                                const blocks = [
                                    {
                                        type: 'section',
                                        text: {
                                            type: 'mrkdwn',
                                            text: '常室は施錠されました。鍵の返却を忘れないでください',
                                        },
                                    },
                                ];
                                yield sendMessage(botChannel, blocks);
                            }
                            else {
                                // 開錠したユーザー以外が '/closeroom' を使用した場合
                                const blocks = [
                                    {
                                        type: 'section',
                                        text: {
                                            type: 'mrkdwn',
                                            text: `常室は施錠されました *${openUser}* に鍵を渡してください`,
                                        },
                                    },
                                ];
                                yield sendMessage(botChannel, blocks);
                            }
                        }
                    }
                    else if (message === '/inroom') {
                        // メッセージが '/inroom' の場合、ユーザーを入室者リストに追加します
                        participants.push(event.user);
                    }
                    else if (message === '/outroom') {
                        // メッセージが '/outroom' の場合、ユーザーを入室者リストから削除します
                        const index = participants.indexOf(event.user);
                        if (index !== -1) {
                            participants.splice(index, 1);
                        }
                    }
                    else if (message === '/showroom') {
                        // メッセージが '/showroom' の場合、現在の入室者リストを表示します
                        let responseText = '';
                        if (isRoomUnlocked) {
                            responseText = participants.length > 0 ? participants.join(', ') : '入室者はいません';
                        }
                        else {
                            responseText = '常室は開いていません';
                        }
                        const blocks = [
                            {
                                type: 'section',
                                text: {
                                    type: 'mrkdwn',
                                    text: responseText,
                                },
                            },
                        ];
                        yield sendMessage(botChannel, blocks);
                    }
                }
            }));
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
// メインの処理を実行します
main();
