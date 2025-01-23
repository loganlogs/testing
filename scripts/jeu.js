import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

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

// Variables utilisateur
let userId = localStorage.getItem("userId");
let username = localStorage.getItem("username");
let score = 0;  // Le score global

// Fonction pour récupérer l'utilisateur anonyme ou authentifié
function initAuth() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Utilisateur authentifié, récupérer son ID
      userId = user.uid;
      localStorage.setItem("userId", userId);
      console.log("Utilisateur connecté :", userId);
      chargerScore();  // Charger le score depuis la base de données
    } else {
      // Utilisateur anonyme
      signInAnonymously(auth)
        .then(() => {
          console.log("Utilisateur connecté anonymement !");
          userId = auth.currentUser.uid;
          localStorage.setItem("userId", userId);
          chargerScore();  // Charger le score depuis la base de données
        })
        .catch((error) => {
          console.error("Erreur d'authentification :", error);
        });
    }
  });
}

// Charger le score de l'utilisateur dans la base de données
async function chargerScore() {
  const scoreRef = ref(db, `scores/${userId}`);
  const snapshot = await get(scoreRef);
  if (snapshot.exists()) {
    score = snapshot.val().score;  // Charger le score existant
    console.log("Score chargé depuis la base de données :", score);
  } else {
    console.log("Aucun score trouvé, création d'un nouveau score.");
  }
}

// Sauvegarder le score de l'utilisateur dans la base de données
function sauvegarderScore(username, points) {
  const userRef = ref(db, `scores/${userId}`);
  set(userRef, { username, score: points })
    .then(() => console.log("Score mis à jour avec succès !"))
    .catch((error) => console.error("Erreur lors de l'enregistrement du score :", error));
}

// Afficher les scores dans le tableau HTML
function afficherScores() {
  const scoresRef = ref(db, "scores");
  onValue(scoresRef, (snapshot) => {
    const scoresData = snapshot.val();
    if (!scoresData) {
      console.log("Aucun score trouvé.");
      return;
    }
    
    const scoresArray = [];
    for (const key in scoresData) {
      scoresArray.push(scoresData[key]);
    }

    scoresArray.sort((a, b) => b.score - a.score); // Trier par score décroissant

    const scoreTable = document.getElementById("scoreTable").querySelector("tbody");
    scoreTable.innerHTML = ''; // Vider le tableau avant de le remplir

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

// Fonction pour démarrer le jeu
(() => {
  let randomNumber;
  let compteur = 0;

  const loginDiv = document.getElementById("login");
  const gameDiv = document.getElementById("game");
  const usernameInput = document.getElementById("username");
  const loginButton = document.getElementById("loginButton");

  const input = document.getElementById("proposition");
  const envoyer = document.getElementById("envoyer");
  const reset = document.getElementById("reset");
  const resultat = document.querySelector(".resultat");
  const tropHautTropBas = document.querySelector(".tropHautTropBas");
  const tentatives = document.querySelector(".tentatives");

  // Connexion ou mode invité
  loginButton.addEventListener("click", () => {
    username = usernameInput.value.trim() || "Invité"; // Si pas de nom, utilisateur reste "Invité"
    loginDiv.style.display = "none";
    gameDiv.style.display = "block";
    startGame();
  });

  // Démarrer un nouveau jeu
  function startGame() {
    randomNumber = Math.floor(Math.random() * 100) + 1;
    compteur = 0;

    input.value = "";
    resultat.textContent = "";
    tropHautTropBas.textContent = "";
    tentatives.textContent = "";
    input.disabled = false;
    envoyer.disabled = false;

    input.focus();
  }

  // Vérification de la proposition
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

      // Si l'utilisateur n'est pas "Invité", on cumule les scores et on les sauvegarde
      if (username !== "Invité") {
        score += (score || 0);  // Cumuler le score existant
        sauvegarderScore(username, score);  // Sauvegarde dans la base de données
        afficherScores();  // Affichage des scores dans le tableau
      }

      finDeJeu();
    } else if (proposition < randomNumber) {
      tropHautTropBas.textContent = "C'est plus grand !";
    } else {
      tropHautTropBas.textContent = "C'est plus petit !";
    }

    tentatives.textContent = `Tentatives : ${compteur}`;
    input.value = "";
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
  reset.addEventListener("click", startGame);

  // Appui sur Enter
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") verifier();
  });

  envoyer.addEventListener("click", verifier);

  // Initialiser l'authentification
  initAuth();
})();
