const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const PORT = 3000;

// Iniciar o cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
        ],
        timeout: 30000,
    }
});

// Exibir QR Code no terminal para conectar o WhatsApp
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Escaneie o QR code acima para conectar');
});

// Cliente pronto
client.on('ready', () => {
    console.log('Cliente WhatsApp pronto!');
});

client.on('ready', async () => {
    console.log('Cliente WhatsApp pronto!');

    // Obter todos os chats
    const chats = await client.getChats();

    // Filtrar apenas os grupos
    const grupos = chats.filter(chat => chat.isGroup);

    console.log('Grupos:');
    grupos.forEach(grupo => {
        console.log(`${grupo.name} - ID: ${grupo.id._serialized}`);
    });
});


// Inicializar cliente
client.initialize();

// Middleware para permitir JSON no express
app.use(express.json());

// Função para calcular a diferença de tempo
const calcularTempoRestante = (dataFuturaStr) => {
    const dataFutura = new Date(dataFuturaStr);
    const dataAtual = new Date();
    const diferenca = dataFutura - dataAtual;

    if (diferenca <= 0) {
        return 'O evento já ocorreu';
    }

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

    return `Faltam ${dias} dias, ${horas} horas, ${minutos} minutos e ${segundos} segundos PARA O SITIO`;
};

// Rota para enviar mensagem para número via JSON e programar intervalos
app.post('/send-message', async (req, res) => {
    const { number, message, interval } = req.body;
    
    // Formatar número com código do país
    const chatId = `${number}@c.us`;

    // Definir data futura (você pode customizar via requisição também)
    const dataFuturaStr = "2024-10-19 08:00";
    
    try {
        // Função que envia mensagem em intervalos
        const enviarMensagem = async () => {
            const tempoRestante = calcularTempoRestante(dataFuturaStr);
            const finalMessage = `${message}\n${tempoRestante}`;

            await client.sendMessage(chatId, finalMessage);
            console.log(`Mensagem enviada para ${number}: ${finalMessage}`);
        };

        // Configurar envio de mensagem a cada intervalo
        setInterval(enviarMensagem, interval * 1000); // Intervalo em segundos

        res.status(200).json({ status: 'success', message: `Mensagens automáticas iniciadas para ${number}` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.toString() });
    }
});

// Rota para enviar mensagem para grupo via JSON e programar intervalos
app.post('/send-group-message', async (req, res) => {
    const { groupId, message, interval } = req.body;

    // Definir data futura (você pode customizar via requisição também)
    const dataFuturaStr = "2024-10-19 08:00";
    
    try {
        // Função que envia mensagem em intervalos
        const enviarMensagemGrupo = async () => {
            const tempoRestante = calcularTempoRestante(dataFuturaStr);
            const finalMessage = `${message}\n${tempoRestante}`;

            await client.sendMessage(groupId, finalMessage);
            console.log(`Mensagem enviada para o grupo ${groupId}: ${finalMessage}`);
        };

        // Configurar envio de mensagem a cada intervalo
        setInterval(enviarMensagemGrupo, interval * 1000); // Intervalo em segundos

        res.status(200).json({ status: 'success', message: `Mensagens automáticas iniciadas para o grupo ${groupId}` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.toString() });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
