# Portail des cours — Plateforme multi-écoles

Plateforme de partage de documents académiques **multi-écoles / multi-classes /
multi-délégués**. Refonte de l'ancien prototype statique vers une architecture
full-stack moderne.

> Cette PR livre la **Phase 1 (MVP)**. Les fonctionnalités avancées (recherche
> avancée, versioning, analytics, mode sombre, PWA, i18n…) suivront en PRs
> séparées.

## Stack

- **Next.js 14 (App Router) + React + TypeScript** — frontend + API REST
- **MongoDB + Mongoose** — modèle relationnel École → Classe → Délégué → Étudiant
- **JWT (cookie httpOnly) + bcrypt** — authentification multi-rôles
- **Tailwind CSS** — UI responsive, mobile-first
- **Jest + mongodb-memory-server** — tests unitaires et d'intégration

## Rôles

| Rôle | Portée |
|------|--------|
| `superadmin` | Toutes les écoles (gestion globale, stats système) |
| `school_admin` | Une école (classes, délégués, branding) |
| `delegate` | Une classe (documents, annonces, codes d'accès) |
| `student` | Une classe (consultation, téléchargement, favoris) |

La matrice de permissions est définie dans `src/lib/permissions.ts` et appliquée
côté serveur via `withAuth()` (`src/lib/apiAuth.ts`).

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseigner MONGODB_URI et JWT_SECRET
npm run seed                 # données de démonstration (optionnel)
npm run dev                  # http://localhost:3000
```

Il faut une instance MongoDB accessible (locale ou MongoDB Atlas) renseignée
dans `MONGODB_URI`.

### Comptes de démonstration (après `npm run seed`)

| Rôle | E-mail | Mot de passe |
|------|--------|--------------|
| Superadmin | `superadmin@portailcours.edu` | `Admin@1234` |
| Admin école | `admin@ucao.edu` | `Admin@1234` |
| Délégué | `delegue@ucao.edu` | `Admin@1234` |
| Étudiant | `etudiant@ucao.edu` | `Admin@1234` |

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run lint` | ESLint (next lint) |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` | Tests Jest |
| `npm run seed` | Peuple la base avec des données de démonstration |

## Structure

```
src/
  app/
    page.tsx                  # accueil (sélection d'école)
    connexion/                # connexion
    inscription-ecole/        # inscription d'une école
    inscription-etudiant/     # inscription étudiant (code d'accès)
    admin/systeme/            # dashboard superadmin
    admin/ecole/              # dashboard admin école
    delegue/                  # espace délégué
    etudiant/                 # espace étudiant
    api/                      # routes REST (auth, schools, classes, ...)
  lib/                        # db, auth, permissions, validation, storage
  models/                     # schémas Mongoose
  components/                 # composants partagés
scripts/seed.ts               # script de seed
tests/                        # tests Jest
```

## Principales routes API

- `POST /api/auth/register-school` · `POST /api/auth/register-student` · `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me`
- `GET|POST /api/schools` · `GET|PUT|DELETE /api/schools/:id` · `GET /api/schools/public`
- `GET|POST /api/classes` · `GET|PUT|DELETE /api/classes/:id`
- `GET|POST /api/delegates` · `GET /api/students`
- `GET|POST /api/documents` · `PUT|DELETE /api/documents/:id` · `POST /api/documents/:id/download` · `POST /api/documents/:id/favorite`
- `GET|POST /api/announcements`
- `POST /api/codes/generate` · `GET /api/codes`
- `GET /api/stats/system` · `GET /api/stats/school/:id` · `GET /api/stats/class/:id`
- `POST /api/upload` (stockage local en dev, à remplacer par S3/GCS en prod)

## Sécurité

- Mots de passe hachés (bcrypt), jamais retournés par l'API.
- JWT signé, stocké dans un cookie `httpOnly` `SameSite=Lax`.
- Validation des entrées via Zod (`src/lib/validation.ts`).
- Politique mot de passe : 8+ caractères, 1 majuscule, 1 chiffre, 1 spécial.
- Code d'accès : 8 caractères alphanumériques, unique par classe.
- Isolation des données par école/classe appliquée dans chaque handler.
