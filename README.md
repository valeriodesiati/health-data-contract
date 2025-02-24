# Health Data Registry

Un prototipo per la gestione sicura e decentralizzata dei dati sanitari, che integra un smart contract su blockchain, la cifratura dei dati e l'archiviazione su IPFS tramite Pinata. Il sistema include inoltre un Key Manager per gestire in modo sicuro le chiavi di decrittazione, evitando di memorizzarle direttamente nello smart contract.

---

## Panoramica del progetto

Questo progetto è stato sviluppato per dimostrare come:
- **I dati sanitari vengano cifrati** utilizzando l'algoritmo AES-256-CBC.
- **Gli hash dei dati cifrati** vengano memorizzati in un Personal Data Store decentralizzato (IPFS) tramite il servizio Pinata.
- **Uno smart contract (HealthDataRegistry.sol)** gestisca la registrazione dei pazienti e il controllo degli accessi (autorizzazione/revoca dei provider).
- **Un Key Manager** (server Express con JWT) gestisca in maniera sicura la memorizzazione e il recupero delle chiavi di cifratura.
- **Script di deploy e interazione** (deploy.js, interact.js) semplifichino la distribuzione e il testing del sistema tramite Hardhat.

---

## Architettura e componenti

Il progetto è suddiviso in diversi moduli:

- **Smart Contract (HealthDataRegistry.sol)**
  - Gestisce la registrazione dei pazienti e l'aggiornamento dei dati sanitari (rappresentati come hash IPFS).
  - Implementa un meccanismo di autorizzazione per garantire che solo il paziente o provider autorizzati possano accedere ai dati.
  - Emissione di eventi per tracciare le operazioni (registrazione, aggiornamento, autorizzazione, revoca e richiesta di chiave).

- **Cifratura e gestione dei dati (encryption.cjs)**
  - Implementa le funzioni per generare una chiave a 256 bit e per cifrare/decifrare i dati usando AES-256-CBC.
  - Garantisce che i dati siano protetti prima del caricamento su IPFS.

- **Caricamento su IPFS tramite Pinata (ipfs_upload.mjs)**
  - Cifra i dati e li carica su IPFS utilizzando il servizio Pinata.
  - Dopo il caricamento, il modulo interagisce con il Key Manager per salvare la chiave di cifratura.

- **Key Manager (key-manager.js)**
  - Server Express che gestisce le chiavi di cifratura dei pazienti.
  - Protegge le API con autenticazione JWT e limita l'accesso alle sole richieste autorizzate.
  - Permette di memorizzare e recuperare la chiave, evitando di esporla sullo smart contract.

- **Script di deploy e interazione**
  - **deploy.js**: Utilizza ethers.js e Hardhat per distribuire il contratto sulla rete (Hardhat o altra rete configurata).
  - **interact.js**: Simula l'interazione con lo smart contract, testando casi come registrazione, aggiornamento dati, autorizzazione e revoca dei provider, e richiesta della chiave di decrittazione.
  - **Configurazione Hardhat**: Include impostazioni per reti (Hardhat, Amoy) e strumenti come il gas reporter per misurare il consumo di gas.

---

## Requisiti del Sistema

- **Node.js** (versione LTS consigliata)
- **npm** o **yarn**
- **Hardhat** per il deploy e il testing dello smart contract
- Un account su **Pinata** per il caricamento dei file su IPFS
- Variabili d'ambiente (file `.env`) per configurare:
  - PINATA_API_KEY e PINATA_API_SECRET
  - ACCESS_TOKEN_SECRET (per JWT)

---

## Installazione e Configurazione

1. **Clonare il repository:**

   ```bash
   git clone https://github.com/tuo-username/health-data-registry.git
   cd health-data-registry
   ```

2. **Installare le dipendenze:**

   ```bash
   npm install
   ```

3. **Configurare le variabili d'ambiente:**

   Crea un file `.env` nella root del progetto con i seguenti contenuti (modifica i valori con le tue credenziali):

   ```env
    # Stringa segreta generata per ogni utente, serve a firmare e verificare il token JWT - genera con "openssl rand -hex 32"
    ACCESS_TOKEN_SECRET=

    # Accesso a Pinata
    PINATA_API_KEY=
    PINATA_API_SECRET=

   ```

   **Nota:** Assicurati di aggiungere il file `.env` al tuo `.gitignore` per evitare la pubblicazione di informazioni sensibili.

4. **Compilare lo Smart Contract:**

   ```bash
   npx hardhat compile
   ```

5. **Deploy del contratto:**

   Utilizza lo script di deploy per distribuire il contratto sulla rete desiderata (es. rete locale Hardhat):

   ```bash
   npx hardhat run scripts/deploy.js --network hardhat
   ```

---

## Utilizzo

### Interazione con lo Smart Contract

Per simulare l'interazione con il contratto (registrazione paziente, aggiornamento dati, autorizzazione provider, richiesta della chiave):

```bash
npx hardhat run scripts/interact.js --network localhost
```

Lo script **interact.js** mostra:
- La registrazione del paziente e il controllo degli accessi.
- L'aggiornamento dei dati sanitari e il caricamento dell'hash su IPFS.
- L'autorizzazione e la revoca dei provider.
- La richiesta della chiave di decifratura.

### Caricamento dei dati su IPFS con Pinata

Il modulo **ipfs_upload.mjs**:
- Cifra i dati sanitari utilizzando il modulo **encryption.cjs**.
- Carica i dati cifrati su IPFS tramite Pinata.
- Invia la chiave di cifratura al Key Manager, garantendo che la chiave non sia memorizzata nello smart contract.

### Gestione delle chiavi con il Key Manager

Il server **key-manager.js**:
- Avvia un'API REST per memorizzare e recuperare la chiave di cifratura associata a ciascun paziente.
- Utilizza JWT per autenticare le richieste, assicurando che solo il paziente autorizzato possa accedere alla propria chiave.

---

## Valutazione

- **Sicurezza e privacy:** Il sistema garantisce che i dati sanitari siano cifrati prima del caricamento su IPFS e che le chiavi siano gestite separatamente, riducendo il rischio di accessi non autorizzati.
- **Gas consumption:** Grazie all'integrazione del gas reporter in Hardhat, è possibile misurare il consumo di gas per ciascuna operazione dello smart contract e ottimizzare il sistema.

---

## Autori

Valerio Desiati - <valerio.desiati@studio.unibo.it> <br>
Lucrezia Ilvento - <lucrezia.ilvento@studio.unibo.it>

---

## Licenza

Questo progetto è distribuito sotto la licenza Creative Commons Attribution Share Alike 4.0 International. Vedi il file [LICENSE](LICENSE) per ulteriori dettagli.
