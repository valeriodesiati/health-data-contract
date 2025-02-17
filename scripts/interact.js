// interact.js
// Questo script simula l'interazione con il contratto HealthDataRegistry.
// Vengono testati vari scenari: registrazione del paziente, aggiornamento dei dati,
// autorizzazione/revoca di provider, richiesta di chiave di decrittazione e accesso ai dati.

const { ethers } = require("hardhat");

// Indirizzo in cui è stato distribuito il contratto.
// Hardhat
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Importa l'ABI del contratto.
const { abi } = require("../artifacts/contracts/HealthDataRegistry.sol/HealthDataRegistry.json");

/**
 * Funzione principale che simula l'interazione con il contratto HealthDataRegistry.
 * Vengono testati vari scenari, come la registrazione del paziente, l'aggiornamento dei dati,
 * l'autorizzazione dei provider, la richiesta di chiavi di decrittazione e l'accesso ai dati.
 * 
 * @async
 * @function main
 * @throws {Error} Se si verifica un errore durante le transazioni con il contratto.
 */
async function main() {
    // Recupera gli account di test.
    const [owner, patient, provider, provider2, otherAccount] = await ethers.getSigners();

    console.log("Owner address:", owner.address);
    console.log("Patient address:", patient.address);
    console.log("Provider address:", provider.address);
    console.log("Provider 2 address:", provider2.address);
    console.log("Other account address:", otherAccount ? otherAccount.address : "No other account available");
    console.log("\n");

    // Crea un'istanza del contratto (inizialmente con lo signer owner).
    const contract = new ethers.Contract(contractAddress, abi, owner);

    // 1. Registrazione del paziente (chiamata da "patient")
    const isRegistered = await contract.isPatientRegistered(patient.address);
    if (!isRegistered) {
        try {
            const tx1 = await contract.connect(patient).registerPatient();
            console.log("Transaction hash (registerPatient):", tx1.hash);
            await tx1.wait();
            console.log("Patient registered!");
        } catch (error) {
            console.log("Registration error:", error.message);
        }
    } else {
        console.log("Patient already registered, skipping registration.");
    }
    console.log("\n");

    // 2. Aggiornamento dei dati sanitari da parte del paziente
    const encryptedIpfsHash = "QmUzA3j2VBbmajMVJwCL5JYim86WaJuAj5B4HVWpFyQZLV";
    const tx2 = await contract.connect(patient).updateHealthData(encryptedIpfsHash);
    console.log("Transaction hash (updateHealthData):", tx2.hash);
    await tx2.wait();
    console.log("Health data updated!");
    console.log("\n");

    // 3. Il paziente autorizza il provider
    const isAuthorized = await contract.isProviderAuthorized(patient.address, provider.address);
    if (!isAuthorized) {
        try {
            const tx3 = await contract.connect(patient).authorizeProvider(provider.address);
            console.log("Transaction hash (authorizeProvider):", tx3.hash);
            await tx3.wait();
            console.log("Provider 1 authorized!");
            const authorized = await contract.isProviderAuthorized(patient.address, provider.address);
            console.log("Is provider 1 authorized?", authorized);
        } catch (error) {
            console.log("Authorization error:", error.message);
        }
    } else {
        console.log("Provider already registered, skipping authorization.");
    }
    console.log("\n");

    // 4. Il provider accede ai dati sanitari del paziente
    try {
        const healthData = await contract.connect(provider).getHealthData(patient.address);
        console.log("Health data from provider 1 (authorized):", healthData);
    } catch (error) {
        console.log("Error getting health data as provider 1:", error.message);
    }
    console.log("\n");

    // 5. Il paziente revoca l'autorizzazione del provider
    const tx4 = await contract.connect(patient).revokeProvider(provider.address);
    console.log("Transaction hash (revokeProvider):", tx4.hash);
    await tx4.wait();
    console.log("Provider 1 authorization revoked!");
    console.log("\n");

    // 6. Il provider tenta di accedere ai dati dopo la revoca (dovrebbe fallire)
    try {
        const healthDataRevoked = await contract.connect(provider).getHealthData(patient.address);
        console.log("Health data from revoked provider:", healthDataRevoked);
    } catch (error) {
        console.log("Access denied to revoked provider:", error.message);
    }
    console.log("\n");

    // 7. Il paziente richiede la chiave di decrittazione per se stesso
    const tx5 = await contract.connect(patient).requestDecryptionKey(patient.address);
    console.log("Transaction hash (requestDecryptionKey - patient):", tx5.hash);
    await tx5.wait();
    console.log("Patient requested decryption key!");
    console.log("\n");

    // 8. Il paziente autorizza nuovamente il provider e il provider richiede la chiave
    const tx6 = await contract.connect(patient).authorizeProvider(provider.address);
    console.log("Transaction hash (reauthorizeProvider):", tx6.hash);
    await tx6.wait();
    console.log("Provider 1 reauthorized!");    
    const tx7 = await contract.connect(provider).requestDecryptionKey(patient.address);
    console.log("Transaction hash (requestDecryptionKey - provider):", tx7.hash);
    await tx7.wait();
    console.log("Provider 1 requested decryption key!");
    console.log("\n");

    // 9. Un account non autorizzato tenta di richiedere la chiave (dovrebbe fallire)
    try {
        const tx8 = await contract.connect(otherAccount).requestDecryptionKey(patient.address);
        console.log("Transaction hash (requestDecryptionKey - unauthorized):", tx8.hash);
        await tx8.wait();
    } catch (error) {
        console.log("Access denied for unauthorized account when requesting decryption key:", error.message);
    }
    console.log("\n");

    // 12. Il paziente autorizza il secondo provider
    const isAuthorized2 = await contract.isProviderAuthorized(patient.address, provider2.address);
    if (!isAuthorized2) {
        try {
            const tx11 = await contract.connect(patient).authorizeProvider(provider2.address);
            console.log("Transaction hash (authorizeProvider):", tx11.hash);
            await tx11.wait();
            console.log("Provider 2 authorized!");
            const authorized2 = await contract.isProviderAuthorized(patient.address, provider2.address);
            console.log("Is provider 2 authorized?", authorized2);
        } catch (error) {
            console.log("Authorization error:", error.message);
        }
    } else {
        console.log("Provider 2 already registered, skipping authorization.");
    }
    console.log("\n");

    // 13. Il provider 2 accede ai dati sanitari del paziente
    try {
        const healthData = await contract.connect(provider2).getHealthData(patient.address);
        console.log("Health data from provider 2 (authorized):", healthData);
    } catch (error) {
        console.log("Error getting health data as provider 2:", error.message);
    }
    console.log("\n");
}

/**
 * Esecuzione della funzione principale che simula l'interazione con il contratto.
 * @returns {Promise<void>} Restituisce una promise che si risolve quando tutte le transazioni sono completate.
 */
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
