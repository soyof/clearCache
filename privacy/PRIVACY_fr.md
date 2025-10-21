# Politique de Confidentialité

**Dernière mise à jour : 21 octobre 2025**

---

## Introduction

Merci d'utiliser "Cache Cleaner Assistant" (ci-après dénommée "cette Extension"). Nous prenons très au sérieux votre vie privée et la sécurité de vos données. Cette Politique de Confidentialité est conçue pour vous aider à comprendre comment cette Extension collecte, utilise, stocke et protège vos informations.

**Engagement important : Cette Extension ne collecte, ne stocke ni ne transmet aucune information personnellement identifiable vers des serveurs externes. Tout le traitement des données est effectué localement sur votre appareil.**

---

## 1. Collecte d'Informations

### 1.1 Informations que Nous NE Collectons PAS

Cette Extension ne collecte **AUCUNE** des informations suivantes :

- ❌ Informations personnellement identifiables (nom, email, téléphone, etc.)
- ❌ Historique de navigation
- ❌ Données de visite de sites Web
- ❌ Contenu des cookies
- ❌ Données de formulaires
- ❌ Mots de passe ou identifiants de connexion
- ❌ Informations de géolocalisation
- ❌ Identifiants d'appareil
- ❌ Adresses IP

### 1.2 Données Stockées Localement

Cette Extension stocke uniquement les informations de paramètres suivantes localement dans votre navigateur pour fournir une expérience personnalisée :

| Type de Données            | Objectif                                    | Emplacement de Stockage |
| -------------------------- | ------------------------------------------- | ----------------------- |
| Préférence de Langue       | Mémoriser la langue d'interface choisie     | Stockage local          |
| Paramètres de Thème        | Sauvegarder la sélection thème sombre/clair | Stockage local          |
| Paramètres de Notification | Mémoriser l'état activé/désactivé           | Stockage local          |
| Options de Nettoyage       | Sauvegarder vos préférences de nettoyage    | Stockage local          |
| Planification Automatique  | Stocker la configuration de nettoyage auto  | Stockage local          |

**Ces données sont uniquement stockées sur votre appareil et ne sont jamais téléchargées vers un serveur.**

---

## 2. Explication des Permissions

Cette Extension nécessite les permissions de navigateur suivantes pour fournir des fonctionnalités de base. Nous promettons d'utiliser ces permissions uniquement aux fins déclarées :

### 2.1 Permissions Requises

| Permission         | Objectif                                                    | Méthode de Traitement des Données                                  |
| ------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| `storage`          | Sauvegarder les paramètres utilisateur                      | Stockage local uniquement, pas de téléchargement                   |
| `browsingData`     | Effacer le cache, les cookies et autres données             | Effectue uniquement la suppression, ne lit pas le contenu          |
| `tabs`             | Obtenir les informations de l'onglet actuel                 | Lit uniquement le domaine URL, n'enregistre pas l'URL complète     |
| `activeTab`        | Exécuter des opérations de rechargement sur l'onglet actuel | Déclenche uniquement le rafraîchissement, n'accède pas au contenu  |
| `downloads`        | Effacer l'historique de téléchargement                      | Effectue uniquement la suppression, n'accède pas aux fichiers      |
| `history`          | Effacer l'historique de navigation                          | Effectue uniquement la suppression, ne lit pas l'historique        |
| `cookies`          | Effacer les cookies des sites Web                           | Effectue uniquement la suppression, ne lit pas les valeurs         |
| `unlimitedStorage` | Stocker les paramètres utilisateur (sans limite de taille)  | Stocke uniquement les paramètres, ne collecte pas d'infos          |
| `contextMenus`     | Ajouter des actions rapides au menu contextuel              | Fournit uniquement des options de menu, ne collecte pas de données |
| `notifications`    | Afficher les notifications de fin d'opération               | Affiche uniquement localement, n'envoie pas à l'extérieur          |
| `scripting`        | Exécuter des scripts de nettoyage sur les pages             | Efface uniquement LocalStorage/SessionStorage                      |
| `<all_urls>`       | Permettre les opérations de nettoyage sur tous les sites    | Utilisé uniquement pour le nettoyage, n'accède pas au contenu      |

### 2.2 Principes d'Utilisation des Permissions

- ✅ **Principe du Moindre Privilège** : Demande uniquement les permissions nécessaires
- ✅ **Utilisation Transparente** : Tous les objectifs des permissions sont clairement expliqués
- ✅ **Traitement Local** : Tout le traitement des données est effectué localement
- ✅ **Pas d'Abus de Permissions** : N'utilise pas les permissions à d'autres fins que celles déclarées

---

## 3. Utilisation des Données

### 3.1 Méthodes de Traitement des Données

Toutes les fonctions de cette Extension s'exécutent sur votre appareil local :

1. **Nettoyage du Cache** : Appelle directement l'API du navigateur pour supprimer le cache, ne lit pas le contenu
2. **Nettoyage des Cookies** : Supprime directement les cookies, ne lit ni n'enregistre les valeurs
3. **Nettoyage du Stockage** : Efface LocalStorage et SessionStorage, n'accède pas au contenu
4. **Nettoyage de l'Historique** : Supprime l'historique de navigation, ne lit ni n'enregistre les données
5. **Rechargement de Page** : Déclenche le rafraîchissement de la page, n'accède pas au contenu

### 3.2 Opérations que Nous N'Effectuons PAS

Cette Extension ne fera **JAMAIS** :

- ❌ Envoyer vos données vers des serveurs externes
- ❌ Partager vos informations avec des tiers
- ❌ Suivre votre comportement de navigation
- ❌ Analyser vos habitudes d'utilisation
- ❌ Afficher des publicités ou effectuer du marketing
- ❌ Vendre ou louer vos données

---

## 4. Sécurité des Données

### 4.1 Mesures de Sécurité

Nous prenons les mesures suivantes pour protéger la sécurité de vos données :

- 🔒 **Stockage Local** : Toutes les données sont stockées uniquement sur votre appareil
- 🔒 **Pas de Transmission Réseau** : L'extension ne contient aucun code de requête réseau
- 🔒 **Pas de Dépendances Externes** : Ne dépend d'aucun service tiers ou CDN
- 🔒 **Transparence Open Source** : Le code source est public et disponible pour examen
- 🔒 **Isolation des Permissions** : Suit les mécanismes de sandbox de sécurité du navigateur

### 4.2 Suppression des Données

Vous pouvez supprimer toutes les données stockées par cette Extension à tout moment par les méthodes suivantes :

1. **Désinstaller l'Extension** : Tous les paramètres locaux seront automatiquement supprimés après la désinstallation
2. **Réinitialiser les Paramètres** : Cliquez sur "Restaurer les Paramètres par Défaut" dans les paramètres de l'extension
3. **Effacer les Données du Navigateur** : Effacez les données de l'extension via les paramètres du navigateur

---

## 5. Services Tiers

### 5.1 Aucun Service Tiers

Cette Extension **n'utilise AUCUN service tiers**, y compris mais sans s'y limiter :

- ❌ Services d'analyse (comme Google Analytics)
- ❌ Réseaux publicitaires
- ❌ Services de stockage cloud
- ❌ Plugins de médias sociaux
- ❌ Services de suivi d'erreurs

### 5.2 Aucune Connexion Externe

Cette Extension **n'établit AUCUNE connexion réseau externe** :

- ❌ Ne se connecte pas à nos serveurs
- ❌ Ne se connecte pas à des API tierces
- ❌ Ne charge pas de ressources externes
- ❌ N'envoie pas de données de télémétrie

---

## 6. Confidentialité des Enfants

Cette Extension ne collecte intentionnellement aucune information d'enfants de moins de 13 ans. En fait, cette Extension ne collecte aucune information personnelle d'aucun utilisateur, ce qui la rend adaptée aux utilisateurs de tous âges.

---

## 7. Utilisateurs Internationaux

Cette Extension est fournie dans le monde entier et prend en charge plusieurs langues. Où que vous soyez, notre engagement en matière de protection de la vie privée est cohérent :

- 🌍 **Applicable Mondialement** : La politique de confidentialité s'applique aux utilisateurs de toutes les régions
- 🌍 **Conformité Réglementaire** : Conforme aux réglementations sur la confidentialité telles que le RGPD et le CCPA
- 🌍 **Traitement Local** : Tout le traitement des données est effectué sur votre appareil local
- 🌍 **Pas de Transfert Transfrontalier** : N'implique aucun transfert de données transfrontalier

---

## 8. Mises à Jour de la Politique de Confidentialité

### 8.1 Notifications de Mise à Jour

Nous pouvons mettre à jour cette Politique de Confidentialité de temps à autre. En cas de changements importants, nous vous en informerons par les méthodes suivantes :

1. Note dans la description de mise à jour de l'extension
2. Affichage d'une notification dans l'interface de l'extension
3. Publication d'une annonce sur la page du projet GitHub

### 8.2 Date d'Effet

Les mises à jour de cette Politique de Confidentialité prendront effet immédiatement après publication. L'utilisation continue de cette Extension indique votre acceptation de la Politique de Confidentialité mise à jour.

---

## 9. Droits des Utilisateurs

### 9.1 Vos Droits

En tant qu'utilisateur, vous disposez des droits suivants :

- ✅ **Droit d'Accès** : Voir toutes les données de paramètres stockées par cette Extension
- ✅ **Droit de Modification** : Modifier vos paramètres et préférences à tout moment
- ✅ **Droit de Suppression** : Supprimer toutes les données stockées localement à tout moment
- ✅ **Droit de Refus** : Choisir de ne pas utiliser certaines fonctionnalités
- ✅ **Droit de Savoir** : Comprendre comment les données sont utilisées

### 9.2 Exercice des Droits

Vous pouvez exercer les droits ci-dessus par les méthodes suivantes :

1. **Dans les Paramètres de l'Extension** : Modifier ou réinitialiser directement les paramètres
2. **Désinstaller l'Extension** : Supprimer complètement toutes les données
3. **Nous Contacter** : Si vous avez des questions, veuillez nous contacter via les coordonnées ci-dessous

---

## 10. Engagement Open Source

### 10.1 Transparence du Code

Cette Extension est entièrement open source :

- 📖 **Code Source Public** : [https://github.com/soyof/clearCache](https://github.com/soyof/clearCache)
- 📖 **Examinable** : Tout le monde peut examiner le code pour vérifier les engagements de confidentialité
- 📖 **Surveillance Communautaire** : Les membres de la communauté sont invités à signaler tout problème de confidentialité

### 10.2 Audit et Vérification

Nous accueillons les chercheurs en sécurité et les défenseurs de la vie privée pour auditer cette Extension :

- 🔍 Examiner le code source pour vérifier l'absence de collecte de données
- 🔍 Vérifier le trafic réseau pour confirmer l'absence de connexions externes
- 🔍 Analyser l'utilisation des permissions pour garantir une conformité raisonnable

---

## 11. Nous Contacter

Si vous avez des questions, des commentaires ou des suggestions concernant cette Politique de Confidentialité, veuillez nous contacter par les méthodes suivantes :

### 📧 Coordonnées

- **Email** : somuns.os@qq.com
- **GitHub Issues** : [https://github.com/soyof/clearCache/issues](https://github.com/soyof/clearCache/issues)
- **Page d'Accueil du Projet** : [https://github.com/soyof/clearCache](https://github.com/soyof/clearCache)

### ⏱️ Temps de Réponse

Nous répondrons à votre demande dans les 7 jours ouvrables suivant sa réception.

---

## 12. Déclaration de Copyright

### 12.1 Licence Open Source

Cette Extension est open source sous la **Licence MIT**. Vous êtes libre d'utiliser, de modifier et de distribuer cette Extension.

### 12.2 Exigences d'Attribution

Si vous utilisez, modifiez ou référencez le code ou la documentation de cette Extension dans votre projet, veuillez respecter les exigences suivantes :

- ✅ **Conserver l'Avis de Copyright** : Conserver la Licence MIT originale et les informations de copyright
- ✅ **Citer la Source** : Reconnaître la source dans la documentation de votre projet
- ✅ **Format de Citation** : Nous recommandons d'utiliser le format suivant

```
Ce projet est basé sur "Cache Cleaner Assistant"
Auteur Original : soyof
URL du Projet : https://github.com/soyof/clearCache
Licence : MIT License
```

### 12.3 Clause de Non-Responsabilité

Cette Extension est fournie "telle quelle" sans aucune garantie expresse ou implicite. Lors de l'utilisation de cette Extension pour nettoyer des données, veuillez vous assurer de comprendre les conséquences de l'opération. Nous ne sommes pas responsables de toute perte de données ou d'autres pertes résultant de l'utilisation de cette Extension.

---

## 13. Résumé de la Protection de la Vie Privée

### ✅ Nos Engagements

| Engagement                        | Description                                                 |
| --------------------------------- | ----------------------------------------------------------- |
| 🔒 **Zéro Collecte de Données**   | Ne collecte aucune information personnellement identifiable |
| 🔒 **Traitement Local**           | Toutes les opérations effectuées sur votre appareil         |
| 🔒 **Pas de Transmission Réseau** | N'envoie pas de données vers des serveurs                   |
| 🔒 **Pas de Tiers**               | N'utilise aucun service tiers                               |
| 🔒 **Transparence Open Source**   | Le code source est entièrement public et examinable         |
| 🔒 **Permissions Raisonnables**   | Demande uniquement les permissions nécessaires, pas d'abus  |

### 🎯 Principes Fondamentaux

1. **Confidentialité d'Abord** : La vie privée des utilisateurs est notre priorité absolue
2. **Transparent et Ouvert** : Toutes les méthodes de traitement des données sont transparentes et ouvertes
3. **Principe de Minimisation** : Collecter et traiter uniquement les données nécessaires
4. **Contrôle Utilisateur** : Les utilisateurs ont un contrôle complet sur leurs données
5. **Garantie de Sécurité** : Prendre des mesures appropriées pour protéger la sécurité des données

---

## 14. Questions Fréquemment Posées (FAQ)

### Q1 : Cette Extension collecte-t-elle mon historique de navigation ?

**R :** Non. Cette Extension supprimera uniquement l'historique de navigation lorsque vous le demandez explicitement, et ne lit ni ne collecte le contenu de l'historique.

### Q2 : Cette Extension lit-elle mes cookies ?

**R :** Non. Cette Extension supprimera uniquement les cookies lorsque vous demandez un nettoyage, et ne lit ni n'enregistre le contenu des cookies.

### Q3 : Mes données de paramètres seront-elles téléchargées vers des serveurs ?

**R :** Non. Toutes les données de paramètres sont uniquement stockées dans votre navigateur local et ne seront jamais téléchargées.

### Q4 : Cette Extension nécessite-t-elle une connexion Internet ?

**R :** Non. Cette Extension fonctionne complètement hors ligne et ne nécessite aucune connexion réseau.

### Q5 : Comment puis-je vérifier les engagements de confidentialité de cette Extension ?

**R :** Vous pouvez :

1. Voir le code open source : [https://github.com/soyof/clearCache](https://github.com/soyof/clearCache)
2. Utiliser les outils de développement du navigateur pour surveiller les requêtes réseau (vous constaterez qu'il n'y a aucune requête externe)
3. Vérifier les enregistrements d'utilisation des permissions du navigateur

### Q6 : Les données resteront-elles après la désinstallation de l'Extension ?

**R :** Non. Après la désinstallation de l'Extension, toutes les données de paramètres stockées localement seront automatiquement supprimées.

### Q7 : Cette Extension est-elle conforme au RGPD ?

**R :** Oui. Étant donné que cette Extension ne collecte aucune donnée personnelle, elle est entièrement conforme au RGPD et aux autres réglementations sur la confidentialité.

---

## 15. Historique des Versions

| Version | Date       | Modifications    |
| ------- | ---------- | ---------------- |
| 1.0     | 2025-10-21 | Version initiale |

---

<div align="center">
  <p><strong>Merci de faire confiance à "Cache Cleaner Assistant"</strong></p>
  <p><i>Votre Vie Privée, Notre Responsabilité</i></p>
  <p>© 2025 Cache Cleaner Assistant | MIT License</p>
</div>

---

**Cette Politique de Confidentialité a été mise à jour pour la dernière fois le : 21 octobre 2025**
