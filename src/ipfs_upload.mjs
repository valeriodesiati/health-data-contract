// ipfs_upload.mjs

import { encryptData, generateKey, decryptData } from "./encryption.cjs";
import axios from 'axios';
import { create } from 'ipfs-core';  // Importa da js-ipfs (ipfs-core)
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Carica le variabili d'ambiente dal file .env
dotenv.config();

async function uploadToIPFS(data, patientAddress) {
    // Crea un nodo IPFS in memoria (eseguendo il nodo localmente)
    const node = await create();

    const key = generateKey();
    const encrypted = encryptData(data, key);

    // Aggiungi i dati cifrati a IPFS
    const { cid } = await node.add(JSON.stringify(encrypted));

    console.log('Dati cifrati caricati su IPFS:', cid.toString());

    // Genera un token JWT per l'autenticazione
    const token = jwt.sign({ address: patientAddress, role: "patient" }, process.env.ACCESS_TOKEN_SECRET);

    // Prepara i dati da inviare nel corpo della richiesta
    const postData = {
        patientAddress,
        key
    };

    // Invia la richiesta HTTP con il token di autorizzazione
    try {
        const response = await axios.post('http://localhost:3000/store-key', postData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Aggiungi il token nell'intestazione
            }
        });

        console.log('Chiave salvata nel Key Manager per:', patientAddress);
        console.log('Risposta del server:', response.data);
    } catch (error) {
        console.error('Errore durante la richiesta HTTP:', error);
    }

    // Chiudi il nodo IPFS
    await node.stop();

    // Restituisce l'hash IPFS (CID)
    return cid.toString();
}

export { uploadToIPFS };  // Esporta anche la funzione decryptDataFromIPFS
