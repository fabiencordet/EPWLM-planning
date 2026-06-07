# Deploiement staging (Vercel + Neon)

Objectif: publier une URL stable pour des tests externes.

## 1) Prerequis

- Un compte Vercel.
- Un compte Neon.
- Le repo pousse sur GitHub.

## 2) Creer la base PostgreSQL Neon

1. Dans Neon, creer un nouveau projet (region proche de toi, ex: EU).
2. Recuperer la chaine de connexion `postgresql://...`.
3. Conserver cette valeur pour `DATABASE_URL` dans Vercel.

## 3) Importer le projet dans Vercel

1. Dans Vercel, cliquer sur `Add New...` puis `Project`.
2. Selectionner le repo `patin`.
3. Framework detecte: Next.js.

## 4) Variables d environnement a configurer dans Vercel

Configurer ces variables dans `Project Settings > Environment Variables`:

- `DATABASE_URL` = URL PostgreSQL Neon
- `NEXTAUTH_SECRET` = secret long aleatoire
- `NEXTAUTH_URL` = URL staging Vercel (ex: `https://patin-staging.vercel.app`)
- `COACH_EMAIL`
- `COACH_PASSWORD`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `BREVO_API_KEY`
- `MAIL_FROM_EMAIL`
- `MAIL_FROM_NAME`

Conseil: utilise les memes valeurs pour `Preview` et `Production` si tu veux un comportement identique.

## 5) Initialiser la base distante (migrations + seed)

Option simple avec Vercel CLI depuis ton poste:

```bash
cd /home/fab-ubuntu/Github\ repository/patin
npm i -g vercel
vercel login
vercel link
vercel env pull .env.vercel
```

Puis:

```bash
export $(grep -v '^#' .env.vercel | xargs)
npm run prisma:generate
npx prisma migrate deploy
npm run db:seed
```

## 6) Deployer

1. Push sur la branche choisie.
2. Vercel build/deploie automatiquement.
3. Recuperer l URL publique Vercel.

## 7) Verification fonctionnelle

1. Ouvrir `/login`.
2. Se connecter avec coach/admin.
3. Ouvrir `/admin`.
4. Modifier un creneau.
5. Verifier creation/envoi des notifications email.

## 8) Partage testeurs

Envoyer:

- URL staging: `https://...vercel.app`
- URL login: `https://...vercel.app/login`
- Comptes de test
- Perimetre de test (3-5 scenarios)

## 9) Depannage rapide

- Erreur auth: verifier `NEXTAUTH_URL` et `NEXTAUTH_SECRET`.
- Erreur Prisma: verifier `DATABASE_URL` et lancer `npx prisma migrate deploy`.
- Emails non envoyes: verifier `BREVO_API_KEY` et `MAIL_FROM_EMAIL`.
