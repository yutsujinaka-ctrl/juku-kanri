export default async function handler(req, res) {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const { userId, studentName, grade, type } = req.body;
 
  if (!userId || !studentName || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
 
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'LINE token not configured' });
  }
 
  const typeLabel = type === 'enter' ? '入室' : '退室';
  const emoji     = type === 'enter' ? '📥' : '📤';
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
 
  const message = `${emoji} ${typeLabel}のお知らせ\n\n${studentName} さん（${grade}）が\n${now} に\n${typeLabel}しました。\n\n──────────\n📚 ○○学習塾\n入退室管理システム`;
 
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: 'text', text: message }],
      }),
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      console.error('LINE API error:', data);
      return res.status(500).json({ error: 'LINE API error', detail: data });
    }
 
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Notify error:', err);
    return res.status(500).json({ error: err.message });
  }
}
