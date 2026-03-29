# TaskVoilà — Backend Persistence

## Current State
Missions (open requests) and rental listings are stored only in localStorage via React context providers (mission-store.ts, rental-store.ts). Data is lost on page refresh and is not shared between users. The backend (main.mo) only has User and Document management.

## Requested Changes (Diff)

### Add
- `createMission` / `listMissions` / `getMission` / `updateMissionStatus` / `deleteMission` backend endpoints
- `createRentalListing` / `listRentalListings` / `getRentalListing` / `updateRentalListing` / `deleteRentalListing` backend endpoints
- Mission offer CRUD: `submitOffer` / `listOffersByMission` / `acceptOffer` / `rejectOffer`
- Frontend: replace localStorage read/write in mission-store and rental-store with backend actor calls
- Frontend: show loading states while fetching from backend

### Modify
- `main.mo`: add Mission, RentalListing, and Offer data types and CRUD functions
- `mission-store.ts`: switch from localStorage to backend calls
- `rental-store.ts`: switch from localStorage to backend calls

### Remove
- localStorage persistence for missions and rental listings (replaced by backend)

## Implementation Plan
1. Generate updated Motoko backend with Mission, RentalListing, and Offer modules
2. Update frontend stores to use backend actor calls with async operations
3. Update components to handle async loading states
