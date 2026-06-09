# Architecture et fonctionnement de l'application EPWLM Planning

Ce document explique la structure du projet, le rôle des différents fichiers, le modèle de données, les environnements de base de données, et la manière dont tout s'imbrique du front jusqu'à PostgreSQL.

## 1) Objectif de l'application

L'application permet de gérer le planning d'un club de patinage:

- consultation publique de l'agenda,
- gestion des créneaux (coach/admin),
- gestion des adhérents par section,
- notifications aux familles lors de changements de créneaux.

## 2) Stack technique

- Next.js (App Router) + TypeScript
- React 19
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- NextAuth (Credentials + JWT)
- Zod (validation des payloads API)

## 3) Organisation des dossiers

### Racine

- `README.md`: guide de démarrage rapide
- `DEPLOYMENT_VERCEL_NEON.md`: procédure de déploiement staging/production
- `docker-compose.yml`: PostgreSQL local
- `prisma/schema.prisma`: modèle de données Prisma
- `prisma/migrations/*`: historique SQL des migrations
- `prisma/seed.ts`: données de démarrage
- `scripts/import_stage_ete_2026.ts`: import métier de créneaux stage

### Application

- `src/app/*`: pages App Router (public, login, admin, embed)
- `src/app/api/*`: endpoints backend (trainings, weeks, sections, users, section-members, auth)
- `src/components/*`: composants UI client (calendrier, back-office, formulaires)
- `src/lib/*`: logique partagée (auth, Prisma client, utilitaires date, notifications, email, tri sections)
- `src/types/next-auth.d.ts`: extension des types NextAuth (id + role en session)

## 4) Les environnements de base de données

Le projet utilise toujours PostgreSQL, avec plusieurs environnements:

1. Local (développement): PostgreSQL Docker (`patin-postgres`) via `db:up`
2. Staging/Production: PostgreSQL hébergé sur Neon (URL via `DATABASE_URL`)

Le schéma métier est le même dans tous les environnements. Seule l'URL de connexion change.

## 5) Modèle de données métier (Prisma)

### Entités principales

- `User`: utilisateurs applicatifs (coach/admin), avec mot de passe hashé et rôle
- `Section`: sections sportives du club
- `WeekProfile`: semaine ISO + type (`STANDARD` ou `STAGE`)
- `Training`: créneau (date, heures, lieu, coach, section, statut)
- `Skater`: adhérent
- `SkaterSection`: appartenance d'un adhérent à une section, historisée avec `startsAt`/`endsAt`
- `Notification`: trace des notifications à envoyer/envoyées/échouées

### Entités complémentaires

- `TrainingTemplate`: prévu pour des gabarits de créneaux
- `TrainingAttendance`: prévu pour la présence
- `AuditLog`: prévu pour la traçabilité des actions

### Relations clés

- Un `Training` appartient à une `Section`, un `WeekProfile` et un `User` (coach)
- Un `Skater` peut avoir plusieurs inscriptions via `SkaterSection`
- Une `Section` possède plusieurs adhérents via `SkaterSection`
- Un `Training` peut générer plusieurs `Notification`

## 6) Authentification et autorisation

L'auth est gérée par NextAuth en mode Credentials:

- email + mot de passe envoyés au provider credentials,
- vérification du hash (`bcryptjs`) dans la table `User`,
- session JWT enrichie avec `id` et `role` (`coach`/`admin`).

Conséquences:

- les pages/API protégées vérifient la session serveur,
- les routes d'écriture (`POST`, `PATCH`, `DELETE`) exigent un utilisateur connecté.

## 7) API backend et responsabilités

### `GET /api/trainings`

- lit les créneaux selon intervalle de dates,
- filtre optionnel par section(s) et coach(s),
- exclut les créneaux annulés,
- renvoie des libellés prêts pour l'UI.

### `POST /api/trainings`

- nécessite auth,
- valide le payload (Zod),
- crée/upsert le `WeekProfile` cible,
- crée le `Training`.

### `PATCH /api/trainings/:id`

- nécessite auth,
- met à jour le créneau,
- génère des notifications section/familles (`updated`).

### `DELETE /api/trainings/:id`

- nécessite auth,
- annulation logique (`status = cancelled`),
- génère des notifications (`deleted`).

### `GET/PATCH /api/weeks`

- `GET`: crée/retourne le profil de semaine si absent,
- `PATCH`: change le type de semaine (`STANDARD`/`STAGE`).

Règle importante:

- si on applique `STANDARD` sur une semaine vide, l'API peut hériter les créneaux de la dernière semaine standard existante.

### `GET /api/sections`

- renvoie les sections actives, triées selon l'ordre métier.

### `GET /api/users`

- renvoie les utilisateurs actifs (auth requis).

### `GET/POST/PATCH/DELETE /api/section-members`

- gestion des adhérents et de leur rattachement section,
- suppression logique du rattachement via `endsAt`.

## 8) Couche frontend: qui appelle quoi

### Page publique (`/`)

- charge server-side les sections + premiers créneaux,
- hydrate `WeeklyCalendar` (composant client),
- `WeeklyCalendar` recharge ensuite via `GET /api/trainings` selon la plage visible dans FullCalendar.

### Page admin (`/admin`)

- protégée par session,
- charge sections, users, créneaux de la semaine, profil de semaine, adhérents actifs,
- affiche deux onglets:
  - gestion adhérents,
  - gestion créneaux.

### Page login (`/login`)

- formulaire client, appel `signIn("credentials")`,
- redirection vers admin (ou callback URL).

### Page embed (`/embed/schedule`)

- vue simplifiée lecture seule, compatible iframe.

## 9) Flux de bout en bout (exemples)

### A. Consultation agenda public

1. L'utilisateur ouvre `/`
2. Le serveur rend la page avec données initiales
3. Le calendrier client récupère/rafraîchit les créneaux selon la semaine affichée
4. Les événements sont affichés avec filtres sections/coachs

### B. Création d'un créneau

1. Un coach/admin ouvre le formulaire
2. Le client envoie `POST /api/trainings`
3. L'API valide, upsert la semaine, crée le créneau
4. L'UI recharge les événements

### C. Modification/suppression d'un créneau

1. Le client envoie `PATCH` ou `DELETE /api/trainings/:id`
2. L'API met à jour le créneau
3. L'API crée des notifications en base (`Notification`)
4. Le module email tente l'envoi des notifications pending

## 10) Notifications email

- La création des notifications est faite dans `training-notifications`.
- L'envoi effectif passe par Brevo (`BREVO_API_KEY`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME`).
- Chaque notification a un statut (`pending`, `sent`, `failed`) enregistré en base.

## 11) Données initiales et imports

- `prisma/seed.ts` crée:
  - utilisateurs de démo,
  - sections,
  - semaine et créneaux initiaux.
- `scripts/import_stage_ete_2026.ts` ajoute des créneaux stage selon un plan prédéfini.

## 12) Migrations et cohérence schéma

Deux migrations sont présentes:

1. `0001_init`: création des tables/enum/index
2. `20260606200357_add_skater_city`: ajout du champ `city` sur `Skater`

Le code API contient un fallback défensif sur `city` pour tolérer temporairement une DB pas encore migrée.

## 13) Points de vigilance

- Toujours appliquer les migrations avant test fonctionnel (`prisma migrate deploy/dev`).
- Vérifier `DATABASE_URL` selon l'environnement.
- Vérifier les variables NextAuth (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`).
- Vérifier les variables Brevo pour les emails, sinon envoi ignoré/échoue.

## 14) Résumé mental de l'architecture

- Next.js gère pages + API dans le même projet.
- Les composants React appellent les endpoints `/api/*`.
- Les endpoints valident, appliquent les règles métier, puis écrivent/lisent PostgreSQL via Prisma.
- Les changements de créneaux peuvent déclencher une chaîne de notifications email.
- Le même code tourne en local (Docker) et en staging/prod (Neon), avec configuration par variables d'environnement.
