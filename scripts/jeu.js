import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAEuk1wol1lNcSrzEGqRu31kCuoGpD9PTQ",
  authDomain: "jeu-hasard.firebaseapp.com",
  databaseURL: "https://jeu-hasard-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "jeu-hasard",
  storageBucket: "jeu-hasard.appspot.com",
  messagingSenderId: "654185101593",
  appId: "1:654185101593:web:5b95112878620ace536d88"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Authentification Firebase
const auth = getAuth();
let userId = null;
signInAnonymously(auth)
  .then(() => {
    console.log("Utilisateur connecté anonymement !");
    userId = auth.currentUser.uid; // On récupère l'ID utilisateur
  })
  .catch((error) => {
    console.error("Erreur d'authentification :", error);
  });

// Références Firebase
const scoresRef = ref(db, "scores");

// Élément HTML
const loginDiv = document.getElementById('login');
const gameDiv = document.getElementById('game');
const usernameInput = document.getElementById('username');
const loginButton = document.getElementById('loginButton');
const input = document.getElementById('proposition');
const envoyer = document.getElementById('envoyer');
const reset = document.getElementById('reset');
const resultat = document.querySelector('.resultat');
const tropHautTropBas = document.querySelector('.tropHautTropBas');
const tentatives = document.querySelector('.tentatives');
const scoreTable = document.getElementById('scoreTable').querySelector('tbody');

let randomNumber, compteur, username, score;

// Connexion utilisateur
loginButton.addEventListener('click', () => {
  username = usernameInput.value.trim() || "Invité"; // Par défaut, Invité
  loginDiv.style.display = 'none';
  gameDiv.style.display = 'block';
  startGame();
});

// Démarrer un nouveau jeu
function startGame() {
  randomNumber = Math.floor(Math.random() * 100) + 1;
  compteur = 0;
  score = 0;

  input.value = '';
  resultat.textContent = '';
  tropHautTropBas.textContent = '';
  tentatives.textContent = '';
  input.disabled = false;
  envoyer.disabled = false;

  input.focus();
}

// Vérifier la proposition
function verifier() {
  const proposition = Number(input.value);
  if (isNaN(proposition) || proposition < 1 || proposition > 100) {
    tropHautTropBas.textContent = "Veuillez entrer un nombre valide entre 1 et 100.";
    return;
  }
  compteur++;

  if (proposition === randomNumber) {
    score = Math.max(100 - compteur * 10, 0); // Calcul du score
    resultat.textContent = `Bravo ${username} ! Vous avez trouvé en ${compteur} tentatives. 🎉`;
    tentatives.textContent = `Score gagné : ${score} points.`;
    enregistrerScore(userId, username, score); // Enregistrer le score dans Firebase
    afficherScores(); // Afficher le classement
    finDeJeu();
  } else if (proposition < randomNumber) {
    tropHautTropBas.textContent = "C'est plus grand !";
  } else {
    tropHautTropBas.textContent = "C'est plus petit !";
  }

  tentatives.textContent = `Tentatives : ${compteur}`;
  input.value = '';
  input.focus();

  if (compteur === 10 && proposition !== randomNumber) {
    resultat.textContent = `Perdu ! Le nombre était ${randomNumber}. 😢`;
    finDeJeu();
  }
}

// Désactiver le jeu
function finDeJeu() {
  envoyer.disabled = true;
  input.disabled = true;
}

// Réinitialiser le jeu
reset.addEventListener('click', startGame);
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') verifier();
});
envoyer.addEventListener('click', verifier);

// Enregistrer un score dans Firebase
function enregistrerScore(userId, username, score) {
  const nouveauScoreRef = push(scoresRef);
  set(nouveauScoreRef, {
    userId: userId,
    username: username,
    score: score
  })
    .then(() => {
      console.log("Score enregistré avec succès !");
    })
    .catch((error) => {
      console.error("Erreur lors de l'enregistrement du score :", error);
    });
}

// Afficher les scores
function afficherScores() {
  onValue(scoresRef, (snapshot) => {
    const scoresData = snapshot.val();
    const scoresArray = [];

    // Convertir les données Firebase en tableau
    for (let key in scoresData) {
      scoresArray.push(scoresData[key]);
    }

    // Trier par score décroissant
    scoresArray.sort((a, b) => b.score - a.score);

    // Afficher dans le tableau HTML
    scoreTable.innerHTML = '';
    scoresArray.forEach((score, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${score.username}</td>
        <td>${score.score}</td>
      `;
      scoreTable.appendChild(row);
    });
  });
}

// Afficher le classement dès le chargement
afficherScores();
