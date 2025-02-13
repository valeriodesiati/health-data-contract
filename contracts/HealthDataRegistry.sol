// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title HealthDataRegistry
 * @dev This smart contract manages encrypted health data for patients,
 *      their registration, and the authorization of providers to access the data.
 */
contract HealthDataRegistry {
    // Structure to represent a patient.
    // It contains the encrypted IPFS hash of health data, a mapping of authorized addresses, and an existence flag.
    struct Patient {
        string encryptedIpfsHash; // Encrypted IPFS hash of the health data
        mapping(address => bool) authorized; // Mapping of authorized providers
        bool exists; // Flag indicating if the patient is registered
    }

    // Mapping that links each patient's address to their Patient structure
    mapping(address => Patient) private patients;

    // Events to track operations on the contract
    event PatientRegistered(address indexed patient);
    event DataUpdated(address indexed patient, string ipfsHash);
    event ProviderAuthorized(address indexed patient, address indexed provider);
    event ProviderRevoked(address indexed patient, address indexed provider);
    event KeyRequested(address indexed patient, address indexed requester);

    /**
     * @notice Registers a new patient if not already registered.
     */
    function registerPatient() public {
        require(
            !patients[msg.sender].exists,
            "The patient is already registered"
        );
        patients[msg.sender].exists = true;
        emit PatientRegistered(msg.sender);
    }

    // Modifier to check that the caller is a registered patient
    modifier onlyPatient() {
        require(patients[msg.sender].exists, "Not a patient");
        _;
    }

    /**
     * @notice Updates the patient's health data (the encrypted IPFS hash).
     * @param _ipfsHash The IPFS hash pointing to the encrypted health data.
     */
    function updateHealthData(string memory _ipfsHash) public onlyPatient {
        require(patients[msg.sender].exists, "Patient not registered");
        patients[msg.sender].encryptedIpfsHash = _ipfsHash;
        emit DataUpdated(msg.sender, _ipfsHash);
    }

    /**
     * @notice Authorizes a provider to access the patient's health data.
     * @param _provider The address of the provider to authorize.
     */
    function authorizeProvider(address _provider) public {
        require(patients[msg.sender].exists, "Patient not registered");
        require(
            !patients[msg.sender].authorized[_provider],
            "Provider already authorized"
        );
        patients[msg.sender].authorized[_provider] = true;
        emit ProviderAuthorized(msg.sender, _provider);
    }

    /**
     * @notice Revokes authorization for a previously authorized provider.
     * @param _provider The address of the provider to revoke.
     */
    function revokeProvider(address _provider) public {
        require(patients[msg.sender].exists, "Patient not registered");
        require(
            patients[msg.sender].authorized[_provider],
            "Provider not authorized"
        );
        patients[msg.sender].authorized[_provider] = false;
        emit ProviderRevoked(msg.sender, _provider);
    }

    /**
     * @notice Retrieves the encrypted health data (IPFS hash) if the requester is the patient or an authorized provider.
     * @param _patient The address of the patient whose data is being requested.
     * @return string The IPFS hash containing the encrypted health data.
     */
    function getHealthData(
        address _patient
    ) public view returns (string memory) {
        require(
            _patient == msg.sender || patients[_patient].authorized[msg.sender],
            "Unauthorized access"
        );
        return patients[_patient].encryptedIpfsHash;
    }

    /**
     * @notice Requests the decryption key for the health data.
     * Access is granted only to the patient or an authorized provider.
     * @param patient The address of the patient for whom the decryption key is requested.
     */
    function requestDecryptionKey(address patient) public {
        require(patients[patient].exists, "Patient not registered");
        require(
            patient == msg.sender || patients[patient].authorized[msg.sender],
            "Unauthorized access"
        );
        emit KeyRequested(patient, msg.sender);
    }

    /**
     * @notice Helper function to check if a patient is registered.
     * @param _patient The address of the patient.
     * @return bool True if the patient is registered.
     */
    function isPatientRegistered(address _patient) public view returns (bool) {
        return patients[_patient].exists;
    }

    /**
     * @notice Helper function to check if a provider is authorized for a given patient.
     * @param _patient The address of the patient.
     * @param _provider The address of the provider.
     * @return bool True if the provider is authorized.
     */
    function isProviderAuthorized(
        address _patient,
        address _provider
    ) public view returns (bool) {
        return patients[_patient].authorized[_provider];
    }
}
