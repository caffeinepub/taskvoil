import { useTranslation } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, Lock, Mail, Shield, Users } from "lucide-react";
import { motion } from "motion/react";

export function PrivacyPolicyPage() {
  const { t, lang } = useTranslation();
  const p = t.privacyPage;

  const sections = [
    {
      icon: Users,
      title: p.dataCollectedTitle,
      content: p.dataCollectedDesc,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Shield,
      title: p.usageTitle,
      content: p.usageDesc,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      icon: FileText,
      title: p.rightsTitle,
      content: p.rightsDesc,
      color: "text-primary",
      bg: "bg-primary/10",
      rights: [
        p.rightAccess,
        p.rightRectification,
        p.rightDeletion,
        p.rightPortability,
        p.rightOpposition,
      ],
    },
    {
      icon: Mail,
      title: p.contactTitle,
      content: p.contactDesc,
      color: "text-amber-600",
      bg: "bg-amber-50",
      email: "hi@taskvoila.com",
    },
  ];

  return (
    <main className="min-h-screen bg-background" data-ocid="privacy.page">
      {/* Header */}
      <section className="bg-foreground text-white py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
            data-ocid="privacy.home.link"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.common.back}
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                {p.title}
              </h1>
            </div>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
              {p.intro}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 max-w-3xl py-12">
        <div className="space-y-6">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm"
              >
                <div
                  className={`flex items-center gap-3 px-6 py-5 border-b border-border ${section.bg}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0">
                    <Icon className={`h-5 w-5 ${section.color}`} />
                  </div>
                  <h2 className="font-display font-bold text-lg text-foreground">
                    {section.title}
                  </h2>
                </div>
                <div className="px-6 py-5">
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>

                  {section.rights && (
                    <ul className="mt-4 space-y-2">
                      {section.rights.map((right) => (
                        <li
                          key={right}
                          className="flex items-start gap-2 text-sm text-foreground"
                        >
                          <span
                            className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${section.bg.replace("bg-", "bg-").replace("/10", "").replace("/50", "")}`}
                            style={{
                              background:
                                section.color === "text-primary"
                                  ? "oklch(var(--primary))"
                                  : section.color === "text-secondary"
                                    ? "oklch(var(--secondary))"
                                    : undefined,
                            }}
                          />
                          {right}
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.email && (
                    <div className="mt-4">
                      <a
                        href={`mailto:${section.email}`}
                        className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary/80 transition-colors"
                        data-ocid="privacy.contact.link"
                      >
                        <Mail className="h-4 w-4" />
                        {section.email}
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Address Privacy section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm"
          data-ocid="privacy.address.panel"
        >
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border bg-purple-50">
            <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="font-display font-bold text-lg text-foreground">
              {lang === "fr"
                ? "Confidentialité de l'adresse"
                : lang === "de"
                  ? "Adressdatenschutz"
                  : lang === "es"
                    ? "Privacidad del domicilio"
                    : lang === "it"
                      ? "Riservatezza dell'indirizzo"
                      : lang === "pt"
                        ? "Privacidade do endereço"
                        : lang === "nl"
                          ? "Privacybescherming adres"
                          : lang === "el"
                            ? "Απόρρητο διεύθυνσης"
                            : "Address Privacy"}
            </h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-muted-foreground leading-relaxed">
              {lang === "fr"
                ? "Votre adresse postale complète est strictement privée. Elle n'est jamais affichée publiquement sur la plateforme. Elle est uniquement communiquée au professionnel assigné à votre mission, et seulement après que vous avez accepté son devis. Aucun autre utilisateur, visiteur, ou tiers n'a accès à cette information."
                : lang === "de"
                  ? "Ihre vollständige Postanschrift ist streng privat. Sie wird auf der Plattform nie öffentlich angezeigt. Sie wird nur dem Profi mitgeteilt, der Ihrem Auftrag zugewiesen wurde, und zwar erst nachdem Sie sein Angebot angenommen haben. Kein anderer Nutzer, Besucher oder Dritter hat Zugang zu diesen Informationen."
                  : lang === "es"
                    ? "Su dirección postal completa es estrictamente privada. Nunca se muestra públicamente en la plataforma. Solo se comunica al profesional asignado a su misión, y únicamente después de que haya aceptado su presupuesto. Ningún otro usuario, visitante o tercero tiene acceso a esta información."
                    : lang === "it"
                      ? "Il suo indirizzo postale completo è strettamente privato. Non viene mai visualizzato pubblicamente sulla piattaforma. Viene comunicato solo al professionista assegnato alla sua missione, e solo dopo che lei ha accettato il suo preventivo. Nessun altro utente, visitatore o terzo ha accesso a queste informazioni."
                      : lang === "pt"
                        ? "O seu endereço postal completo é estritamente privado. Nunca é exibido publicamente na plataforma. É comunicado apenas ao profissional atribuído à sua missão, e apenas após ter aceitado o seu orçamento. Nenhum outro utilizador, visitante ou terceiro tem acesso a esta informação."
                        : lang === "nl"
                          ? "Uw volledige postadres is strikt privé. Het wordt nooit openbaar weergegeven op het platform. Het wordt alleen gedeeld met de professional die aan uw opdracht is toegewezen, en alleen nadat u zijn offerte heeft geaccepteerd. Geen enkele andere gebruiker, bezoeker of derde partij heeft toegang tot deze informatie."
                          : lang === "el"
                            ? "Η πλήρης ταχυδρομική σας διεύθυνση είναι αυστηρά ιδιωτική. Δεν εμφανίζεται ποτέ δημόσια στην πλατφόρμα. Κοινοποιείται μόνο στον επαγγελματία που έχει αναλάβει την αποστολή σας, και μόνο αφού έχετε αποδεχθεί την προσφορά του. Κανένας άλλος χρήστης, επισκέπτης ή τρίτος δεν έχει πρόσβαση σε αυτές τις πληροφορίες."
                            : "Your full postal address is strictly private. It is never displayed publicly on the platform. It is only shared with the professional assigned to your mission, and only after you have accepted their quote. No other user, visitor, or third party has access to this information."}
            </p>
          </div>
        </motion.div>

        {/* DAC7 Retention section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-sm"
          data-ocid="privacy.dac7.panel"
        >
          <div className="flex items-center gap-3 px-6 py-5 border-b border-amber-200 bg-amber-50">
            <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="font-display font-bold text-lg text-foreground">
              {lang === "fr"
                ? "Conservation des données (DAC7)"
                : lang === "de"
                  ? "Datenspeicherung (DAC7)"
                  : lang === "es"
                    ? "Retención de datos (DAC7)"
                    : lang === "it"
                      ? "Conservazione dei dati (DAC7)"
                      : lang === "pt"
                        ? "Retenção de dados (DAC7)"
                        : lang === "nl"
                          ? "Gegevensbewaring (DAC7)"
                          : lang === "el"
                            ? "Διατήρηση δεδομένων (DAC7)"
                            : "Data Retention (DAC7)"}
            </h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-muted-foreground leading-relaxed">
              {lang === "fr"
                ? "Les données fiscales et bancaires collectées auprès des utilisateurs professionnels sont conservées pendant une durée minimale de 10 ans, conformément aux exigences de la réglementation DAC7 de l'UE."
                : lang === "de"
                  ? "Die von professionellen Nutzern erhobenen Steuer- und Bankdaten werden gemäß den Anforderungen der EU-DAC7-Verordnung mindestens 10 Jahre lang aufbewahrt."
                  : lang === "es"
                    ? "Los datos fiscales y bancarios recopilados de los usuarios profesionales se conservan durante un mínimo de 10 años, de conformidad con los requisitos de la normativa DAC7 de la UE."
                    : lang === "it"
                      ? "I dati fiscali e bancari raccolti dagli utenti professionali sono conservati per un minimo di 10 anni, in conformità con i requisiti della normativa UE DAC7."
                      : lang === "pt"
                        ? "Os dados fiscais e bancários recolhidos dos utilizadores profissionais são conservados por um mínimo de 10 anos, de acordo com os requisitos da regulamentação DAC7 da UE."
                        : lang === "nl"
                          ? "De fiscale en bankgegevens die van professionele gebruikers worden verzameld, worden minimaal 10 jaar bewaard overeenkomstig de vereisten van de EU DAC7-verordening."
                          : lang === "el"
                            ? "Τα φορολογικά και τραπεζικά δεδομένα που συλλέγονται από επαγγελματίες χρήστες διατηρούνται για τουλάχιστον 10 χρόνια, σύμφωνα με τις απαιτήσεις του κανονισμού DAC7 της ΕΕ."
                            : "Tax and banking data collected from professional users is retained for a minimum of 10 years as required by EU DAC7 regulations."}
            </p>
          </div>
        </motion.div>

        {/* Last updated */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">{p.lastUpdated}</p>
        </div>
      </section>
    </main>
  );
}
