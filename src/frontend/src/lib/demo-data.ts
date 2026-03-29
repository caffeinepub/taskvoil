// ─── Structural types & category data — used throughout the app ─────────────
// Note: Demo/fake data arrays have been fully removed. Only category
// metadata (used in task forms, filters, etc.) remains.

export type N1Category = {
  key: string;
  emoji: string;
  labelFR: string;
  labelEN: string;
  examplesFR: string[];
  examplesEN: string[];
  order: number;
};

export type N2Category = {
  key: string;
  parentKey: string;
  labelFR: string;
  labelEN: string;
};

// ─── Types re-exported for backward compat (AdminDashboard, etc.) ────────────
// These are pure TypeScript interfaces — no runtime data.

export type DemoPro = {
  id: number;
  firstName: string;
  lastName: string;
  companyName: string;
  category: string;
  city: string;
  postalCode: string;
  radius: number;
  description: string;
  hourlyRate: number;
  rating: number;
  totalMissions: number;
  isVerified: boolean;
  isPremium: boolean;
  yearsExperience: number;
  country?: string;
};

export type DemoTask = {
  id: number;
  title: string;
  category: string;
  n2?: string;
  city: string;
  budgetMin: number;
  budgetMax: number;
  status: "open" | "inProgress" | "completed" | "cancelled" | "disputed";
  offerCount: number;
  createdAt: string;
  scheduledDate: string;
  description: string;
  clientId: number;
  country?: string;
};

export type DemoOffer = {
  id: number;
  taskId: number;
  proId: number;
  price: number;
  description: string;
  deliveryDays: number;
  createdAt: string;
};

export type DemoUser = {
  id: number;
  role: "client" | "pro" | "admin";
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  status: "active" | "verified" | "pending" | "suspended";
  createdAt: string;
};

export type DemoDispute = {
  id: number;
  taskId: number;
  clientId: number;
  proId: number;
  amount: number;
  reason: string;
  status: "pending" | "resolved_client" | "resolved_pro" | "split";
  createdAt: string;
};

export type DemoReport = {
  id: number;
  type: "message" | "profile" | "mission";
  reporterId: number;
  reportedUserId: number;
  contentPreview: string;
  createdAt: string;
  status: "pending" | "resolved" | "dismissed";
};

// ─── Category data ───────────────────────────────────────────────────────────

export const n1Categories: N1Category[] = [
  {
    key: "handytask",
    emoji: "🔧",
    labelFR: "HandyTask",
    labelEN: "HandyTask",
    examplesFR: [
      "Fuites, prises, peinture…",
      "Serrurerie, vitrage",
      "Petits travaux urgents",
    ],
    examplesEN: [
      "Leaks, sockets, painting…",
      "Locksmith, glazing",
      "Small urgent repairs",
    ],
    order: 1,
  },
  {
    key: "nettoyage",
    emoji: "🧹",
    labelFR: "Nettoyage & Ménage",
    labelEN: "Cleaning",
    examplesFR: ["Ménage régulier", "Nettoyage fin de bail", "Après travaux"],
    examplesEN: ["Regular cleaning", "End of tenancy", "Post-renovation"],
    order: 2,
  },
  {
    key: "demenagement",
    emoji: "📦",
    labelFR: "Déménagement & Transport",
    labelEN: "Moving & Transport",
    examplesFR: ["Aide au déménagement", "Livraison meubles", "Débarras"],
    examplesEN: ["Moving help", "Furniture delivery", "Clearance"],
    order: 3,
  },
  {
    key: "montage",
    emoji: "🛋️",
    labelFR: "Montage Meubles & Installation",
    labelEN: "Furniture Assembly",
    examplesFR: [
      "Montage meubles en kit",
      "Fixation TV au mur",
      "Étagères, stores",
    ],
    examplesEN: ["Flat-pack assembly", "TV wall mounting", "Shelves, blinds"],
    order: 4,
  },
  {
    key: "jardin",
    emoji: "🌳",
    labelFR: "Jardin & Extérieur",
    labelEN: "Garden & Outdoor",
    examplesFR: ["Tonte de pelouse", "Taille de haies", "Terrasse & extérieur"],
    examplesEN: ["Lawn mowing", "Hedge trimming", "Patio & outdoor"],
    order: 5,
  },
  {
    key: "renovation",
    emoji: "🧱",
    labelFR: "Gros Œuvre & Rénovation",
    labelEN: "Renovation & Building",
    examplesFR: [
      "Rénovation salle de bain",
      "Carrelage & sols",
      "Peinture intérieure",
    ],
    examplesEN: [
      "Bathroom renovation",
      "Tiling & flooring",
      "Interior painting",
    ],
    order: 7,
  },
  {
    key: "animaux",
    emoji: "🐾",
    labelFR: "Animaux & Pet Sitting",
    labelEN: "Pet Care",
    examplesFR: ["Garde à domicile", "Promenade", "Pet-sitter vacances"],
    examplesEN: ["Home pet sitting", "Dog walking", "Holiday pet care"],
    order: 8,
  },
];

export const n2Categories: N2Category[] = [
  // handytask
  {
    key: "montage-meubles-kit",
    parentKey: "handytask",
    labelFR: "Montage Meubles Kit",
    labelEN: "Flat-pack Assembly",
  },
  {
    key: "peinture-interieure",
    parentKey: "handytask",
    labelFR: "Peinture Intérieure / Extérieure",
    labelEN: "Interior / Exterior Painting",
  },
  {
    key: "plombier-depannage",
    parentKey: "handytask",
    labelFR: "Plombier Dépannage",
    labelEN: "Plumber Emergency",
  },
  {
    key: "electricien-urgence",
    parentKey: "handytask",
    labelFR: "Électricien Urgence",
    labelEN: "Electrician Emergency",
  },
  {
    key: "serrurier-24h",
    parentKey: "handytask",
    labelFR: "Serrurier 24h",
    labelEN: "Locksmith 24h",
  },
  {
    key: "vitrier",
    parentKey: "handytask",
    labelFR: "Vitrier & Vitrine",
    labelEN: "Glazier",
  },
  {
    key: "climatisation",
    parentKey: "handytask",
    labelFR: "Climatisation & Petites Installations",
    labelEN: "AC & Small Installations",
  },
  // nettoyage
  {
    key: "menage-regulier",
    parentKey: "nettoyage",
    labelFR: "Ménage régulier",
    labelEN: "Regular Cleaning",
  },
  {
    key: "nettoyage-printemps",
    parentKey: "nettoyage",
    labelFR: "Nettoyage de printemps",
    labelEN: "Spring Cleaning",
  },
  {
    key: "nettoyage-fin-location",
    parentKey: "nettoyage",
    labelFR: "Nettoyage fin de location",
    labelEN: "End of Tenancy",
  },
  {
    key: "vitres",
    parentKey: "nettoyage",
    labelFR: "Vitres & Baies vitrées",
    labelEN: "Windows & Glass Doors",
  },
  {
    key: "nettoyage-travaux",
    parentKey: "nettoyage",
    labelFR: "Nettoyage après travaux",
    labelEN: "Post-renovation Cleaning",
  },
  // demenagement
  {
    key: "aide-demenagement",
    parentKey: "demenagement",
    labelFR: "Aide au déménagement",
    labelEN: "Moving Help",
  },
  {
    key: "demenagement-complet",
    parentKey: "demenagement",
    labelFR: "Déménagement complet",
    labelEN: "Full Removal",
  },
  {
    key: "livraison-transport",
    parentKey: "demenagement",
    labelFR: "Livraison & petit transport",
    labelEN: "Delivery & Small Transport",
  },
  {
    key: "debarras",
    parentKey: "demenagement",
    labelFR: "Débarras & enlèvement encombrants",
    labelEN: "Clearance & Bulky Items",
  },
  // montage
  {
    key: "montage-chambre-salon",
    parentKey: "montage",
    labelFR: "Montage meubles chambre/salon",
    labelEN: "Bedroom/Living Room Assembly",
  },
  {
    key: "montage-bureau",
    parentKey: "montage",
    labelFR: "Montage bureau & meubles de bureau",
    labelEN: "Office Furniture Assembly",
  },
  {
    key: "fixation-etageres-tv",
    parentKey: "montage",
    labelFR: "Fixation étagères / TV / cadres",
    labelEN: "Shelf / TV / Frame Mounting",
  },
  {
    key: "installation-rideaux",
    parentKey: "montage",
    labelFR: "Installation rideaux & stores",
    labelEN: "Curtains & Blinds",
  },
  // jardin
  {
    key: "tonte-pelouse",
    parentKey: "jardin",
    labelFR: "Tonte de pelouse",
    labelEN: "Lawn Mowing",
  },
  {
    key: "taille-haies",
    parentKey: "jardin",
    labelFR: "Taille de haies",
    labelEN: "Hedge Trimming",
  },
  {
    key: "desherbage",
    parentKey: "jardin",
    labelFR: "Désherbage & entretien massifs",
    labelEN: "Weeding & Border Care",
  },
  {
    key: "terrasse-maconnerie",
    parentKey: "jardin",
    labelFR: "Terrasse / petite maçonnerie ext.",
    labelEN: "Patio / Small Outdoor Build",
  },
  // renovation
  {
    key: "renovation-sdb",
    parentKey: "renovation",
    labelFR: "Rénovation Salle de Bain",
    labelEN: "Bathroom Renovation",
  },
  {
    key: "installation-cuisine",
    parentKey: "renovation",
    labelFR: "Installation Cuisine",
    labelEN: "Kitchen Installation",
  },
  {
    key: "carrelage",
    parentKey: "renovation",
    labelFR: "Carrelage Sol & Mur",
    labelEN: "Floor & Wall Tiling",
  },
  {
    key: "parquet",
    parentKey: "renovation",
    labelFR: "Parquet & Sols stratifiés",
    labelEN: "Parquet & Laminate Flooring",
  },
  {
    key: "nettoyage-chantier",
    parentKey: "renovation",
    labelFR: "Nettoyage fin de chantier",
    labelEN: "Post-Build Cleaning",
  },
  // animaux
  {
    key: "garde-domicile",
    parentKey: "animaux",
    labelFR: "Garde à domicile",
    labelEN: "Home Pet Sitting",
  },
  {
    key: "promenade-chien",
    parentKey: "animaux",
    labelFR: "Promenade",
    labelEN: "Dog Walking",
  },
  {
    key: "visite-domicile",
    parentKey: "animaux",
    labelFR: "Visite à domicile",
    labelEN: "Home Visit",
  },
  {
    key: "petsitter-vacances",
    parentKey: "animaux",
    labelFR: "Pet-sitter vacances",
    labelEN: "Holiday Pet Sitter",
  },
];

export const categoryEmojis: Record<string, string> = {
  handytask: "🔧",
  nettoyage: "🧹",
  demenagement: "📦",
  montage: "🛋️",
  jardin: "🌳",
  renovation: "🧱",
  animaux: "🐾",
  // legacy keys
  plomberie: "🔧",
  electricite: "⚡",
  jardinage: "🌿",
  menage: "🏠",
  bricolage: "🔨",
  peinture: "🎨",
  maconnerie: "🧱",
  cours: "📚",
  babysitting: "👶",
};

export const allCategories = n1Categories.map((c) => c.key);

export function getN2ForN1(n1Key: string): N2Category[] {
  return n2Categories.filter((n2) => n2.parentKey === n1Key);
}
