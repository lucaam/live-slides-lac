# 🍕 Pizza Reveal.js Presentation - Interactive Edition

Presentazione interattiva Neapolitan Pizza con funzionalità in tempo reale per sondaggi ed emoji reactions, hostabile su GitHub Pages.

## ✨ Features

- **Presentazione Reveal.js** con slide responsive
- **Sondaggi interattivi in tempo reale** - tutti i partecipanti possono votare e vedere i risultati aggiornati istantaneamente
- **Emoji reactions condivise** - reagisci con emoji e vedi le reazioni di tutti in tempo reale
- **Firebase Realtime Database** - sincronizzazione automatica tra tutti i partecipanti
- **GitHub Pages ready** - deploy gratuito e facile

## 🚀 Setup

### 1. Configurare Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Clicca su "Add project" / "Aggiungi progetto"
3. Segui il wizard (puoi disabilitare Google Analytics se non serve)
4. Una volta creato il progetto, clicca su "Web" (icona `</>`)
5. Registra l'app con un nome (es. "pizza-presentation")
6. Copia la configurazione Firebase che appare

### 2. Abilitare Realtime Database

1. Nel menu laterale di Firebase, vai su **Build** → **Realtime Database**
2. Clicca su "Create Database"
3. Scegli una location (es. `europe-west1`)
4. Inizia in **test mode** (per sviluppo - le regole di sicurezza permettono lettura/scrittura a tutti)
5. Prendi nota dell'URL del database (es. `https://your-project-id-default-rtdb.firebaseio.com`)

### 3. Configurare il progetto

1. Apri `index.html`
2. Trova la sezione `firebaseConfig` (circa linea 115)
3. Sostituisci con le tue credenziali Firebase dalla console:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**NOTA:** È normale che queste credenziali siano pubbliche su GitHub Pages. La sicurezza viene dalle Firebase Rules (vedi sotto).

### 4. Testare localmente

Puoi testare la presentazione localmente con un server HTTP:

```bash
# Con Python 3
cd /path/to/pizza_revealjs_template
python3 -m http.server 8000

# Con Node.js (se hai npx)
npx serve

# Con PHP
php -S localhost:8000
```

Apri `http://localhost:8000` nel browser. Prova ad aprire due tab per vedere l'interazione in tempo reale!

### 5. Deploy su GitHub Pages

#### Opzione A: Via GitHub Web UI

1. Crea un nuovo repository su GitHub (pubblico)
2. Carica tutti i file del progetto
3. Vai su **Settings** → **Pages**
4. In "Source", seleziona **main branch** e **/ (root)**
5. Clicca Save
6. La tua presentazione sarà disponibile su `https://your-username.github.io/repository-name/`

#### Opzione B: Via Git da terminale

```bash
cd /home/lamoriello/Downloads/pizza_revealjs_template

# Inizializza repo
git init
git add .
git commit -m "Initial commit - Interactive pizza presentation"

# Aggiungi remote (sostituisci con il tuo repo)
git remote add origin https://github.com/YOUR-USERNAME/pizza-presentation.git

# Push
git branch -M main
git push -u origin main
```

Poi abilita GitHub Pages dalle Settings del repository (Settings → Pages → Source: main branch).

## 🎮 Come usare durante la presentazione

### Modalità Presenter (Tu)

1. Apri la presentazione con `?presenter` alla fine dell'URL:
   ```
   https://your-username.github.io/pizza-presentation/?presenter
   ```
   oppure in locale: `http://localhost:8000/?presenter`

2. Vedrai un **bordo rosso** e un banner che dice "PRESENTER MODE"
3. Quando cambi slide (frecce/spazio), **tutti** i partecipanti vedranno la stessa slide automaticamente!

### Modalità Audience (Partecipanti)

1. Condividi il link **normale** (senza ?presenter):
   ```
   https://your-username.github.io/pizza-presentation/
   ```

2. I partecipanti vedranno un **banner blu** "AUDIENCE MODE"
3. Le loro slide si sincronizzeranno automaticamente con le tue!
4. Possono comunque:
   - **Votare** nei sondaggi
   - **Reagire con emoji**
   - Tutti vedono i conteggi aggiornati in tempo reale! 🎉

### Funzionalità interattive

- **Sondaggi**: I partecipanti cliccano sui bottoni per votare
- **Emoji**: Cliccano sulle emoji per reagire
- **Sincronizzazione**: Le slide cambiano automaticamente seguendo il presenter

## 🔧 Personalizzazione

### Aggiungere nuovi sondaggi

In `index.html`, aggiungi una nuova sezione:

```html
<section>
  <h2>Tua domanda?</h2>
  <div class="poll" data-poll="nome-sondaggio">
    <button class="poll-option" data-option="opzione1">Opzione 1</button>
    <button class="poll-option" data-option="opzione2">Opzione 2</button>
    <div class="poll-results">
      <div class="result" id="result-opzione1">Opzione 1: <span class="count">0</span></div>
      <div class="result" id="result-opzione2">Opzione 2: <span class="count">0</span></div>
    </div>
  </div>
</section>
```

### Modificare emoji disponibili

In `index.html`, nella sezione emoji-reactions:

```html
<button class="emoji-btn" data-emoji="🚀">🚀 <span class="emoji-count">0</span></button>
```

### Cambiare colori

Modifica `css/custom.css` per personalizzare i colori del tema.

## 🔒 Sicurezza (IMPORTANTE!)

### Per sviluppo locale

Le credenziali Firebase sono in `js/firebase-config.js` che NON viene committato grazie al `.gitignore`.

### Per GitHub Pages (produzione)

Quando ospiti su GitHub Pages, il codice è pubblico, quindi le credenziali Firebase saranno visibili. Questo è OK se proteggi il database con regole Firebase appropriate:

1. Vai su Firebase Console → Realtime Database → Rules
2. Usa queste regole per permettere solo lettura/scrittura su specifici path:

```json
{
  "rules": {
    "polls": {
      ".read": true,
      ".write": true,
      "$pollId": {
        "$option": {
          ".validate": "newData.isNumber()"
        }
      }
    },
    "emojis": {
      ".read": true,
      ".write": true,
      "$slideId": {
        "$emoji": {
          ".validate": "newData.isNumber()"
        }
      }
    }
  }
}
```

3. **IMPORTANTE:** Configura le restrizioni per API key in Firebase Console:
   - Vai su **Project Settings** → **Cloud APIs**
   - Limita la tua API key solo ai domini autorizzati (es. `your-username.github.io`)
   - Questo previene che altri usino le tue credenziali

### Alternativa: Variabili d'ambiente con GitHub Actions

Per massima sicurezza, puoi usare GitHub Secrets e un build step che inietta le credenziali al momento del deploy. Questo è più complesso ma più sicuro.

## 📱 Compatibilità

- ✅ Chrome, Firefox, Safari, Edge (ultime versioni)
- ✅ Mobile responsive
- ✅ Funziona su desktop, tablet, smartphone

## 🐛 Troubleshooting

**I voti non si aggiornano?**
- Verifica la configurazione Firebase in `index.html`
- Controlla la console del browser per errori (F12)
- Verifica che Realtime Database sia abilitato su Firebase

**Errore CORS?**
- Assicurati di usare un server HTTP (non `file://`)
- Verifica che il dominio GitHub Pages sia autorizzato in Firebase

**Le emoji non animano?**
- Verifica che i CSS siano caricati correttamente
- Prova a refreshare la cache (Ctrl+Shift+R)

## 📄 License

MIT - Usa liberamente per le tue presentazioni!

---

**Buona presentazione! 🍕🔥**
