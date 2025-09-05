export default async function handler(request, response) {
    const path = request.query.path.join('/');
    const targetUrl = `http://167.172.229.221:3026/${path}`;

    try {
        const apiResponse = await fetch(targetUrl, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await apiResponse.json();
        response.status(200).json(data);
    } catch (error) {
        console.error('Erro no proxy do Uptime Kuma:', error);
        response.status(500).json({ error: 'Falha ao buscar dados do Uptime Kuma.' });
    }
}