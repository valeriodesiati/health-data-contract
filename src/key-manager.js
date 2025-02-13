// key-manager.js
// Questo file implementa un semplice server Express che funge da Key Manager.
// Le chiavi di cifratura dei pazienti vengono salvate e possono essere recuperate tramite API,
// previa autenticazione tramite JWT.

const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Carica le variabili d'ambiente dal file .env per l'accesso ai segreti e configurazioni.
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// In memoria, un oggetto per memorizzare le chiavi associate agli indirizzi dei pazienti.
const keys = {};

// Abilita il parsing del JSON per le richieste HTTP.
app.use(express.json());

// Limita il numero di richieste per evitare abusi delle API (fino a 100 richieste ogni 15 minuti).
const rateLimit = require('express-rate-limit');
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));

/**
 * @notice Middleware per l'autenticazione tramite token JWT.
 * Verifica che il token sia presente nell'header Authorization e lo decodifica.
 * Questo middleware è necessario per proteggere tutte le rotte che richiedono accesso ai dati sensibili.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Ci aspettiamo un header nel formato: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token non fornito' });
  }
  // Verifica il token utilizzando il segreto definito nelle variabili d'ambiente.
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token non valido' });
    }
    // Il token decodificato (es. { address: '0x...', role: 'patient' }) viene salvato in req.user.
    req.user = user;
    next();
  });
}

/**
 * @notice API per salvare la chiave di cifratura per un paziente.
 * Solo il paziente (autenticato) può salvare la propria chiave.
 * L'API riceve l'indirizzo del paziente e la chiave di cifratura da associare a tale indirizzo.
 */
app.post('/store-key', authenticateToken, (req, res) => {
  const { patientAddress, key } = req.body;
  
  // Verifica che l'utente autenticato sia lo stesso del paziente per cui si salva la chiave.
  if (req.user.address.toLowerCase() !== patientAddress.toLowerCase()) {
    return res.status(403).json({ error: 'Non autorizzato a salvare la chiave per questo indirizzo' });
  }
  
  // Memorizza la chiave di cifratura per il paziente specificato.
  keys[patientAddress] = key;
  res.json({ message: `Chiave salvata per ${patientAddress}` });
});

/**
 * @notice API per ottenere la chiave di cifratura.
 * Solo il paziente autenticato (e in ambienti reali anche eventuali provider autorizzati) possono accedere alla chiave.
 * L'API restituisce la chiave cifrata associata all'indirizzo del paziente.
 */
app.get('/get-key/:patientAddress', authenticateToken, (req, res) => {
  const patientAddress = req.params.patientAddress;
  
  // Verifica che l'utente autenticato sia lo stesso del paziente per cui si richiede la chiave.
  if (req.user.address.toLowerCase() !== patientAddress.toLowerCase()) {
    return res.status(403).json({ error: 'Non autorizzato a richiedere la chiave per questo indirizzo' });
  }
  
  // Se la chiave esiste, la restituisce. Altrimenti restituisce un errore 404.
  if (keys[patientAddress]) {
    res.json({ key: keys[patientAddress] });
  } else {
    res.status(404).json({ error: 'Chiave non trovata' });
  }
});

// Avvia il server sulla porta specificata.
app.listen(port, () => {
  console.log(`Key Manager attivo su http://localhost:${port}`);
});
