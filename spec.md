# TaskVoilà — Connexion Vrai Flow ICP

## Current State
- `LoginPage.tsx` utilise `useSimulatedICP` (popup simulé, principal aléatoire stocké en localStorage)
- `useInternetIdentity.ts` existe avec `@dfinity/auth-client` réel mais n'est pas utilisé dans la page login
- `useActor.ts` utilise déjà `useInternetIdentity` pour créer les acteurs backend authentifiés
- `auth-store.ts` gère l'état `currentUser` avec localStorage, bridgé manuellement via `loginUser()`

## Requested Changes (Diff)

### Add
- Branchement du vrai `useInternetIdentity` dans `LoginPage` pour Internet Identity
- Authentification NFID via `AuthClient` avec l'URL provider NFID (`https://nfid.one/authenticate`)
- Authentification Plug Wallet via `window.ic.plug` API
- Hook utilitaire `useICPLogin` centralisant les 3 providers et le bridge vers `auth-store`

### Modify
- `LoginPage.tsx` : remplacer `useSimulatedICP` par le vrai flow ICP
  - II : appeler `useInternetIdentity().login()`, écouter `isLoginSuccess` via `useEffect`, récupérer `identity.getPrincipal().toString()`
  - NFID : `AuthClient.create()` + `.login({ identityProvider: "https://nfid.one/authenticate" })`
  - Plug : `window.ic?.plug?.requestConnect()` puis `window.ic.plug.agent.getPrincipal()`
  - Après obtention du principal : chercher profil existant en localStorage → redirect dashboard OU redirect `/complete-profile`
- Supprimer l'import et l'usage de `SimulatedICPModal` et `useSimulatedICP` dans `LoginPage`

### Remove
- Dépendance à `useSimulatedICP` dans `LoginPage`
- Modal simulé `SimulatedICPModal` dans `LoginPage`

## Implementation Plan
1. Créer `src/frontend/src/hooks/useICPLogin.ts` avec logique des 3 providers et bridge auth-store
2. Mettre à jour `LoginPage.tsx` pour utiliser `useICPLogin` au lieu de `useSimulatedICP`
3. Garder l'UI exactement identique (mêmes boutons, mêmes textes, même design)
4. Le loading spinner reste pendant l'auth réelle
5. Valider (typecheck + build)
