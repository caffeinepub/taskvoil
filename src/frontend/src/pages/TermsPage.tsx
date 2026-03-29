import { useCountryStore } from "@/lib/country-store";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, Scale, Shield } from "lucide-react";
import { motion } from "motion/react";

const TERMS: Record<
  string,
  {
    title: string;
    cguLabel: string;
    dac7Title: string;
    dac7Text: string;
    generalTitle: string;
    generalText: string;
    privacyTitle: string;
    privacyText: string;
    privacyLink: string;
    contactTitle: string;
    contactText: string;
    footer: string;
    backLabel: string;
  }
> = {
  fr: {
    title: "Conditions Générales d'Utilisation",
    cguLabel: "CGU",
    dac7Title: "Collecte et déclaration fiscale (DAC7)",
    dac7Text:
      "TaskVoilà est exploité par une société de droit irlandais, enregistrée auprès des Revenue Commissioners irlandais via Revenue Online Service (ROS) pour la conformité DAC7. Conformément à la Directive européenne DAC7 (Directive du Conseil 2021/514/UE), TaskVoilà est légalement tenu de collecter, vérifier et déclarer annuellement aux autorités fiscales les revenus perçus par les utilisateurs professionnels via la plateforme. Cette déclaration couvre tous les pays où TaskVoilà opère : Irlande, France, Espagne, Portugal, Italie, Suisse, Belgique, Pays-Bas, Royaume-Uni, Luxembourg, Grèce et Allemagne. Les utilisateurs professionnels sont informés que leur nom, adresse, numéro d'identification fiscale, coordonnées bancaires (IBAN), nombre de transactions et revenus générés via TaskVoilà seront transmis à l'autorité fiscale compétente chaque année avant le 31 janvier. En vous inscrivant en tant que professionnel sur TaskVoilà, vous reconnaissez et acceptez cette obligation légale. Cette déclaration ne remplace pas votre obligation personnelle de déclarer vos revenus à votre administration fiscale nationale.",
    generalTitle: "Conditions générales d'utilisation",
    generalText:
      "TaskVoilà est une plateforme de mise en relation entre particuliers et professionnels. L'accès à la plateforme est réservé aux personnes majeures. L'utilisation de la plateforme est soumise à l'acceptation des présentes conditions. TaskVoilà se réserve le droit de suspendre ou supprimer tout compte qui ne respecte pas les règles d'utilisation. La plateforme perçoit une commission sur les transactions réalisées via TaskVoilà.",
    privacyTitle: "Politique de confidentialité",
    privacyText:
      "Vos données personnelles sont traitées conformément au RGPD. Pour plus d'informations, consultez notre",
    privacyLink: "Politique de confidentialité",
    contactTitle: "Contact",
    contactText:
      "Pour toute question relative aux présentes conditions, contactez-nous à",
    footer: "TaskVoilà © — Irlande",
    backLabel: "Retour",
  },
  en: {
    title: "Terms and Conditions",
    cguLabel: "Terms",
    dac7Title: "Tax Reporting (DAC7)",
    dac7Text:
      "TaskVoilà is operated by a company incorporated in Ireland, registered with the Irish Revenue Commissioners via Revenue Online Service (ROS) for DAC7 compliance. In accordance with EU DAC7 Directive (Council Directive 2021/514/EU), TaskVoilà is legally required to collect, verify, and annually report to tax authorities the income earned by professional users through the platform. This reporting covers all countries where TaskVoilà operates: Ireland, France, Spain, Portugal, Italy, Switzerland, Belgium, the Netherlands, the United Kingdom, Luxembourg, Greece, and Germany. Professional users are informed that their name, address, tax identification number, bank account details (IBAN), number of transactions, and total income generated via TaskVoilà will be reported to the relevant tax authority each year before January 31st. By registering as a professional on TaskVoilà, you acknowledge and accept this legal obligation. This declaration does not replace your personal obligation to declare your income to your own national tax authority.",
    generalTitle: "General Terms of Use",
    generalText:
      "TaskVoilà is a platform connecting individuals and professionals. Access to the platform is reserved for adults. Use of the platform is subject to acceptance of these terms. TaskVoilà reserves the right to suspend or delete any account that does not comply with the usage rules. The platform charges a commission on transactions made via TaskVoilà.",
    privacyTitle: "Privacy Policy",
    privacyText:
      "Your personal data is processed in accordance with GDPR. For more information, see our",
    privacyLink: "Privacy Policy",
    contactTitle: "Contact",
    contactText: "For any questions regarding these terms, contact us at",
    footer: "TaskVoilà © — Ireland",
    backLabel: "Back",
  },
  de: {
    title: "Allgemeine Nutzungsbedingungen",
    cguLabel: "AGB",
    dac7Title: "Steuerliche Meldepflicht (DAC7)",
    dac7Text:
      "TaskVoilà wird von einem nach irischem Recht gegründeten Unternehmen betrieben, das bei den irischen Revenue Commissioners über den Revenue Online Service (ROS) für die DAC7-Compliance registriert ist. Gemäß der EU-DAC7-Richtlinie (Richtlinie des Rates 2021/514/EU) ist TaskVoilà gesetzlich verpflichtet, die von professionellen Nutzern über die Plattform erzielten Einkünfte zu erheben, zu überprüfen und jährlich an die Steuerbehörden zu melden. Diese Meldung betrifft alle Länder, in denen TaskVoilà tätig ist: Irland, Frankreich, Spanien, Portugal, Italien, Schweiz, Belgien, Niederlande, Vereinigtes Königreich, Luxemburg, Griechenland und Deutschland. Professionelle Nutzer werden darüber informiert, dass ihr Name, ihre Adresse, ihre Steueridentifikationsnummer, ihre Bankverbindung (IBAN), die Anzahl der Transaktionen und die über TaskVoilà erzielten Gesamteinnahmen jährlich bis zum 31. Januar der zuständigen Steuerbehörde gemeldet werden. Mit der Registrierung als Profi bei TaskVoilà erkennen Sie diese gesetzliche Verpflichtung an. Diese Meldung ersetzt nicht Ihre persönliche Pflicht, Ihre Einkünfte beim nationalen Finanzamt zu deklarieren.",
    generalTitle: "Allgemeine Nutzungsbedingungen",
    generalText:
      "TaskVoilà ist eine Plattform zur Vermittlung zwischen Privatpersonen und Fachleuten. Der Zugang zur Plattform ist Volljährigen vorbehalten. Die Nutzung der Plattform setzt die Akzeptanz dieser Bedingungen voraus.",
    privacyTitle: "Datenschutzrichtlinie",
    privacyText:
      "Ihre personenbezogenen Daten werden gemäß der DSGVO verarbeitet. Weitere Informationen finden Sie in unserer",
    privacyLink: "Datenschutzrichtlinie",
    contactTitle: "Kontakt",
    contactText: "Bei Fragen zu diesen Bedingungen kontaktieren Sie uns unter",
    footer: "TaskVoilà © — Irland",
    backLabel: "Zurück",
  },
  es: {
    title: "Condiciones Generales de Uso",
    cguLabel: "CGU",
    dac7Title: "Declaración fiscal (DAC7)",
    dac7Text:
      "TaskVoilà es operado por una empresa constituida en Irlanda, registrada ante los Revenue Commissioners irlandeses a través del Revenue Online Service (ROS) para el cumplimiento de DAC7. De conformidad con la Directiva DAC7 de la UE (Directiva del Consejo 2021/514/UE), TaskVoilà está legalmente obligado a recopilar, verificar e informar anualmente a las autoridades fiscales los ingresos obtenidos por los usuarios profesionales a través de la plataforma. Esta declaración cubre todos los países donde opera TaskVoilà: Irlanda, Francia, España, Portugal, Italia, Suiza, Bélgica, Países Bajos, Reino Unido, Luxemburgo, Grecia y Alemania. Los usuarios profesionales son informados de que su nombre, dirección, número de identificación fiscal, datos bancarios (IBAN), número de transacciones e ingresos totales generados a través de TaskVoilà serán comunicados a la autoridad fiscal correspondiente cada año antes del 31 de enero. Al registrarse como profesional en TaskVoilà, reconoce y acepta esta obligación legal. Esta declaración no sustituye su obligación personal de declarar sus ingresos ante su administración fiscal nacional.",
    generalTitle: "Condiciones generales de uso",
    generalText:
      "TaskVoilà es una plataforma de conexión entre particulares y profesionales. El acceso a la plataforma está reservado a mayores de edad. El uso de la plataforma está sujeto a la aceptación de estas condiciones.",
    privacyTitle: "Política de privacidad",
    privacyText:
      "Sus datos personales se tratan de conformidad con el RGPD. Para más información, consulte nuestra",
    privacyLink: "Política de privacidad",
    contactTitle: "Contacto",
    contactText:
      "Para cualquier pregunta relacionada con estas condiciones, contáctenos en",
    footer: "TaskVoilà © — Irlanda",
    backLabel: "Volver",
  },
  it: {
    title: "Condizioni Generali di Utilizzo",
    cguLabel: "CGU",
    dac7Title: "Dichiarazione fiscale (DAC7)",
    dac7Text:
      "TaskVoilà è gestito da una società di diritto irlandese, registrata presso i Revenue Commissioners irlandesi tramite il Revenue Online Service (ROS) per la conformità DAC7. Ai sensi della Direttiva UE DAC7 (Direttiva del Consiglio 2021/514/UE), TaskVoilà è legalmente tenuta a raccogliere, verificare e segnalare annualmente alle autorità fiscali i redditi percepiti dagli utenti professionali tramite la piattaforma. Questa dichiarazione copre tutti i paesi in cui opera TaskVoilà: Irlanda, Francia, Spagna, Portogallo, Italia, Svizzera, Belgio, Paesi Bassi, Regno Unito, Lussemburgo, Grecia e Germania. Gli utenti professionali sono informati che il loro nome, indirizzo, numero di identificazione fiscale, coordinate bancarie (IBAN), numero di transazioni e reddito totale generato tramite TaskVoilà saranno comunicati all'autorità fiscale competente ogni anno entro il 31 gennaio. Registrandosi come professionista su TaskVoilà, l'utente riconosce e accetta questo obbligo legale. Questa dichiarazione non sostituisce l'obbligo personale di dichiarare i propri redditi all'amministrazione fiscale nazionale.",
    generalTitle: "Condizioni generali di utilizzo",
    generalText:
      "TaskVoilà è una piattaforma di collegamento tra privati e professionisti. L'accesso alla piattaforma è riservato ai maggiorenni. L'utilizzo della piattaforma è soggetto all'accettazione delle presenti condizioni.",
    privacyTitle: "Informativa sulla privacy",
    privacyText:
      "I dati personali vengono trattati in conformità al GDPR. Per ulteriori informazioni, consultare la nostra",
    privacyLink: "Informativa sulla privacy",
    contactTitle: "Contatto",
    contactText:
      "Per qualsiasi domanda relativa a queste condizioni, contattarci a",
    footer: "TaskVoilà © — Irlanda",
    backLabel: "Indietro",
  },
  pt: {
    title: "Condições Gerais de Utilização",
    cguLabel: "CGU",
    dac7Title: "Declaração fiscal (DAC7)",
    dac7Text:
      "A TaskVoilà é gerida por uma empresa constituída na Irlanda, registada junto dos Revenue Commissioners irlandeses através do Revenue Online Service (ROS) para conformidade com a DAC7. Em conformidade com a Diretiva DAC7 da UE (Diretiva do Conselho 2021/514/UE), a TaskVoilà é legalmente obrigada a recolher, verificar e comunicar anualmente às autoridades fiscais os rendimentos auferidos pelos utilizadores profissionais através da plataforma. Esta declaração abrange todos os países onde a TaskVoilà opera: Irlanda, França, Espanha, Portugal, Itália, Suíça, Bélgica, Países Baixos, Reino Unido, Luxemburgo, Grécia e Alemanha. Os utilizadores profissionais são informados de que o seu nome, morada, número de identificação fiscal, dados bancários (IBAN), número de transações e rendimento total gerado através da TaskVoilà serão comunicados à autoridade fiscal competente todos os anos antes de 31 de janeiro. Ao registar-se como profissional na TaskVoilà, reconhece e aceita esta obrigação legal. Esta declaração não substitui a obrigação pessoal de declarar os rendimentos à administração fiscal nacional.",
    generalTitle: "Condições gerais de utilização",
    generalText:
      "A TaskVoilà é uma plataforma de ligação entre particulares e profissionais. O acesso à plataforma está reservado a maiores de idade. A utilização da plataforma está sujeita à aceitação das presentes condições.",
    privacyTitle: "Política de privacidade",
    privacyText:
      "Os seus dados pessoais são tratados em conformidade com o RGPD. Para mais informações, consulte a nossa",
    privacyLink: "Política de privacidade",
    contactTitle: "Contacto",
    contactText:
      "Para qualquer questão relativa a estas condições, contacte-nos em",
    footer: "TaskVoilà © — Irlanda",
    backLabel: "Voltar",
  },
  nl: {
    title: "Algemene Gebruiksvoorwaarden",
    cguLabel: "AGV",
    dac7Title: "Fiscale rapportage (DAC7)",
    dac7Text:
      "TaskVoilà wordt beheerd door een naar Iers recht opgericht bedrijf, geregistreerd bij de Ierse Revenue Commissioners via de Revenue Online Service (ROS) voor DAC7-naleving. Overeenkomstig de EU DAC7-richtlijn (Richtlijn van de Raad 2021/514/EU) is TaskVoilà wettelijk verplicht de inkomsten van professionele gebruikers via het platform te verzamelen, te verifiëren en jaarlijks aan de belastingautoriteiten te rapporteren. Deze rapportage geldt voor alle landen waar TaskVoilà actief is: Ierland, Frankrijk, Spanje, Portugal, Italië, Zwitserland, België, Nederland, het Verenigd Koninkrijk, Luxemburg, Griekenland en Duitsland. Professionele gebruikers worden geïnformeerd dat hun naam, adres, fiscaal identificatienummer, bankgegevens (IBAN), aantal transacties en totale inkomsten via TaskVoilà elk jaar vóór 31 januari worden doorgegeven aan de bevoegde belastingautoriteit. Door u als professional bij TaskVoilà te registreren, erkent en aanvaardt u deze wettelijke verplichting. Deze aangifte vervangt niet uw persoonlijke verplichting om uw inkomsten bij uw nationale belastingdienst aan te geven.",
    generalTitle: "Algemene gebruiksvoorwaarden",
    generalText:
      "TaskVoilà is een platform dat particulieren en professionals met elkaar verbindt. Toegang tot het platform is voorbehouden aan meerderjarigen. Het gebruik van het platform is onderworpen aan de aanvaarding van deze voorwaarden.",
    privacyTitle: "Privacybeleid",
    privacyText:
      "Uw persoonsgegevens worden verwerkt in overeenstemming met de AVG. Raadpleeg voor meer informatie ons",
    privacyLink: "Privacybeleid",
    contactTitle: "Contact",
    contactText:
      "Voor vragen over deze voorwaarden kunt u contact met ons opnemen via",
    footer: "TaskVoilà © — Ierland",
    backLabel: "Terug",
  },
  el: {
    title: "Γενικοί Όροι Χρήσης",
    cguLabel: "ΓΟΧ",
    dac7Title: "Φορολογική δήλωση (DAC7)",
    dac7Text:
      "Η TaskVoilà λειτουργεί από εταιρεία συσταθείσα στην Ιρλανδία, εγγεγραμμένη στους Revenue Commissioners της Ιρλανδίας μέσω της υπηρεσίας Revenue Online Service (ROS) για συμμόρφωση με το DAC7. Σύμφωνα με την Οδηγία DAC7 της ΕΕ (Οδηγία του Συμβουλίου 2021/514/ΕΕ), η TaskVoilà υποχρεούται νομικά να συλλέγει, να επαληθεύει και να αναφέρει ετησίως στις φορολογικές αρχές τα εισοδήματα που αποκτούν οι επαγγελματίες χρήστες μέσω της πλατφόρμας. Η αναφορά αυτή καλύπτει όλες τις χώρες όπου λειτουργεί η TaskVoilà: Ιρλανδία, Γαλλία, Ισπανία, Πορτογαλία, Ιταλία, Ελβετία, Βέλγιο, Κάτω Χώρες, Ηνωμένο Βασίλειο, Λουξεμβούργο, Ελλάδα και Γερμανία. Οι επαγγελματίες χρήστες ενημερώνονται ότι το όνομά τους, η διεύθυνσή τους, ο αριθμός φορολογικής ταυτότητας, τα τραπεζικά στοιχεία (IBAN), ο αριθμός συναλλαγών και το συνολικό εισόδημα που δημιουργείται μέσω της TaskVoilà θα κοινοποιούνται στην αρμόδια φορολογική αρχή κάθε χρόνο πριν από την 31η Ιανουαρίου. Με την εγγραφή σας ως επαγγελματίας στην TaskVoilà, αναγνωρίζετε και αποδέχεστε αυτή τη νομική υποχρέωση. Αυτή η δήλωση δεν αντικαθιστά την προσωπική σας υποχρέωση να δηλώσετε τα εισοδήματά σας στην εθνική φορολογική αρχή.",
    generalTitle: "Γενικοί όροι χρήσης",
    generalText:
      "Η TaskVoilà είναι πλατφόρμα σύνδεσης ιδιωτών και επαγγελματιών. Η πρόσβαση στην πλατφόρμα επιτρέπεται μόνο σε ενήλικες. Η χρήση της πλατφόρμας υπόκειται στην αποδοχή των παρόντων όρων.",
    privacyTitle: "Πολιτική απορρήτου",
    privacyText:
      "Τα προσωπικά σας δεδομένα υποβάλλονται σε επεξεργασία σύμφωνα με τον ΓΚΠΔ. Για περισσότερες πληροφορίες, ανατρέξτε στην",
    privacyLink: "Πολιτική απορρήτου",
    contactTitle: "Επικοινωνία",
    contactText:
      "Για ερωτήσεις σχετικά με τους παρόντες όρους, επικοινωνήστε μαζί μας στο",
    footer: "TaskVoilà © — Ιρλανδία",
    backLabel: "Πίσω",
  },
};

const LANG_MAP: Record<string, string> = {
  FR: "fr",
  BE: "fr",
  GB: "en",
  IE: "en",
  DE: "de",
  CH: "de",
  ES: "es",
  IT: "it",
  PT: "pt",
  NL: "nl",
  GR: "el",
  LU: "fr",
};

export function TermsPage() {
  const { selectedCountry } = useCountryStore();
  const lang = LANG_MAP[selectedCountry ?? "FR"] ?? "fr";
  const t = TERMS[lang] ?? TERMS.en;
  const year = new Date().getFullYear();

  const sections = [
    {
      icon: Scale,
      color: "text-blue-600",
      bg: "bg-blue-50",
      title: t.generalTitle,
      content: t.generalText,
    },
    {
      icon: Shield,
      color: "text-amber-600",
      bg: "bg-amber-50",
      title: t.dac7Title,
      content: t.dac7Text,
      isDac7: true,
    },
  ];

  return (
    <main className="min-h-screen bg-background" data-ocid="terms.page">
      <section className="bg-foreground text-white py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
            data-ocid="terms.home.link"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backLabel}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t.title}</h1>
              <p className="text-white/60 text-sm mt-1">TaskVoilà</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-3xl py-12 space-y-6">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl bg-white border border-border/60 shadow-sm overflow-hidden"
          >
            <div className={`${section.bg} px-6 py-4 flex items-center gap-3`}>
              <section.icon className={`h-5 w-5 ${section.color}`} />
              <h2 className="font-semibold text-foreground">{section.title}</h2>
              {section.isDac7 && (
                <span className="ml-auto text-xs font-medium bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                  DAC7
                </span>
              )}
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Privacy reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white border border-border/60 shadow-sm overflow-hidden"
        >
          <div className="bg-gray-50 px-6 py-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold text-foreground">{t.privacyTitle}</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground">
              {t.privacyText}{" "}
              <Link
                to="/privacy"
                className="text-primary hover:underline font-medium"
                data-ocid="terms.privacy.link"
              >
                {t.privacyLink}
              </Link>
              .
            </p>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white border border-border/60 shadow-sm overflow-hidden"
        >
          <div className="bg-gray-50 px-6 py-4">
            <h2 className="font-semibold text-foreground">{t.contactTitle}</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground">
              {t.contactText}{" "}
              <a
                href="mailto:hello@taskvoila.com"
                className="text-primary hover:underline font-medium"
              >
                hello@taskvoila.com
              </a>
            </p>
          </div>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground pt-4">
          {t.footer.replace("©", `© ${year}`)}
        </p>
      </div>
    </main>
  );
}
