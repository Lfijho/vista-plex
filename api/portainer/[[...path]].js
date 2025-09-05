export default async function handler(request, response) {
    const path = request.query.path.join('/');
    const targetUrl = `${process.env.PORTAINER_URL}/api/${path}`;
    try {
        const apiResponse = await fetch(targetUrl, {
            headers: { 'X-API-Key': process.env.PORTAINER_API_KEY },
        });
        const data = await apiResponse.json();
        response.status(200).json(data);
    } catch (error) {
        response.status(500).json({ error: 'Erro ao conectar com Portainer' });
    }
}