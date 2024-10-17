const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const PORT = 3000;

// Iniciar o cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // Se quiser ver o navegador, altere para false
        args: ['--no-sandbox', '--disable-setuid-sandbox']
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

// Inicializar cliente
client.initialize();

// Middleware para permitir JSON no express
app.use(express.json());

// Rota para enviar mensagem para número
app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;
    
    // Formatar número com o código do país (por exemplo, Brasil = 55)
    const chatId = `${number}@c.us`; 

    try {
        await client.sendMessage(chatId, message);
        res.status(200).json({ status: 'success', message: `Mensagem enviada para ${number}` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.toString() });
    }
});

// Rota para enviar mensagem para grupo
app.post('/send-group-message', async (req, res) => {
    const { groupId, message } = req.body;
    
    try {
        await client.sendMessage(groupId, message);
        res.status(200).json({ status: 'success', message: `Mensagem enviada para o grupo ${groupId}` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.toString() });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
