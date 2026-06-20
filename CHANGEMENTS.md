# Ma Discipline — Corrections appliquées (session du 20/06)

Ce zip contient l'intégralité de `src/`, `index.html` (racine Vite) et
`package.json`, prêts à remplacer ton dossier `ma-discipline/` actuel.

## 1. Nettoyage des incohérences

- **Supprimés** : `src/lib/workout.js` (collection Firestore `seances` à
  plat, jamais utilisée par aucune page — code mort) et `src/lib/suivi.js`
  (doc Firestore fantôme `app/suivi`, en doublon avec `app/agenda` réellement
  utilisé par SuiviTab). Garder ces fichiers risquait de créer des données
  désynchronisées si un jour ils étaient importés par erreur.
- **Unifié** le formulaire d'édition d'exercice : `SeanceTab.jsx` avait son
  propre modal (tout visible) différent de celui de `TrainingSettings.jsx`
  (Nom+Séries+Reps visibles, Poids/Repos sous ⚙️). Les deux utilisent
  maintenant le même composant `src/components/ExerciseRow.jsx`.
- Corrigé un bug où créer un exercice depuis l'onglet Séances (et non
  Réglages) ne définissait pas de valeurs par défaut pour poids/repos.

## 2. Thème "Aube" réappliqué

- `src/index.css` définit maintenant la vraie palette Aube via Tailwind v4
  (`@theme`) : `night` `#15121C`, `surface` `#1E1A28`, `surface-2` `#2A2438`,
  `ember` `#FF7A45`, `gold` `#FFC24B`, `text`, `muted`, `ok`, `info`,
  `danger`. Le dégradé signature est dispo via les classes `.bg-dawn` /
  `.text-dawn` / `.shadow-glow`.
- Toutes les classes `slate-*` / `sky-*` / `red-400` / `green-500` /
  `yellow-400` / `blue-400` / `orange-400` ont été remplacées dans
  l'ensemble du code (~30 fichiers) par les nouvelles classes Aube.
- `src/lib/theme.js` reflète maintenant la vraie palette (il définissait
  encore du bleu, inutilisé mais trompeur).

## 3. Images d'exercices

- 21 images copiées dans `public/images/exercices/` (servies directement
  par Vite, pas besoin de les importer).
- `src/lib/exercises.jsx` réécrit avec le mapping `exerciseImageFile()` /
  `exerciseImageSrc()`, adapté aux fichiers `.jpg` réellement fournis
  (l'ancien mapping `index.html` référençait des `.png` et quelques
  variantes — burpee-planche, burpee-saut, maker-swing, maker-clean — qui
  n'existent pas dans le lot fourni ; elles retombent sur l'image la plus
  proche : burpee-pompe / maker-press).
- Nouveau composant `src/components/ExerciseImg.jsx`, intégré dans
  `Runner.jsx` (l'image de l'exercice en cours s'affiche pendant la
  séance, comme dans l'ancienne version HTML).

## 4. Fiabilité / UX

- **Wake Lock** (`src/hooks/useWakeLock.js`) : l'écran ne s'éteint plus
  pendant une séance (`Runner`) ou un WOD (`WodRunner`).
- **Mode hors-ligne** : persistence Firestore activée
  (`persistentLocalCache` + `persistentMultipleTabManager` dans
  `src/lib/firebase.js`), avec une bannière "Hors ligne" affichée dans
  `App.jsx` via le nouveau hook `src/hooks/useOnlineStatus.js`. Les
  modifications faites sans réseau seront synchronisées au retour.
- `index.html` (racine du projet, absent du zip que tu m'avais envoyé) a
  été recréé avec les meta tags PWA/iPhone (safe-area, apple-mobile-web-
  app-capable, theme-color).
- Support `env(safe-area-inset-top/bottom)` ajouté dans `index.css` et sur
  le header sticky de `App.jsx` pour la Dynamic Island / l'encoche iPhone.

## Pas encore traité (volontairement laissé de côté cette session)

- Profil utilisateur complet (photo, date de naissance/âge) —
  `ProfileSettings` séparé n'existe toujours pas.
- Bibliothèque de WODs sauvegardés/nommés (le WOD Runner reste un
  minuteur générique, pas de persistance d'une liste de WODs).
- Page Aide/FAQ.
- Export des données.
- Réglage de transparence de la barre de navigation (`navAlpha`).

## Pour déployer

1. Dézippe ce contenu par-dessus ton dossier `ma-discipline/` (remplace
   `src/`, `index.html`, `package.json`).
2. `npm install` (au cas où, mais aucune nouvelle dépendance n'a été
   ajoutée — Firestore offline persistence fait partie du SDK `firebase`
   déjà installé).
3. `npm run build` pour vérifier que tout compile sans erreur avant de
   pousser sur GitHub.
4. Commit + push comme d'habitude pour déclencher le déploiement GitHub
   Actions.
