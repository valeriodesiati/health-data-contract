// encryption.cjs
// Questo modulo contiene funzioni per la gestione della crittografia dei dati sanitari.
// Viene utilizzato l'algoritmo AES-256-CBC per cifrare e decifrare i dati.

const crypto = require("crypto");

// Specifica dell'algoritmo di crittografia.
const algorithm = 'aes-256-cbc';

/**
 * @notice Genera una chiave casuale a 256 bit in formato esadecimale.
 * @return {string} La chiave generata.
 */
function generateKey() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * @notice Cifra i dati utilizzando AES-256-CBC.
 * @param {string} data I dati in chiaro da cifrare.
 * @param {string} key La chiave (in formato esadecimale) utilizzata per la cifratura.
 * @return {object} Un oggetto contenente il vettore di inizializzazione (iv) e i dati cifrati.
 */
function encryptData(data, key) {
    // Genera un vettore di inizializzazione casuale a 16 byte.
    const iv = crypto.randomBytes(16);
    // Crea un oggetto cipher utilizzando l'algoritmo, la chiave e l'iv.
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Restituisce l'iv e i dati cifrati in formato esadecimale.
    return { iv: iv.toString('hex'), encryptedData: encrypted };
}

/**
 * @notice Decifra i dati cifrati utilizzando AES-256-CBC.
 * @param {object} encryptedObject L'oggetto contenente iv e i dati cifrati.
 * @param {string} key La chiave (in formato esadecimale) utilizzata per la decifratura.
 * @return {string} I dati decifrati in chiaro.
 */
function decryptData(encryptedObject, key) {
    const iv = Buffer.from(encryptedObject.iv, 'hex');
    const encryptedText = Buffer.from(encryptedObject.encryptedData, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { generateKey, encryptData, decryptData };