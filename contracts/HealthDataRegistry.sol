// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract HealthDataRegistry {
    struct Patient {
        string ipfsHash;
        mapping(address => bool) authorized;
        bool exists;
    }
    
    mapping(address => Patient) private patients;
    
    event PatientRegistered(address indexed patient);
    event DataUpdated(address indexed patient, string ipfsHash);
    event ProviderAuthorized(address indexed patient, address indexed provider);
    event ProviderRevoked(address indexed patient, address indexed provider);
    
    function registerPatient() public {
        require(!patients[msg.sender].exists, "Il paziente e' gia' registrato");
        patients[msg.sender].exists = true;
        emit PatientRegistered(msg.sender);
    }
    
    function updateHealthData(string memory _ipfsHash) public {
        require(patients[msg.sender].exists, "Paziente non registrato");
        patients[msg.sender].ipfsHash = _ipfsHash;
        emit DataUpdated(msg.sender, _ipfsHash);
    }
    
    function authorizeProvider(address _provider) public {
        require(patients[msg.sender].exists, "Paziente non registrato");
        require(!patients[msg.sender].authorized[_provider], "Provider gia' autorizzato");
        patients[msg.sender].authorized[_provider] = true;
        emit ProviderAuthorized(msg.sender, _provider);
    }
    
    function revokeProvider(address _provider) public {
        require(patients[msg.sender].exists, "Paziente non registrato");
        require(patients[msg.sender].authorized[_provider], "Provider non autorizzato");
        patients[msg.sender].authorized[_provider] = false;
        emit ProviderRevoked(msg.sender, _provider);
    }
    
    function getHealthData(address _patient) public view returns (string memory) {
        require(
            _patient == msg.sender || patients[_patient].authorized[msg.sender],
            "Accesso non autorizzato"
        );
        return patients[_patient].ipfsHash;
    }
}
