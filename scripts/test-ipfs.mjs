// test-ipfs.mjs

import { uploadToIPFS } from "../src/ipfs_upload.mjs"; // Funzione che esegue l'upload su IPFS e salva la chiave
import { create } from 'ipfs-core'; // Per interagire con IPFS
import { decryptData } from "../src/encryption.cjs"; // Funzione per decrittare i dati
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();


/**
 * Testa l'upload su IPFS.
 * - Cifra i dati sanitari e li carica su IPFS.
 * - Salva la chiave nel Key Manager tramite API.
 * - Stampa l'hash IPFS ottenuto.
 */
async function testIpfsUpload() {
    try {
        // Dati sanitari in chiaro da cifrare
        const data = "Pressione 120/80";
        const patientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

        // Esegue l'upload e salva la chiave
        console.log("Inizio upload su IPFS...");
        const ipfsHash = await uploadToIPFS(data, patientAddress);
        console.log("Upload completato, hash IPFS:", ipfsHash);
        return ipfsHash;
    } catch (error) {
        console.error("Errore durante l'upload su IPFS:", error.message);
    }
}

/**
 * Testa la decrittazione dei dati:
 * - Recupera i dati cifrati da Pinata tramite l'hash IPFS (CID).
 * - Richiede la chiave dal Key Manager.
 * - Utilizza la chiave per decrittare i dati e li stampa in chiaro.
 * 
 * @param {string} ipfsHash L'hash (CID) dei dati cifrati memorizzati su IPFS.
 * @param {string} patientAddress L'indirizzo del paziente associato ai dati.
 */
async function testDataDecryption(ipfsHash, patientAddress) {
    console.log("inizio test decrypt");
    try {
        // Recupera i dati cifrati da IPFS tramite il CID
        // const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        const ipfsUrl = 'https://plum-secret-felidae-888.mypinata.cloud/ipfs/'+ipfsHash;
        console.log("Recupero dati cifrati da IPFS tramite URL:", ipfsUrl);

        const response = await axios.get(ipfsUrl);

        const encryptedData = response.data; // Assicurati che la risposta sia JSON direttamente
        console.log("Dati cifrati recuperati da Pinata:", encryptedData);

        // Assumiamo che i dati siano cifrati in un formato JSON, ma verifica la struttura
        const encryptedObject = encryptedData; 

        // Richiesta della chiave dal Key Manager
        const token = jwt.sign({ address: patientAddress, role: "patient" }, process.env.ACCESS_TOKEN_SECRET);
        
        console.log("Richiesta chiave in corso...");
        
        const keyResponse = await axios.get(`http://localhost:3000/get-key/${patientAddress}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const key = keyResponse.data.key;

        console.log("Chiave ricevuta:", keyResponse.data);

        // Decrittazione dei dati
        const decryptedData = decryptData(encryptedObject, key);
        console.log("Dati decrittati:", decryptedData);
    } catch (error) {
        console.error("Errore durante la decrittazione dei dati:", error.message);
    }
}

export { testIpfsUpload, testDataDecryption };

async function main() {
    const ipfsHash = await testIpfsUpload();
    await testDataDecryption(ipfsHash, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });