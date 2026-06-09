# Planning EPWLM

Application SaaS de gestion des plannings pour un club de patinage associatif.

## Documentation d'architecture

Pour une explication detaillee de la structure du projet, des flux de donnees, des API et des environnements de base de donnees:

- Voir `ARCHITECTURE_FONCTIONNEMENT.md`
- Guide metier (coach/admin): `GUIDE_METIER_COACH_ADMIN.md`
- Schema visuel simplifie: `FLUX_VISUEL_SIMPLIFIE.md`
- Version presentation 5 minutes: `PRESENTATION_5_MINUTES.md`

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth (Credentials)

## Fonctionnalités incluses (socle MVP)

- Agenda public FullCalendar en vue hebdomadaire avec navigation semaine suivante/précédente
- Filtre par section (toutes sections ou section ciblée)
- Vue iframe en lecture seule (`/embed/schedule`)
- Connexion entraîneur/admin (`/login`)
- Espace admin protégé (`/admin`)

API disponibles:
	- `GET /api/trainings`
	- `POST /api/trainings` (auth requis)
	- `PATCH /api/trainings/:id` (auth requis)
	- `DELETE /api/trainings/:id` (auth requis)
	- `GET /api/weeks`
	- `GET /api/sections`

## Démarrage

1. Copier l'environnement:

```bash
cp .env.example .env
```

2. Installer et générer Prisma:

```bash
npm install
npm run prisma:generate
```

3. Démarrer PostgreSQL local (Docker):

```bash
npm run db:up
```

4. Initialiser la base:

```bash
npm run prisma:migrate -- --name init
npm run db:seed
```

5. Lancer en local:

```bash
npm run dev
```

## Scripts utiles

- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:studio`
- `npm run db:up`
- `npm run db:down`
- `npm run db:seed`

Note: le script `db:up` démarre un conteneur Docker `patin-postgres` sans dépendre de docker-compose.

## Modèle de données

Le schéma Prisma inclut les entités de base du domaine club:

- `User` (coach/admin)
- `Section`
- `WeekProfile` (standard/stage)
- `Training` et `TrainingTemplate`
- `Skater`, `SkaterSection`, `TrainingAttendance`
- `Notification`, `AuditLog`

## Comptes de démonstration

- Coach: `coach@epwlm.local` / `coach123`
- Admin: `admin@epwlm.local` / `admin123`

Tu peux surcharger ces valeurs via `.env`.
