import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export const SCENARIOS = [
  {
    id: "1",
    emoji: "📦",
    nameKey: "scenario1Name",
    descKey: "scenario1Desc",
    tasks: [
      {
        id: "1-1",
        title: "Transport de mobilier",
        desc: "Déménagement de meubles entre deux adresses",
      },
      {
        id: "1-2",
        title: "Démontage et remontage de meubles",
        desc: "Démonter et remonter lit, armoire, bureau",
      },
      {
        id: "1-3",
        title: "Nettoyage fin de bail",
        desc: "Grand ménage complet avant remise des clés",
      },
      {
        id: "1-4",
        title: "Dépôt de déchets en déchetterie",
        desc: "Évacuation des encombrants et déchets",
      },
      {
        id: "1-5",
        title: "Peinture d'une pièce",
        desc: "Rafraîchissement peinture avant état des lieux",
      },
      {
        id: "1-6",
        title: "Montage de meubles IKEA",
        desc: "Assemblage de meubles en kit",
      },
      {
        id: "1-7",
        title: "Réparations avant départ",
        desc: "Petits travaux pour récupérer la caution",
      },
      {
        id: "1-8",
        title: "Inventaire et emballage",
        desc: "Aide à l'emballage et l'étiquetage des cartons",
      },
    ],
  },
  {
    id: "2",
    emoji: "🔧",
    nameKey: "scenario2Name",
    descKey: "scenario2Desc",
    tasks: [
      {
        id: "2-1",
        title: "Fuite de plomberie",
        desc: "Réparation d'une fuite sous l'évier ou robinet",
      },
      {
        id: "2-2",
        title: "Prise électrique défectueuse",
        desc: "Remplacement ou réparation d'une prise",
      },
      {
        id: "2-3",
        title: "Porte qui grince ou coince",
        desc: "Réglage et graissage de charnières",
      },
      {
        id: "2-4",
        title: "Carrelage cassé",
        desc: "Remplacement de tuiles ou carreaux cassés",
      },
      {
        id: "2-5",
        title: "Robinet qui goutte",
        desc: "Remplacement du joint ou du robinet",
      },
      {
        id: "2-6",
        title: "Interrupteur défaillant",
        desc: "Remplacement d'un interrupteur électrique",
      },
      {
        id: "2-7",
        title: "Serrure à changer",
        desc: "Installation d'une nouvelle serrure de sécurité",
      },
      {
        id: "2-8",
        title: "Fenêtre qui ferme mal",
        desc: "Réglage des gonds et joints de fenêtre",
      },
    ],
  },
  {
    id: "3",
    emoji: "⏰",
    nameKey: "scenario3Name",
    descKey: "scenario3Desc",
    tasks: [
      {
        id: "3-1",
        title: "Ménage hebdomadaire",
        desc: "Nettoyage régulier du logement",
      },
      {
        id: "3-2",
        title: "Repassage de vêtements",
        desc: "Repassage d'une pile de linge",
      },
      {
        id: "3-3",
        title: "Courses alimentaires",
        desc: "Faire les courses selon votre liste",
      },
      {
        id: "3-4",
        title: "Entretien du jardin",
        desc: "Tonte et nettoyage régulier",
      },
      {
        id: "3-5",
        title: "Livraison de colis",
        desc: "Livraison ou récupération d'un colis",
      },
      {
        id: "3-6",
        title: "Montage de meuble",
        desc: "Assemblage d'un meuble en kit",
      },
      {
        id: "3-7",
        title: "Nettoyage des vitres",
        desc: "Lavage des fenêtres intérieur et extérieur",
      },
      {
        id: "3-8",
        title: "Bricolage divers",
        desc: "Petites réparations et installations",
      },
    ],
  },
  {
    id: "4",
    emoji: "🏠",
    nameKey: "scenario4Name",
    descKey: "scenario4Desc",
    tasks: [
      {
        id: "4-1",
        title: "Peinture du salon",
        desc: "Peinture complète des murs et plafond",
      },
      {
        id: "4-2",
        title: "Installation d'étagères",
        desc: "Pose et fixation d'étagères murales",
      },
      {
        id: "4-3",
        title: "Pose de parquet",
        desc: "Installation d'un parquet flottant",
      },
      {
        id: "4-4",
        title: "Travaux d'électricité",
        desc: "Mise aux normes ou extension électrique",
      },
      {
        id: "4-5",
        title: "Travaux de plomberie",
        desc: "Installation ou rénovation sanitaires",
      },
      {
        id: "4-6",
        title: "Isolation thermique",
        desc: "Isolation des murs, sol ou combles",
      },
      {
        id: "4-7",
        title: "Montage de cuisine",
        desc: "Installation d'une cuisine équipée",
      },
      {
        id: "4-8",
        title: "Nettoyage post-travaux",
        desc: "Grand ménage après chantier",
      },
    ],
  },
  {
    id: "5",
    emoji: "🌿",
    nameKey: "scenario5Name",
    descKey: "scenario5Desc",
    tasks: [
      {
        id: "5-1",
        title: "Tonte de pelouse",
        desc: "Tonte et ramassage de l'herbe",
      },
      {
        id: "5-2",
        title: "Taille de haie",
        desc: "Taille et mise en forme des haies",
      },
      {
        id: "5-3",
        title: "Plantation d'arbustes",
        desc: "Achat et plantation d'espèces adaptées",
      },
      {
        id: "5-4",
        title: "Arrosage automatique",
        desc: "Installation d'un système d'arrosage",
      },
      {
        id: "5-5",
        title: "Désherbage",
        desc: "Désherbage manuel ou chimique des allées",
      },
      {
        id: "5-6",
        title: "Élagage d'arbre",
        desc: "Taille et élagage d'arbres",
      },
      {
        id: "5-7",
        title: "Pose de clôture",
        desc: "Installation d'une clôture ou portail",
      },
      {
        id: "5-8",
        title: "Débarras végétaux",
        desc: "Évacuation des déchets verts",
      },
    ],
  },
];

export function ScenariosPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link to="/" data-ocid="scenarios.back_button">
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t.scenarios.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.scenarios.subtitle}
          </p>
        </div>
      </div>

      {/* Scenario grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {SCENARIOS.map((scenario, i) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Card
              className="cursor-pointer hover:border-amber-400 hover:shadow-md transition-all border-border"
              data-ocid={`scenarios.scenario.item.${i + 1}`}
              onClick={() => void navigate({ to: `/scenarios/${scenario.id}` })}
            >
              <CardContent className="p-5">
                <div className="text-4xl mb-3">{scenario.emoji}</div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {(t.scenarios as any)[scenario.nameKey]}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {(t.scenarios as any)[scenario.descKey]}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {scenario.tasks.length} {t.scenarios.taskIdeas}
                  </span>
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    data-ocid={`scenarios.explore_button.${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      void navigate({ to: `/scenarios/${scenario.id}` });
                    }}
                  >
                    Explorer <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
