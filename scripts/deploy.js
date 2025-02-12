// deploy.js
// Questo script utilizza ethers.js (attraverso Hardhat) per distribuire il contratto HealthDataRegistry.

// Funzione principale di deploy.
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

// Esecuzione della funzione main.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
