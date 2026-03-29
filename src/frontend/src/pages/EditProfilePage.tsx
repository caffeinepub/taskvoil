import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import {
  type Dac7FormValues,
  Dac7TaxSection,
  encryptIban,
} from "@/components/dac7/Dac7TaxSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type CurrentUser,
  isProfileComplete,
  useAuthStore,
} from "@/lib/auth-store";
import { useCountryStore } from "@/lib/country-store";
import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Globe,
  Info,
  Lock,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Upload,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const SERVICE_CATEGORIES = [
  "Bricolage",
  "Jardinage",
  "Ménage",
  "Livraison",
  "Montage",
  "Déménagement",
  "Informatique",
  "Cours",
  "Beauté",
  "Autres",
];

/** Country-specific legal field config */
type LegalField = {
  label: string;
  placeholder: string;
  key: keyof Pick<CurrentUser, "legalId" | "vatNumber">;
  required: boolean;
};

const COUNTRY_LEGAL: Record<string, LegalField[]> = {
  FR: [
    {
      label: "Numéro SIRET",
      placeholder: "12345678901234",
      key: "legalId",
      required: true,
    },
    {
      label: "N° TVA (optionnel)",
      placeholder: "FR12345678901",
      key: "vatNumber",
      required: false,
    },
  ],
  BE: [
    {
      label: "Numéro BCE",
      placeholder: "BE0123456789",
      key: "legalId",
      required: true,
    },
    {
      label: "N° TVA (optionnel)",
      placeholder: "BE0123456789",
      key: "vatNumber",
      required: false,
    },
  ],
  GB: [
    {
      label: "Companies House or UTR",
      placeholder: "12345678",
      key: "legalId",
      required: true,
    },
    {
      label: "VAT number (optional)",
      placeholder: "GB123456789",
      key: "vatNumber",
      required: false,
    },
  ],
  IE: [
    {
      label: "CRO or Tax Reference",
      placeholder: "123456",
      key: "legalId",
      required: true,
    },
    {
      label: "VAT number (optional)",
      placeholder: "IE1234567X",
      key: "vatNumber",
      required: false,
    },
  ],
  DE: [
    {
      label: "Handelsregister- oder Steuernummer",
      placeholder: "HRB 12345",
      key: "legalId",
      required: true,
    },
    {
      label: "USt-IdNr (optional)",
      placeholder: "DE123456789",
      key: "vatNumber",
      required: false,
    },
  ],
  CH: [
    {
      label: "Numéro UID (CHE-xxx.xxx.xxx)",
      placeholder: "CHE-123.456.789",
      key: "legalId",
      required: true,
    },
    {
      label: "MWST-Nummer (optionnel)",
      placeholder: "CHE-123.456.789 MWST",
      key: "vatNumber",
      required: false,
    },
  ],
  ES: [
    {
      label: "NIF / CIF",
      placeholder: "B12345678",
      key: "legalId",
      required: true,
    },
  ],
  NL: [
    {
      label: "KvK-nummer",
      placeholder: "12345678",
      key: "legalId",
      required: true,
    },
    {
      label: "BTW-nummer (optioneel)",
      placeholder: "NL123456789B01",
      key: "vatNumber",
      required: false,
    },
  ],
  IT: [
    {
      label: "Partita IVA",
      placeholder: "IT12345678901",
      key: "legalId",
      required: true,
    },
    {
      label: "Codice Fiscale",
      placeholder: "RSSMRA80A01H501U",
      key: "vatNumber",
      required: false,
    },
  ],
  PT: [
    {
      label: "NIF (Contribuinte)",
      placeholder: "123456789",
      key: "legalId",
      required: true,
    },
  ],
  GR: [
    { label: "ΑΦΜ", placeholder: "123456789", key: "legalId", required: true },
  ],
  LU: [
    {
      label: "Numéro d'identification fiscale (NIF Luxembourg)",
      placeholder: "1234567890123",
      key: "legalId",
      required: true,
    },
    {
      label: "N° TVA (optionnel)",
      placeholder: "LU12345678",
      key: "vatNumber",
      required: false,
    },
  ],
};

/** Country-specific registration document names */
const REGISTRATION_DOC_NAME: Record<string, string> = {
  FR: "Extrait Kbis",
  BE: "Extrait BCE",
  GB: "Certificate of Incorporation",
  IE: "Certificate of Incorporation",
  DE: "Handelsregisterauszug",
  ES: "Certificado del Registro Mercantil",
  IT: "Visura camerale",
  PT: "Certidão Permanente",
  NL: "KvK-uittreksel",
  GR: "Βεβαίωση ΓΕΜΗ",
  CH: "Handelsregisterauszug",
  LU: "Extrait RCS Luxembourg",
};

const LABELS: Record<
  string,
  {
    title: string;
    subtitle: string;
    publicSection: string;
    privateSection: string;
    privateNote: string;
    proSection: string;
    proLegalNote: string;
    pseudo: string;
    role: string;
    roleClient: string;
    rolePro: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    companyName: string;
    businessDesc: string;
    categories: string;
    coverage: string;
    website: string;
    save: string;
    saving: string;
    saved: string;
    required: string;
    back: string;
    // Verification section
    verificationSection: string;
    idDocLabel: string;
    idDocHint: string;
    regDocHint: string;
    uploadBtn: string;
    uploading: string;
    uploadSuccess: string;
    verificationPending: string;
    verificationVerified: string;
    verificationRejected: string;
    maxSizeError: string;
    formatError: string;
    // Placeholders
    pseudoPlaceholder: string;
    phonePlaceholder: string;
    addressPlaceholder: string;
    postalCodePlaceholder: string;
    cityPlaceholder: string;
    companyPlaceholder: string;
    businessDescPlaceholder: string;
    coveragePlaceholder: string;
    coverageUnit: string;
    websitePlaceholder: string;
    coverageHelp: string;
  }
> = {
  fr: {
    title: "Mon profil",
    subtitle: "Renseignez vos informations pour pouvoir utiliser la plateforme",
    publicSection: "Informations publiques",
    privateSection: "Informations privées",
    privateNote:
      "Ces informations sont privées et ne seront partagées qu'après acceptation d'un devis",
    proSection: "Informations professionnelles",
    proLegalNote:
      "Ces informations sont requises pour travailler légalement en tant que professionnel dans votre pays.",
    pseudo: "Pseudo (affiché publiquement)",
    role: "Rôle",
    roleClient: "Particulier",
    rolePro: "Professionnel",
    firstName: "Prénom",
    lastName: "Nom de famille",
    phone: "Téléphone",
    address: "Adresse (rue, numéro)",
    postalCode: "Code postal",
    city: "Ville",
    country: "Pays",
    companyName: "Nom de l'entreprise / Raison sociale",
    businessDesc: "Description de l'activité",
    categories: "Catégories de services",
    coverage: "Zone d'intervention",
    website: "Site web",
    save: "Enregistrer mon profil",
    saving: "Enregistrement...",
    saved: "Profil enregistré !",
    required: "Champ obligatoire",
    back: "Retour",
    verificationSection: "Vérification du compte",
    idDocLabel: "Pièce d'identité",
    idDocHint: "Passeport, carte nationale d'identité ou permis de conduire",
    regDocHint: "Document officiel d'immatriculation de votre entreprise",
    uploadBtn: "Choisir un fichier",
    uploading: "Téléversement en cours...",
    uploadSuccess: "Fichier ajouté ✓",
    verificationPending: "En attente de vérification",
    verificationVerified: "Compte vérifié",
    verificationRejected: "Documents rejetés — veuillez re-téléverser",
    maxSizeError: "Fichier trop volumineux (max 10 Mo)",
    formatError: "Format non accepté (PDF, JPG, PNG, WEBP uniquement)",
    pseudoPlaceholder: "BricoBob, JardinierPro…",
    phonePlaceholder: "+33 6 12 34 56 78",
    addressPlaceholder: "12 rue de la Paix",
    postalCodePlaceholder: "75001",
    cityPlaceholder: "Paris",
    companyPlaceholder: "Mon Entreprise SARL",
    businessDescPlaceholder:
      "Décrivez votre activité, expérience, spécialités…",
    coveragePlaceholder: "Paris et Île-de-France",
    coverageUnit: "km",
    websitePlaceholder: "https://monsite.fr",
    coverageHelp: "Rayon maximal autour de votre ville",
  },
  en: {
    title: "My profile",
    subtitle: "Fill in your information to use the platform",
    publicSection: "Public information",
    privateSection: "Private information",
    privateNote:
      "This information is private and will only be shared after a quote is accepted",
    proSection: "Professional information",
    proLegalNote:
      "This information is required to work legally as a professional in your country.",
    pseudo: "Nickname (publicly displayed)",
    role: "Role",
    roleClient: "Individual",
    rolePro: "Professional",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    address: "Address (street, number)",
    postalCode: "Postal code",
    city: "City",
    country: "Country",
    companyName: "Company name / Legal name",
    businessDesc: "Business description",
    categories: "Service categories",
    coverage: "Coverage area",
    website: "Website",
    save: "Save my profile",
    saving: "Saving...",
    saved: "Profile saved!",
    required: "Required field",
    back: "Back",
    verificationSection: "Account verification",
    idDocLabel: "Identity document",
    idDocHint: "Passport, national identity card or driving licence",
    regDocHint: "Official business registration document",
    uploadBtn: "Choose a file",
    uploading: "Uploading...",
    uploadSuccess: "File added ✓",
    verificationPending: "Awaiting verification",
    verificationVerified: "Account verified",
    verificationRejected: "Documents rejected — please re-upload",
    maxSizeError: "File too large (max 10 MB)",
    formatError: "Unsupported format (PDF, JPG, PNG, WEBP only)",
    pseudoPlaceholder: "HandyBob, GardenPro…",
    phonePlaceholder: "+44 7700 900000",
    addressPlaceholder: "12 High Street",
    postalCodePlaceholder: "SW1A 1AA",
    cityPlaceholder: "London",
    companyPlaceholder: "My Company Ltd",
    businessDescPlaceholder:
      "Describe your activity, experience, specialities…",
    coveragePlaceholder: "London and surroundings",
    coverageUnit: "miles",
    websitePlaceholder: "https://mywebsite.co.uk",
    coverageHelp: "Maximum radius around your city",
  },
  ie: {
    title: "My profile",
    subtitle: "Fill in your information to use the platform",
    publicSection: "Public information",
    privateSection: "Private information",
    privateNote:
      "This information is private and will only be shared after a quote is accepted",
    proSection: "Professional information",
    proLegalNote:
      "This information is required to work legally as a professional in your country.",
    pseudo: "Nickname (publicly displayed)",
    role: "Role",
    roleClient: "Individual",
    rolePro: "Professional",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    address: "Address (street, number)",
    postalCode: "Postal code",
    city: "City",
    country: "Country",
    companyName: "Company name / Legal name",
    businessDesc: "Business description",
    categories: "Service categories",
    coverage: "Coverage area",
    website: "Website",
    save: "Save my profile",
    saving: "Saving...",
    saved: "Profile saved!",
    required: "Required field",
    back: "Back",
    verificationSection: "Account verification",
    idDocLabel: "Identity document",
    idDocHint: "Passport, national identity card or driving licence",
    regDocHint: "Official business registration document",
    uploadBtn: "Choose a file",
    uploading: "Uploading...",
    uploadSuccess: "File added ✓",
    verificationPending: "Awaiting verification",
    verificationVerified: "Account verified",
    verificationRejected: "Documents rejected — please re-upload",
    maxSizeError: "File too large (max 10 MB)",
    formatError: "Unsupported format (PDF, JPG, PNG, WEBP only)",
    pseudoPlaceholder: "HandyPat, GardenPro…",
    phonePlaceholder: "+353 85 000 0000",
    addressPlaceholder: "12 Main Street",
    postalCodePlaceholder: "D01 A000",
    cityPlaceholder: "Dublin",
    companyPlaceholder: "My Business Ltd",
    businessDescPlaceholder:
      "Describe your activity, experience, specialities…",
    coveragePlaceholder: "Dublin and surroundings",
    coverageUnit: "miles",
    websitePlaceholder: "https://mywebsite.ie",
    coverageHelp: "Maximum radius around your city",
  },
  de: {
    title: "Mein Profil",
    subtitle: "Füllen Sie Ihre Angaben aus, um die Plattform nutzen zu können",
    publicSection: "Öffentliche Informationen",
    privateSection: "Private Informationen",
    privateNote:
      "Diese Angaben sind privat und werden nur nach Annahme eines Angebots weitergegeben",
    proSection: "Berufliche Informationen",
    proLegalNote:
      "Diese Angaben sind erforderlich, um in Ihrem Land legal als Fachmann zu arbeiten.",
    pseudo: "Benutzername (öffentlich sichtbar)",
    role: "Rolle",
    roleClient: "Privatperson",
    rolePro: "Fachmann",
    firstName: "Vorname",
    lastName: "Nachname",
    phone: "Telefon",
    address: "Adresse (Straße, Hausnummer)",
    postalCode: "Postleitzahl",
    city: "Stadt",
    country: "Land",
    companyName: "Firmenname / Handelsname",
    businessDesc: "Beschreibung der Tätigkeit",
    categories: "Servicekategorien",
    coverage: "Einsatzgebiet",
    website: "Website",
    save: "Profil speichern",
    saving: "Wird gespeichert...",
    saved: "Profil gespeichert!",
    required: "Pflichtfeld",
    back: "Zurück",
    verificationSection: "Kontoüberprüfung",
    idDocLabel: "Ausweisdokument",
    idDocHint: "Reisepass, Personalausweis oder Führerschein",
    regDocHint: "Offizielles Handelsregisterauszug Ihres Unternehmens",
    uploadBtn: "Datei auswählen",
    uploading: "Wird hochgeladen...",
    uploadSuccess: "Datei hinzugefügt ✓",
    verificationPending: "Verifizierung ausstehend",
    verificationVerified: "Konto verifiziert",
    verificationRejected: "Dokumente abgelehnt — bitte erneut hochladen",
    maxSizeError: "Datei zu groß (max. 10 MB)",
    formatError: "Format nicht unterstützt (nur PDF, JPG, PNG, WEBP)",
    pseudoPlaceholder: "HandwerkerBob, GärtnerPro…",
    phonePlaceholder: "+49 30 00000000",
    addressPlaceholder: "Hauptstraße 12",
    postalCodePlaceholder: "10115",
    cityPlaceholder: "Berlin",
    companyPlaceholder: "Mein Betrieb GmbH",
    businessDescPlaceholder:
      "Beschreiben Sie Ihre Tätigkeit, Erfahrung, Spezialgebiete…",
    coveragePlaceholder: "Berlin und Umgebung",
    coverageUnit: "km",
    websitePlaceholder: "https://meine-webseite.de",
    coverageHelp: "Maximaler Radius um Ihre Stadt",
  },
  es: {
    title: "Mi perfil",
    subtitle: "Rellena tu información para poder usar la plataforma",
    publicSection: "Información pública",
    privateSection: "Información privada",
    privateNote:
      "Esta información es privada y solo se compartirá tras la aceptación de un presupuesto",
    proSection: "Información profesional",
    proLegalNote:
      "Esta información es necesaria para trabajar legalmente como profesional en tu país.",
    pseudo: "Apodo (visible públicamente)",
    role: "Rol",
    roleClient: "Particular",
    rolePro: "Profesional",
    firstName: "Nombre",
    lastName: "Apellidos",
    phone: "Teléfono",
    address: "Dirección (calle, número)",
    postalCode: "Código postal",
    city: "Ciudad",
    country: "País",
    companyName: "Nombre de empresa / Razón social",
    businessDesc: "Descripción de la actividad",
    categories: "Categorías de servicios",
    coverage: "Área de cobertura",
    website: "Sitio web",
    save: "Guardar mi perfil",
    saving: "Guardando...",
    saved: "¡Perfil guardado!",
    required: "Campo obligatorio",
    back: "Volver",
    verificationSection: "Verificación de cuenta",
    idDocLabel: "Documento de identidad",
    idDocHint: "Pasaporte, DNI o permiso de conducir",
    regDocHint: "Documento oficial de registro mercantil de tu empresa",
    uploadBtn: "Elegir archivo",
    uploading: "Subiendo...",
    uploadSuccess: "Archivo añadido ✓",
    verificationPending: "Verificación pendiente",
    verificationVerified: "Cuenta verificada",
    verificationRejected: "Documentos rechazados — vuelve a subirlos",
    maxSizeError: "Archivo demasiado grande (máx. 10 MB)",
    formatError: "Formato no admitido (solo PDF, JPG, PNG, WEBP)",
    pseudoPlaceholder: "BricoJuan, JardinPro…",
    phonePlaceholder: "+34 600 000 000",
    addressPlaceholder: "Calle Mayor, 12",
    postalCodePlaceholder: "28001",
    cityPlaceholder: "Madrid",
    companyPlaceholder: "Mi Empresa S.L.",
    businessDescPlaceholder:
      "Describe tu actividad, experiencia, especialidades…",
    coveragePlaceholder: "Madrid y alrededores",
    coverageUnit: "km",
    websitePlaceholder: "https://miweb.es",
    coverageHelp: "Radio máximo alrededor de tu ciudad",
  },
  it: {
    title: "Il mio profilo",
    subtitle: "Compila le tue informazioni per utilizzare la piattaforma",
    publicSection: "Informazioni pubbliche",
    privateSection: "Informazioni private",
    privateNote:
      "Queste informazioni sono private e verranno condivise solo dopo l'accettazione di un preventivo",
    proSection: "Informazioni professionali",
    proLegalNote:
      "Queste informazioni sono necessarie per lavorare legalmente come professionista nel tuo paese.",
    pseudo: "Nickname (visibile pubblicamente)",
    role: "Ruolo",
    roleClient: "Privato",
    rolePro: "Professionista",
    firstName: "Nome",
    lastName: "Cognome",
    phone: "Telefono",
    address: "Indirizzo (via, numero)",
    postalCode: "Codice postale",
    city: "Città",
    country: "Paese",
    companyName: "Nome azienda / Ragione sociale",
    businessDesc: "Descrizione dell'attività",
    categories: "Categorie di servizi",
    coverage: "Area di intervento",
    website: "Sito web",
    save: "Salva il mio profilo",
    saving: "Salvataggio in corso...",
    saved: "Profilo salvato!",
    required: "Campo obbligatorio",
    back: "Indietro",
    verificationSection: "Verifica account",
    idDocLabel: "Documento d'identità",
    idDocHint: "Passaporto, carta d'identità o patente di guida",
    regDocHint: "Documento ufficiale di iscrizione della tua impresa",
    uploadBtn: "Scegli file",
    uploading: "Caricamento in corso...",
    uploadSuccess: "File aggiunto ✓",
    verificationPending: "Verifica in attesa",
    verificationVerified: "Account verificato",
    verificationRejected: "Documenti rifiutati — ricaricali",
    maxSizeError: "File troppo grande (max 10 MB)",
    formatError: "Formato non supportato (solo PDF, JPG, PNG, WEBP)",
    pseudoPlaceholder: "BricoLuca, GiardinieroPro…",
    phonePlaceholder: "+39 320 000 0000",
    addressPlaceholder: "Via Roma, 12",
    postalCodePlaceholder: "00100",
    cityPlaceholder: "Roma",
    companyPlaceholder: "La Mia Azienda S.r.l.",
    businessDescPlaceholder:
      "Descrivi la tua attività, esperienza, specializzazioni…",
    coveragePlaceholder: "Roma e dintorni",
    coverageUnit: "km",
    websitePlaceholder: "https://miositoweb.it",
    coverageHelp: "Raggio massimo intorno alla tua città",
  },
  pt: {
    title: "O meu perfil",
    subtitle: "Preenche as tuas informações para utilizar a plataforma",
    publicSection: "Informações públicas",
    privateSection: "Informações privadas",
    privateNote:
      "Estas informações são privadas e só serão partilhadas após aceitação de um orçamento",
    proSection: "Informações profissionais",
    proLegalNote:
      "Estas informações são necessárias para trabalhar legalmente como profissional no teu país.",
    pseudo: "Nickname (visível publicamente)",
    role: "Papel",
    roleClient: "Particular",
    rolePro: "Profissional",
    firstName: "Nome próprio",
    lastName: "Apelido",
    phone: "Telefone",
    address: "Morada (rua, número)",
    postalCode: "Código postal",
    city: "Cidade",
    country: "País",
    companyName: "Nome da empresa / Denominação social",
    businessDesc: "Descrição da atividade",
    categories: "Categorias de serviços",
    coverage: "Área de cobertura",
    website: "Website",
    save: "Guardar o meu perfil",
    saving: "A guardar...",
    saved: "Perfil guardado!",
    required: "Campo obrigatório",
    back: "Voltar",
    verificationSection: "Verificação da conta",
    idDocLabel: "Documento de identidade",
    idDocHint: "Passaporte, cartão de cidadão ou carta de condução",
    regDocHint: "Documento oficial de registo da tua empresa",
    uploadBtn: "Escolher ficheiro",
    uploading: "A carregar...",
    uploadSuccess: "Ficheiro adicionado ✓",
    verificationPending: "Aguardando verificação",
    verificationVerified: "Conta verificada",
    verificationRejected: "Documentos rejeitados — por favor recarrega",
    maxSizeError: "Ficheiro demasiado grande (máx. 10 MB)",
    formatError: "Formato não aceite (apenas PDF, JPG, PNG, WEBP)",
    pseudoPlaceholder: "BricoJoão, JardineiroPro…",
    phonePlaceholder: "+351 910 000 000",
    addressPlaceholder: "Rua da Paz, 12",
    postalCodePlaceholder: "1000-001",
    cityPlaceholder: "Lisboa",
    companyPlaceholder: "A Minha Empresa Lda.",
    businessDescPlaceholder:
      "Descreve a tua atividade, experiência, especialidades…",
    coveragePlaceholder: "Lisboa e arredores",
    coverageUnit: "km",
    websitePlaceholder: "https://meusitenaweb.pt",
    coverageHelp: "Raio máximo à volta da tua cidade",
  },
  nl: {
    title: "Mijn profiel",
    subtitle: "Vul uw gegevens in om het platform te kunnen gebruiken",
    publicSection: "Openbare informatie",
    privateSection: "Privé-informatie",
    privateNote:
      "Deze informatie is privé en wordt alleen gedeeld na acceptatie van een offerte",
    proSection: "Professionele informatie",
    proLegalNote:
      "Deze informatie is vereist om legaal als professional in uw land te werken.",
    pseudo: "Gebruikersnaam (publiek zichtbaar)",
    role: "Rol",
    roleClient: "Particulier",
    rolePro: "Professional",
    firstName: "Voornaam",
    lastName: "Achternaam",
    phone: "Telefoon",
    address: "Adres (straat, huisnummer)",
    postalCode: "Postcode",
    city: "Stad",
    country: "Land",
    companyName: "Bedrijfsnaam / Handelsnaam",
    businessDesc: "Beschrijving van de activiteit",
    categories: "Servicecategorieën",
    coverage: "Werkgebied",
    website: "Website",
    save: "Mijn profiel opslaan",
    saving: "Opslaan...",
    saved: "Profiel opgeslagen!",
    required: "Verplicht veld",
    back: "Terug",
    verificationSection: "Accountverificatie",
    idDocLabel: "Identiteitsbewijs",
    idDocHint: "Paspoort, identiteitskaart of rijbewijs",
    regDocHint: "Officieel registratiedocument van uw onderneming",
    uploadBtn: "Bestand kiezen",
    uploading: "Bezig met uploaden...",
    uploadSuccess: "Bestand toegevoegd ✓",
    verificationPending: "Verificatie in behandeling",
    verificationVerified: "Account geverifieerd",
    verificationRejected: "Documenten afgewezen — upload opnieuw",
    maxSizeError: "Bestand te groot (max. 10 MB)",
    formatError: "Formaat niet ondersteund (alleen PDF, JPG, PNG, WEBP)",
    pseudoPlaceholder: "KlusserJan, HovenierPro…",
    phonePlaceholder: "+31 6 00000000",
    addressPlaceholder: "Hoofdstraat 12",
    postalCodePlaceholder: "1000 AA",
    cityPlaceholder: "Amsterdam",
    companyPlaceholder: "Mijn Bedrijf BV",
    businessDescPlaceholder:
      "Beschrijf uw activiteit, ervaring, specialiteiten…",
    coveragePlaceholder: "Amsterdam en omgeving",
    coverageUnit: "km",
    websitePlaceholder: "https://mijnwebsite.nl",
    coverageHelp: "Maximale straal rondom uw stad",
  },
  el: {
    title: "Το προφίλ μου",
    subtitle:
      "Συμπληρώστε τις πληροφορίες σας για να χρησιμοποιήσετε την πλατφόρμα",
    publicSection: "Δημόσιες πληροφορίες",
    privateSection: "Ιδιωτικές πληροφορίες",
    privateNote:
      "Αυτές οι πληροφορίες είναι ιδιωτικές και θα κοινοποιηθούν μόνο μετά την αποδοχή προσφοράς",
    proSection: "Επαγγελματικές πληροφορίες",
    proLegalNote:
      "Αυτές οι πληροφορίες απαιτούνται για να εργαστείτε νόμιμα ως επαγγελματίας στη χώρα σας.",
    pseudo: "Ψευδώνυμο (δημόσια ορατό)",
    role: "Ρόλος",
    roleClient: "Ιδιώτης",
    rolePro: "Επαγγελματίας",
    firstName: "Όνομα",
    lastName: "Επίθετο",
    phone: "Τηλέφωνο",
    address: "Διεύθυνση (οδός, αριθμός)",
    postalCode: "Ταχυδρομικός κώδικας",
    city: "Πόλη",
    country: "Χώρα",
    companyName: "Επωνυμία επιχείρησης",
    businessDesc: "Περιγραφή δραστηριότητας",
    categories: "Κατηγορίες υπηρεσιών",
    coverage: "Περιοχή κάλυψης",
    website: "Ιστότοπος",
    save: "Αποθήκευση προφίλ",
    saving: "Αποθήκευση...",
    saved: "Το προφίλ αποθηκεύτηκε!",
    required: "Υποχρεωτικό πεδίο",
    back: "Πίσω",
    verificationSection: "Επαλήθευση λογαριασμού",
    idDocLabel: "Έγγραφο ταυτότητας",
    idDocHint: "Διαβατήριο, αστυνομική ταυτότητα ή δίπλωμα οδήγησης",
    regDocHint: "Επίσημο έγγραφο εγγραφής της επιχείρησής σας",
    uploadBtn: "Επιλογή αρχείου",
    uploading: "Μεταφόρτωση...",
    uploadSuccess: "Το αρχείο προστέθηκε ✓",
    verificationPending: "Αναμονή επαλήθευσης",
    verificationVerified: "Ο λογαριασμός επαληθεύτηκε",
    verificationRejected: "Τα έγγραφα απορρίφθηκαν — παρακαλώ επαναφορτώστε",
    maxSizeError: "Το αρχείο είναι πολύ μεγάλο (μέγ. 10 MB)",
    formatError: "Μη υποστηριζόμενη μορφή (μόνο PDF, JPG, PNG, WEBP)",
    pseudoPlaceholder: "ΤεχνικόςΒοβ, ΚηπουρόςΠρο…",
    phonePlaceholder: "+30 210 0000000",
    addressPlaceholder: "Οδός Αθηνάς, 12",
    postalCodePlaceholder: "10552",
    cityPlaceholder: "Αθήνα",
    companyPlaceholder: "Η Εταιρεία μου ΕΠΕ",
    businessDescPlaceholder:
      "Περιγράψτε τη δραστηριότητα, εμπειρία, ειδικότητές σας…",
    coveragePlaceholder: "Αθήνα και περίχωρα",
    coverageUnit: "km",
    websitePlaceholder: "https://mywebsite.gr",
    coverageHelp: "Μέγιστη ακτίνα γύρω από την πόλη σας",
  },
};

const ACCEPTED_TYPES = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
const ACCEPTED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type UploadState = {
  file: File | null;
  url: string | null;
  progress: number; // 0-100
  uploading: boolean;
  error: string | null;
};

const INITIAL_UPLOAD: UploadState = {
  file: null,
  url: null,
  progress: 0,
  uploading: false,
  error: null,
};

function SectionHeader({
  icon,
  title,
}: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <h2 className="font-display font-bold text-base text-foreground">
        {title}
      </h2>
    </div>
  );
}

type UploadZoneProps = {
  label: string;
  hint: string;
  state: UploadState;
  uploadBtnLabel: string;
  uploadingLabel: string;
  uploadSuccessLabel: string;
  onFileChange: (file: File) => void;
  onClear: () => void;
  inputId: string;
  ocid: string;
  errorMaxSize: string;
  errorFormat: string;
  onError: (msg: string) => void;
};

function UploadZone({
  label,
  hint,
  state,
  uploadBtnLabel,
  uploadingLabel,
  uploadSuccessLabel,
  onFileChange,
  onClear,
  inputId,
  ocid,
  errorMaxSize,
  errorFormat,
  onError,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate format
    if (!ACCEPTED_MIME.includes(file.type)) {
      onError(errorFormat);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      onError(errorMaxSize);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    onFileChange(file);
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">
        {label} <span className="text-destructive">*</span>
      </Label>
      <p className="text-xs text-muted-foreground">{hint}</p>

      {/* File already loaded */}
      {state.file && !state.uploading ? (
        <div className="flex items-center gap-3 rounded-xl border border-green-300 bg-green-50 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800 truncate">
              {state.file.name}
            </p>
            <p className="text-xs text-green-600">
              {formatFileSize(state.file.size)} — {uploadSuccessLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-green-600 hover:text-green-800 transition-colors shrink-0"
            data-ocid={`${ocid}.close_button`}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : state.uploading ? (
        /* Upload in progress */
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-amber-600 animate-bounce shrink-0" />
            <p className="text-sm font-medium text-amber-700">
              {uploadingLabel}
            </p>
          </div>
          <Progress value={state.progress} className="h-1.5" />
          <p className="text-xs text-amber-600 text-right">{state.progress}%</p>
        </div>
      ) : (
        /* Drop zone / picker */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-400 transition-colors px-4 py-5 flex flex-col items-center gap-2 cursor-pointer"
          data-ocid={`${ocid}.upload_button`}
        >
          <Upload className="h-7 w-7 text-amber-500" />
          <span className="text-sm font-semibold text-amber-700">
            {uploadBtnLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            PDF, JPG, PNG, WEBP — max 10 Mo
          </span>
        </button>
      )}

      {/* Error message */}
      {state.error && (
        <p
          className="text-xs text-destructive flex items-center gap-1"
          data-ocid={`${ocid}.error_state`}
        >
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          {state.error}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

export function EditProfilePage() {
  const { currentUser, loginUser } = useAuthStore();
  const { selectedCountry } = useCountryStore();
  const { lang } = useTranslation();
  const navigate = useNavigate();

  const lbl = LABELS[lang] ?? LABELS.en;
  const countryCode = selectedCountry ?? currentUser?.country ?? "FR";
  const legalFields = COUNTRY_LEGAL[countryCode] ?? [];
  const registrationDocName =
    REGISTRATION_DOC_NAME[countryCode] ?? "Registration document";

  const [form, setForm] = useState({
    pseudo: currentUser?.pseudo ?? "",
    firstName: currentUser?.firstName ?? "",
    lastName: currentUser?.lastName ?? "",
    phone: currentUser?.phone ?? "",
    address: currentUser?.address ?? "",
    postalCode: currentUser?.postalCode ?? "",
    city: currentUser?.city ?? "",
    fullAddress: currentUser?.fullAddress ?? "",
    companyName: currentUser?.companyName ?? "",
    businessDescription: currentUser?.businessDescription ?? "",
    serviceCategories: currentUser?.serviceCategories ?? ([] as string[]),
    coverageArea: currentUser?.coverageArea ?? "",
    website: currentUser?.website ?? "",
    legalId: currentUser?.legalId ?? "",
    vatNumber: currentUser?.vatNumber ?? "",
  });

  const [dac7Values, setDac7Values] = useState<Dac7FormValues>({
    proStatus: currentUser?.proStatus ?? "",
    taxId: currentUser?.taxId ?? "",
    vatNumber: currentUser?.vatNumber ?? "",
    dateOfBirth: currentUser?.dateOfBirth ?? "",
    taxResidenceCountry: currentUser?.taxResidenceCountry ?? countryCode,
    ibanRaw: "", // never persist decrypted IBAN in state from store
    ibanLocked: currentUser?.ibanLocked ?? false,
    dac7Accepted: currentUser?.dac7Accepted ?? false,
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Document upload state
  const [idDoc, setIdDoc] = useState<UploadState>({
    ...INITIAL_UPLOAD,
    url: currentUser?.idDocumentUrl ?? null,
  });
  const [regDoc, setRegDoc] = useState<UploadState>({
    ...INITIAL_UPLOAD,
    url: currentUser?.registrationDocUrl ?? null,
  });

  if (!currentUser) {
    void navigate({ to: "/login" });
    return null;
  }

  const isPro = currentUser?.role === "pro";
  const profileAlreadyComplete = isProfileComplete(currentUser);
  const verificationStatus = currentUser?.verificationStatus;

  function handleUpload(
    file: File,
    setter: React.Dispatch<React.SetStateAction<UploadState>>,
    urlField: "idDocumentUrl" | "registrationDocUrl",
  ) {
    setter({ file, url: null, progress: 0, uploading: true, error: null });
    // Read file locally and store as object URL (backend storage pending)
    const objectUrl = URL.createObjectURL(file);
    setter({
      file,
      url: objectUrl,
      progress: 100,
      uploading: false,
      error: null,
    });
    loginUser({ ...(currentUser as CurrentUser), [urlField]: objectUrl });
  }

  function toggleCategory(cat: string) {
    setForm((prev) => ({
      ...prev,
      serviceCategories: prev.serviceCategories.includes(cat)
        ? prev.serviceCategories.filter((c) => c !== cat)
        : [...prev.serviceCategories, cat],
    }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.pseudo.trim()) errs.pseudo = lbl.required;
    if (!form.firstName.trim()) errs.firstName = lbl.required;
    if (!form.lastName.trim()) errs.lastName = lbl.required;
    if (!form.phone.trim()) errs.phone = lbl.required;
    if (!form.address.trim()) errs.address = lbl.required;
    if (!form.postalCode.trim()) errs.postalCode = lbl.required;
    if (!form.city.trim()) errs.city = lbl.required;
    if (isPro && !form.companyName.trim()) errs.companyName = lbl.required;
    // Required legal fields for pro
    for (const field of legalFields) {
      if (field.required && field.key === "legalId" && !form.legalId.trim()) {
        errs.legalId = lbl.required;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate() || !currentUser) return;
    const user = currentUser;
    setSaving(true);
    try {
      // Encrypt IBAN if provided
      let encryptedIban = user.iban;
      if (isPro && dac7Values.ibanRaw.trim()) {
        const principal = user.icpPrincipal ?? String(user.id);
        encryptedIban = await encryptIban(dac7Values.ibanRaw.trim(), principal);
      }

      const updatedUser: CurrentUser = {
        ...user,
        pseudo: form.pseudo.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        postalCode: form.postalCode.trim(),
        city: form.city.trim(),
        fullAddress: form.fullAddress.trim() || undefined,
        ...(isPro && {
          companyName: form.companyName.trim(),
          businessDescription: form.businessDescription.trim(),
          serviceCategories: form.serviceCategories,
          coverageArea: form.coverageArea.trim(),
          website: form.website.trim(),
          legalId: form.legalId.trim() || dac7Values.taxId.trim(),
          vatNumber: dac7Values.vatNumber.trim() || form.vatNumber.trim(),
          // DAC7 fields
          proStatus: dac7Values.proStatus,
          taxId: dac7Values.taxId.trim(),
          dateOfBirth: dac7Values.dateOfBirth,
          taxResidenceCountry: dac7Values.taxResidenceCountry,
          iban: encryptedIban,
          ibanLocked: dac7Values.ibanRaw.trim() ? true : user.ibanLocked,
          dac7Accepted: dac7Values.dac7Accepted,
        }),
        idDocumentUrl: idDoc.url ?? user.idDocumentUrl,
        registrationDocUrl: regDoc.url ?? user.registrationDocUrl,
      };
      updatedUser.profileComplete = isProfileComplete(updatedUser);
      loginUser(updatedUser);
      toast.success(lbl.saved);
      setTimeout(() => {
        if (user.role === "client") {
          void navigate({ to: "/dashboard/client" });
        } else if (user.role === "pro") {
          void navigate({ to: "/dashboard/pro" });
        }
      }, 800);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => void navigate({ to: "/" })}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="profile.edit.back"
          >
            <ArrowLeft className="h-4 w-4" />
            {lbl.back}
          </button>
        </div>

        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {lbl.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{lbl.subtitle}</p>
          {!profileAlreadyComplete && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              ⚠️ {LABELS[lang]?.privateNote ?? LABELS.en.privateNote}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* ── Section 1: Public info ── */}
          <div
            className="rounded-2xl bg-white border border-border/60 shadow-sm p-5"
            data-ocid="profile.public.panel"
          >
            <SectionHeader
              icon={<User className="h-5 w-5 text-primary" />}
              title={lbl.publicSection}
            />
            <div className="space-y-1.5 mb-4">
              <Label htmlFor="pseudo" className="text-sm font-semibold">
                {lbl.pseudo} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pseudo"
                value={form.pseudo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, pseudo: e.target.value }))
                }
                placeholder={lbl.pseudoPlaceholder}
                data-ocid="profile.pseudo.input"
              />
              {errors.pseudo && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="profile.pseudo.error"
                >
                  {errors.pseudo}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">{lbl.role}</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {isPro ? lbl.rolePro : lbl.roleClient}
                </span>
              </div>
            </div>
          </div>

          {/* ── Section 2: Private info ── */}
          <div
            className="rounded-2xl bg-white border border-border/60 shadow-sm p-5"
            data-ocid="profile.private.panel"
          >
            <SectionHeader
              icon={<Lock className="h-5 w-5 text-primary" />}
              title={lbl.privateSection}
            />
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {lbl.privateNote}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm font-semibold">
                  {lbl.firstName} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                  data-ocid="profile.firstname.input"
                />
                {errors.firstName && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="profile.firstname.error"
                  >
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-semibold">
                  {lbl.lastName} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                  data-ocid="profile.lastname.input"
                />
                {errors.lastName && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="profile.lastname.error"
                  >
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5 mt-4">
              <Label htmlFor="phone" className="text-sm font-semibold">
                <Phone className="inline h-3.5 w-3.5 mr-1" />
                {lbl.phone} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder={lbl.phonePlaceholder}
                data-ocid="profile.phone.input"
              />
              {errors.phone && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="profile.phone.error"
                >
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="space-y-1.5 mt-4">
              <Label htmlFor="address" className="text-sm font-semibold">
                <MapPin className="inline h-3.5 w-3.5 mr-1" />
                {lbl.address} <span className="text-destructive">*</span>
              </Label>
              <AddressAutocomplete
                id="address"
                value={form.address}
                onChange={(val) => setForm((p) => ({ ...p, address: val }))}
                onSelect={(result) => {
                  setForm((p) => ({
                    ...p,
                    address: result.display_name,
                    postalCode: result.address.postcode ?? p.postalCode,
                    city:
                      result.address.city ??
                      result.address.town ??
                      result.address.village ??
                      p.city,
                  }));
                }}
                placeholder={lbl.addressPlaceholder}
                countryCode={countryCode.toLowerCase()}
                data-ocid="profile.address.input"
              />
              {errors.address && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="profile.address.error"
                >
                  {errors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="postalCode" className="text-sm font-semibold">
                  {lbl.postalCode} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="postalCode"
                  value={form.postalCode}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, postalCode: e.target.value }))
                  }
                  placeholder={lbl.postalCodePlaceholder}
                  data-ocid="profile.postalcode.input"
                />
                {errors.postalCode && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="profile.postalcode.error"
                  >
                    {errors.postalCode}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-sm font-semibold">
                  {lbl.city} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, city: e.target.value }))
                  }
                  placeholder={lbl.cityPlaceholder}
                  data-ocid="profile.city.input"
                />
                {errors.city && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="profile.city.error"
                  >
                    {errors.city}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5 mt-4">
              <Label className="text-sm font-semibold">{lbl.country}</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {countryCode}
                </span>
              </div>
            </div>

            {/* Full address (private, required before posting a task) */}
            {!isPro && (
              <div className="space-y-1.5 mt-4">
                <Label
                  htmlFor="fullAddress"
                  className="text-sm font-semibold flex items-center gap-1"
                >
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {lang === "fr"
                    ? "Adresse complète (rue + code postal)"
                    : lang === "de"
                      ? "Vollständige Adresse"
                      : lang === "es"
                        ? "Dirección completa"
                        : lang === "it"
                          ? "Indirizzo completo"
                          : lang === "pt"
                            ? "Endereço completo"
                            : lang === "nl"
                              ? "Volledig adres"
                              : "Full address"}
                </Label>
                <Input
                  id="fullAddress"
                  value={form.fullAddress}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fullAddress: e.target.value }))
                  }
                  placeholder={
                    lang === "fr"
                      ? "Ex: 12 rue de la Paix, 75001 Paris"
                      : "Ex: 12 Main Street, Dublin 1"
                  }
                  data-ocid="profile.fulladdress.input"
                />
                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <Lock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {lang === "fr"
                    ? "Votre adresse complète est requise avant de publier une demande. Elle ne sera jamais affichée publiquement."
                    : lang === "de"
                      ? "Ihre vollständige Adresse wird vor der Auftragsveröffentlichung benötigt. Sie wird nie öffentlich angezeigt."
                      : lang === "es"
                        ? "Su dirección completa es necesaria antes de publicar una solicitud. Nunca se mostrará públicamente."
                        : lang === "it"
                          ? "Il suo indirizzo completo è richiesto prima di pubblicare una richiesta. Non verrà mai visualizzato pubblicamente."
                          : lang === "pt"
                            ? "O seu endereço completo é necessário antes de publicar um pedido. Nunca será exibido publicamente."
                            : lang === "nl"
                              ? "Uw volledige adres is vereist voordat u een aanvraag publiceert. Het wordt nooit openbaar weergegeven."
                              : "Your full address is required before posting a task. It will never be displayed publicly."}
                </p>
              </div>
            )}
          </div>

          {/* ── Section 3: Pro info (only for pros) ── */}
          {isPro && (
            <div
              className="rounded-2xl bg-white border border-border/60 shadow-sm p-5"
              data-ocid="profile.pro.panel"
            >
              <SectionHeader
                icon={<Building2 className="h-5 w-5 text-primary" />}
                title={lbl.proSection}
              />

              <div className="space-y-1.5 mb-4">
                <Label htmlFor="companyName" className="text-sm font-semibold">
                  {lbl.companyName} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, companyName: e.target.value }))
                  }
                  placeholder={lbl.companyPlaceholder}
                  data-ocid="profile.company.input"
                />
                {errors.companyName && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="profile.company.error"
                  >
                    {errors.companyName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 mb-4">
                <Label htmlFor="businessDesc" className="text-sm font-semibold">
                  {lbl.businessDesc}
                </Label>
                <Textarea
                  id="businessDesc"
                  value={form.businessDescription}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      businessDescription: e.target.value.slice(0, 500),
                    }))
                  }
                  rows={3}
                  maxLength={500}
                  placeholder={lbl.businessDescPlaceholder}
                  data-ocid="profile.businessdesc.textarea"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {form.businessDescription.length}/500
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <Label className="text-sm font-semibold">
                  {lbl.categories}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        form.serviceCategories.includes(cat)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/50"
                      }`}
                      data-ocid={"profile.category.toggle"}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <Label htmlFor="coverage" className="text-sm font-semibold">
                  {lbl.coverage}
                </Label>
                {(() => {
                  const usesMiles =
                    countryCode === "GB" || countryCode === "IE";
                  const unit = usesMiles ? "miles" : "km";
                  const options = usesMiles
                    ? [5, 10, 20, 30, 50, 60]
                    : [5, 10, 20, 30, 50, 100];
                  return (
                    <>
                      <div className="flex gap-2">
                        <Input
                          id="coverage"
                          value={form.coverageArea}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              coverageArea: e.target.value,
                            }))
                          }
                          placeholder={lbl.coveragePlaceholder}
                          data-ocid="profile.coverage.input"
                          className="flex-1"
                        />
                        <Select
                          value={""}
                          onValueChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              coverageArea: `${lbl.coveragePlaceholder} (${v} ${unit})`,
                            }))
                          }
                        >
                          <SelectTrigger
                            className="w-36"
                            data-ocid="profile.coverage.select"
                          >
                            <SelectValue placeholder={unit} />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((n) => (
                              <SelectItem key={n} value={String(n)}>
                                {n} {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {lbl.coverageHelp}
                      </p>
                    </>
                  );
                })()}
              </div>

              <div className="space-y-1.5 mb-6">
                <Label htmlFor="website" className="text-sm font-semibold">
                  {lbl.website}
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, website: e.target.value }))
                  }
                  placeholder={lbl.websitePlaceholder}
                  data-ocid="profile.website.input"
                />
              </div>

              {/* ── Country-specific legal fields ── */}
              {legalFields.length > 0 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">{lbl.proLegalNote}</p>
                  </div>
                  <div className="space-y-3">
                    {legalFields.map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <Label className="text-sm font-semibold">
                          {field.label}
                          {field.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </Label>
                        <Input
                          value={
                            field.key === "legalId"
                              ? form.legalId
                              : form.vatNumber
                          }
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              [field.key]: e.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          data-ocid={`profile.${field.key}.input`}
                        />
                        {field.key === "legalId" && errors.legalId && (
                          <p
                            className="text-xs text-destructive"
                            data-ocid="profile.legalid.error"
                          >
                            {errors.legalId}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Section 3b: DAC7 Tax Section (pros only) ── */}
          {isPro && (
            <Dac7TaxSection
              lang={lang}
              country={countryCode}
              principal={currentUser.icpPrincipal ?? String(currentUser.id)}
              values={dac7Values}
              onChange={(partial) =>
                setDac7Values((prev) => ({ ...prev, ...partial }))
              }
              errors={errors}
            />
          )}

          {/* ── Section 4: Account Verification (pros only) ── */}
          {isPro && (
            <div
              className="rounded-2xl bg-white border border-border/60 shadow-sm p-5"
              data-ocid="profile.verification.panel"
            >
              <SectionHeader
                icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                title={lbl.verificationSection}
              />

              {/* Verification status badge */}
              <div className="mb-5" data-ocid="profile.verification.card">
                {verificationStatus === "verified" ? (
                  <div className="flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    <span className="text-sm font-semibold text-green-800">
                      {lbl.verificationVerified} ✓
                    </span>
                  </div>
                ) : verificationStatus === "rejected" ? (
                  <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3">
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    <span className="text-sm font-semibold text-red-700">
                      {lbl.verificationRejected}
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3"
                    data-ocid="profile.verification.loading_state"
                  >
                    <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                    <span className="text-sm font-semibold text-amber-700">
                      {lbl.verificationPending}
                    </span>
                  </div>
                )}
              </div>

              {/* Upload fields */}
              <div className="space-y-6">
                {/* Identity document */}
                <UploadZone
                  label={lbl.idDocLabel}
                  hint={lbl.idDocHint}
                  state={idDoc}
                  uploadBtnLabel={lbl.uploadBtn}
                  uploadingLabel={lbl.uploading}
                  uploadSuccessLabel={lbl.uploadSuccess}
                  onFileChange={(file) =>
                    handleUpload(file, setIdDoc, "idDocumentUrl")
                  }
                  onClear={() => setIdDoc({ ...INITIAL_UPLOAD })}
                  inputId="idDocInput"
                  ocid="profile.iddoc"
                  errorMaxSize={lbl.maxSizeError}
                  errorFormat={lbl.formatError}
                  onError={(msg) =>
                    setIdDoc((prev) => ({ ...prev, error: msg }))
                  }
                />

                {/* Registration document */}
                <UploadZone
                  label={registrationDocName}
                  hint={lbl.regDocHint}
                  state={regDoc}
                  uploadBtnLabel={lbl.uploadBtn}
                  uploadingLabel={lbl.uploading}
                  uploadSuccessLabel={lbl.uploadSuccess}
                  onFileChange={(file) =>
                    handleUpload(file, setRegDoc, "registrationDocUrl")
                  }
                  onClear={() => setRegDoc({ ...INITIAL_UPLOAD })}
                  inputId="regDocInput"
                  ocid="profile.regdoc"
                  errorMaxSize={lbl.maxSizeError}
                  errorFormat={lbl.formatError}
                  onError={(msg) =>
                    setRegDoc((prev) => ({ ...prev, error: msg }))
                  }
                />
              </div>
            </div>
          )}

          {/* ── Save button ── */}
          <Button
            onClick={() => void handleSave()}
            disabled={saving}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            data-ocid="profile.save.button"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? lbl.saving : lbl.save}
          </Button>
        </div>
      </div>
    </main>
  );
}
