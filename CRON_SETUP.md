# Configuration du Cron Job - Rapport Mensuel

## Vue d'ensemble

Le système envoie automatiquement un rapport mensuel par email à tous les administrateurs le **1er de chaque mois à 9h00**.

## Configuration Vercel

### 1. Fichier vercel.json

Le fichier `vercel.json` à la racine du projet configure le cron job :

```json
{
  "crons": [
    {
      "path": "/api/cron/monthly-report",
      "schedule": "0 9 1 * *"
    }
  ]
}
```

**Schedule expliqué** : `0 9 1 * *`
- `0` = minute 0
- `9` = heure 9 (9h00 UTC)
- `1` = jour 1 du mois
- `*` = tous les mois
- `*` = tous les jours de la semaine

### 2. Variable d'environnement

Ajoutez la variable suivante dans Vercel Dashboard → Settings → Environment Variables :

```
CRON_SECRET=votre_secret_aleatoire_securise
```

**Générer un secret sécurisé** :
```bash
# Méthode 1 : Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Méthode 2 : OpenSSL
openssl rand -hex 32

# Méthode 3 : En ligne
# Utilisez https://generate-secret.vercel.app/32
```

### 3. Déploiement

Après avoir configuré `vercel.json` et la variable d'environnement :

```bash
# Déployer sur Vercel
vercel --prod
```

Le cron job sera automatiquement activé après le déploiement.

## Test Manuel

### Endpoint de test

Pour tester le cron job manuellement sans attendre le 1er du mois :

```bash
curl -X GET https://votre-app.vercel.app/api/cron/monthly-report \
  -H "Authorization: Bearer votre_CRON_SECRET"
```

**Note** : Remplacez `votre_CRON_SECRET` par la valeur réelle de votre variable d'environnement.

### Test en local

```bash
# 1. Ajouter CRON_SECRET dans .env.local
CRON_SECRET=test_secret_local

# 2. Démarrer le serveur
npm run dev

# 3. Tester l'endpoint
curl -X GET http://localhost:3000/api/cron/monthly-report \
  -H "Authorization: Bearer test_secret_local"
```

## Contenu du Rapport

Le rapport mensuel inclut :

### 📊 Statistiques Globales
- Total des réservations
- Nombre de réservations en attente
- Nombre de réservations acceptées
- Nombre de réservations refusées

### 🏢 Réservations par Commission
Pour chaque commission :
- Nombre total de réservations
- Répartition par statut (acceptées, refusées, en attente)

### 📍 Top 10 des Lieux
Liste des 10 lieux les plus demandés avec le nombre de réservations

## Destinataires

Le rapport est envoyé à **tous les utilisateurs avec le rôle ADMIN** dans la base de données.

Pour ajouter/retirer des destinataires, modifiez les rôles des utilisateurs dans le back-office.

## Monitoring

### Vérifier les logs sur Vercel

1. Aller sur Vercel Dashboard
2. Sélectionner votre projet
3. Aller dans **Functions** → **Cron Jobs**
4. Voir l'historique des exécutions

### Logs attendus

```
🚀 Starting monthly report cron job...
✅ Monthly report sent successfully to 3 admins
📊 Stats: 145 total reservations
```

## Fréquence

Le cron s'exécute **une fois par mois** :
- **Jour** : 1er du mois
- **Heure** : 9h00 UTC (ajuster selon votre timezone)
- **Période analysée** : Mois précédent complet

## Sécurité

### Protection de l'endpoint

L'endpoint `/api/cron/monthly-report` est protégé par :
1. **Bearer token** avec CRON_SECRET
2. Vérification côté serveur avant exécution

### Bonnes pratiques

- ✅ Utilisez un secret fort (32+ caractères)
- ✅ Ne commitez jamais CRON_SECRET dans Git
- ✅ Rotez le secret périodiquement
- ✅ Limitez l'accès aux variables d'environnement Vercel

## Dépannage

### Le cron ne s'exécute pas

1. Vérifier que `vercel.json` est à la racine
2. Vérifier que le projet est déployé en production
3. Vérifier les logs dans Vercel Dashboard
4. Vérifier que CRON_SECRET est bien défini

### Les emails ne sont pas envoyés

1. Vérifier que RESEND_API_KEY est configuré
2. Vérifier qu'il y a au moins un utilisateur ADMIN
3. Vérifier les logs de l'endpoint
4. Tester manuellement avec curl

### Erreur 401 Unauthorized

- Le CRON_SECRET dans la requête ne correspond pas à celui dans Vercel
- Vérifier la variable d'environnement dans Vercel Dashboard

## Support

Pour toute question ou problème :
1. Consulter les logs Vercel
2. Tester l'endpoint manuellement
3. Vérifier la documentation Vercel Cron : https://vercel.com/docs/cron-jobs
