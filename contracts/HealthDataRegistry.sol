// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title HealthDataRegistry
 * @dev Questo smart contract gestisce i dati sanitari cifrati dei pazienti,
 * la registrazione degli stessi e l'autorizzazione di provider per accedere ai dati.
 */
contract HealthDataRegistry {
    // Struttura per rappresentare un paziente.
    // Contiene l'hash IPFS dei dati sanitari cifrati, un mapping degli indirizzi autorizzati e un flag di esistenza.
    struct Patient {
        string encryptedIpfsHash;
        mapping(address => bool) authorized;
        bool exists;
    }

    // Mapping che associa ogni indirizzo (paziente) alla propria struttura Patient.
    mapping(address => Patient) private patients;

    // Eventi per tracciare le operazioni sul contratto.
    event PatientRegistered(address indexed patient);
    event DataUpdated(address indexed patient, string ipfsHash);
    event ProviderAuthorized(address indexed patient, address indexed provider);
    event ProviderRevoked(address indexed patient, address indexed provider);
    event KeyRequested(address indexed patient, address indexed requester);

    /**
     * @notice Registra un paziente se non è già registrato.
     */
    function registerPatient() public {
        require(!patients[msg.sender].exists, "Il paziente e' gia' registrato");
        patients[msg.sender].exists = true;
        emit PatientRegistered(msg.sender);
    }

    /**
     * @notice Aggiorna i dati sanitari (l'hash IPFS dei dati cifrati) del paziente.
     * @param _ipfsHash L'hash IPFS che punta ai dati sanitari cifrati.
     */
    function updateHealthData(string memory _ipfsHash) public {
        require(patients[msg.sender].exists, "Paziente non registrato");
        patients[msg.sender].encryptedIpfsHash = _ipfsHash;
        emit DataUpdated(msg.sender, _ipfsHash);
    }

    /**
     * @notice Autorizza un provider ad accedere ai dati sanitari.
     * @param _provider Indirizzo del provider da autorizzare.
     */
    function authorizeProvider(address _provider) public {
        require(patients[msg.sender].exists, "Paziente non registrato");
        require(
            !patients[msg.sender].authorized[_provider],
            "Provider gia' autorizzato"
        );
        patients[msg.sender].authorized[_provider] = true;
        emit ProviderAuthorized(msg.sender, _provider);
    }

    /**
     * @notice Revoca l'autorizzazione ad un provider precedentemente autorizzato.
     * @param _provider Indirizzo del provider da revocare.
     */
    function revokeProvider(address _provider) public {
        require(patients[msg.sender].exists, "Paziente non registrato");
        require(
            patients[msg.sender].authorized[_provider],
            "Provider non autorizzato"
        );
        patients[msg.sender].authorized[_provider] = false;
        emit ProviderRevoked(msg.sender, _provider);
    }

    /**
     * @notice Restituisce i dati sanitari cifrati (IPFS hash) se il richiedente è il paziente o un provider autorizzato.
     * @param _patient Indirizzo del paziente di cui si vogliono ottenere i dati.
     * @return string L'hash IPFS contenente i dati sanitari cifrati.
     */
    function getHealthData(
        address _patient
    ) public view returns (string memory) {
        require(
            _patient == msg.sender || patients[_patient].authorized[msg.sender],
            "Accesso non autorizzato"
        );
        return patients[_patient].encryptedIpfsHash;
    }

    /**
     * @notice Funzione per richiedere la chiave di decrittazione dei dati sanitari.
     * L'accesso è consentito solo al paziente o a un provider autorizzato.
     * @param patient Indirizzo del paziente.
     */
    function requestDecryptionKey(address patient) public {
        require(patients[patient].exists, "Paziente non registrato");
        require(
            patient == msg.sender || patients[patient].authorized[msg.sender],
            "Accesso non autorizzato"
        );
        emit KeyRequested(patient, msg.sender);
    }

    /**
     * @notice Funzione helper per verificare se un paziente è registrato.
     * @param _patient Indirizzo del paziente.
     * @return bool True se il paziente è registrato.
     */
    function isPatientRegistered(address _patient) public view returns (bool) {
        return patients[_patient].exists;
    }

    /**
     * @notice Funzione helper per verificare se un provider è autorizzato per un dato paziente.
     * @param _patient Indirizzo del paziente.
     * @param _provider Indirizzo del provider.
     * @return bool True se il provider è autorizzato.
     */
    function isProviderAuthorized(
        address _patient,
        address _provider
    ) public view returns (bool) {
        return patients[_patient].authorized[_provider];
    }
}
