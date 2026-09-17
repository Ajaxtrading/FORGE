# FORGE — suivi d'entraînement

App perso de suivi de musculation/boxe : programme éditable, log de séances (poids, reps, difficulté),
remplacement d'exercice à la volée, historique, volume hebdo par groupe musculaire, poids du corps.

Stack : React + Vite, Supabase (Postgres) pour le stockage, déploiement Vercel.
Même approche que ton app de track record trading (GitHub → Vercel, Supabase pour les données).

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project**.
2. Une fois créé, ouvre **SQL Editor** → **New query**.
3. Colle le contenu de `supabase/schema.sql`, exécute.
4. Nouvelle query → colle le contenu de `supabase/seed.sql`, exécute.
   (Ça insère ton programme actuel — 6 jours + jour de repos — et la bibliothèque d'exercices.)
5. Va dans **Project Settings → API** : note l'**URL** du projet et la clé **anon public**.

## 2. Configurer le projet en local

```bash
npm install
cp .env.example .env
```

Ouvre `.env` et colle ton URL et ta clé :

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_KEY=ta-clé-anon-public
```

Lance en local pour tester :

```bash
npm run dev
```

## 3. Pousser sur GitHub

```bash
git init
git add .
git commit -m "Initial commit — FORGE tracker"
git branch -M main
git remote add origin https://github.com/<ton-user>/forge-tracker.git
git push -u origin main
```

(Remplace `<ton-user>` par ton pseudo GitHub, et crée le repo vide sur GitHub avant si besoin.)

## 4. Déployer sur Vercel

1. Sur [vercel.com](https://vercel.com) → **Add New → Project** → importe le repo `forge-tracker`.
2. Vercel détecte Vite automatiquement (build command `vite build`, output `dist`).
3. Dans **Environment Variables**, ajoute les deux mêmes variables que dans `.env` :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
4. **Deploy**.

Tu obtiens une URL du type `forge-tracker.vercel.app` — c'est celle-là que tu ajoutes à l'écran
d'accueil de ton iPhone (Safari → Partager → Sur l'écran d'accueil), exactement comme pour l'artifact.

## Sécurité — à savoir

Les policies dans `schema.sql` autorisent lecture/écriture à quiconque a l'URL + la clé anon
(pareil que la plupart des projets Supabase perso). Ce n'est pas un souci tant que ces valeurs
restent privées (elles sont dans les variables d'environnement Vercel, jamais exposées dans le repo
public si le repo est privé). Si un jour tu veux une vraie authentification, on pourra ajouter
Supabase Auth et scoper les policies à `auth.uid()`.

## Structure du projet

```
src/
  App.jsx              — état global, routage, appels Supabase
  supabaseClient.js     — connexion Supabase
  lib/format.js         — constantes + helpers (dates, PR, volume hebdo...)
  components/
    Home.jsx             — accueil : jours, volume, poids
    DayView.jsx           — détail d'un jour avant de démarrer
    SessionView.jsx        — séance en cours (log, swap, timer)
    ExercisePicker.jsx      — sheet de recherche/ajout d'exercice
    History.jsx              — liste des séances passées
    HistoryDetail.jsx         — détail d'une séance
    EditProgram.jsx            — édition des titres de jours
    EditDay.jsx                  — édition des exercices d'un jour
    TabBar.jsx / Toast.jsx        — UI partagée
supabase/
  schema.sql             — tables + RLS
  seed.sql                — programme + bibliothèque d'exercices de départ
```

Tout le programme et les séances sont modifiables directement dans l'app (icône ✎ sur l'accueil).
Pour changer un exercice en cours de séance, utilise le bouton ⇄ sur la carte de l'exercice.
