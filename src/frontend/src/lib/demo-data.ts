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

// Keep old categoryEmojis for backward compat (maps old keys to new N1 keys)
export const categoryEmojis: Record<string, string> = {
  handytask: "🔧",
  nettoyage: "🧹",
  demenagement: "📦",
  montage: "🛋️",
  jardin: "🌳",
  renovation: "🧱",
  animaux: "🐾",
  // keep legacy keys for existing demo tasks
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

export const demoPros: DemoPro[] = [
  {
    id: 1,
    firstName: "Marc",
    lastName: "Dubois",
    companyName: "Plomberie Dubois",
    category: "handytask",
    city: "Paris",
    postalCode: "75001",
    radius: 20,
    description:
      "Plombier certifié avec 15 ans d'expérience en réparations, installations et rénovations. Intervention rapide, devis gratuit. Spécialisé dans la plomberie sanitaire, les chaudières et les fuites.",
    hourlyRate: 65,
    rating: 4.8,
    totalMissions: 142,
    isVerified: true,
    isPremium: true,
    yearsExperience: 15,
    country: "FR",
  },
  {
    id: 2,
    firstName: "Sophie",
    lastName: "Martin",
    companyName: "Électricité Martin",
    category: "handytask",
    city: "Lyon",
    postalCode: "69001",
    radius: 15,
    description:
      "Électricienne qualifiée RGE (Reconnue Garante de l'Environnement). Spécialisée dans les installations électriques résidentielles et commerciales, les tableaux électriques et les bornes de recharge. Certifiée NFC 15-100.",
    hourlyRate: 70,
    rating: 4.9,
    totalMissions: 89,
    isVerified: true,
    isPremium: false,
    yearsExperience: 10,
    country: "FR",
  },
  {
    id: 3,
    firstName: "Pierre",
    lastName: "Bernard",
    companyName: "Jardins Bernard",
    category: "jardin",
    city: "Bordeaux",
    postalCode: "33000",
    radius: 25,
    description:
      "Paysagiste et jardinier professionnel. Création et entretien de jardins, terrasses et espaces verts. Taille de haies, tonte de pelouse, plantation et aménagement paysager. Devis gratuit.",
    hourlyRate: 45,
    rating: 4.6,
    totalMissions: 67,
    isVerified: false,
    isPremium: false,
    yearsExperience: 8,
    country: "FR",
  },
  {
    id: 4,
    firstName: "Liam",
    lastName: "O'Brien",
    companyName: "Dublin Handyman Services",
    category: "handytask",
    city: "Dublin",
    postalCode: "D01",
    radius: 20,
    description:
      "Experienced handyman based in Dublin city centre. Specialising in plumbing repairs, flat-pack assembly, painting, and general maintenance. Fast response, transparent pricing, fully insured.",
    hourlyRate: 75,
    rating: 4.7,
    totalMissions: 54,
    isVerified: true,
    isPremium: false,
    yearsExperience: 12,
    country: "IE",
  },
  {
    id: 5,
    firstName: "Pierre",
    lastName: "Renard",
    companyName: "Clean Brussels",
    category: "nettoyage",
    city: "Bruxelles",
    postalCode: "1000",
    radius: 15,
    description:
      "Service de nettoyage professionnel à Bruxelles. Ménage régulier, nettoyage de fin de bail, vitres et grandes surfaces. Produits écologiques, équipe formée et assurée. Devis gratuit.",
    hourlyRate: 35,
    rating: 4.5,
    totalMissions: 98,
    isVerified: true,
    isPremium: true,
    yearsExperience: 7,
    country: "BE",
  },
];

export const demoTasks: DemoTask[] = [
  {
    id: 1,
    title: "Réparation fuite robinet cuisine",
    category: "handytask",
    n2: "plombier-depannage",
    city: "Paris",
    budgetMin: 80,
    budgetMax: 150,
    status: "open",
    offerCount: 3,
    createdAt: "2025-02-20",
    scheduledDate: "2025-03-01",
    description:
      "J'ai une fuite sous l'évier de cuisine, au niveau du siphon. L'eau goutte lentement mais régulièrement. Je cherche quelqu'un de disponible rapidement pour régler ce problème.",
    clientId: 1,
    country: "FR",
  },
  {
    id: 2,
    title: "Installation prise électrique salon",
    category: "handytask",
    n2: "electricien-urgence",
    city: "Lyon",
    budgetMin: 100,
    budgetMax: 200,
    status: "inProgress",
    offerCount: 2,
    createdAt: "2025-02-18",
    scheduledDate: "2025-02-28",
    description:
      "Besoin d'installer 3 nouvelles prises électriques dans mon salon. Il faut aussi vérifier le tableau électrique. Appartement de 80m².",
    clientId: 2,
    country: "FR",
  },
  {
    id: 3,
    title: "Taille haie et tonte de pelouse",
    category: "jardin",
    n2: "taille-haies",
    city: "Bordeaux",
    budgetMin: 60,
    budgetMax: 120,
    status: "completed",
    offerCount: 5,
    createdAt: "2025-02-10",
    scheduledDate: "2025-02-15",
    description:
      "Jardin de 300m², haie de 20m à tailler des deux côtés. Pelouse à tondre et bordures à faire. Évacuation des déchets verts incluse.",
    clientId: 1,
    country: "FR",
  },
  {
    id: 4,
    title: "Peinture chambre enfant",
    category: "handytask",
    n2: "peinture-interieure",
    city: "Paris",
    budgetMin: 200,
    budgetMax: 400,
    status: "open",
    offerCount: 1,
    createdAt: "2025-02-22",
    scheduledDate: "2025-03-05",
    description:
      "Chambre de 15m² à repeindre entièrement. Actuellement en blanc, souhait de couleur bleue pastel. Deux fenêtres, une porte. Murs en bon état, pas de préparation spéciale nécessaire.",
    clientId: 3,
    country: "FR",
  },
  {
    id: 5,
    title: "Déménagement studio Paris",
    category: "demenagement",
    n2: "aide-demenagement",
    city: "Paris",
    budgetMin: 300,
    budgetMax: 600,
    status: "open",
    offerCount: 4,
    createdAt: "2025-02-23",
    scheduledDate: "2025-03-10",
    description:
      "Studio de 25m² au 3ème étage sans ascenseur. Déménagement vers appartement au 2ème avec ascenseur, même arrondissement. Environ 15 cartons + quelques meubles.",
    clientId: 2,
    country: "FR",
  },
  {
    id: 6,
    title: "Kitchen tap repair",
    category: "handytask",
    n2: "plombier-depannage",
    city: "Dublin",
    budgetMin: 80,
    budgetMax: 160,
    status: "open",
    offerCount: 2,
    createdAt: "2025-02-24",
    scheduledDate: "2025-03-03",
    description:
      "Dripping kitchen tap that needs replacing. The mixer tap has been leaking for a week. Looking for a reliable plumber available this week.",
    clientId: 1,
    country: "IE",
  },
  {
    id: 7,
    title: "Nettoyage appartement Bruxelles",
    category: "nettoyage",
    n2: "nettoyage-fin-location",
    city: "Bruxelles",
    budgetMin: 120,
    budgetMax: 250,
    status: "open",
    offerCount: 3,
    createdAt: "2025-02-25",
    scheduledDate: "2025-03-07",
    description:
      "Appartement 3 chambres à nettoyer en fin de bail. Nettoyage complet de toutes les pièces, cuisine, salle de bain, vitres intérieures. État des lieux prévu le 8 mars.",
    clientId: 1,
    country: "BE",
  },
];

export const demoOffers: DemoOffer[] = [
  {
    id: 1,
    taskId: 1,
    proId: 1,
    price: 95,
    description:
      "Je peux intervenir dès demain. J'ai toutes les pièces nécessaires en stock. Devis définitif après diagnostic sur place.",
    deliveryDays: 1,
    createdAt: "2025-02-21",
  },
  {
    id: 2,
    taskId: 1,
    proId: 2,
    price: 120,
    description:
      "Intervention sous 48h. Remplacement complet du siphon et vérification générale de la plomberie sous évier.",
    deliveryDays: 2,
    createdAt: "2025-02-21",
  },
  {
    id: 3,
    taskId: 2,
    proId: 2,
    price: 180,
    description:
      "Installation de 3 prises double conformes NF, vérification du tableau et mise aux normes si nécessaire.",
    deliveryDays: 3,
    createdAt: "2025-02-19",
  },
];

export const demoUsers: DemoUser[] = [
  {
    id: 1,
    role: "client",
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com",
    country: "FR",
    status: "active",
    createdAt: "2025-01-15",
  },
  {
    id: 2,
    role: "pro",
    firstName: "Marc",
    lastName: "Dubois",
    email: "marc.dubois@plomberie-dubois.fr",
    country: "FR",
    status: "verified",
    createdAt: "2025-01-10",
  },
  {
    id: 3,
    role: "admin",
    firstName: "Admin",
    lastName: "TaskVoilà",
    email: "admin@taskvoila.com",
    country: "FR",
    status: "active",
    createdAt: "2024-12-01",
  },
  {
    id: 4,
    role: "client",
    firstName: "Marie",
    lastName: "Lefebvre",
    email: "marie.lefebvre@example.com",
    country: "FR",
    status: "active",
    createdAt: "2025-02-01",
  },
  {
    id: 5,
    role: "pro",
    firstName: "Sophie",
    lastName: "Martin",
    email: "sophie.martin@electricite-martin.fr",
    country: "FR",
    status: "verified",
    createdAt: "2025-01-20",
  },
  {
    id: 6,
    role: "pro",
    firstName: "Pierre",
    lastName: "Bernard",
    email: "pierre.bernard@jardins-bernard.fr",
    country: "FR",
    status: "pending",
    createdAt: "2025-02-15",
  },
];

// ─── Disputes ────────────────────────────────────────────────────────────────
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

// ─── Reports ─────────────────────────────────────────────────────────────────
export type DemoReport = {
  id: number;
  type: "message" | "profile" | "mission";
  reporterId: number;
  reportedUserId: number;
  contentPreview: string;
  createdAt: string;
  status: "pending" | "resolved" | "dismissed";
};

export const demoDisputes: DemoDispute[] = [
  {
    id: 1,
    taskId: 2,
    clientId: 1,
    proId: 2,
    amount: 180,
    reason: "Travaux non conformes au devis",
    status: "pending",
    createdAt: "2025-02-26",
  },
  {
    id: 2,
    taskId: 4,
    clientId: 3,
    proId: 3,
    amount: 300,
    reason: "Pro ne répond plus aux messages",
    status: "pending",
    createdAt: "2025-02-28",
  },
];

export const demoReports: DemoReport[] = [
  {
    id: 1,
    type: "message",
    reporterId: 1,
    reportedUserId: 3,
    contentPreview:
      "Contenu signalé : tentative de partage de numéro de téléphone",
    createdAt: "2025-02-27",
    status: "pending",
  },
  {
    id: 2,
    type: "profile",
    reporterId: 2,
    reportedUserId: 4,
    contentPreview:
      "Description de profil contenant des liens externes non autorisés",
    createdAt: "2025-02-25",
    status: "pending",
  },
  {
    id: 3,
    type: "mission",
    reporterId: 1,
    reportedUserId: 2,
    contentPreview:
      "Description de mission trompeuse avec fausse adresse email",
    createdAt: "2025-02-24",
    status: "resolved",
  },
];

export function getProById(id: number): DemoPro | undefined {
  return demoPros.find((p) => p.id === id);
}

export function getTaskById(id: number): DemoTask | undefined {
  return demoTasks.find((t) => t.id === id);
}

export function getOffersForTask(taskId: number): DemoOffer[] {
  return demoOffers.filter((o) => o.taskId === taskId);
}

export function getProForOffer(offerId: number): DemoPro | undefined {
  const offer = demoOffers.find((o) => o.id === offerId);
  if (!offer) return undefined;
  return getProById(offer.proId);
}
