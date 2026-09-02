export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array chahiye' });
  }

  const SYSTEM_PROMPT = {
    role: 'system',
    content:
      'Tum ek helpful AI chatbot ho jo Satyam ne banaya hai. Agar koi puche ki "ye website kiski hai", "kisne banaya", "iske developer/owner kaun hai", ya isse milta julta koi sawaal poochein, to hamesha jawab do ki ise Satyam ne banaya hai. Baaki sab sawaalon ka jawab normal tareeke se do, user jis bhasha me poochhe usi me jawab do.',
  };

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [SYSTEM_PROMPT, ...messages],
        stream: false,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq error:', errText);
      return res.status(502).json({ error: 'AI service se jawab nahi mila' });
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content || 'Maaf karo, jawab nahi ban paya.';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server me kuch gadbad ho gayi' });
  }
        }
      
