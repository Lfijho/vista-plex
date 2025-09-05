export default async function handler(request, response) {
    const path = request.query.path.join('/');
    const targetUrl = `${process.env.UPTIME_KUMA_URL}/${path}`;
    try {
        const apiResponse = await fetch(targetUrl);
        const data = await apiResponse.json();
        response.status(200).json(data);
    } catch (error) {
        response.status(500).json({ error: 'Erro ao conectar com Uptime Kuma' });
    }
}