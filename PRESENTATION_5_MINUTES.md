# Presentation 5 minutes - EPWLM Planning

Objectif: expliquer rapidement l'application a un bureau, un partenaire ou un testeur, sans rentrer dans le detail technique.

## 1) Le probleme resolu (30 sec)

Le club a besoin d'un planning fiable, facilement consultable, et simple a maintenir.

Sans outil centralise:

- informations dispersees,
- erreurs de communication,
- changements de derniere minute mal diffuses.

## 2) La solution (45 sec)

EPWLM Planning est une application web qui centralise:

- l'agenda public du club,
- la gestion des creneaux par coach/admin,
- la gestion des adherents par section,
- la notification des familles en cas de changement.

## 3) Ce que voit chaque profil (45 sec)

### Public

- consulte l'agenda du club,
- filtre par section,
- peut utiliser une version iframe.

### Coach/Admin

- se connecte,
- cree/modifie/supprime des creneaux,
- gere les adherents (admin/back-office),
- pilote le type de semaine (standard/stage).

## 4) Fonctionnement metier en 3 flux (1 min 30)

### Flux 1: consultation

1. Le visiteur ouvre l'agenda.
2. Les creneaux de la semaine s'affichent.
3. Les filtres section/coachs permettent de cibler la lecture.

### Flux 2: gestion planning

1. Le coach/admin edite un creneau.
2. Le planning est mis a jour immediatement.
3. Le creneau apparait dans l'agenda public.

### Flux 3: communication familles

1. Si un creneau est modifie/supprime,
2. l'application prepare des notifications,
3. les emails sont envoyes si la configuration est active.

## 5) Ce qui rend la solution robuste (45 sec)

- Authentification avec roles (coach/admin)
- Regles metier sur les semaines (STANDARD/STAGE)
- Historique des rattachements adherents/sections
- Statuts de notification (pending/sent/failed)
- Meme socle en local et en staging/production

## 6) Valeur pour le club (45 sec)

- Gain de temps pour les coachs et l'administration
- Moins d'erreurs de planning
- Information plus claire pour les familles
- Outil evolutif (attendance, audit, templates deja prevus)

## 7) Conclusion (15 sec)

EPWLM Planning devient la source unique de verite du planning club:

- plus simple a piloter,
- plus lisible pour tous,
- plus fiable dans la communication.

---

## Trame orale prete a dire (option)

"En 5 minutes: EPWLM Planning centralise le planning du club. Le public consulte l'agenda, les coachs et admins le mettent a jour, et les familles sont notifiees en cas de changement. On reduit les erreurs, on gagne du temps, et on professionnalise la communication du club."