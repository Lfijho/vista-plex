export default async function handler(request, response) {
    // Pega o caminho da URL, por exemplo: 'api/status-page/heartbeat/dashiilex'
    const path = request.query.path.join('/');
    const targetUrl = `http://167.172.229.221:3026/${path}`;

    try {
        const apiResponse = await fetch(targetUrl);

        // Se a resposta da API não for OK, retorna o erro
        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error(`Erro da API Uptime Kuma: ${apiResponse.status}`, errorText);
            return response.status(apiResponse.status).json({ error: `Erro no servidor Uptime Kuma: ${apiResponse.statusText}` });
        }

        // Pega a resposta como texto para verificar se é JSON
        const responseText = await apiResponse.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            // Se não for JSON, é um erro.
            console.error('A resposta do Uptime Kuma não é um JSON válido. Resposta recebida:', responseText);
            return response.status(500).json({ error: 'Resposta inválida do servidor Uptime Kuma.' });
        }

        // Se tudo deu certo, envia o JSON para o dashboard
        response.status(200).json(data);

    } catch (error) {
        console.error('Erro no proxy do Uptime Kuma:', error.message);
        response.status(500).json({ error: 'Falha interna ao tentar conectar com o Uptime Kuma.' });
    }
}