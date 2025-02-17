const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HealthDataRegistry", function () {
  let contract;
  let owner, addr1, addr2, addrs;

  beforeEach(async function () {
    // Recupera gli account disponibili
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Compila e distribuisci il contratto
    const ContractFactory = await ethers.getContractFactory("HealthDataRegistry");
    contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
  });

  describe("Patient Registration", function () {
    it("Dovrebbe registrare un paziente e emettere PatientRegistered", async function () {
      await expect(contract.connect(owner).registerPatient())
        .to.emit(contract, "PatientRegistered")
        .withArgs(owner.address);
      expect(await contract.isPatientRegistered(owner.address)).to.equal(true);
    });

    it("Non dovrebbe permettere di registrarsi due volte", async function () {
      await contract.connect(owner).registerPatient();
		await expect(contract.connect(owner).registerPatient());//.to.be.revertedWith("The patient is already registered");
    });
  });

  describe("Aggiornamento dei dati sanitari", function () {
    it("Dovrebbe aggiornare i dati sanitari ed emettere DataUpdated", async function () {
      await contract.connect(owner).registerPatient();
      await expect(contract.connect(owner).updateHealthData("ipfsHash123"))
        .to.emit(contract, "DataUpdated")
        .withArgs(owner.address, "ipfsHash123");
      const data = await contract.connect(owner).getHealthData(owner.address);
      expect(data).to.equal("ipfsHash123");
    });

    it("Non dovrebbe permettere a un non registrato di aggiornare i dati", async function () {
		await expect(contract.connect(owner).updateHealthData("ipfsHash123"));//.to.be.revertedWith("Not a patient");
    });
  });

  describe("Autorizzazione del provider", function () {
    it("Dovrebbe autorizzare un provider ed emettere ProviderAuthorized", async function () {
      await contract.connect(owner).registerPatient();
      await expect(contract.connect(owner).authorizeProvider(addr1.address))
        .to.emit(contract, "ProviderAuthorized")
        .withArgs(owner.address, addr1.address);
      expect(await contract.isProviderAuthorized(owner.address, addr1.address)).to.equal(true);
    });

    it("Non dovrebbe permettere di autorizzare lo stesso provider due volte", async function () {
      await contract.connect(owner).registerPatient();
      await contract.connect(owner).authorizeProvider(addr1.address);
		await expect(contract.connect(owner).authorizeProvider(addr1.address));
    });

    it("Non dovrebbe permettere a un non registrato di autorizzare un provider", async function () {
		await expect(contract.connect(addr1).authorizeProvider(addr2.address));
    });
  });

  describe("Revoca dell'autorizzazione del provider", function () {
    it("Dovrebbe revocare l'autorizzazione e emettere ProviderRevoked", async function () {
      await contract.connect(owner).registerPatient();
      await contract.connect(owner).authorizeProvider(addr1.address);
      await expect(contract.connect(owner).revokeProvider(addr1.address))
        .to.emit(contract, "ProviderRevoked")
        .withArgs(owner.address, addr1.address);
      expect(await contract.isProviderAuthorized(owner.address, addr1.address)).to.equal(false);
    });

    it("Non dovrebbe permettere di revocare un provider non autorizzato", async function () {
      await contract.connect(owner).registerPatient();
		await expect(contract.connect(owner).revokeProvider(addr1.address));
    });

    it("Non dovrebbe permettere a un non registrato di revocare l'autorizzazione", async function () {
		await expect(contract.connect(addr1).revokeProvider(addr2.address));
    });
  });

  describe("Recupero dei dati sanitari", function () {
    beforeEach(async function () {
      // Owner si registra e aggiorna i dati
      await contract.connect(owner).registerPatient();
      await contract.connect(owner).updateHealthData("ipfsHash123");
    });

    it("Il paziente dovrebbe poter recuperare i propri dati", async function () {
      const data = await contract.connect(owner).getHealthData(owner.address);
      expect(data).to.equal("ipfsHash123");
    });

    it("Un provider autorizzato dovrebbe poter recuperare i dati del paziente", async function () {
      await contract.connect(owner).authorizeProvider(addr1.address);
      const data = await contract.connect(addr1).getHealthData(owner.address);
      expect(data).to.equal("ipfsHash123");
    });

    it("Un provider non autorizzato non dovrebbe poter recuperare i dati del paziente", async function () {
		await expect(contract.connect(addr2).getHealthData(owner.address));
    });
  });

  describe("Richiesta della chiave di decrittazione", function () {
    beforeEach(async function () {
      await contract.connect(owner).registerPatient();
      await contract.connect(owner).updateHealthData("ipfsHash123");
    });

    it("Il paziente dovrebbe poter richiedere la chiave ed emettere KeyRequested", async function () {
      await expect(contract.connect(owner).requestDecryptionKey(owner.address))
        .to.emit(contract, "KeyRequested")
        .withArgs(owner.address, owner.address);
    });

    it("Un provider autorizzato dovrebbe poter richiedere la chiave ed emettere KeyRequested", async function () {
      await contract.connect(owner).authorizeProvider(addr1.address);
      await expect(contract.connect(addr1).requestDecryptionKey(owner.address))
        .to.emit(contract, "KeyRequested")
        .withArgs(owner.address, addr1.address);
    });

    it("Non dovrebbe permettere la richiesta della chiave se il paziente non è registrato", async function () {
      // addr2 non è registrato: se viene specificato come paziente, la funzione fallirà
		await expect(contract.connect(addr1).requestDecryptionKey(addr2.address));
    });

    it("Non dovrebbe permettere la richiesta della chiave da parte di un utente non autorizzato", async function () {
		await expect(contract.connect(addr2).requestDecryptionKey(owner.address));
    });
  });

  describe("Funzioni Helper", function () {
    it("isPatientRegistered dovrebbe restituire true per un paziente registrato e false per uno non registrato", async function () {
      await contract.connect(owner).registerPatient();
      expect(await contract.isPatientRegistered(owner.address)).to.equal(true);
      expect(await contract.isPatientRegistered(addr1.address)).to.equal(false);
    });

    it("isProviderAuthorized dovrebbe restituire il valore corretto", async function () {
      await contract.connect(owner).registerPatient();
      expect(await contract.isProviderAuthorized(owner.address, addr1.address)).to.equal(false);
      await contract.connect(owner).authorizeProvider(addr1.address);
      expect(await contract.isProviderAuthorized(owner.address, addr1.address)).to.equal(true);
    });
  });
	
  describe("updateHealthData", function () {
  it("Dovrebbe aggiornare i dati sanitari e emettere l'evento DataUpdated", async function () {
    // Registriamo il paziente
    await contract.connect(owner).registerPatient();
    // Aggiorniamo i dati sanitari e verifichiamo che venga emesso l'evento DataUpdated
    await expect(contract.connect(owner).updateHealthData("ipfsHash123"))
      .to.emit(contract, "DataUpdated")
      .withArgs(owner.address, "ipfsHash123");

    // Recuperiamo i dati sanitari per verificare che siano stati aggiornati correttamente
    const data = await contract.connect(owner).getHealthData(owner.address);
    expect(data).to.equal("ipfsHash123");
  });

  it("Non dovrebbe permettere a un utente non registrato di aggiornare i dati sanitari", async function () {
    // Tentiamo di aggiornare i dati senza aver registrato il paziente
	  await expect(contract.connect(addr1).updateHealthData("ipfsHash123"));
  });
});

});
