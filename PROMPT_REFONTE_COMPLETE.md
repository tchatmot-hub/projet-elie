# PROMPT COMPLET POUR REFONTE MULTI-ÉCOLES/MULTI-CLASSES/MULTI-DÉLÉGUÉS

## CONTEXTE GÉNÉRAL
Créer une plateforme de partage de documents académiques évolutive qui peut être utilisée par plusieurs écoles, plusieurs classes et plusieurs délégués simultanément. La plateforme doit être professionnelle, sécurisée et scalable.

---

## ARCHITECTURE TECHNIQUE

### 1. BASE DE DONNÉES
- **Utiliser une vraie base de données** (MongoDB, PostgreSQL ou Firebase)
- **Schéma de données multi-niveaux** : École → Classe → Délégué → Étudiants
- **Relations clés étrangères** pour maintenir l'intégrité des données
- **Indexation** pour les performances de recherche

### 2. BACKEND
- **API RESTful** ou GraphQL pour la communication
- **Authentification JWT** avec tokens sécurisés
- **Middleware de validation** pour toutes les requêtes
- **Gestion des erreurs centralisée**
- **Logging complet** des actions

### 3. FRONTEND
- **Framework moderne** (React.js, Vue.js ou Next.js)
- **State management** (Redux, Vuex ou Zustand)
- **Routing dynamique** pour les espaces multi-écoles
- **Responsive design** mobile-first
- **Accessibilité WCAG 2.1 AA**

### 4. SÉCURITÉ
- **HTTPS obligatoire** en production
- **Protection CSRF** pour tous les formulaires
- **Rate limiting** pour prévenir les attaques
- **Sanitization** des entrées utilisateur
- **Encryption** des données sensibles

---

## MODÈLE DE DONNÉES

### ÉCOLE
```javascript
{
  id: String (UUID),
  name: String,
  code: String (unique, ex: "UCAO"),
  domain: String (ex: "ucao.portailcours.edu"),
  logo: String (URL),
  primaryColor: String,
  secondaryColor: String,
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean,
  settings: {
    maxDelegatesPerClass: Number,
    maxStudentsPerClass: Number,
    allowStudentUpload: Boolean,
    requireEmailVerification: Boolean
  }
}
```

### CLASSE
```javascript
{
  id: String (UUID),
  schoolId: String (référence École),
  name: String (ex: "Licence 1 Informatique Groupe A"),
  code: String (unique par école),
  academicYear: String (ex: "2026-2027"),
  level: String (ex: "L1", "L2", "L3"),
  department: String,
  delegates: [String] (array de delegateIds),
  students: [String] (array de studentIds),
  documents: [String] (array de documentIds),
  announcements: [String] (array de announcementIds),
  createdAt: Date,
  updatedAt: Date
}
```

### DÉLÉGUÉ
```javascript
{
  id: String (UUID),
  schoolId: String (référence École),
  classId: String (référence Classe),
  name: String,
  username: String (unique global),
  email: String (unique),
  password: String (hashé),
  role: String ("delegate", "admin", "superadmin"),
  permissions: {
    canUpload: Boolean,
    canDelete: Boolean,
    canManageStudents: Boolean,
    canGenerateCodes: Boolean,
    canPublishAnnouncements: Boolean
  },
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### ÉTUDIANT
```javascript
{
  id: String (UUID),
  schoolId: String (référence École),
  classId: String (référence Classe),
  name: String,
  email: String (unique),
  password: String (hashé),
  accessCode: String (unique par classe),
  studentNumber: String (numéro étudiant),
  profile: {
    avatar: String (URL),
    bio: String,
    phone: String
  },
  downloads: [{
    documentId: String,
    downloadedAt: Date,
    count: Number
  }],
  favorites: [String] (array de documentIds),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### DOCUMENT
```javascript
{
  id: String (UUID),
  schoolId: String (référence École),
  classId: String (référence Classe),
  uploadedBy: String (référence Délégué),
  title: String,
  description: String,
  subject: String,
  professor: String,
  type: String ("course", "td", "tp", "exam", "correction"),
  fileType: String ("pdf", "docx", "xlsx", "pptx"),
  fileUrl: String (URL stockage cloud),
  fileSize: Number,
  version: Number,
  isPublic: Boolean,
  tags: [String],
  downloads: Number,
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### ANNONCE
```javascript
{
  id: String (UUID),
  schoolId: String (référence École),
  classId: String (référence Classe),
  authorId: String (référence Délégué),
  title: String,
  content: String,
  priority: String ("low", "normal", "high", "urgent"),
  isPinned: Boolean,
  targetAudience: String ("all", "students", "delegates"),
  readBy: [String] (array de userIds),
  createdAt: Date,
  updatedAt: Date
}
```

---

## FONCTIONNALITÉS PAR RÔLE

### ADMINISTRATEUR SYSTÈME (Superadmin)
- **Gestion des écoles** : Créer, modifier, supprimer des écoles
- **Gestion globale** : Voir toutes les statistiques, gérer les utilisateurs
- **Configuration système** : Définir les limites et règles globales
- **Support technique** : Accéder aux logs et résoudre les problèmes
- **Analytics avancés** : Rapports détaillés sur l'utilisation

### ADMINISTRATEUR ÉCOLE
- **Gestion des classes** : Créer, modifier, supprimer des classes
- **Gestion des délégués** : Nommer, révoquer les délégués
- **Personnalisation** : Logo, couleurs, domaine de l'école
- **Statistiques école** : Voir les données de son école uniquement
- **Configuration locale** : Adapter les règles à son école

### DÉLÉGUÉ
- **Gestion documents** : Upload, modifier, supprimer des documents
- **Génération de codes** : Créer des codes d'accès pour les étudiants
- **Publication annonces** : Créer et diffuser des annonces
- **Statistiques classe** : Voir les téléchargements et activité de sa classe
- **Modération** : Valider les commentaires et signalements

### ÉTUDIANT
- **Accès documents** : Télécharger les documents de sa classe
- **Recherche avancée** : Filtrer par matière, type, professeur
- **Favoris** : Marquer des documents comme favoris
- **Notifications** : Recevoir les annonces de son délégué
- **Profil personnel** : Gérer ses informations

---

## WORKFLOW D'INSCRIPTION

### INSCRIPTION ÉCOLE (Admin système)
1. Formulaire d'inscription école avec :
   - Nom de l'école
   - Code unique
   - Domaine personnalisé
   - Logo upload
   - Couleurs de marque
   - Informations de contact
2. Validation et création du compte admin école
3. Envoi email de confirmation
4. Dashboard de configuration initiale

### INSCRIPTION DÉLÉGUÉ (Admin école)
1. L'admin école nomme un délégué pour une classe
2. Le délégué reçoit un email d'invitation
3. Le délégué crée son compte avec mot de passe
4. Le délégué accède à son espace de gestion

### INSCRIPTION ÉTUDIANT
1. Le délégué génère un code d'accès unique
2. Le délégué communique le code à l'étudiant
3. L'étudiant s'inscrit avec le code + ses informations
4. Validation du code et création du compte
5. L'étudiant accède aux documents de sa classe

---

## STRUCTURE DES PAGES

### 1. PAGE D'ACCUEIL GLOBALE (`/`)
- **Sélection d'école** : Dropdown ou recherche pour choisir l'école
- **Branding dynamique** : Logo et couleurs de l'école sélectionnée
- **Boutons d'action** :
  - "S'inscrire comme étudiant"
  - "Espace délégué"
  - "Contact admin"
- **Statistiques publiques** : Nombre d'écoles, classes, documents

### 2. PAGE INSCRIPTION ÉCOLE (`/inscription-ecole`)
- Formulaire complet pour les nouvelles écoles
- Validation du code unique
- Upload du logo
- Choix du domaine
- Configuration initiale

### 3. PAGE CONNEXION GLOBALE (`/connexion`)
- Formulaire de connexion multi-rôles
- Sélection du type de compte (étudiant, délégué, admin)
- Récupération de mot de passe
- Mémorisation de l'école

### 4. DASHBOARD ADMIN SYSTÈME (`/admin/systeme`)
- **Vue d'ensemble** : Statistiques globales
- **Gestion écoles** : Tableau CRUD des écoles
- **Gestion utilisateurs** : Liste de tous les utilisateurs
- **Logs système** : Journal d'activité
- **Configuration** : Paramètres globaux
- **Support** : Tickets et messages

### 5. DASHBOARD ADMIN ÉCOLE (`/admin/ecole/:schoolId`)
- **Vue d'overview** : Statistiques de l'école
- **Gestion classes** : CRUD des classes
- **Gestion délégués** : Nomination et gestion
- **Personnalisation** : Logo, couleurs, domaine
- **Statistiques détaillées** : Graphiques et rapports

### 6. ESPACE DÉLÉGUÉ (`/delegue/:delegateId`)
- **Dashboard personnel** : Vue d'ensemble de sa classe
- **Gestion documents** : Upload, édition, suppression
- **Génération codes** : Création de codes étudiants
- **Publication annonces** : Création et diffusion
- **Statistiques classe** : Téléchargements, activité
- **Gestion étudiants** : Liste et gestion basique

### 7. ESPACE ÉTUDIANT (`/etudiant/:studentId`)
- **Dashboard personnel** : Documents récents, favoris
- **Bibliothèque documents** : Tous les documents de sa classe
- **Recherche avancée** : Filtres et recherche
- **Annonces** : Messages du délégué
- **Profil** : Gestion de ses informations
- **Téléchargements** : Historique de téléchargements

---

## API ENDPOINTS

### AUTHENTIFICATION
- `POST /api/auth/register-school` - Inscription école
- `POST /api/auth/register-delegate` - Inscription délégué
- `POST /api/auth/register-student` - Inscription étudiant
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/forgot-password` - Récupération mot de passe
- `POST /api/auth/reset-password` - Réinitialisation mot de passe

### ÉCOLES
- `GET /api/schools` - Liste toutes les écoles (admin)
- `GET /api/schools/:id` - Détails école
- `POST /api/schools` - Créer école (admin)
- `PUT /api/schools/:id` - Modifier école (admin)
- `DELETE /api/schools/:id` - Supprimer école (admin)

### CLASSES
- `GET /api/schools/:schoolId/classes` - Liste classes d'une école
- `GET /api/classes/:id` - Détails classe
- `POST /api/classes` - Créer classe (admin école)
- `PUT /api/classes/:id` - Modifier classe (admin école)
- `DELETE /api/classes/:id` - Supprimer classe (admin école)

### DÉLÉGUÉS
- `GET /api/classes/:classId/delegates` - Liste délégués d'une classe
- `GET /api/delegates/:id` - Détails délégué
- `POST /api/delegates` - Créer délégué (admin école)
- `PUT /api/delegates/:id` - Modifier délégué
- `DELETE /api/delegates/:id` - Supprimer délégué (admin école)

### ÉTUDIANTS
- `GET /api/classes/:classId/students` - Liste étudiants d'une classe
- `GET /api/students/:id` - Détails étudiant
- `POST /api/students` - Inscrire étudiant
- `PUT /api/students/:id` - Modifier étudiant
- `DELETE /api/students/:id` - Supprimer étudiant (délégué/admin)

### DOCUMENTS
- `GET /api/classes/:classId/documents` - Liste documents d'une classe
- `GET /api/documents/:id` - Détails document
- `POST /api/documents` - Upload document (délégué)
- `PUT /api/documents/:id` - Modifier document (délégué)
- `DELETE /api/documents/:id` - Supprimer document (délégué)
- `POST /api/documents/:id/download` - Télécharger document
- `POST /api/documents/:id/favorite` - Ajouter aux favoris (étudiant)

### ANNONCES
- `GET /api/classes/:classId/announcements` - Liste annonces d'une classe
- `GET /api/announcements/:id` - Détails annonce
- `POST /api/announcements` - Créer annonce (délégué)
- `PUT /api/announcements/:id` - Modifier annonce (délégué)
- `DELETE /api/announcements/:id` - Supprimer annonce (délégué)
- `POST /api/announcements/:id/read` - Marquer comme lu (étudiant)

### CODES D'ACCÈS
- `POST /api/codes/generate` - Générer code (délégué)
- `GET /api/codes/:classId` - Liste codes d'une classe (délégué)
- `DELETE /api/codes/:id` - Révoquer code (délégué)

### STATISTIQUES
- `GET /api/stats/school/:schoolId` - Stats école (admin école)
- `GET /api/stats/class/:classId` - Stats classe (délégué)
- `GET /api/stats/student/:studentId` - Stats étudiant
- `GET /api/stats/system` - Stats globales (admin système)

---

## SÉCURITÉ ET PERMISSIONS

### MATRICE DES PERMISSIONS

| Action | Superadmin | Admin École | Délégué | Étudiant |
|--------|-----------|-------------|---------|----------|
| Créer école | ✅ | ❌ | ❌ | ❌ |
| Supprimer école | ✅ | ❌ | ❌ | ❌ |
| Gérer classes école | ✅ | ✅ | ❌ | ❌ |
| Nommer délégués | ✅ | ✅ | ❌ | ❌ |
| Upload documents | ✅ | ✅ | ✅ | ❌ |
| Supprimer documents | ✅ | ✅ | ✅ | ❌ |
| Générer codes | ✅ | ✅ | ✅ | ❌ |
| Voir stats classe | ✅ | ✅ | ✅ | ❌ |
| Télécharger documents | ✅ | ✅ | ✅ | ✅ |
| Voir annonces | ✅ | ✅ | ✅ | ✅ |
| Modifier profil | ✅ | ✅ | ✅ | ✅ |

### VALIDATIONS
- **Email** : Format valide, unique global
- **Mot de passe** : Min 8 caractères, 1 majuscule, 1 chiffre, 1 spécial
- **Code d'accès** : 8 caractères alphanumériques, unique par classe
- **Nom école** : Min 3 caractères, unique global
- **Nom classe** : Min 5 caractères, unique par école

---

## DESIGN ET UX

### PRINCIPES DE DESIGN
- **Consistance** : Même design pour toutes les écoles avec branding personnalisé
- **Simplicité** : Interface intuitive, nombre minimal de clics
- **Accessibilité** : Contraste WCAG AA, navigation clavier, screen readers
- **Performance** : Chargement < 2 secondes, optimisation images
- **Mobile-first** : Responsive design parfait sur tous les appareils

### COMPOSANTS UI
- **Navigation contextuelle** : Menu adapté au rôle de l'utilisateur
- **Cards modulaires** : Composants réutilisables pour les données
- **Tables avancées** : Tri, filtrage, pagination, export
- **Modals** : Pour les actions secondaires
- **Toasts** : Notifications non-intrusives
- **Loading states** : Indicateurs de chargement clairs
- **Empty states** : Messages quand aucune donnée

### THÈMES
- **Thème par défaut** : Bleu professionnel
- **Thème école** : Couleurs personnalisées par école
- **Mode sombre** : Option pour tous les utilisateurs
- **Mode contraste élevé** : Pour accessibilité

---

## DÉPLOIEMENT

### ENVIRONNEMENTS
- **Développement** : Local avec Docker
- **Staging** : Serveur de test
- **Production** : Cloud (AWS, GCP, Azure)

### INFRASTRUCTURE
- **Base de données** : PostgreSQL ou MongoDB Atlas
- **Stockage fichiers** : AWS S3 ou Google Cloud Storage
- **CDN** : Cloudflare pour assets statiques
- **Email** : SendGrid ou Mailgun
- **Monitoring** : Sentry pour erreurs, Analytics pour usage

### CI/CD
- **GitHub Actions** ou GitLab CI
- **Tests automatiques** : Unit tests, integration tests, E2E tests
- **Déploiement automatique** : Sur merge vers main
- **Rollback automatique** : En cas d'erreur

---

## TESTING

### TYPES DE TESTS
- **Unit tests** : Tester chaque fonction isolément
- **Integration tests** : Tester les interactions entre modules
- **E2E tests** : Tester les workflows complets (Cypress/Playwright)
- **Performance tests** : Tester sous charge
- **Security tests** : Tests de pénétration

### COUVERTURE
- **Minimum 80%** de couverture de code
- **Tests critiques** : Authentification, permissions, upload
- **Tests UI** : Composants principaux

---

## DOCUMENTATION

### DOCUMENTATION TECHNIQUE
- **README** : Installation et configuration
- **API Docs** : Swagger/OpenAPI
- **Architecture** : Diagrammes et explications
- **Database Schema** : Documentation complète

### DOCUMENTATION UTILISATEUR
- **Guide admin système** : Pour les superadmins
- **Guide admin école** : Pour les admins école
- **Guide délégué** : Pour les délégués
- **Guide étudiant** : Pour les étudiants
- **FAQ** : Questions fréquentes
- **Vidéos tutoriels** : Pour les fonctionnalités clés

---

## ROADMAP

### PHASE 1 (MVP - 2 mois)
- Architecture de base
- Authentification multi-rôles
- Gestion écoles/classes
- Upload documents basique
- Espace étudiant simple

### PHASE 2 (Améliorations - 1 mois)
- G complète des codes d'accès
- Annonces et notifications
- Recherche avancée
- Favoris et profil
- Statistiques de base

### PHASE 3 (Avancé - 1 mois)
- Versionning documents
- Comments et Q&A
- Analytics avancés
- Export données
- Mode sombre

### PHASE 4 (Enterprise - 1 mois)
- Multi-langues
- PWA mobile
- API pour intégrations
- Webhooks
- Support avancé

---

## BUDGET ESTIMATIF

### DÉVELOPPEMENT
- **Backend** : 40-60 heures
- **Frontend** : 60-80 heures
- **Database** : 20-30 heures
- **Testing** : 30-40 heures
- **Documentation** : 15-20 heures

### COÛTS MENSUELS
- **Hébergement** : $50-200/mois
- **Base de données** : $25-100/mois
- **Stockage** : $10-50/mois
- **Email** : $20-50/mois
- **CDN** : $10-30/mois

---

## CRITÈRES DE SUCCÈS

### KPIs
- **Performance** : < 2s temps de chargement
- **Uptime** : 99.9% disponibilité
- **Sécurité** : 0 incidents majeurs
- **Satisfaction** : > 4/5 étoiles utilisateurs
- **Adoption** : > 80% des classes actives utilisent la plateforme

### OBJECTIFS
- **3 mois** : MVP fonctionnel avec 5 écoles pilotes
- **6 mois** : 20 écoles, 100 classes, 5000 étudiants
- **12 mois** : 50 écoles, 500 classes, 20000 étudiants

---

Ce prompt fournit une base complète pour refondre la plateforme de manière professionnelle et scalable, en tenant compte de tous les aspects techniques, fonctionnels et business nécessaires pour une utilisation multi-écoles, multi-classes et multi-délégués.
