const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HealthDataRegistry", function () {
	let contract;
	let owner;
	let addr1;
	let addr2;

	beforeEach(async function () {
		// Recupera gli account disponibili
		[owner, addr1, addr2, _] = await ethers.getSigners();

		// Compila e distribuisci il contratto
		const ContractFactory = await ethers.getContractFactory("HealthDataRegistry");
		contract = await ContractFactory.deploy();
		// In ethers v6, usa waitForDeployment invece di deployed()
		await contract.waitForDeployment();
	});


	it("Dovrebbe registrare un paziente", async function () {
		await contract.connect(owner).registerPatient();
		// Per verificare che il paziente sia registrato, proviamo a chiamare updateHealthData senza errori
		await expect(contract.connect(owner).updateHealthData("ipfsHash123")).to.not.be.reverted;
	});

	it("Non dovrebbe permettere di registrarsi due volte", async function () {
		await contract.connect(owner).registerPatient();
		await expect(contract.connect(owner).registerPatient()).to.be.revertedWith("Il paziente e' gia' registrato");
	});

	it("Dovrebbe aggiornare i dati sanitari", async function () {
		await contract.connect(owner).registerPatient();
		await contract.connect(owner).updateHealthData("ipfsHash123");
		const data = await contract.connect(owner).getHealthData(owner.address);
		expect(data).to.equal("ipfsHash123");
	});

	it("Dovrebbe autorizzare un provider", async function () {
		await contract.connect(owner).registerPatient();
		await contract.connect(owner).authorizeProvider(addr1.address);
		// Ora, addr1 dovrebbe essere in grado di chiamare getHealthData
		await contract.connect(owner).updateHealthData("ipfsHash123");
		const data = await contract.connect(addr1).getHealthData(owner.address);
		expect(data).to.equal("ipfsHash123");
	});

	it("Dovrebbe revocare l'autorizzazione ad un provider", async function () {
		await contract.connect(owner).registerPatient();
		await contract.connect(owner).authorizeProvider(addr1.address);
		await contract.connect(owner).updateHealthData("ipfsHash123");

		// Verifichiamo che addr1 possa leggere i dati
		const data = await contract.connect(addr1).getHealthData(owner.address);
		expect(data).to.equal("ipfsHash123");

		// Revoca l'autorizzazione e poi l'accesso dovrebbe fallire
		await contract.connect(owner).revokeProvider(addr1.address);
		await expect(contract.connect(addr1).getHealthData(owner.address)).to.be.revertedWith("Accesso non autorizzato");
	});
});
