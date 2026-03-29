import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

type FAQItem = { q: string; a: string };
type FAQCategory = { icon: string; title: string; items: FAQItem[] };
type FAQData = { hero: string; subtitle: string; categories: FAQCategory[] };

const FAQ_DATA: Record<string, FAQData> = {
  fr: {
    hero: "Foire Aux Questions",
    subtitle: "Tout ce que vous devez savoir sur TaskVoilà",
    categories: [
      {
        icon: "❓",
        title: "Comment fonctionne TaskVoilà",
        items: [
          {
            q: "Qu'est-ce que TaskVoilà ?",
            a: "TaskVoilà est une marketplace de services locaux qui met en relation des particuliers avec des professionnels vérifiés pour des travaux d'artisanat, des réparations, des installations et de la location de matériel. Le tout en 3 clics.",
          },
          {
            q: "Dans quels pays TaskVoilà est-il disponible ?",
            a: "France, Belgique, Royaume-Uni, Irlande, Allemagne, Espagne, Italie, Portugal, Pays-Bas, Grèce, Suisse et Luxembourg.",
          },
          {
            q: "La plateforme est-elle gratuite ?",
            a: "L'inscription est gratuite. TaskVoilà prend une commission uniquement lorsqu'une mission est terminée : 8 % sur les services, 15 % ou 12 % sur la location de matériel selon la durée.",
          },
        ],
      },
      {
        icon: "🏠",
        title: "Pour les particuliers / clients",
        items: [
          {
            q: "Comment publier une mission ?",
            a: "Créez un compte, complétez votre profil, cliquez sur le bouton +, décrivez votre besoin, fixez un budget et une localisation. Des professionnels vérifiés vous répondront avec des offres.",
          },
          {
            q: "Comment trouver un professionnel ?",
            a: "Utilisez la recherche, parcourez les catégories ou consultez la carte interactive. Vous pouvez filtrer par distance, note, disponibilité et catégorie.",
          },
          {
            q: "Puis-je réserver un professionnel directement ?",
            a: "Oui. Visitez le profil d'un pro, consultez son calendrier de disponibilités, sélectionnez un créneau et envoyez une demande de réservation. Le pro confirme ou propose un autre horaire.",
          },
          {
            q: "Mon adresse personnelle est-elle visible publiquement ?",
            a: "Non. Votre adresse complète est uniquement partagée avec le professionnel assigné après que vous avez accepté son offre.",
          },
          {
            q: "Comment fonctionne le paiement ?",
            a: "Le paiement est sécurisé par un système d'escrow. Vous payez lorsque vous acceptez un devis. Les fonds sont libérés au professionnel uniquement après confirmation de la mission.",
          },
        ],
      },
      {
        icon: "🔧",
        title: "Pour les professionnels",
        items: [
          {
            q: "Comment m'inscrire en tant que professionnel ?",
            a: 'Choisissez le type de compte "Professionnel" lors de l\'inscription. Complétez votre profil avec le nom de votre entreprise, vos services et la section obligatoire Informations fiscales et légales (conformité DAC7).',
          },
          {
            q: "Qu'est-ce que la DAC7 et pourquoi dois-je fournir des informations fiscales ?",
            a: "La DAC7 est une directive fiscale européenne (2021/514/UE) qui oblige les plateformes numériques à déclarer les revenus professionnels aux autorités fiscales. TaskVoilà est enregistré en Irlande auprès des Revenue Commissioners (ROS). Vous devez fournir votre numéro d'identification fiscale, votre IBAN et votre statut juridique avant de publier des annonces.",
          },
          {
            q: "Comment fonctionne le calendrier de disponibilité ?",
            a: "Définissez vos jours et horaires de travail dans votre tableau de bord. Bloquez les dates de vacances, bloquez automatiquement les jours fériés de votre pays. Les clients voient votre calendrier en vert (disponible), rouge (réservé) et gris (fermé).",
          },
          {
            q: "Les clients peuvent-ils voir mon adresse personnelle ?",
            a: "Non. Seule votre zone de service (ville / zone) est affichée publiquement. Votre adresse complète reste privée.",
          },
        ],
      },
      {
        icon: "🔑",
        title: "Compte & Sécurité",
        items: [
          {
            q: "Comment me connecter ?",
            a: "TaskVoilà utilise une authentification sécurisée native ICP : Internet Identity, NFID (avec Google) ou Plug Wallet. Aucun nom d'utilisateur ni mot de passe requis.",
          },
          {
            q: "Comment récupérer mon compte si je perds mon appareil ?",
            a: "Cela dépend de votre méthode de connexion :\n\n• Internet Identity : vous ne pouvez récupérer votre compte que si vous avez configuré un appareil de secours ou une phrase de récupération sur identity.ic0.app AVANT la perte. Sans ça, le compte est inaccessible.\n\n• NFID (Google) : reconnectez-vous simplement avec votre compte Google depuis n'importe quel appareil.\n\n• Plug Wallet : utilisez votre phrase de récupération de 12 mots pour restaurer votre wallet sur un nouvel appareil.\n\nNous vous recommandons vivement de sauvegarder votre méthode de connexion dès votre inscription.",
          },
          {
            q: "Mes données sont-elles sécurisées ?",
            a: "Toutes les données personnelles (nom, téléphone, adresse, IBAN) sont chiffrées en AES-256 avant d'être envoyées au backend. TaskVoilà est conforme au RGPD et respecte le droit européen de la protection des données.",
          },
        ],
      },
      {
        icon: "🔨",
        title: "Location de matériel",
        items: [
          {
            q: "Comment fonctionne la location de matériel ?",
            a: 'Parcourez la section "Location de Matériel", choisissez une catégorie (outillage, jardin, transport, etc.), contactez le propriétaire et convenez de la location. TaskVoilà prend 15 % de commission pour les locations de moins de 4 jours, 12 % pour 4 jours ou plus.',
          },
          {
            q: "Qui peut louer ou publier du matériel ?",
            a: "Les particuliers et les professionnels peuvent tous deux publier du matériel à louer ou louer du matériel chez d'autres utilisateurs.",
          },
        ],
      },
      {
        icon: "💻",
        title: "Technique",
        items: [
          {
            q: "Puis-je utiliser TaskVoilà sur mon téléphone ?",
            a: "Oui. TaskVoilà est une Progressive Web App (PWA). Sur Android, ajoutez-la à votre écran d'accueil depuis Chrome. Sur iPhone, utilisez Safari et appuyez sur \"Ajouter à l'écran d'accueil\".",
          },
          {
            q: "Pourquoi ne puis-je pas voir les annonces sans me connecter ?",
            a: "Pour la confidentialité et la sécurité, les annonces ne sont visibles qu'aux membres inscrits. Les visiteurs voient un aperçu avec une invitation à s'inscrire.",
          },
        ],
      },
    ],
  },
  en: {
    hero: "Frequently Asked Questions",
    subtitle: "Everything you need to know about TaskVoilà",
    categories: [
      {
        icon: "❓",
        title: "How TaskVoilà works",
        items: [
          {
            q: "What is TaskVoilà?",
            a: "TaskVoilà is a local services marketplace connecting individuals with verified professionals for handyman tasks, repairs, installations, and equipment rental. All in 3 clicks.",
          },
          {
            q: "In which countries is TaskVoilà available?",
            a: "France, Belgium, UK, Ireland, Germany, Spain, Italy, Portugal, Netherlands, Greece, Switzerland, and Luxembourg.",
          },
          {
            q: "Is the platform free to use?",
            a: "Registration is free. TaskVoilà takes a commission only when a mission is completed: 8% on services, 15% or 12% on equipment rental depending on duration.",
          },
        ],
      },
      {
        icon: "🏠",
        title: "For Clients",
        items: [
          {
            q: "How do I post a task?",
            a: "Create an account, complete your profile, click the + button, describe your need, set a budget and location. Verified pros will respond with offers.",
          },
          {
            q: "How do I find a professional?",
            a: "Use the search, browse by category, or view the interactive map. You can filter by distance, rating, availability, and category.",
          },
          {
            q: "Can I book a professional directly?",
            a: "Yes. Visit a pro's profile, view their availability calendar, select a time slot, and send a booking request. The pro confirms or proposes another time.",
          },
          {
            q: "Is my personal address visible publicly?",
            a: "No. Your full address is only shared with the assigned professional after you accept their offer.",
          },
          {
            q: "How does payment work?",
            a: "Payment is secured via escrow. You pay when you accept a quote. Funds are released to the pro only after the mission is confirmed complete.",
          },
        ],
      },
      {
        icon: "🔧",
        title: "For Professionals",
        items: [
          {
            q: "How do I register as a professional?",
            a: 'Choose the "Professional" account type at registration. Complete your profile including company name, services, and the mandatory Tax & Legal section (DAC7 compliance).',
          },
          {
            q: "What is DAC7 and why do I need to provide tax information?",
            a: "DAC7 is an EU tax directive (2021/514/EU) requiring digital platforms to report professional income to tax authorities. TaskVoilà is registered in Ireland with the Revenue Commissioners (ROS). You must provide your tax ID, IBAN, and legal status before publishing listings.",
          },
          {
            q: "How does the availability calendar work?",
            a: "Set your working days and hours in your dashboard. Block vacation dates, auto-block public holidays for your country. Clients see your calendar in green (available), red (booked), grey (closed).",
          },
          {
            q: "Can clients see my personal address?",
            a: "No. Only your service area (city/zone) is shown publicly. Your full address is private.",
          },
        ],
      },
      {
        icon: "🔑",
        title: "Account & Security",
        items: [
          {
            q: "How do I log in?",
            a: "TaskVoilà uses secure ICP-native authentication: Internet Identity, NFID (with Google), or Plug Wallet. No username/password required.",
          },
          {
            q: "How do I recover my account if I lose my device?",
            a: "Depends on your login method:\n\n• Internet Identity: You can only recover your account if you set up a recovery device or recovery phrase in advance at identity.ic0.app. Without it, the account is inaccessible.\n\n• NFID (Google): Simply log in with your Google account from any device.\n\n• Plug Wallet: Use your 12-word seed phrase to restore your wallet on any device.\n\nWe strongly recommend saving your login method as soon as you register.",
          },
          {
            q: "Is my data secure?",
            a: "All personal data (name, phone, address, IBAN) is encrypted with AES-256 before being sent to the backend. TaskVoilà is GDPR compliant and follows EU data protection law.",
          },
        ],
      },
      {
        icon: "🔨",
        title: "Equipment Rental",
        items: [
          {
            q: "How does equipment rental work?",
            a: 'Browse the "Equipment Rental" section, choose a category (tools, garden, transport, etc.), contact the owner, and arrange the rental. TaskVoilà takes 15% commission for rentals under 4 days, 12% for 4 days or more.',
          },
          {
            q: "Who can rent or list equipment?",
            a: "Both individuals and professionals can list equipment for rent or rent from others.",
          },
        ],
      },
      {
        icon: "💻",
        title: "Technical",
        items: [
          {
            q: "Can I use TaskVoilà on my phone?",
            a: 'Yes. TaskVoilà is a Progressive Web App (PWA). On Android, add it to your home screen from Chrome. On iPhone, use Safari and tap "Add to Home Screen".',
          },
          {
            q: "Why can't I see listings without logging in?",
            a: "For privacy and security, listings are only visible to registered members. Visitors see a preview with a sign-up prompt.",
          },
        ],
      },
    ],
  },
  de: {
    hero: "Häufig gestellte Fragen",
    subtitle: "Alles, was Sie über TaskVoilà wissen müssen",
    categories: [
      {
        icon: "❓",
        title: "Wie TaskVoilà funktioniert",
        items: [
          {
            q: "Was ist TaskVoilà?",
            a: "TaskVoilà ist ein lokaler Dienstleistungsmarktplatz, der Privatpersonen mit verifizierten Fachleuten für Heimwerkeraufgaben, Reparaturen, Installationen und Geräteverleih verbindet. Alles in 3 Klicks.",
          },
          {
            q: "In welchen Ländern ist TaskVoilà verfügbar?",
            a: "Frankreich, Belgien, Vereinigtes Königreich, Irland, Deutschland, Spanien, Italien, Portugal, Niederlande, Griechenland, Schweiz und Luxemburg.",
          },
          {
            q: "Ist die Plattform kostenlos?",
            a: "Die Registrierung ist kostenlos. TaskVoilà erhebt eine Provision nur beim Abschluss eines Auftrags: 8 % auf Dienstleistungen, 15 % oder 12 % auf Geräteverleih je nach Dauer.",
          },
        ],
      },
      {
        icon: "🏠",
        title: "Für Auftraggeber",
        items: [
          {
            q: "Wie stelle ich einen Auftrag ein?",
            a: "Erstellen Sie ein Konto, vervollständigen Sie Ihr Profil, klicken Sie auf die +-Schaltfläche, beschreiben Sie Ihren Bedarf, legen Sie Budget und Standort fest. Verifizierte Fachleute antworten mit Angeboten.",
          },
          {
            q: "Wie finde ich einen Fachmann?",
            a: "Nutzen Sie die Suche, stöbern Sie nach Kategorien oder sehen Sie sich die interaktive Karte an. Sie können nach Entfernung, Bewertung, Verfügbarkeit und Kategorie filtern.",
          },
          {
            q: "Kann ich einen Fachmann direkt buchen?",
            a: "Ja. Besuchen Sie das Profil eines Fachmanns, sehen Sie seinen Verfügbarkeitskalender, wählen Sie einen Zeitslot und senden Sie eine Buchungsanfrage. Der Fachmann bestätigt oder schlägt eine andere Zeit vor.",
          },
          {
            q: "Ist meine persönliche Adresse öffentlich sichtbar?",
            a: "Nein. Ihre vollständige Adresse wird nur mit dem zugewiesenen Fachmann geteilt, nachdem Sie sein Angebot angenommen haben.",
          },
          {
            q: "Wie funktioniert die Zahlung?",
            a: "Die Zahlung wird über Treuhand gesichert. Sie zahlen, wenn Sie ein Angebot annehmen. Die Mittel werden erst nach Bestätigung der abgeschlossenen Mission an den Fachmann freigegeben.",
          },
        ],
      },
      {
        icon: "🔧",
        title: "Für Fachleute",
        items: [
          {
            q: "Wie registriere ich mich als Fachmann?",
            a: 'Wählen Sie bei der Registrierung den Kontotyp "Fachmann". Vervollständigen Sie Ihr Profil mit Firmenname, Dienstleistungen und dem obligatorischen Steuer- und Rechtsbereich (DAC7-Konformität).',
          },
          {
            q: "Was ist DAC7 und warum muss ich Steuerinformationen angeben?",
            a: "DAC7 ist eine EU-Steuerrichtlinie (2021/514/EU), die digitale Plattformen verpflichtet, Berufseinkommen an Steuerbehörden zu melden. TaskVoilà ist in Irland bei den Revenue Commissioners (ROS) registriert. Sie müssen Ihre Steuer-ID, IBAN und Ihren Rechtsstatus vor der Veröffentlichung angeben.",
          },
          {
            q: "Wie funktioniert der Verfügbarkeitskalender?",
            a: "Legen Sie Ihre Arbeitstage und -stunden in Ihrem Dashboard fest. Blockieren Sie Urlaubsdaten, sperren Sie automatisch Feiertage Ihres Landes. Kunden sehen Ihren Kalender in Grün (verfügbar), Rot (gebucht), Grau (geschlossen).",
          },
          {
            q: "Können Kunden meine persönliche Adresse sehen?",
            a: "Nein. Nur Ihr Servicebereich (Stadt/Zone) wird öffentlich angezeigt. Ihre vollständige Adresse bleibt privat.",
          },
        ],
      },
      {
        icon: "🔑",
        title: "Konto & Sicherheit",
        items: [
          {
            q: "Wie melde ich mich an?",
            a: "TaskVoilà verwendet sichere ICP-native Authentifizierung: Internet Identity, NFID (mit Google) oder Plug Wallet. Kein Benutzername oder Passwort erforderlich.",
          },
          {
            q: "Wie stelle ich mein Konto wieder her, wenn ich mein Gerät verliere?",
            a: "Hängt von Ihrer Anmeldemethode ab:\n\n• Internet Identity: Sie können Ihr Konto nur wiederherstellen, wenn Sie zuvor auf identity.ic0.app ein Wiederherstellungsgerät oder eine Wiederherstellungsphrase eingerichtet haben. Ohne das ist das Konto unzugänglich.\n\n• NFID (Google): Melden Sie sich einfach von einem beliebigen Gerät mit Ihrem Google-Konto an.\n\n• Plug Wallet: Verwenden Sie Ihre 12-Wort-Wiederherstellungsphrase, um Ihr Wallet auf einem neuen Gerät wiederherzustellen.\n\nWir empfehlen dringend, Ihre Anmeldemethode sofort bei der Registrierung zu speichern.",
          },
          {
            q: "Sind meine Daten sicher?",
            a: "Alle persönlichen Daten (Name, Telefon, Adresse, IBAN) werden mit AES-256 verschlüsselt, bevor sie an das Backend gesendet werden. TaskVoilà ist DSGVO-konform und folgt dem EU-Datenschutzrecht.",
          },
        ],
      },
      {
        icon: "🔨",
        title: "Geräteverleih",
        items: [
          {
            q: "Wie funktioniert der Geräteverleih?",
            a: 'Stöbern Sie im Bereich "Geräteverleih", wählen Sie eine Kategorie (Werkzeug, Garten, Transport usw.), kontaktieren Sie den Eigentümer und vereinbaren Sie die Miete. TaskVoilà nimmt 15 % Provision für Mieten unter 4 Tagen, 12 % für 4 Tage oder mehr.',
          },
          {
            q: "Wer kann Geräte vermieten oder einstellen?",
            a: "Sowohl Privatpersonen als auch Fachleute können Geräte zur Miete anbieten oder von anderen mieten.",
          },
        ],
      },
      {
        icon: "💻",
        title: "Technik",
        items: [
          {
            q: "Kann ich TaskVoilà auf meinem Telefon verwenden?",
            a: 'Ja. TaskVoilà ist eine Progressive Web App (PWA). Auf Android fügen Sie sie über Chrome zu Ihrem Startbildschirm hinzu. Auf iPhone nutzen Sie Safari und tippen auf "Zum Startbildschirm hinzufügen".',
          },
          {
            q: "Warum kann ich ohne Anmeldung keine Inserate sehen?",
            a: "Aus Datenschutz- und Sicherheitsgründen sind Inserate nur für registrierte Mitglieder sichtbar. Besucher sehen eine Vorschau mit einer Anmeldeaufforderung.",
          },
        ],
      },
    ],
  },
  es: {
    hero: "Preguntas Frecuentes",
    subtitle: "Todo lo que necesitas saber sobre TaskVoilà",
    categories: [
      {
        icon: "❓",
        title: "Cómo funciona TaskVoilà",
        items: [
          {
            q: "¿Qué es TaskVoilà?",
            a: "TaskVoilà es un mercado de servicios locales que conecta a particulares con profesionales verificados para tareas de mantenimiento, reparaciones, instalaciones y alquiler de equipos. Todo en 3 clics.",
          },
          {
            q: "¿En qué países está disponible TaskVoilà?",
            a: "Francia, Bélgica, Reino Unido, Irlanda, Alemania, España, Italia, Portugal, Países Bajos, Grecia, Suiza y Luxemburgo.",
          },
          {
            q: "¿La plataforma es gratuita?",
            a: "El registro es gratuito. TaskVoilà cobra una comisión solo cuando se completa una misión: 8% en servicios, 15% o 12% en alquiler de equipos según la duración.",
          },
        ],
      },
      {
        icon: "🏠",
        title: "Para clientes",
        items: [
          {
            q: "¿Cómo publico una tarea?",
            a: "Crea una cuenta, completa tu perfil, haz clic en el botón +, describe tu necesidad, establece un presupuesto y ubicación. Los profesionales verificados responderán con ofertas.",
          },
          {
            q: "¿Cómo encuentro un profesional?",
            a: "Usa la búsqueda, navega por categorías o consulta el mapa interactivo. Puedes filtrar por distancia, valoración, disponibilidad y categoría.",
          },
          {
            q: "¿Puedo reservar un profesional directamente?",
            a: "Sí. Visita el perfil de un profesional, consulta su calendario de disponibilidad, selecciona un horario y envía una solicitud de reserva. El profesional confirma o propone otro horario.",
          },
          {
            q: "¿Mi dirección personal es visible públicamente?",
            a: "No. Tu dirección completa solo se comparte con el profesional asignado después de aceptar su oferta.",
          },
          {
            q: "¿Cómo funciona el pago?",
            a: "El pago se asegura mediante depósito en garantía. Pagas cuando aceptas un presupuesto. Los fondos se liberan al profesional solo cuando se confirma la misión completada.",
          },
        ],
      },
      {
        icon: "🔧",
        title: "Para profesionales",
        items: [
          {
            q: "¿Cómo me registro como profesional?",
            a: 'Elige el tipo de cuenta "Profesional" al registrarte. Completa tu perfil con el nombre de la empresa, servicios y la sección obligatoria de Información Fiscal y Legal (cumplimiento DAC7).',
          },
          {
            q: "¿Qué es DAC7 y por qué necesito proporcionar información fiscal?",
            a: "DAC7 es una directiva fiscal de la UE (2021/514/UE) que obliga a las plataformas digitales a declarar los ingresos profesionales a las autoridades fiscales. TaskVoilà está registrado en Irlanda con los Revenue Commissioners (ROS). Debes proporcionar tu NIF, IBAN y estado legal antes de publicar anuncios.",
          },
          {
            q: "¿Cómo funciona el calendario de disponibilidad?",
            a: "Configura tus días y horarios de trabajo en tu panel. Bloquea fechas de vacaciones, bloquea automáticamente los festivos de tu país. Los clientes ven tu calendario en verde (disponible), rojo (reservado) y gris (cerrado).",
          },
          {
            q: "¿Los clientes pueden ver mi dirección personal?",
            a: "No. Solo tu área de servicio (ciudad/zona) se muestra públicamente. Tu dirección completa es privada.",
          },
        ],
      },
      {
        icon: "🔑",
        title: "Cuenta y Seguridad",
        items: [
          {
            q: "¿Cómo inicio sesión?",
            a: "TaskVoilà usa autenticación segura nativa de ICP: Internet Identity, NFID (con Google) o Plug Wallet. No se requiere nombre de usuario ni contraseña.",
          },
          {
            q: "¿Cómo recupero mi cuenta si pierdo mi dispositivo?",
            a: "Depende de tu método de inicio de sesión:\n\n• Internet Identity: Solo puedes recuperar tu cuenta si configuraste un dispositivo de recuperación o frase de recuperación en identity.ic0.app con antelación. Sin eso, la cuenta es inaccesible.\n\n• NFID (Google): Simplemente inicia sesión con tu cuenta de Google desde cualquier dispositivo.\n\n• Plug Wallet: Usa tu frase de recuperación de 12 palabras para restaurar tu wallet en cualquier dispositivo.\n\nRecomendamos guardar tu método de inicio de sesión al registrarte.",
          },
          {
            q: "¿Mis datos están seguros?",
            a: "Todos los datos personales (nombre, teléfono, dirección, IBAN) están cifrados con AES-256 antes de enviarse al backend. TaskVoilà cumple con el RGPD y sigue la legislación europea de protección de datos.",
          },
        ],
      },
      {
        icon: "🔨",
        title: "Alquiler de equipos",
        items: [
          {
            q: "¿Cómo funciona el alquiler de equipos?",
            a: 'Navega por la sección "Alquiler de Equipos", elige una categoría (herramientas, jardín, transporte, etc.), contacta al propietario y organiza el alquiler. TaskVoilà cobra 15% de comisión para alquileres de menos de 4 días, 12% para 4 días o más.',
          },
          {
            q: "¿Quién puede alquilar o publicar equipos?",
            a: "Tanto particulares como profesionales pueden publicar equipos en alquiler o alquilar de otros usuarios.",
          },
        ],
      },
      {
        icon: "💻",
        title: "Técnico",
        items: [
          {
            q: "¿Puedo usar TaskVoilà en mi teléfono?",
            a: 'Sí. TaskVoilà es una Progressive Web App (PWA). En Android, añádela a tu pantalla de inicio desde Chrome. En iPhone, usa Safari y toca "Añadir a pantalla de inicio".',
          },
          {
            q: "¿Por qué no puedo ver anuncios sin iniciar sesión?",
            a: "Por privacidad y seguridad, los anuncios solo son visibles para los miembros registrados. Los visitantes ven una vista previa con una invitación a registrarse.",
          },
        ],
      },
    ],
  },
  it: {
    hero: "Domande Frequenti",
    subtitle: "Tutto quello che devi sapere su TaskVoilà",
    categories: [
      {
        icon: "❓",
        title: "Come funziona TaskVoilà",
        items: [
          {
            q: "Cos'è TaskVoilà?",
            a: "TaskVoilà è un marketplace di servizi locali che mette in contatto privati con professionisti verificati per lavori di artigianato, riparazioni, installazioni e noleggio attrezzature. Tutto in 3 clic.",
          },
          {
            q: "In quali paesi è disponibile TaskVoilà?",
            a: "Francia, Belgio, Regno Unito, Irlanda, Germania, Spagna, Italia, Portogallo, Paesi Bassi, Grecia, Svizzera e Lussemburgo.",
          },
          {
            q: "La piattaforma è gratuita?",
            a: "La registrazione è gratuita. TaskVoilà prende una commissione solo al completamento di una missione: 8% sui servizi, 15% o 12% sul noleggio attrezzature in base alla durata.",
          },
        ],
      },
      {
        icon: "🏠",
        title: "Per i clienti",
        items: [
          {
            q: "Come pubblico un'offerta?",
            a: "Crea un account, completa il profilo, clicca sul pulsante +, descrivi la tua necessità, imposta un budget e una posizione. I professionisti verificati risponderanno con offerte.",
          },
          {
            q: "Come trovo un professionista?",
            a: "Usa la ricerca, sfoglia le categorie o visualizza la mappa interattiva. Puoi filtrare per distanza, valutazione, disponibilità e categoria.",
          },
          {
            q: "Posso prenotare direttamente un professionista?",
            a: "Sì. Visita il profilo di un professionista, visualizza il suo calendario disponibilità, seleziona uno slot e invia una richiesta di prenotazione. Il professionista conferma o propone un altro orario.",
          },
          {
            q: "Il mio indirizzo personale è visibile pubblicamente?",
            a: "No. Il tuo indirizzo completo viene condiviso solo con il professionista assegnato dopo aver accettato la sua offerta.",
          },
          {
            q: "Come funziona il pagamento?",
            a: "Il pagamento è garantito tramite escrow. Paghi quando accetti un preventivo. I fondi vengono rilasciati al professionista solo dopo la conferma del completamento della missione.",
          },
        ],
      },
      {
        icon: "🔧",
        title: "Per i professionisti",
        items: [
          {
            q: "Come mi registro come professionista?",
            a: 'Scegli il tipo di account "Professionista" alla registrazione. Completa il profilo con ragione sociale, servizi e la sezione obbligatoria Informazioni Fiscali e Legali (conformità DAC7).',
          },
          {
            q: "Cos'è la DAC7 e perché devo fornire informazioni fiscali?",
            a: "La DAC7 è una direttiva fiscale UE (2021/514/UE) che obbliga le piattaforme digitali a dichiarare i redditi professionali alle autorità fiscali. TaskVoilà è registrato in Irlanda presso i Revenue Commissioners (ROS). Devi fornire il tuo codice fiscale/P.IVA, IBAN e stato legale prima di pubblicare annunci.",
          },
          {
            q: "Come funziona il calendario disponibilità?",
            a: "Imposta i tuoi giorni e orari di lavoro nella dashboard. Blocca date di ferie, blocca automaticamente le festività del tuo paese. I clienti vedono il tuo calendario in verde (disponibile), rosso (prenotato), grigio (chiuso).",
          },
          {
            q: "I clienti possono vedere il mio indirizzo personale?",
            a: "No. Solo la tua area di servizio (città/zona) è mostrata pubblicamente. Il tuo indirizzo completo è privato.",
          },
        ],
      },
      {
        icon: "🔑",
        title: "Account e Sicurezza",
        items: [
          {
            q: "Come accedo?",
            a: "TaskVoilà usa autenticazione sicura nativa ICP: Internet Identity, NFID (con Google) o Plug Wallet. Nessun nome utente o password richiesti.",
          },
          {
            q: "Come recupero il mio account se perdo il dispositivo?",
            a: "Dipende dal metodo di accesso:\n\n• Internet Identity: puoi recuperare l'account solo se hai configurato un dispositivo di recupero su identity.ic0.app in anticipo. Senza di esso, l'account è inaccessibile.\n\n• NFID (Google): accedi semplicemente con il tuo account Google da qualsiasi dispositivo.\n\n• Plug Wallet: usa la tua frase di recupero di 12 parole per ripristinare il wallet su un nuovo dispositivo.\n\nConsigliamo vivamente di salvare il metodo di accesso appena ci si registra.",
          },
          {
            q: "I miei dati sono al sicuro?",
            a: "Tutti i dati personali (nome, telefono, indirizzo, IBAN) sono crittografati con AES-256 prima di essere inviati al backend. TaskVoilà è conforme al GDPR e segue la normativa europea sulla protezione dei dati.",
          },
        ],
      },
      {
        icon: "🔨",
        title: "Noleggio attrezzature",
        items: [
          {
            q: "Come funziona il noleggio attrezzature?",
            a: 'Sfoglia la sezione "Noleggio Attrezzature", scegli una categoria (utensili, giardino, trasporto, ecc.), contatta il proprietario e organizza il noleggio. TaskVoilà applica il 15% di commissione per noleggi inferiori a 4 giorni, 12% per 4 giorni o più.',
          },
          {
            q: "Chi può noleggiare o pubblicare attrezzature?",
            a: "Sia privati che professionisti possono pubblicare attrezzature in noleggio o noleggiarle da altri utenti.",
          },
        ],
      },
      {
        icon: "💻",
        title: "Tecnico",
        items: [
          {
            q: "Posso usare TaskVoilà sul mio telefono?",
            a: 'Sì. TaskVoilà è una Progressive Web App (PWA). Su Android aggiungila alla schermata home da Chrome. Su iPhone usa Safari e tocca "Aggiungi a schermata home".',
          },
          {
            q: "Perché non posso vedere gli annunci senza accedere?",
            a: "Per privacy e sicurezza, gli annunci sono visibili solo ai membri registrati. I visitatori vedono un'anteprima con un invito a registrarsi.",
          },
        ],
      },
    ],
  },
  pt: {
    hero: "Perguntas Frequentes",
    subtitle: "Tudo o que precisas de saber sobre TaskVoilà",
    categories: [
      {
        icon: "❓",
        title: "Como funciona o TaskVoilà",
        items: [
          {
            q: "O que é o TaskVoilà?",
            a: "O TaskVoilà é um marketplace de serviços locais que liga particulares a profissionais verificados para trabalhos de bricolagem, reparações, instalações e aluguer de equipamentos. Tudo em 3 cliques.",
          },
          {
            q: "Em que países está disponível o TaskVoilà?",
            a: "França, Bélgica, Reino Unido, Irlanda, Alemanha, Espanha, Itália, Portugal, Países Baixos, Grécia, Suíça e Luxemburgo.",
          },
          {
            q: "A plataforma é gratuita?",
            a: "O registo é gratuito. O TaskVoilà cobra uma comissão apenas quando uma missão é concluída: 8% nos serviços, 15% ou 12% no aluguer de equipamentos consoante a duração.",
          },
        ],
      },
      {
        icon: "🏠",
        title: "Para clientes",
        items: [
          {
            q: "Como publico uma tarefa?",
            a: "Cria uma conta, completa o perfil, clica no botão +, descreve a tua necessidade, define um orçamento e localização. Profissionais verificados responderão com propostas.",
          },
          {
            q: "Como encontro um profissional?",
            a: "Usa a pesquisa, navega por categorias ou consulta o mapa interativo. Podes filtrar por distância, avaliação, disponibilidade e categoria.",
          },
          {
            q: "Posso reservar um profissional diretamente?",
            a: "Sim. Visita o perfil de um profissional, vê o seu calendário de disponibilidade, seleciona um horário e envia um pedido de reserva. O profissional confirma ou propõe outro horário.",
          },
          {
            q: "A minha morada pessoal é visível publicamente?",
            a: "Não. A tua morada completa só é partilhada com o profissional designado após aceitares a oferta.",
          },
          {
            q: "Como funciona o pagamento?",
            a: "O pagamento é assegurado por escrow. Pagas quando aceitas um orçamento. Os fundos são libertados ao profissional apenas após a confirmação da conclusão da missão.",
          },
        ],
      },
      {
        icon: "🔧",
        title: "Para profissionais",
        items: [
          {
            q: "Como me registo como profissional?",
            a: 'Escolhe o tipo de conta "Profissional" no registo. Completa o perfil com o nome da empresa, serviços e a secção obrigatória de Informação Fiscal e Legal (conformidade DAC7).',
          },
          {
            q: "O que é a DAC7 e por que preciso de fornecer informações fiscais?",
            a: "A DAC7 é uma diretiva fiscal da UE (2021/514/UE) que obriga as plataformas digitais a reportar os rendimentos profissionais às autoridades fiscais. O TaskVoilà está registado na Irlanda junto dos Revenue Commissioners (ROS). Deves fornecer o teu NIF, IBAN e estatuto legal antes de publicar anúncios.",
          },
          {
            q: "Como funciona o calendário de disponibilidade?",
            a: "Define os teus dias e horários de trabalho no painel. Bloqueia datas de férias, bloqueia automaticamente os feriados do teu país. Os clientes veem o teu calendário a verde (disponível), vermelho (reservado) e cinzento (fechado).",
          },
          {
            q: "Os clientes podem ver a minha morada pessoal?",
            a: "Não. Apenas a tua área de serviço (cidade/zona) é mostrada publicamente. A tua morada completa é privada.",
          },
        ],
      },
      {
        icon: "🔑",
        title: "Conta e Segurança",
        items: [
          {
            q: "Como faço login?",
            a: "O TaskVoilà usa autenticação segura nativa ICP: Internet Identity, NFID (com Google) ou Plug Wallet. Não é necessário nome de utilizador nem senha.",
          },
          {
            q: "Como recupero a minha conta se perder o dispositivo?",
            a: "Depende do método de login:\n\n• Internet Identity: só podes recuperar a conta se configuraste um dispositivo de recuperação ou frase de recuperação em identity.ic0.app antecipadamente. Sem isso, a conta é inacessível.\n\n• NFID (Google): basta fazer login com a tua conta Google em qualquer dispositivo.\n\n• Plug Wallet: usa a tua frase de recuperação de 12 palavras para restaurar o wallet num novo dispositivo.\n\nRecomendamos guardar o método de login assim que te registas.",
          },
          {
            q: "Os meus dados estão seguros?",
            a: "Todos os dados pessoais (nome, telefone, morada, IBAN) são cifrados com AES-256 antes de serem enviados ao backend. O TaskVoilà é conforme ao RGPD e segue a legislação europeia de proteção de dados.",
          },
        ],
      },
      {
        icon: "🔨",
        title: "Aluguer de equipamentos",
        items: [
          {
            q: "Como funciona o aluguer de equipamentos?",
            a: 'Navega pela secção "Aluguer de Equipamentos", escolhe uma categoria (ferramentas, jardim, transporte, etc.), contacta o proprietário e combina o aluguer. O TaskVoilà cobra 15% de comissão para alugueres inferiores a 4 dias, 12% para 4 dias ou mais.',
          },
          {
            q: "Quem pode alugar ou publicar equipamentos?",
            a: "Tanto particulares como profissionais podem publicar equipamentos para aluguer ou alugar de outros utilizadores.",
          },
        ],
      },
      {
        icon: "💻",
        title: "Técnico",
        items: [
          {
            q: "Posso usar o TaskVoilà no telemóvel?",
            a: 'Sim. O TaskVoilà é uma Progressive Web App (PWA). No Android, adiciona-o ao ecrã inicial a partir do Chrome. No iPhone, usa o Safari e toca em "Adicionar ao ecrã inicial".',
          },
          {
            q: "Por que não consigo ver anúncios sem fazer login?",
            a: "Por privacidade e segurança, os anúncios são visíveis apenas para membros registados. Os visitantes veem uma pré-visualização com um convite para se registarem.",
          },
        ],
      },
    ],
  },
  nl: {
    hero: "Veelgestelde Vragen",
    subtitle: "Alles wat je moet weten over TaskVoilà",
    categories: [
      {
        icon: "❓",
        title: "Hoe TaskVoilà werkt",
        items: [
          {
            q: "Wat is TaskVoilà?",
            a: "TaskVoilà is een lokale dienstenmarktplaats die particulieren verbindt met geverifieerde professionals voor klussen, reparaties, installaties en apparatuurverhuur. Alles in 3 klikken.",
          },
          {
            q: "In welke landen is TaskVoilà beschikbaar?",
            a: "Frankrijk, België, Verenigd Koninkrijk, Ierland, Duitsland, Spanje, Italië, Portugal, Nederland, Griekenland, Zwitserland en Luxemburg.",
          },
          {
            q: "Is het platform gratis?",
            a: "Registratie is gratis. TaskVoilà rekent alleen een commissie als een opdracht is voltooid: 8% op diensten, 15% of 12% op apparatuurverhuur afhankelijk van de duur.",
          },
        ],
      },
      {
        icon: "🏠",
        title: "Voor klanten",
        items: [
          {
            q: "Hoe plaats ik een opdracht?",
            a: "Maak een account aan, vul je profiel in, klik op de +-knop, beschrijf je behoefte, stel een budget en locatie in. Geverifieerde professionals reageren met aanbiedingen.",
          },
          {
            q: "Hoe vind ik een professional?",
            a: "Gebruik de zoekfunctie, blader op categorie of bekijk de interactieve kaart. Je kunt filteren op afstand, beoordeling, beschikbaarheid en categorie.",
          },
          {
            q: "Kan ik direct een professional boeken?",
            a: "Ja. Bezoek het profiel van een professional, bekijk hun beschikbaarheidskalender, selecteer een tijdslot en stuur een boekingsverzoek. De professional bevestigt of stelt een andere tijd voor.",
          },
          {
            q: "Is mijn persoonlijk adres openbaar zichtbaar?",
            a: "Nee. Je volledige adres wordt alleen gedeeld met de toegewezen professional nadat je hun aanbod hebt geaccepteerd.",
          },
          {
            q: "Hoe werkt betaling?",
            a: "Betaling is beveiligd via escrow. Je betaalt wanneer je een offerte accepteert. Geld wordt pas vrijgegeven aan de professional na bevestiging dat de opdracht is voltooid.",
          },
        ],
      },
      {
        icon: "🔧",
        title: "Voor professionals",
        items: [
          {
            q: "Hoe registreer ik als professional?",
            a: 'Kies het accounttype "Professional" bij registratie. Vul je profiel in met bedrijfsnaam, diensten en de verplichte sectie Belasting & Juridische Informatie (DAC7-naleving).',
          },
          {
            q: "Wat is DAC7 en waarom moet ik belastinginformatie opgeven?",
            a: "DAC7 is een EU-belastingrichtlijn (2021/514/EU) die digitale platforms verplicht beroepsinkomsten te rapporteren aan belastingautoriteiten. TaskVoilà is geregistreerd in Ierland bij de Revenue Commissioners (ROS). Je moet je belasting-ID, IBAN en juridische status opgeven voor het publiceren van advertenties.",
          },
          {
            q: "Hoe werkt de beschikbaarheidskalender?",
            a: "Stel je werkdagen en -uren in via je dashboard. Blokkeer vakantiedatums, blokkeer automatisch feestdagen voor jouw land. Klanten zien je kalender in groen (beschikbaar), rood (geboekt) en grijs (gesloten).",
          },
          {
            q: "Kunnen klanten mijn persoonlijk adres zien?",
            a: "Nee. Alleen je servicegebied (stad/zone) wordt openbaar getoond. Je volledige adres is privé.",
          },
        ],
      },
      {
        icon: "🔑",
        title: "Account & Beveiliging",
        items: [
          {
            q: "Hoe log ik in?",
            a: "TaskVoilà gebruikt veilige ICP-native authenticatie: Internet Identity, NFID (met Google) of Plug Wallet. Geen gebruikersnaam of wachtwoord vereist.",
          },
          {
            q: "Hoe herstel ik mijn account als ik mijn apparaat verlies?",
            a: "Hangt af van je inlogmethode:\n\n• Internet Identity: je kunt je account alleen herstellen als je vooraf een hersteldapparaat of herstelzin hebt ingesteld op identity.ic0.app. Zonder dit is het account ontoegankelijk.\n\n• NFID (Google): log gewoon in met je Google-account vanaf elk apparaat.\n\n• Plug Wallet: gebruik je herstelzin van 12 woorden om je wallet te herstellen op een nieuw apparaat.\n\nWe raden sterk aan je inlogmethode op te slaan zodra je je registreert.",
          },
          {
            q: "Zijn mijn gegevens veilig?",
            a: "Alle persoonlijke gegevens (naam, telefoon, adres, IBAN) zijn versleuteld met AES-256 voordat ze naar de backend worden verzonden. TaskVoilà voldoet aan de AVG en volgt de Europese gegevensbeschermingswetgeving.",
          },
        ],
      },
      {
        icon: "🔨",
        title: "Apparatuurverhuur",
        items: [
          {
            q: "Hoe werkt apparatuurverhuur?",
            a: 'Blader door de sectie "Apparatuurverhuur", kies een categorie (gereedschap, tuin, transport, etc.), neem contact op met de eigenaar en regel de verhuur. TaskVoilà rekent 15% commissie voor verhuur onder 4 dagen, 12% voor 4 dagen of meer.',
          },
          {
            q: "Wie kan apparatuur huren of aanbieden?",
            a: "Zowel particulieren als professionals kunnen apparatuur te huur aanbieden of van anderen huren.",
          },
        ],
      },
      {
        icon: "💻",
        title: "Technisch",
        items: [
          {
            q: "Kan ik TaskVoilà op mijn telefoon gebruiken?",
            a: 'Ja. TaskVoilà is een Progressive Web App (PWA). Op Android voeg je het toe aan je startscherm via Chrome. Op iPhone gebruik je Safari en tik je op "Voeg toe aan beginscherm".',
          },
          {
            q: "Waarom kan ik advertenties niet zien zonder in te loggen?",
            a: "Voor privacy en beveiliging zijn advertenties alleen zichtbaar voor geregistreerde leden. Bezoekers zien een voorbeeld met een uitnodiging om zich te registreren.",
          },
        ],
      },
    ],
  },
  el: {
    hero: "Συχνές Ερωτήσεις",
    subtitle: "Όλα όσα χρειάζεται να γνωρίζεις για το TaskVoilà",
    categories: [
      {
        icon: "❓",
        title: "Πώς λειτουργεί το TaskVoilà",
        items: [
          {
            q: "Τι είναι το TaskVoilà;",
            a: "Το TaskVoilà είναι μια αγορά τοπικών υπηρεσιών που συνδέει ιδιώτες με επαληθευμένους επαγγελματίες για εργασίες επισκευής, εγκατάστασης και ενοικίαση εξοπλισμού. Όλα σε 3 κλικ.",
          },
          {
            q: "Σε ποιες χώρες είναι διαθέσιμο το TaskVoilà;",
            a: "Γαλλία, Βέλγιο, Ηνωμένο Βασίλειο, Ιρλανδία, Γερμανία, Ισπανία, Ιταλία, Πορτογαλία, Ολλανδία, Ελλάδα, Ελβετία και Λουξεμβούργο.",
          },
          {
            q: "Η πλατφόρμα είναι δωρεάν;",
            a: "Η εγγραφή είναι δωρεάν. Το TaskVoilà χρεώνει προμήθεια μόνο όταν ολοκληρωθεί μια αποστολή: 8% στις υπηρεσίες, 15% ή 12% στην ενοικίαση εξοπλισμού ανάλογα με τη διάρκεια.",
          },
        ],
      },
      {
        icon: "🏠",
        title: "Για πελάτες",
        items: [
          {
            q: "Πώς δημοσιεύω μια εργασία;",
            a: "Δημιούργησε λογαριασμό, συμπλήρωσε το προφίλ σου, κάνε κλικ στο κουμπί +, περίγραψε την ανάγκη σου, ορίστε προϋπολογισμό και τοποθεσία. Επαληθευμένοι επαγγελματίες θα απαντήσουν με προσφορές.",
          },
          {
            q: "Πώς βρίσκω επαγγελματία;",
            a: "Χρησιμοποίησε την αναζήτηση, περιήγηση ανά κατηγορία ή δες τον διαδραστικό χάρτη. Μπορείς να φιλτράρεις κατά απόσταση, αξιολόγηση, διαθεσιμότητα και κατηγορία.",
          },
          {
            q: "Μπορώ να κλείσω απευθείας έναν επαγγελματία;",
            a: "Ναι. Επισκέψου το προφίλ του επαγγελματία, δες το ημερολόγιο διαθεσιμότητάς του, επίλεξε χρονοθυρίδα και στείλε αίτημα κράτησης. Ο επαγγελματίας επιβεβαιώνει ή προτείνει άλλη ώρα.",
          },
          {
            q: "Είναι η προσωπική μου διεύθυνση ορατή δημόσια;",
            a: "Όχι. Η πλήρης διεύθυνσή σου κοινοποιείται μόνο στον ανατεθειμένο επαγγελματία αφού αποδεχτείς την προσφορά του.",
          },
          {
            q: "Πώς γίνεται η πληρωμή;",
            a: "Η πληρωμή ασφαλίζεται μέσω escrow. Πληρώνεις όταν αποδέχεσαι μια προσφορά. Τα χρήματα αποδεσμεύονται στον επαγγελματία μόνο μετά την επιβεβαίωση ολοκλήρωσης της αποστολής.",
          },
        ],
      },
      {
        icon: "🔧",
        title: "Για επαγγελματίες",
        items: [
          {
            q: "Πώς εγγράφομαι ως επαγγελματίας;",
            a: 'Επίλεξε τον τύπο λογαριασμού "Επαγγελματίας" κατά την εγγραφή. Συμπλήρωσε το προφίλ με επωνυμία εταιρείας, υπηρεσίες και την υποχρεωτική ενότητα Φορολογικών και Νομικών Πληροφοριών (συμμόρφωση DAC7).',
          },
          {
            q: "Τι είναι η DAC7 και γιατί πρέπει να παρέχω φορολογικές πληροφορίες;",
            a: "Η DAC7 είναι ευρωπαϊκή φορολογική οδηγία (2021/514/ΕΕ) που υποχρεώνει τις ψηφιακές πλατφόρμες να αναφέρουν επαγγελματικά εισοδήματα στις φορολογικές αρχές. Το TaskVoilà είναι εγγεγραμμένο στην Ιρλανδία στους Revenue Commissioners (ROS). Πρέπει να παρέχεις ΑΦΜ, IBAN και νομικό καθεστώς πριν δημοσιεύσεις.",
          },
          {
            q: "Πώς λειτουργεί το ημερολόγιο διαθεσιμότητας;",
            a: "Ορίστε τις εργάσιμες ημέρες και ώρες σου στον πίνακα ελέγχου. Μπλοκάρισε ημερομηνίες διακοπών, αυτόματα μπλοκάρισμα αργιών χώρας. Οι πελάτες βλέπουν το ημερολόγιό σου σε πράσινο (διαθέσιμο), κόκκινο (κλεισμένο) και γκρι (κλειστό).",
          },
          {
            q: "Μπορούν οι πελάτες να δουν την προσωπική μου διεύθυνση;",
            a: "Όχι. Μόνο η περιοχή υπηρεσιών σου (πόλη/ζώνη) εμφανίζεται δημόσια. Η πλήρης διεύθυνσή σου παραμένει ιδιωτική.",
          },
        ],
      },
      {
        icon: "🔑",
        title: "Λογαριασμός & Ασφάλεια",
        items: [
          {
            q: "Πώς συνδέομαι;",
            a: "Το TaskVoilà χρησιμοποιεί ασφαλή εγγενή πιστοποίηση ICP: Internet Identity, NFID (με Google) ή Plug Wallet. Δεν απαιτείται όνομα χρήστη ή κωδικός.",
          },
          {
            q: "Πώς ανακτώ τον λογαριασμό μου αν χάσω τη συσκευή μου;",
            a: "Εξαρτάται από τη μέθοδο σύνδεσής σου:\n\n• Internet Identity: μπορείς να ανακτήσεις τον λογαριασμό μόνο αν έχεις ρυθμίσει συσκευή ανάκτησης στο identity.ic0.app εκ των προτέρων. Χωρίς αυτό ο λογαριασμός είναι αδύνατη η πρόσβαση.\n\n• NFID (Google): συνδέσου απλά με τον λογαριασμό Google σου από οποιαδήποτε συσκευή.\n\n• Plug Wallet: χρησιμοποίησε τη φράση ανάκτησης 12 λέξεων για αποκατάσταση του wallet σε νέα συσκευή.\n\nΣυνιστούμε ανεπιφύλακτα να αποθηκεύσεις τη μέθοδο σύνδεσής σου μόλις εγγραφείς.",
          },
          {
            q: "Είναι ασφαλή τα δεδομένα μου;",
            a: "Όλα τα προσωπικά δεδομένα (όνομα, τηλέφωνο, διεύθυνση, IBAN) κρυπτογραφούνται με AES-256 πριν αποσταλούν στο backend. Το TaskVoilà συμμορφώνεται με τον ΓΚΠΔ και ακολουθεί την ευρωπαϊκή νομοθεσία για την προστασία δεδομένων.",
          },
        ],
      },
      {
        icon: "🔨",
        title: "Ενοικίαση εξοπλισμού",
        items: [
          {
            q: "Πώς λειτουργεί η ενοικίαση εξοπλισμού;",
            a: 'Περιήγηση στην ενότητα "Ενοικίαση Εξοπλισμού", επίλεξε κατηγορία (εργαλεία, κήπος, μεταφορά κ.λπ.), επικοινώνησε με τον ιδιοκτήτη και ρύθμισε την ενοικίαση. Το TaskVoilà χρεώνει 15% για ενοικιάσεις κάτω των 4 ημερών, 12% για 4 ημέρες και άνω.',
          },
          {
            q: "Ποιος μπορεί να νοικιάσει ή να δημοσιεύσει εξοπλισμό;",
            a: "Τόσο ιδιώτες όσο και επαγγελματίες μπορούν να δημοσιεύσουν εξοπλισμό για ενοικίαση ή να νοικιάσουν από άλλους χρήστες.",
          },
        ],
      },
      {
        icon: "💻",
        title: "Τεχνικά",
        items: [
          {
            q: "Μπορώ να χρησιμοποιήσω το TaskVoilà στο κινητό μου;",
            a: 'Ναι. Το TaskVoilà είναι Progressive Web App (PWA). Στο Android, πρόσθεσέ το στην αρχική οθόνη μέσω Chrome. Στο iPhone, χρησιμοποίησε Safari και πάτησε "Προσθήκη στην αρχική οθόνη".',
          },
          {
            q: "Γιατί δεν μπορώ να δω αγγελίες χωρίς σύνδεση;",
            a: "Για λόγους απορρήτου και ασφάλειας, οι αγγελίες είναι ορατές μόνο σε εγγεγραμμένα μέλη. Οι επισκέπτες βλέπουν μια προεπισκόπηση με πρόσκληση εγγραφής.",
          },
        ],
      },
    ],
  },
  lu: {
    hero: "Questions Fréquentes",
    subtitle: "Tout ce que vous devez savoir sur TaskVoilà",
    categories: [
      {
        icon: "❓",
        title: "Comment fonctionne TaskVoilà",
        items: [
          {
            q: "Qu'est-ce que TaskVoilà ?",
            a: "TaskVoilà est une marketplace de services locaux qui met en relation des particuliers avec des professionnels vérifiés pour des travaux, des réparations, des installations et de la location de matériel. Le tout en 3 clics.",
          },
          {
            q: "Dans quels pays TaskVoilà est-il disponible ?",
            a: "France, Belgique, Royaume-Uni, Irlande, Allemagne, Espagne, Italie, Portugal, Pays-Bas, Grèce, Suisse et Luxembourg.",
          },
          {
            q: "La plateforme est-elle gratuite ?",
            a: "L'inscription est gratuite. TaskVoilà prend une commission uniquement lorsqu'une mission est terminée : 8 % sur les services, 15 % ou 12 % sur la location de matériel selon la durée.",
          },
        ],
      },
      {
        icon: "🏠",
        title: "Pour les clients",
        items: [
          {
            q: "Comment publier une demande ?",
            a: "Créez un compte, complétez votre profil, cliquez sur le bouton +, décrivez votre besoin, fixez un budget et une localisation. Des professionnels vérifiés vous enverront des offres.",
          },
          {
            q: "Comment trouver un professionnel ?",
            a: "Utilisez la recherche, parcourez les catégories ou consultez la carte interactive. Vous pouvez filtrer par distance, note, disponibilité et catégorie.",
          },
          {
            q: "Puis-je réserver un professionnel directement ?",
            a: "Oui. Visitez son profil, consultez son calendrier, sélectionnez un créneau et envoyez une demande de réservation.",
          },
          {
            q: "Mon adresse est-elle visible publiquement ?",
            a: "Non. Votre adresse complète est partagée uniquement avec le professionnel assigné après acceptation de son offre.",
          },
          {
            q: "Comment fonctionne le paiement ?",
            a: "Le paiement est sécurisé par escrow. Les fonds sont libérés au professionnel uniquement après confirmation de la mission.",
          },
        ],
      },
      {
        icon: "🔧",
        title: "Pour les professionnels",
        items: [
          {
            q: "Comment s'inscrire en tant que professionnel ?",
            a: 'Choisissez le compte "Professionnel" à l\'inscription. Remplissez les informations fiscales et légales obligatoires (conformité DAC7).',
          },
          {
            q: "Qu'est-ce que la DAC7 ?",
            a: "La DAC7 est une directive fiscale européenne obligeant les plateformes numériques à déclarer les revenus professionnels aux autorités fiscales. TaskVoilà est enregistré en Irlande auprès des Revenue Commissioners (ROS).",
          },
          {
            q: "Comment fonctionne le calendrier de disponibilité ?",
            a: "Définissez vos jours et horaires de travail dans votre tableau de bord. Les clients voient votre calendrier en vert (disponible), rouge (réservé) et gris (fermé).",
          },
          {
            q: "Mon adresse personnelle est-elle visible ?",
            a: "Non. Seule votre zone de service est affichée publiquement.",
          },
        ],
      },
      {
        icon: "🔑",
        title: "Compte & Sécurité",
        items: [
          {
            q: "Comment se connecter ?",
            a: "TaskVoilà utilise une authentification ICP : Internet Identity, NFID (avec Google) ou Plug Wallet.",
          },
          {
            q: "Comment récupérer son compte ?",
            a: "Cela dépend de la méthode : Internet Identity nécessite un appareil de secours sur identity.ic0.app. NFID : reconnectez-vous avec Google. Plug Wallet : utilisez vos 12 mots de récupération.",
          },
          {
            q: "Les données sont-elles sécurisées ?",
            a: "Oui. Toutes les données sont chiffrées AES-256 et TaskVoilà est conforme au RGPD.",
          },
        ],
      },
      {
        icon: "🔨",
        title: "Location de matériel",
        items: [
          {
            q: "Comment fonctionne la location de matériel ?",
            a: 'Parcourez la section "Location de Matériel", choisissez une catégorie, contactez le propriétaire. Commission : 15 % < 4 jours, 12 % ≥ 4 jours.',
          },
          {
            q: "Qui peut louer ou publier du matériel ?",
            a: "Tout utilisateur inscrit, particulier ou professionnel.",
          },
        ],
      },
      {
        icon: "💻",
        title: "Technique",
        items: [
          {
            q: "Puis-je utiliser TaskVoilà sur mobile ?",
            a: "Oui. C'est une PWA. Sur Android : ajoutez via Chrome. Sur iPhone : Safari → Ajouter à l'écran d'accueil.",
          },
          {
            q: "Pourquoi dois-je me connecter pour voir les annonces ?",
            a: "Pour la confidentialité et la sécurité, les annonces ne sont visibles qu'aux membres inscrits.",
          },
        ],
      },
    ],
  },
};

export function FAQPage() {
  const { lang } = useTranslation();
  const navigate = useNavigate();

  const faqLang =
    (lang as string) === "lu"
      ? "lu"
      : (lang as string) in FAQ_DATA
        ? (lang as string)
        : "en";
  const data = FAQ_DATA[faqLang] ?? FAQ_DATA.en;

  return (
    <main className="min-h-screen bg-background" data-ocid="faq.page">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-300 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-amber-900 translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-16">
          <button
            type="button"
            onClick={() => void navigate({ to: "/" })}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors text-sm"
            data-ocid="faq.back.button"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <img
                src="/assets/generated/logo-proposal-3-squirrel-helmet-clipboard.dim_600x600.png"
                alt="TaskVoilà"
                className="w-16 h-16 object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{data.hero}</h1>
            <p className="text-amber-100 text-base md:text-lg">
              {data.subtitle}
            </p>
          </motion.div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="space-y-10">
          {data.categories.map((category, catIdx) => (
            <motion.section
              key={category.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: catIdx * 0.07 }}
              data-ocid={`faq.section.${catIdx + 1}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{category.icon}</span>
                <h2 className="text-xl font-bold text-foreground">
                  {category.title}
                </h2>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {category.items.map((item, itemIdx) => (
                  <AccordionItem
                    key={item.q}
                    value={`cat-${catIdx}-item-${itemIdx}`}
                    className="border border-border rounded-lg px-4 bg-card shadow-sm"
                    data-ocid={`faq.item.${catIdx * 10 + itemIdx + 1}`}
                  >
                    <AccordionTrigger className="text-left font-medium text-sm md:text-base hover:text-amber-600 transition-colors py-4">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 whitespace-pre-line">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.section>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-12 text-center bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8"
          data-ocid="faq.contact.card"
        >
          <span className="text-3xl">💬</span>
          <h3 className="mt-3 text-lg font-bold text-foreground">
            {lang === "fr" || (lang as string) === "lu"
              ? "Vous n'avez pas trouvé votre réponse ?"
              : lang === "de"
                ? "Keine Antwort gefunden?"
                : lang === "es"
                  ? "¿No encontraste tu respuesta?"
                  : lang === "it"
                    ? "Non hai trovato la tua risposta?"
                    : lang === "pt"
                      ? "Não encontrou a sua resposta?"
                      : lang === "nl"
                        ? "Antwoord niet gevonden?"
                        : lang === "el"
                          ? "Δεν βρήκες την απάντησή σου;"
                          : "Didn't find your answer?"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "fr" || (lang as string) === "lu"
              ? "Contactez-nous à "
              : lang === "de"
                ? "Kontaktieren Sie uns unter "
                : lang === "es"
                  ? "Contáctenos en "
                  : lang === "it"
                    ? "Contattaci a "
                    : lang === "pt"
                      ? "Contacte-nos em "
                      : lang === "nl"
                        ? "Neem contact op via "
                        : lang === "el"
                          ? "Επικοινωνήστε μαζί μας στο "
                          : "Contact us at "}
            <a
              href="mailto:hello@taskvoila.com"
              className="text-amber-600 font-semibold hover:underline"
            >
              hello@taskvoila.com
            </a>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
