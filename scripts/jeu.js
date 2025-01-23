import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set, get, query, orderByChild, equalTo, update } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Config Firebase
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
const auth = getAuth();

// Sélection des éléments HTML
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

// Variables globales pour l'utilisateur, le jeu et la base de données
let username = null;
let userId = null;
let randomNumber;
let compteur = 0;
let score = 0;
let scores = {}; // Tableau des scores pour chaque utilisateur

// Vérifie si l'utilisateur a un cookie de session
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Si le cookie existe, connecter l'utilisateur automatiquement
userId = getCookie('userId');
if (userId) {
  // Utilisateur déjà connecté via cookie
  console.log("Utilisateur connecté via cookie :", userId);
  loginDiv.style.display = 'none';
  gameDiv.style.display = 'block';
  startGame();
  // Afficher les scores depuis la base de données
  afficherScores();
} else {
  // Si pas de cookie, connexion via un pseudo
  loginButton.addEventListener('click', () => {
    username = usernameInput.value.trim() || "Invité"; // Si aucun pseudo, on garde "Invité"
    signInAnonymously(auth)
      .then(() => {
        userId = auth.currentUser.uid;
        document.cookie = `userId=${userId};path=/;max-age=31536000`; // Créer un cookie pour 1 an
        console.log("Utilisateur connecté anonymement avec ID :", userId);
        loginDiv.style.display = 'none';
        gameDiv.style.display = 'block';
        startGame();
        enregistrerUtilisateur(username);
        afficherScores(); // Afficher les scores après l'inscription
      })
      .catch((error) => console.error("Erreur d'authentification :", error));
  });
}

// Enregistrer un utilisateur dans Firebase (si il n'est pas déjà enregistré)
async function enregistrerUtilisateur(nom) {
  const userRef = ref(db, `scores/${userId}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    // Si l'utilisateur n'est pas encore enregistré dans la base de données
    await set(userRef, {
      username: nom,
      score: 0 // Début à 0 pour un nouvel utilisateur
    });
    console.log("Utilisateur enregistré avec succès !");
  }
}

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

// Vérification de la proposition
async function verifier() {
  const proposition = Number(input.value);
  if (isNaN(proposition) || proposition < 1 || proposition > 100) {
    tropHautTropBas.textContent = "Veuillez entrer un nombre valide entre 1 et 100.";
    return;
  }
  compteur++;

  if (proposition === randomNumber) {
    // Calcul du score basé sur le nombre de tentatives
    score = Math.max(100 - compteur * 10, 0); // Calcul du score
    resultat.textContent = `Bravo ${username || "Invité"} ! Vous avez trouvé en ${compteur} tentatives. 🎉`;
    tentatives.textContent = `Score gagné : ${score} points.`;
    if (username) {
      await sauvegarderScore(username, score); // Enregistrer le score après la victoire
      afficherScores(); // Mettre à jour le tableau des scores
    }
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

// Reset du jeu
reset.addEventListener('click', startGame);

// Appui sur Enter
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') verifier();
});

envoyer.addEventListener('click', verifier);

// Sauvegarder le score dans Firebase (en ajoutant les points au score existant)
async function sauvegarderScore(username, points) {
  const userRef = ref(db, `scores/${userId}`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    // Récupère le score actuel de l'utilisateur
    let currentScore = snapshot.val().score || 0;
    const newScore = currentScore + points; // Ajoute les nouveaux points

    // Met à jour le score dans la base de données
    await update(userRef, { score: newScore });
    console.log("Score mis à jour dans la base de données.");
  } else {
    console.log("Utilisateur non trouvé dans la base de données.");
  }
}

// Afficher les scores dans le tableau
async function afficherScores() {
  const scoresRef = ref(db, "scores");
  const snapshot = await get(scoresRef);
  const scoresData = snapshot.val();
  if (!scoresData) {
    console.log("Aucun score trouvé.");
    return;
  }

  const scoresArray = [];
  for (const key in scoresData) {
    scoresArray.push(scoresData[key]);
  }

  // Trier les scores par ordre décroissant
  scoresArray.sort((a, b) => b.score - a.score);

  // Vider le tableau avant de le remplir
  scoreTable.innerHTML = '';

  // Ajouter les scores triés au tableau HTML
  scoresArray.forEach((data, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${data.username}</td>
      <td>${data.score}</td>
    `;
    scoreTable.appendChild(row);
  });
}
