// ipfs_upload.mjs

import { encryptData, generateKey, decryptData } from "./encryption.cjs";
import axios from 'axios';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Carica le variabili d'ambiente dal file .env
dotenv.config();

/**
 * Carica i dati cifrati su IPFS utilizzando Pinata e salva la chiave nel Key Manager.
 * 
 * @param {Object} data - I dati da cifrare e caricare su IPFS.
 * @param {string} patientAddress - L'indirizzo del paziente che sta caricando i dati.
 * @returns {Promise<string>} - Restituisce il CID (Content Identifier) di IPFS dove i dati sono stati caricati.
 * @throws {Error} - Lancia un errore se il caricamento su IPFS o l'interazione con il Key Manager fallisce.
 */
async function uploadToIPFS(data, patientAddress) {
    try {
        // Genera una chiave di cifratura per i dati
        const key = generateKey();
        // Cifra i dati con la chiave generata
        const encrypted = encryptData(data, key);

        // Prepara i dati cifrati come JSON
        const dataToUpload = JSON.stringify(encrypted);

        // Configura l'intestazione di autenticazione con le API di Pinata
        const pinataApiKey = process.env.PINATA_API_KEY;
        const pinataApiSecret = process.env.PINATA_API_SECRET;

        const formData = new FormData();
        formData.append('file', new Blob([dataToUpload], { type: 'application/json' }), 'encrypted-data.json');

        // Imposta l'intestazione per la richiesta
        const headers = {
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataApiSecret
        };

        // Carica il file su Pinata (IPFS)
        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, { headers });
        const cid = response.data.IpfsHash;  // Ottieni il CID dal risultato di Pinata
        console.log('Dati cifrati caricati su IPFS tramite Pinata:', cid);

        // Genera un token JWT per l'autenticazione
        const token = jwt.sign({ address: patientAddress, role: "patient" }, process.env.ACCESS_TOKEN_SECRET);

        // Prepara i dati da inviare nel corpo della richiesta
        const postData = {
            patientAddress,
            key
        };

        // Invia la chiave al Key Manager per la memorizzazione
        const keyResponse = await axios.post('http://localhost:3000/store-key', postData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Aggiungi il token nell'intestazione
            }
        });

        console.log('Chiave salvata nel Key Manager per:', patientAddress);
        console.log('Risposta del server:', keyResponse.data);

        // Restituisce l'hash IPFS (CID)
        return cid;

    } catch (error) {
        console.error('Errore durante il caricamento su IPFS tramite Pinata:', error);
        throw new Error('Errore nel caricamento dei dati su IPFS');
    }
}

export { uploadToIPFS };
