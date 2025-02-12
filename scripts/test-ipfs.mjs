// test-ipfs.mjs

import { uploadToIPFS } from "../src/ipfs_upload.mjs"; // Funzione che esegue l'upload su IPFS e salva la chiave
import { create } from 'ipfs-core'; // Per interagire con IPFS
import { decryptData } from "../src/encryption.cjs"; // Funzione per decrittare i dati
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';

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
        const ipfsHash = await uploadToIPFS(data, patientAddress);
        console.log("Dati caricati su IPFS con hash:", ipfsHash);
        return ipfsHash;
    } catch (error) {
        console.error("Errore durante l'upload su IPFS:", error.message);
    }
}

/**
 * Testa la decrittazione dei dati:
 * - Recupera i dati cifrati da IPFS usando l'hash fornito.
 * - Richiede la chiave al Key Manager.
 * - Utilizza la chiave per decrittare i dati e li stampa in chiaro.
 * 
 * @param {string} ipfsHash L'hash (CID) dei dati cifrati memorizzati su IPFS.
 * @param {string} patientAddress L'indirizzo del paziente associato ai dati.
 */
async function testDataDecryption(ipfsHash, patientAddress) {
    try {
        // 1. Recupera i dati cifrati da IPFS
        const node = await create();
        let encryptedDataBuffer = "";
        // Utilizza l'iteratore per leggere i dati da IPFS
        for await (const chunk of node.cat(ipfsHash)) {
            encryptedDataBuffer += chunk.toString();
        }
        await node.stop();
        console.log("Dati cifrati recuperati da IPFS:", encryptedDataBuffer);

        // Converte la stringa JSON in un oggetto contenente l'IV e i dati cifrati
        const encryptedObject = JSON.parse(encryptedDataBuffer);

        // 2. Recupera la chiave dal Key Manager tramite API
        const token = jwt.sign({ address: patientAddress, role: "patient" }, process.env.ACCESS_TOKEN_SECRET);
        const keyResponse = await axios.get(`http://localhost:3000/get-key/${patientAddress}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const key = keyResponse.data.key;

        // 3. Decritta i dati utilizzando la chiave
        const decryptedData = decryptData(encryptedObject, key);
        console.log("Dati decrittati:", decryptedData);
    } catch (error) {
        console.error("Errore durante la decrittazione dei dati:", error.message);
    }
}



// export { testIpfsUpload, testDataDecryption };

// Per testare l'upload su IPFS, esegui questa funzione:
const ipfsHash = await testIpfsUpload();

// Per testare la decrittazione dei dati, esegui questa funzione fornendo l'hash IPFS ottenuto precedentemente:
await testDataDecryption(ipfsHash, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
