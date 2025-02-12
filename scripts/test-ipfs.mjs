//test-ipfs.mjs

import { uploadToIPFS } from "../src/ipfs_upload.mjs";  // Importa dal file .mjs

async function testIpfsUpload() {
    try {
        // Simula dei dati sanitari in chiaro
        const data = "Questi sono i dati sanitari del paziente in chiaro.";
        const patientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

        // Carica i dati cifrati su IPFS e salva la chiave nel Key Manager
        const ipfsHash = await uploadToIPFS(data, patientAddress);
        console.log("Dati caricati su IPFS con hash:", ipfsHash);
    } catch (error) {
        console.error("Errore durante l'upload su IPFS:", error);
    }
}

testIpfsUpload();
