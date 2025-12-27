const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

// Création du client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    }
});

// QR code
client.on("qr", qr => {
    console.log("QR détecté. Scanne-le pour te connecter :");
    qrcode.generate(qr, { small: true });
});

// Loading WhatsApp
client.on("loading_screen", (percent, message) => {
    console.log(`Chargement... ${percent}% - ${message}`);
});

// Auth OK
client.on("ready", () => {
    console.log("Le bot est connecté !");
    startBotLoop();
});

// Auth KO
client.on("auth_failure", err => {
    console.log("Erreur d'authentification :", err);
});

// Déconnexion
client.on("disconnected", reason => {
    console.log("Déconnecté :", reason);
});

client.initialize();


// ───────────────────────────────
// INPUT terminal
// ───────────────────────────────
const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(q) {
    return new Promise(resolve => readline.question(q, resolve));
}


// ───────────────────────────────
// BOUCLE DU BOT
// ───────────────────────────────
async function startBotLoop() {
    while (true) {
        console.log("\n--- Nouvelle opération ---");
        console.log("Tape 'exit' pour quitter.\n");

        // Numéro
        const number = await ask("Numéro du destinataire (ex: 24164383673) : ");
        if (number.toLowerCase() === "exit") {
            console.log("Fermeture du bot...");
            process.exit();
        }

        // Message
        const message = await ask("Message : ");
        if (message.toLowerCase() === "exit") {
            console.log("Fermeture du bot...");
            process.exit();
        }

        // Nombre
        const count = parseInt(await ask("Nombre d'envois : "));
        if (isNaN(count) || count <= 0) {
            console.log("Nombre invalide.");
            continue;
        }

        const chatId = number + "@c.us";

        console.log("Envoi en cours...");

        try {
            for (let i = 0; i < count; i++) {
                await client.sendMessage(chatId, message);
            }
            console.log("Messages envoyés !");
        } catch (err) {
            console.log("Erreur lors de l'envoi :", err.message);
        }

        console.log("Opération terminée. Tu peux en faire une autre.");
    }
}
