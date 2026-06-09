# Flux visuel simplifie - EPWLM Planning

Ce document propose des schemas simples pour comprendre rapidement le fonctionnement global.

## 1) Vue d'ensemble

```mermaid
flowchart LR
  U[Utilisateur] --> P[Pages Next.js]
  P --> C[Composants React]
  C --> A[API /api/*]
  A --> M[Regles metier]
  M --> D[(PostgreSQL via Prisma)]
  M --> N[Notifications email]
```

## 2) Parcours agenda public

```mermaid
sequenceDiagram
  participant V as Visiteur
  participant Page as Page publique /
  participant API as GET /api/trainings
  participant DB as PostgreSQL

  V->>Page: Ouvre l'agenda
  Page->>API: Demande les creneaux
  API->>DB: Lit trainings + sections
  DB-->>API: Donnees planning
  API-->>Page: JSON creneaux
  Page-->>V: Affichage calendrier
```

## 3) Parcours coach/admin - creation ou edition

```mermaid
sequenceDiagram
  participant C as Coach/Admin
  participant BO as Back-office
  participant API as POST/PATCH /api/trainings
  participant W as API /api/weeks
  participant DB as PostgreSQL

  C->>BO: Saisit un creneau
  BO->>API: Envoie formulaire
  API->>W: Verifie/prepare semaine
  W->>DB: Upsert WeekProfile
  API->>DB: Create/Update Training
  DB-->>API: Creneau enregistre
  API-->>BO: Reponse OK
  BO-->>C: Calendrier mis a jour
```

## 4) Suppression et notifications familles

```mermaid
sequenceDiagram
  participant C as Coach/Admin
  participant API as DELETE /api/trainings/:id
  participant DB as PostgreSQL
  participant S as Service notifications
  participant E as Brevo Email

  C->>API: Supprimer creneau
  API->>DB: status=cancelled
  API->>S: Creer notifications section
  S->>DB: Insert Notification(pending)
  S->>E: Envoi email si config active
  E-->>S: sent/failed
  S->>DB: Update statut notification
  API-->>C: Confirmation suppression
```

## 5) Gestion adherents

```mermaid
flowchart TD
  A[Admin ouvre Gestion adherents] --> B[Ajout / modification fiche skater]
  B --> C[Rattachement section: SkaterSection]
  C --> D[Historique conserve via startsAt/endsAt]
  D --> E[Filtrage et recherche par section/nom]
```

## 6) Environnements de base de donnees

```mermaid
flowchart LR
  L[Local Dev] -->|DATABASE_URL locale| P[(PostgreSQL Docker)]
  S[Staging/Prod] -->|DATABASE_URL Neon| N[(PostgreSQL Neon)]
  App[Application Next.js + Prisma] --> L
  App --> S
```

## 7) Rappel des regles metier importantes

- Les ecritures de planning necessitent une session connectee.
- Les creneaux annules sont exclus de l'affichage public.
- Une semaine STANDARD vide peut heriter les creneaux de la precedente semaine STANDARD.
- Les notifications sont tracees en base avec statut (`pending`, `sent`, `failed`).
