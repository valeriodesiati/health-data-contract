// deploy.js
// Questo script utilizza ethers.js (attraverso Hardhat) per distribuire il contratto HealthDataRegistry.

/**
 * Funzione principale di deploy che distribuisce il contratto HealthDataRegistry.
 * - Recupera il primo account disponibile per eseguire il deploy.
 * - Ottiene la factory del contratto HealthDataRegistry.
 * - Distribuisce il contratto sulla rete blockchain.
 * - Attende la conferma della distribuzione del contratto.
 * 
 * @async
 * @function main
 * @throws {Error} Se si verifica un errore durante il deploy del contratto.
 */
async function main() {
  // Recupera il primo account dalla lista degli account disponibili (il deployer).
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Ottiene la factory del contratto HealthDataRegistry.
  const HealthDataRegistry = await ethers.getContractFactory("HealthDataRegistry");
  
  // Distribuisce il contratto.
  const contract = await HealthDataRegistry.deploy();

  // Attende la conferma della distribuzione (in ethers.js v6 si usa waitForDeployment).
  await contract.waitForDeployment();
  
  console.log("Contract deployed to:", contract.target);
}

/**
 * Esecuzione della funzione principale per il deploy del contratto.
 * @returns {Promise<void>} Restituisce una promise che si risolve quando il deploy è completato.
 */
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
