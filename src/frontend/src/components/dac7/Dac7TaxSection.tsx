import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { IbanLockModal } from "./IbanLockModal";

// ─── Tax ID matrix: country × proStatus → { label, placeholder } ────────────
function getTaxIdConfig(
  country: string,
  proStatus: string,
): { label: string; placeholder: string } {
  const isCompany = proStatus === "limited_company";
  const isIndividual = !isCompany;
  switch (country) {
    case "FR":
      return isCompany
        ? { label: "Numéro SIRET", placeholder: "Ex: 12345678901234" }
        : { label: "Numéro Fiscal (NIF)", placeholder: "Ex: 1234567890123" };
    case "BE":
      return isCompany
        ? { label: "Numéro BCE", placeholder: "Ex: BE0123456789" }
        : { label: "Numéro National", placeholder: "Ex: 85.01.02-123.45" };
    case "GB":
      return isCompany
        ? { label: "Companies House Number", placeholder: "Ex: 12345678" }
        : {
            label: "UTR / National Insurance Number",
            placeholder: "Ex: 1234567890 or AB123456C",
          };
    case "IE":
      return isCompany
        ? {
            label: "Company Registration Number (CRO)",
            placeholder: "Ex: 123456",
          }
        : { label: "PPS Number", placeholder: "Ex: 1234567T" };
    case "DE":
      return {
        label: "Steueridentifikationsnummer",
        placeholder: "Ex: 12 345 678 901",
      };
    case "ES":
      return isCompany
        ? { label: "NIF (Sociedad)", placeholder: "Ex: A12345678" }
        : { label: "NIF / NIE", placeholder: "Ex: 12345678A or X1234567A" };
    case "IT":
      return isCompany
        ? { label: "Partita IVA", placeholder: "Ex: IT12345678901" }
        : { label: "Codice Fiscale", placeholder: "Ex: RSSMRA85T10A562S" };
    case "PT":
      return { label: "NIF (Contribuinte)", placeholder: "Ex: 123456789" };
    case "NL":
      return isCompany
        ? { label: "KVK Nummer", placeholder: "Ex: 12345678" }
        : { label: "BSN", placeholder: "Ex: 123456789" };
    case "GR":
      return { label: "ΑΦΜ (AFM)", placeholder: "Ex: 123456789" };
    case "CH":
      return isCompany
        ? { label: "UID", placeholder: "Ex: CHE-123.456.789" }
        : { label: "AHV-Nummer", placeholder: "Ex: 756.1234.5678.97" };
    case "LU":
      return {
        label: "Numéro d'identification fiscale (NIF Luxembourg)",
        placeholder: "Ex: 1234567890123",
      };
    default:
      return isIndividual
        ? {
            label: "Tax Identification Number",
            placeholder: "Enter your tax ID",
          }
        : {
            label: "Company Tax Number",
            placeholder: "Enter company tax number",
          };
  }
}

// ─── AES-256-GCM encryption using Web Crypto ────────────────────────────────
async function deriveKey(principal: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode("taskvoila_iban_key_v1"),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(principal),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptIban(
  iban: string,
  principal: string,
): Promise<string> {
  const key = await deriveKey(principal);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(iban),
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptIban(
  encrypted: string,
  principal: string,
): Promise<string> {
  const key = await deriveKey(principal);
  const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(plaintext);
}

function maskIban(iban: string): string {
  if (iban.length <= 8) return iban;
  return `${iban.slice(0, 4)} *** ${iban.slice(-4)}`;
}

// ─── Translations ────────────────────────────────────────────────────────────
const T: Record<string, Record<string, string>> = {
  fr: {
    sectionTitle: "Informations fiscales et légales (DAC7)",
    sectionSubtitle:
      "Obligatoire pour tous les professionnels — Directive européenne 2021/514/UE",
    proStatusLabel: "Statut professionnel",
    sole_trader: "Auto-entrepreneur / Travailleur indépendant",
    self_employed: "Profession libérale",
    auto_entrepreneur: "Auto-entrepreneur",
    limited_company: "Société (SARL, SAS, etc.)",
    other: "Autre",
    taxIdLabel: "Numéro d'identification fiscale",
    vatLabel: "Numéro TVA (optionnel)",
    vatPlaceholder: "Ex: FR12345678901",
    dobLabel: "Date de naissance (professionnels individuels)",
    taxResidenceLabel: "Pays de résidence fiscale",
    ibanLabel: "IBAN (compte bancaire professionnel)",
    ibanPlaceholder: "Ex: LU28 0019 4006 4475 0000",
    ibanLocked: "IBAN enregistré et verrouillé",
    ibanUnlockBtn: "Modifier l'IBAN",
    ibanNote:
      "Votre IBAN sera chiffré et accessible uniquement par vous et l'administration TaskVoilà pour les obligations DAC7.",
    dac7Label:
      "Je reconnais que mes données fiscales (nom, adresse, NIF, IBAN, transactions) seront transmises aux autorités fiscales compétentes conformément à la Directive DAC7 (2021/514/UE) avant le 31 janvier de chaque année.",
    required: "Obligatoire",
  },
  en: {
    sectionTitle: "Tax and Legal Information (DAC7)",
    sectionSubtitle:
      "Mandatory for all professionals — EU Directive 2021/514/EU",
    proStatusLabel: "Professional status",
    sole_trader: "Sole trader",
    self_employed: "Self-employed",
    auto_entrepreneur: "Auto-entrepreneur",
    limited_company: "Limited company",
    other: "Other",
    taxIdLabel: "Tax identification number",
    vatLabel: "VAT number (optional)",
    vatPlaceholder: "Ex: IE1234567X",
    dobLabel: "Date of birth (individual professionals)",
    taxResidenceLabel: "Country of tax residence",
    ibanLabel: "IBAN (professional bank account)",
    ibanPlaceholder: "Ex: LU28 0019 4006 4475 0000",
    ibanLocked: "IBAN registered and locked",
    ibanUnlockBtn: "Update IBAN",
    ibanNote:
      "Your IBAN is encrypted and accessible only by you and the TaskVoilà administration for DAC7 obligations.",
    dac7Label:
      "I acknowledge that my tax data (name, address, tax ID, IBAN, transactions) will be reported to the competent tax authorities in accordance with the DAC7 Directive (2021/514/EU) before 31 January each year.",
    required: "Required",
  },
  de: {
    sectionTitle: "Steuerliche und rechtliche Informationen (DAC7)",
    sectionSubtitle:
      "Pflichtangaben für alle Profis — EU-Richtlinie 2021/514/EU",
    proStatusLabel: "Beruflicher Status",
    sole_trader: "Einzelunternehmer",
    self_employed: "Selbstständig",
    auto_entrepreneur: "Freiberufler",
    limited_company: "GmbH / AG",
    other: "Sonstiges",
    taxIdLabel: "Steuerliche Identifikationsnummer",
    vatLabel: "USt-IdNr (optional)",
    vatPlaceholder: "Bsp: DE123456789",
    dobLabel: "Geburtsdatum (Einzelpersonen)",
    taxResidenceLabel: "Steuerliches Wohnsitzland",
    ibanLabel: "IBAN (gewerbliches Bankkonto)",
    ibanPlaceholder: "Bsp: DE89 3704 0044 0532 0130 00",
    ibanLocked: "IBAN eingetragen und gesperrt",
    ibanUnlockBtn: "IBAN ändern",
    ibanNote:
      "Ihre IBAN wird verschlüsselt gespeichert und ist nur für Sie und die TaskVoilà-Administration für DAC7-Zwecke zugänglich.",
    dac7Label:
      "Ich bestätige, dass meine Steuerdaten (Name, Adresse, Steuer-ID, IBAN, Transaktionen) gemäß der DAC7-Richtlinie (2021/514/EU) vor dem 31. Januar jedes Jahres an die zuständigen Steuerbehörden übermittelt werden.",
    required: "Pflichtfeld",
  },
  es: {
    sectionTitle: "Información fiscal y legal (DAC7)",
    sectionSubtitle:
      "Obligatorio para todos los profesionales — Directiva UE 2021/514/UE",
    proStatusLabel: "Estado profesional",
    sole_trader: "Autónomo",
    self_employed: "Trabajador por cuenta propia",
    auto_entrepreneur: "Auto-emprendedor",
    limited_company: "Sociedad Limitada / SA",
    other: "Otro",
    taxIdLabel: "Número de identificación fiscal",
    vatLabel: "Número de IVA (opcional)",
    vatPlaceholder: "Ej: ES12345678A",
    dobLabel: "Fecha de nacimiento (profesionales individuales)",
    taxResidenceLabel: "País de residencia fiscal",
    ibanLabel: "IBAN (cuenta bancaria profesional)",
    ibanPlaceholder: "Ej: ES91 2100 0418 4502 0005 1332",
    ibanLocked: "IBAN registrado y bloqueado",
    ibanUnlockBtn: "Modificar IBAN",
    ibanNote:
      "Su IBAN está cifrado y solo es accesible por usted y la administración de TaskVoilà para las obligaciones DAC7.",
    dac7Label:
      "Reconozco que mis datos fiscales (nombre, dirección, NIF, IBAN, transacciones) serán transmitidos a las autoridades fiscales competentes conforme a la Directiva DAC7 (2021/514/UE) antes del 31 de enero de cada año.",
    required: "Obligatorio",
  },
  it: {
    sectionTitle: "Informazioni fiscali e legali (DAC7)",
    sectionSubtitle:
      "Obbligatorio per tutti i professionisti — Direttiva UE 2021/514/UE",
    proStatusLabel: "Status professionale",
    sole_trader: "Libero professionista",
    self_employed: "Lavoratore autonomo",
    auto_entrepreneur: "Auto-imprenditore",
    limited_company: "Società (Srl, SpA, ecc.)",
    other: "Altro",
    taxIdLabel: "Codice fiscale / Partita IVA",
    vatLabel: "Numero IVA (opzionale)",
    vatPlaceholder: "Es: IT12345678901",
    dobLabel: "Data di nascita (professionisti individuali)",
    taxResidenceLabel: "Paese di residenza fiscale",
    ibanLabel: "IBAN (conto bancario professionale)",
    ibanPlaceholder: "Es: IT60 X054 2811 1010 0000 0123 456",
    ibanLocked: "IBAN registrato e bloccato",
    ibanUnlockBtn: "Modifica IBAN",
    ibanNote:
      "Il suo IBAN è crittografato ed è accessibile solo a lei e all'amministrazione di TaskVoilà per gli obblighi DAC7.",
    dac7Label:
      "Riconosco che i miei dati fiscali (nome, indirizzo, codice fiscale, IBAN, transazioni) saranno trasmessi alle autorità fiscali competenti ai sensi della Direttiva DAC7 (2021/514/UE) entro il 31 gennaio di ogni anno.",
    required: "Obbligatorio",
  },
  pt: {
    sectionTitle: "Informações fiscais e legais (DAC7)",
    sectionSubtitle:
      "Obrigatório para todos os profissionais — Diretiva UE 2021/514/UE",
    proStatusLabel: "Estado profissional",
    sole_trader: "Trabalhador independente",
    self_employed: "Profissional liberal",
    auto_entrepreneur: "Auto-empreendedor",
    limited_company: "Sociedade (Lda, SA, etc.)",
    other: "Outro",
    taxIdLabel: "Número de identificação fiscal",
    vatLabel: "Número de IVA (opcional)",
    vatPlaceholder: "Ex: PT123456789",
    dobLabel: "Data de nascimento (profissionais individuais)",
    taxResidenceLabel: "País de residência fiscal",
    ibanLabel: "IBAN (conta bancária profissional)",
    ibanPlaceholder: "Ex: PT50 0002 0123 1234 5678 9015 4",
    ibanLocked: "IBAN registado e bloqueado",
    ibanUnlockBtn: "Alterar IBAN",
    ibanNote:
      "O seu IBAN é encriptado e acessível apenas por si e pela administração da TaskVoilà para as obrigações DAC7.",
    dac7Label:
      "Reconheço que os meus dados fiscais (nome, endereço, NIF, IBAN, transações) serão transmitidos às autoridades fiscais competentes nos termos da Diretiva DAC7 (2021/514/UE) antes de 31 de janeiro de cada ano.",
    required: "Obrigatório",
  },
  nl: {
    sectionTitle: "Fiscale en juridische informatie (DAC7)",
    sectionSubtitle:
      "Verplicht voor alle professionals — EU-richtlijn 2021/514/EU",
    proStatusLabel: "Professionele status",
    sole_trader: "Eenmanszaak",
    self_employed: "Zelfstandige",
    auto_entrepreneur: "Freelancer",
    limited_company: "BV / NV",
    other: "Anders",
    taxIdLabel: "Fiscaal identificatienummer",
    vatLabel: "BTW-nummer (optioneel)",
    vatPlaceholder: "Bv: NL123456789B01",
    dobLabel: "Geboortedatum (individuele professionals)",
    taxResidenceLabel: "Land van fiscale woonplaats",
    ibanLabel: "IBAN (zakelijke bankrekening)",
    ibanPlaceholder: "Bv: NL91 ABNA 0417 1643 00",
    ibanLocked: "IBAN geregistreerd en vergrendeld",
    ibanUnlockBtn: "IBAN wijzigen",
    ibanNote:
      "Uw IBAN is versleuteld en alleen toegankelijk voor u en de TaskVoilà-administratie voor DAC7-verplichtingen.",
    dac7Label:
      "Ik erken dat mijn fiscale gegevens (naam, adres, fiscaal nummer, IBAN, transacties) conform de DAC7-richtlijn (2021/514/EU) vóór 31 januari van elk jaar worden doorgegeven aan de bevoegde belastingautoriteiten.",
    required: "Verplicht",
  },
  el: {
    sectionTitle: "Φορολογικές και νομικές πληροφορίες (DAC7)",
    sectionSubtitle:
      "Υποχρεωτικό για όλους τους επαγγελματίες — Οδηγία ΕΕ 2021/514/ΕΕ",
    proStatusLabel: "Επαγγελματική κατάσταση",
    sole_trader: "Ατομική επιχείρηση",
    self_employed: "Αυτοαπασχολούμενος",
    auto_entrepreneur: "Ελεύθερος επαγγελματίας",
    limited_company: "ΕΠΕ / ΑΕ",
    other: "Άλλο",
    taxIdLabel: "Αριθμός φορολογικής ταυτότητας",
    vatLabel: "Αριθμός ΦΠΑ (προαιρετικό)",
    vatPlaceholder: "Π.χ.: EL123456789",
    dobLabel: "Ημερομηνία γέννησης (μεμονωμένοι επαγγελματίες)",
    taxResidenceLabel: "Χώρα φορολογικής κατοικίας",
    ibanLabel: "IBAN (επαγγελματικός τραπεζικός λογαριασμός)",
    ibanPlaceholder: "Π.χ.: GR16 0110 1250 0000 0001 2300 695",
    ibanLocked: "IBAN εγγεγραμμένο και κλειδωμένο",
    ibanUnlockBtn: "Τροποποίηση IBAN",
    ibanNote:
      "Το IBAN σας είναι κρυπτογραφημένο και προσβάσιμο μόνο από εσάς και τη διαχείριση της TaskVoilà για τις υποχρεώσεις DAC7.",
    dac7Label:
      "Αναγνωρίζω ότι τα φορολογικά μου στοιχεία (όνομα, διεύθυνση, ΑΦΜ, IBAN, συναλλαγές) θα διαβιβαστούν στις αρμόδιες φορολογικές αρχές σύμφωνα με την Οδηγία DAC7 (2021/514/ΕΕ) πριν από την 31η Ιανουαρίου κάθε έτους.",
    required: "Υποχρεωτικό",
  },
};

const SUPPORTED_COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique / België" },
  { code: "GB", label: "United Kingdom" },
  { code: "IE", label: "Ireland" },
  { code: "DE", label: "Deutschland" },
  { code: "ES", label: "España" },
  { code: "IT", label: "Italia" },
  { code: "PT", label: "Portugal" },
  { code: "NL", label: "Nederland" },
  { code: "GR", label: "Ελλάδα" },
  { code: "CH", label: "Schweiz / Suisse" },
  { code: "LU", label: "Luxembourg" },
];

export interface Dac7FormValues {
  proStatus: string;
  taxId: string;
  vatNumber: string;
  dateOfBirth: string;
  taxResidenceCountry: string;
  ibanRaw: string; // plain text IBAN (will be encrypted before saving)
  ibanLocked: boolean;
  dac7Accepted: boolean;
}

interface Dac7TaxSectionProps {
  lang: string;
  country: string;
  principal: string;
  values: Dac7FormValues;
  onChange: (values: Partial<Dac7FormValues>) => void;
  errors?: Record<string, string>;
}

export function Dac7TaxSection({
  lang,
  country,
  principal,
  values,
  onChange,
  errors = {},
}: Dac7TaxSectionProps) {
  const t = T[lang] ?? T.en;
  const [ibanModalOpen, setIbanModalOpen] = useState(false);
  const taxIdConfig = getTaxIdConfig(country, values.proStatus);
  const isIndividual = values.proStatus !== "limited_company";

  void principal; // used by parent to encrypt before saving

  return (
    <Card className="border-amber-200 bg-amber-50/40" data-ocid="dac7.panel">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-amber-800">
          <ShieldCheck className="h-5 w-5 text-amber-600" />
          {t.sectionTitle}
        </CardTitle>
        <p className="text-xs text-amber-700 mt-0.5">{t.sectionSubtitle}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Professional status */}
        <div className="space-y-1.5">
          <Label htmlFor="proStatus" className="text-sm font-semibold">
            {t.proStatusLabel} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={values.proStatus}
            onValueChange={(v) => onChange({ proStatus: v })}
          >
            <SelectTrigger id="proStatus" data-ocid="dac7.prostatus.select">
              <SelectValue placeholder={t.proStatusLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sole_trader">{t.sole_trader}</SelectItem>
              <SelectItem value="auto_entrepreneur">
                {t.auto_entrepreneur}
              </SelectItem>
              <SelectItem value="self_employed">{t.self_employed}</SelectItem>
              <SelectItem value="limited_company">
                {t.limited_company}
              </SelectItem>
              <SelectItem value="other">{t.other}</SelectItem>
            </SelectContent>
          </Select>
          {errors.proStatus && (
            <p
              className="text-xs text-destructive"
              data-ocid="dac7.prostatus.error"
            >
              {errors.proStatus}
            </p>
          )}
        </div>

        {/* Adaptive Tax ID */}
        {values.proStatus && (
          <div className="space-y-1.5">
            <Label htmlFor="taxId" className="text-sm font-semibold">
              {taxIdConfig.label} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="taxId"
              value={values.taxId}
              onChange={(e) => onChange({ taxId: e.target.value })}
              placeholder={taxIdConfig.placeholder}
              data-ocid="dac7.taxid.input"
            />
            {errors.taxId && (
              <p
                className="text-xs text-destructive"
                data-ocid="dac7.taxid.error"
              >
                {errors.taxId}
              </p>
            )}
          </div>
        )}

        {/* VAT number */}
        <div className="space-y-1.5">
          <Label htmlFor="vatNumber" className="text-sm font-semibold">
            {t.vatLabel}
          </Label>
          <Input
            id="vatNumber"
            value={values.vatNumber}
            onChange={(e) => onChange({ vatNumber: e.target.value })}
            placeholder={t.vatPlaceholder}
            data-ocid="dac7.vat.input"
          />
        </div>

        {/* Date of birth (individual pros only) */}
        {isIndividual && (
          <div className="space-y-1.5">
            <Label htmlFor="dateOfBirth" className="text-sm font-semibold">
              {t.dobLabel} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={values.dateOfBirth}
              onChange={(e) => onChange({ dateOfBirth: e.target.value })}
              data-ocid="dac7.dob.input"
            />
            {errors.dateOfBirth && (
              <p
                className="text-xs text-destructive"
                data-ocid="dac7.dob.error"
              >
                {errors.dateOfBirth}
              </p>
            )}
          </div>
        )}

        {/* Tax residence country */}
        <div className="space-y-1.5">
          <Label htmlFor="taxResidence" className="text-sm font-semibold">
            {t.taxResidenceLabel} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={values.taxResidenceCountry}
            onValueChange={(v) => onChange({ taxResidenceCountry: v })}
          >
            <SelectTrigger
              id="taxResidence"
              data-ocid="dac7.taxresidence.select"
            >
              <SelectValue placeholder={t.taxResidenceLabel} />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* IBAN */}
        <div className="space-y-1.5">
          <Label htmlFor="iban" className="text-sm font-semibold">
            {t.ibanLabel} <span className="text-destructive">*</span>
          </Label>
          {values.ibanLocked ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                <Lock className="h-3.5 w-3.5 text-amber-600" />
                <span>{maskIban(values.ibanRaw || "****")}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIbanModalOpen(true)}
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                data-ocid="dac7.iban_unlock.button"
              >
                {t.ibanUnlockBtn}
              </Button>
            </div>
          ) : (
            <Input
              id="iban"
              value={values.ibanRaw}
              onChange={(e) => onChange({ ibanRaw: e.target.value })}
              placeholder={t.ibanPlaceholder}
              data-ocid="dac7.iban.input"
            />
          )}
          <p className="text-xs text-muted-foreground">{t.ibanNote}</p>
          {errors.iban && (
            <p className="text-xs text-destructive" data-ocid="dac7.iban.error">
              {errors.iban}
            </p>
          )}
        </div>

        {/* DAC7 consent checkbox */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="dac7Accepted"
              checked={values.dac7Accepted}
              onCheckedChange={(checked) =>
                onChange({ dac7Accepted: checked === true })
              }
              className="mt-0.5 border-amber-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              data-ocid="dac7.consent.checkbox"
            />
            <Label
              htmlFor="dac7Accepted"
              className="text-xs text-amber-800 leading-relaxed cursor-pointer"
            >
              {t.dac7Label}{" "}
              <span className="text-destructive font-semibold">*</span>
            </Label>
          </div>
          {errors.dac7Accepted && (
            <p
              className="text-xs text-destructive mt-2"
              data-ocid="dac7.consent.error"
            >
              {errors.dac7Accepted}
            </p>
          )}
        </div>
      </CardContent>

      <IbanLockModal
        open={ibanModalOpen}
        lang={lang}
        onClose={() => setIbanModalOpen(false)}
        onUnlock={() => onChange({ ibanLocked: false })}
      />
    </Card>
  );
}
