# Guide metier - Coach et Admin

Ce document explique l'application avec un angle operationnel (non technique), pour aider les coachs et les admins a utiliser l'outil au quotidien.

## 1) A quoi sert l'application

L'application sert a:

- publier un planning lisible pour tout le club,
- permettre aux coachs/admins de creer et modifier les creneaux,
- gerer les adherents par section,
- prevenir les familles quand un creneau est modifie ou supprime.

## 2) Les profils utilisateurs

### Visiteur (non connecte)

- Consulte l'agenda public
- Peut filtrer par section
- Peut ouvrir la vue iframe en lecture seule

### Coach (connecte)

- Consulte et gere ses creneaux
- Peut creer/modifier/supprimer des creneaux
- Peut ouvrir le back-office

### Admin (connecte)

- A les memes capacites que coach
- Pilote en plus l'organisation globale des sections et de la semaine
- Gere les adherents dans le back-office

## 3) Les ecrans principaux

### Agenda public (/)

- Vue calendrier principale
- Filtres sections
- Navigation semaine/jour
- Point d'entree pour tous (communication club)

### Login (/login)

- Connexion coach/admin
- Redirection vers le back-office

### Back-office (/admin)

Deux onglets:

1. Gestion des adherents
2. Gestion des creneaux

### Vue iframe (/embed/schedule)

- Version simple et integree du planning
- Pratique pour affichage sur site externe ou page partenaire

## 4) Processus metier - creneaux

### Creer un creneau

1. Choisir section
2. Choisir coach
3. Renseigner type, date, horaires, lieu
4. Enregistrer

Resultat:

- Le creneau apparait dans le calendrier
- Il est rattache a la semaine correspondante

### Modifier un creneau

1. Ouvrir le creneau
2. Changer les informations utiles
3. Enregistrer

Resultat:

- Le planning est mis a jour
- Les notifications familles peuvent etre declenchees

### Supprimer un creneau

1. Ouvrir le creneau
2. Confirmer la suppression

Resultat:

- Le creneau n'est plus visible dans l'agenda
- Les familles peuvent etre notifiees

## 5) Processus metier - adherents

### Ajouter un adherent

1. Ouvrir l'onglet "Gestion des adherents"
2. Renseigner identite + contact parent + section
3. Valider

### Modifier un adherent

1. Rechercher l'adherent
2. Cliquer "Modifier"
3. Mettre a jour les informations

### Retirer un adherent d'une section

1. Cliquer "Retirer"
2. Confirmer

Important:

- Le systeme conserve un historique de rattachement section
- On evite la suppression irreversible des informations

## 6) Type de semaine: STANDARD vs STAGE

### STANDARD

- Semaine classique d'entrainements
- Si la semaine est vide, l'application peut heriter les creneaux de la derniere semaine standard

### STAGE

- Semaine specifique stage
- Permet de distinguer les periodes exceptionnelles

## 7) Notifications familles

Quand un creneau est modifie ou supprime:

- l'application prepare des notifications pour les adherents de la section concernee,
- l'envoi se fait par email si la configuration email est active.

But metier:

- reduire les oublis,
- ameliorer la qualite d'information,
- garder une trace des envois.

## 8) Bonnes pratiques d'utilisation

- Verifier section, date, lieu et horaires avant validation
- Eviter les doublons de creneaux sur une meme section
- Utiliser les notes pour les infos utiles aux familles
- Tester l'agenda public apres changements importants
- Mettre a jour les contacts parents pour garantir les notifications

## 9) Checklist quotidienne (rapide)

1. Ouvrir le back-office
2. Verifier la semaine active
3. Controler les creneaux critiques (horaires, lieux, coach)
4. Valider les ajustements necessaires
5. Recontroler l'affichage sur agenda public

## 10) Resume

- L'agenda public est la vitrine
- Le back-office est l'outil de pilotage
- Les coachs et admins alimentent le planning
- Le systeme notifie les familles lors des changements
- Le type de semaine structure le fonctionnement (standard/stage)
