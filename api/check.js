export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL query parameter is required' });
    }

    try {
        // Use HEAD request to ping the server without downloading the full body
        const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        
        return res.status(200).json({
            url: url,
            status: response.status,
            ok: response.ok
        });
    } catch (error) {
        // Network errors or invalid URLs output a 500
        return res.status(500).json({
            url: url,
            error: error.message,
            status: 500,
            ok: false
        });
    }
}
