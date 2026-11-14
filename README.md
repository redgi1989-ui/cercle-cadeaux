# Cercle Cadeaux

Application web (pour smartphone) de listes de souhaits partagées en cercles : Noël, Saint-Nicolas, anniversaires, Pâques…

- Un administrateur crée un cercle, choisit l'occasion (le style s'adapte) et un **code d'accès**.
- Les membres rejoignent le cercle avec ce code.
- Chacun a sa liste ; on peut aussi gérer la liste d'un enfant ou d'un proche sans compte.
- On colle le lien d'un produit : image, titre et prix s'affichent.
- « Je l'achète » prévient les autres et évite les doublons, en direct.
- « Mes idées » : une réserve personnelle d'idées à cocher dans chaque cercle.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html`, `styles.css`, `app.js` | L'application |
| `config.js` | Adresse et clé publique Supabase |
| `manifest.webmanifest`, `sw.js`, `icons/` | Installation sur l'écran d'accueil |
| `supabase/schema.sql` | Base de données (à lancer en premier) |
| `supabase/02_mes_idees.sql` | Ajout « Mes idées » (à lancer ensuite) |
| `supabase/03_photos.sql` | Photos des cadeaux (à lancer en dernier) |
| `supabase/functions/link-preview/index.ts` | Aperçu automatique des liens |

## Mise en route

### 1. Base de données (Supabase › SQL Editor)
Lancer `supabase/schema.sql`, puis `supabase/02_mes_idees.sql`, puis `supabase/03_photos.sql`.

### 2. Connexion par e-mail + mot de passe (Supabase › Authentication)
**Sign In / Providers › Email** : désactiver **Confirm email** › *Save*
(les membres peuvent ainsi créer leur compte sans attendre d'e-mail).

**URL Configuration** : *Site URL* = `https://redgi1989-ui.github.io/cercle-cadeaux/`
(ajouter la même adresse dans *Redirect URLs*).

### 3. Aperçu des liens (Supabase › Edge Functions)
*Deploy a new function* › *Via Editor* › nom : `link-preview` › coller `supabase/functions/link-preview/index.ts` › *Deploy*.

### 4. Mise en ligne (GitHub Pages)
Dépôt › *Settings* › *Pages* › *Source* : **Deploy from a branch** › branche `main`, dossier `/ (root)` › *Save*.
L'appli est disponible quelques minutes plus tard sur `https://redgi1989-ui.github.io/cercle-cadeaux/`.

### 5. Sur le téléphone
- **iPhone** : ouvrir l'adresse dans Safari › bouton Partager › *Sur l'écran d'accueil*.
- **Android** : ouvrir dans Chrome › menu ⋮ › *Installer l'application* (ou *Ajouter à l'écran d'accueil*).
