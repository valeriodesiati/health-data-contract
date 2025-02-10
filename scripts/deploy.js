async function main() {
  // Recupera il primo account dalla lista degli account disponibili
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Ottieni la factory per il contratto
  const HealthDataRegistry = await ethers.getContractFactory("HealthDataRegistry");
  // Distribuisci il contratto
  const contract = await HealthDataRegistry.deploy();
  // Attendi che il contratto sia deployato (in ethers.js v6 usa waitForDeployment)
  await contract.waitForDeployment();
  
  console.log("Contract deployed to:", contract.target);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
