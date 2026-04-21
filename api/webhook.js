export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).end();

  const events = req.body?.events || [];

  for (const event of events) {
    if (event.type === 'message' && event.source?.userId) {
      const userId = event.source.userId;
      const replyToken = event.replyToken;
      const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

      // ユーザーIDをそのまま本人に返信する
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          replyToken,
          messages: [{
            type: 'text',
            text: `あなたのユーザーIDは以下です:\n${userId}\n\nこのIDを塾のスタッフにお伝えください。`,
          }],
        }),
      });
    }
  }

  res.status(200).end();
}
