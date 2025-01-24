/* Reset et style global */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Share Tech Mono', monospace;
  background: radial-gradient(circle, #1a1a1a, #0a0a0a); /* Fond sombre doux */
  color: #8aff80; /* Vert clair, pour un contraste plus doux */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow: hidden;
  padding: 20px;
  text-align: center;
  overflow-y: auto; /* Permet le défilement vertical si nécessaire */
}

h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #8aff80; /* Couleur vert clair */
  text-shadow: 0 0 10px #00ff00, 0 0 20px #8aff80; /* Lumière verte douce */
  animation: glow 2s infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 0 0 10px #00ff00, 0 0 20px #8aff80;
  }
  to {
    text-shadow: 0 0 20px #8aff80, 0 0 40px #00ff00;
  }
}

/* Style des paragraphes */
p, .resultat, .tropHautTropBas {
  font-size: 1.2rem;
  color: #8aff80; /* Texte en vert clair */
  text-align: center;
  margin: 10px 0;
  text-shadow: 0 0 5px #00ff00, 0 0 10px #8aff80;
}

/* Connexion et formulaire du jeu */
#login, #game {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%; /* Prendre toute la largeur disponible */
  max-width: 500px; /* Limite de largeur */
  text-align: center; /* Centre le texte dans ces sections */
}

input[type="text"], input[type="number"], button {
  display: block;
  margin: 10px auto; /* Centrer avec une marge automatique */
  padding: 10px;
  font-size: 1rem;
  border-radius: 10px;
  border: 2px solid #8aff80; /* Bordure vert clair */
  background: #2a2a2a; /* Fond sombre mais doux */
  color: #8aff80; /* Texte en vert clair */
  box-shadow: 0 0 5px #00ff00;
  outline: none;
  transition: 0.3s ease;
  width: 100%; /* Pour que les éléments prennent toute la largeur disponible */
  max-width: 300px; /* Limite de largeur */
}

input[type="submit"]:focus, input[type="number"]:focus {
  box-shadow: 0 0 10px #00ff00;
}

button:hover, input[type="submit"]:hover {
  background-color: #1a1a1a; /* Fond plus foncé au survol */
  color: #8aff80;
  border: 2px solid #00ff00;
  box-shadow: 0 0 10px #00ff00;
}

/* Style de la table des scores */
#scoreTableContainer {
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  border: 2px solid #4CAF50; /* Bordure verte */
  border-radius: 10px;
  margin-top: 20px;
}

/* Style de la scrollbar */
#scoreTableContainer::-webkit-scrollbar {
  width: 12px;
}

#scoreTableContainer::-webkit-scrollbar-thumb {
  background-color: #4CAF50;
  border-radius: 10px;
}

#scoreTableContainer::-webkit-scrollbar-track {
  background-color: #222222; /* Fond plus sombre pour la track */
  border-radius: 10px;
}

/* Tableaux des scores */
#scoreTable {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: #2a2a2a; /* Fond sombre pour la table */
}

#scoreTable th, #scoreTable td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #333333; /* Légère séparation entre les lignes */
}

#scoreTable th {
  background-color: #4CAF50;
  color: white;
}

#scoreTable tr:nth-child(even) {
  background-color: #3a3a3a; /* Fond légèrement plus clair pour les lignes paires */
}

#scoreTable tr:hover {
  background-color: #5a5a5a; /* Survol de ligne avec un fond un peu plus clair */
}

/* Section des profils */
#userProfileSection {
  margin-top: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

#userProfileSection h3 {
  font-size: 18px;
  margin-bottom: 10px;
}

#userProfileSection ul {
  list-style-type: none;
  padding: 0;
  text-align: center;
}

#userProfileSection ul li {
  margin: 8px 0;
}

#userProfileSection ul li a {
  text-decoration: none;
  color: #0066cc;
  font-weight: bold;
}

#userProfileSection ul li a:hover {
  color: #004d99;
  text-decoration: underline;
}

/* Animation pour l'affichage des résultats */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.informations p {
  margin: 5px 0;
  font-size: 1rem;
  animation: fadeIn 1s ease-in-out;
}
