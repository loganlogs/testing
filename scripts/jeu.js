import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, query, orderByChild, equalTo, get } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
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

// Gestion locale pour l'utilisateur
let userId = localStorage.getItem("userId");
let username = localStorage.getItem("username");

if (!userId) {
  // Connexion anonyme si l'utilisateur n'est pas enregistré
  signInAnonymously(auth)
    .then(() => {
      console.log("Utilisateur connecté anonymement !");
      userId = auth.currentUser.uid;
      localStorage.setItem("userId", userId);
    })
    .catch((error) => console.error("Erreur d'authentification :", error));
}

// Vérifier si le pseudo existe déjà
async function pseudoExistant(nom) {
  const snapshot = await get(query(ref(db, "scores"), orderByChild("username"), equalTo(nom)));
  return snapshot.exists();
}

// Enregistrer un nouvel utilisateur
async function enregistrerUtilisateur(nom, scoreInitial) {
  if (await pseudoExistant(nom)) {
    console.error("Pseudo déjà pris !");
    alert("Ce pseudo est déjà utilisé, choisissez-en un autre.");
    return false;
  }

  // Sauvegarde dans la BDD
  const userRef = ref(db, `scores/${userId}`);
  await set(userRef, { username: nom, score: scoreInitial });
  localStorage.setItem("username", nom);
  console.log("Utilisateur enregistré avec succès !");
  return true;
}

// Fonction pour enregistrer un score
function enregistrerScore(nouveauScore) {
  const userRef = ref(db, `scores/${userId}`);
  set(userRef, { username, score: nouveauScore })
    .then(() => console.log("Score mis à jour avec succès !"))
    .catch((error) => console.error("Erreur lors de l'enregistrement du score :", error));
}

// Afficher les scores dans le tableau HTML
// Fonction pour afficher les scores
function afficherScores() {
  const scoresRef = ref(db, "scores");
  onValue(scoresRef, (snapshot) => {
    const scoresData = snapshot.val();
    if (!scoresData) {
      console.log("Aucun score trouvé.");
      return;
    }
    
    const scoresArray = [];
    // Transformer les données en tableau
    for (const key in scoresData) {
      scoresArray.push(scoresData[key]);
    }

    // Trier par score décroissant
    scoresArray.sort((a, b) => b.score - a.score);

    // Récupérer le tbody pour ajouter les scores
    const scoreTable = document.getElementById("scoreTable").querySelector("tbody");
    scoreTable.innerHTML = ''; // Vider le tableau avant de le remplir

    // Afficher chaque score dans une nouvelle ligne du tableau
    scoresArray.forEach((data, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${data.username}</td>
        <td>${data.score}</td>
      `;
      scoreTable.appendChild(row);
    });
  });
}

// Gestion du jeu
(() => {
  const loginDiv = document.getElementById("login");
  const gameDiv = document.getElementById("game");
  const usernameInput = document.getElementById("username");
  const loginButton = document.getElementById("loginButton");

  // Gestion de la connexion
  loginButton.addEventListener("click", async () => {
    const nom = usernameInput.value.trim();
    if (!nom) {
      alert("Veuillez entrer un pseudo !");
      return;
    }

    const success = await enregistrerUtilisateur(nom, 0);
    if (success) {
      username = nom;
      loginDiv.style.display = "none";
      gameDiv.style.display = "block";
      startGame();
    }
  });

  // Début d'une nouvelle partie
  function startGame() {
    console.log("Nouvelle partie pour :", username);
    afficherScores(); // Appelle la fonction pour afficher les scores au démarrage du jeu
  }
})();
