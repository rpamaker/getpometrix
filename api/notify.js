export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, page, userAgent } = req.body || {};
    if (!email) {
        return res.status(400).json({ error: 'Missing email' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'RESEND_API_KEY is not configured' });
    }

    const to = [
        'santiago@pometrix.com',
        'andres@pometrix.com',
        'daniel@pometrix.com'
    ];

    const subject = 'Nuevo acceso registrado en GetPometrix';
    const text = `Se registró un nuevo acceso.

Email: ${email}
Página: ${page || ''}
User-Agent: ${userAgent || ''}
Fecha: ${new Date().toISOString()}`;

    try {
        const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'notificaciones@get.pometrix.com',
                to,
                subject,
                text
            })
        });

        if (!resp.ok) {
            const errText = await resp.text();
            return res.status(502).json({ error: 'Email provider error', details: errText });
        }

        const data = await resp.json();
        return res.status(200).json({ ok: true, id: data.id });
    } catch (err) {
        return res.status(500).json({ error: 'Unexpected error', details: String(err) });
    }
}


