export default async function handler(request, response) {
    const path = request.query.path.join('/');
    const targetUrl = `http://167.172.229.221:9000/api/${path}`;

    try {
        const apiResponse = await fetch(targetUrl, {
            headers: {
                'X-API-Key': 'ptr_82jZQyXfWd24T+cR0IgwS9JP503IN8GhO5+KO0lzIEc=',
            },
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error(`Erro da API Portainer: ${apiResponse.status}`, errorText);
            return response.status(apiResponse.status).json({ error: `Erro no servidor Portainer: ${apiResponse.statusText}` });
        }

        const data = await apiResponse.json();
        response.status(200).json(data);

    } catch (error) {
        console.error('Erro no proxy do Portainer:', error.message);
        response.status(500).json({ error: 'Falha interna ao tentar conectar com o Portainer.' });
    }
}