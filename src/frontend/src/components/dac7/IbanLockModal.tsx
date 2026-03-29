import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";

const TEXTS: Record<
  string,
  {
    title: string;
    body: string;
    cancel: string;
    confirm: string;
    confirming: string;
  }
> = {
  fr: {
    title: "Confirmer votre identité pour modifier l'IBAN",
    body: "Pour des raisons de sécurité, la modification de vos coordonnées bancaires nécessite une confirmation d'identité. Reconnectez-vous via Internet Identity pour continuer.",
    cancel: "Annuler",
    confirm: "Confirmer l'identité",
    confirming: "Vérification en cours…",
  },
  en: {
    title: "Confirm your identity to update your IBAN",
    body: "For security reasons, updating your bank details requires identity confirmation. Please reconnect via Internet Identity to continue.",
    cancel: "Cancel",
    confirm: "Confirm identity",
    confirming: "Verifying…",
  },
  de: {
    title: "Identität bestätigen, um IBAN zu ändern",
    body: "Aus Sicherheitsgründen erfordert die Änderung Ihrer Bankverbindung eine Identitätsbestätigung. Bitte melden Sie sich erneut über Internet Identity an.",
    cancel: "Abbrechen",
    confirm: "Identität bestätigen",
    confirming: "Wird überprüft…",
  },
  es: {
    title: "Confirmar identidad para modificar el IBAN",
    body: "Por razones de seguridad, modificar sus datos bancarios requiere confirmación de identidad. Vuelva a conectarse mediante Internet Identity para continuar.",
    cancel: "Cancelar",
    confirm: "Confirmar identidad",
    confirming: "Verificando…",
  },
  it: {
    title: "Conferma la tua identità per modificare l'IBAN",
    body: "Per motivi di sicurezza, la modifica delle coordinate bancarie richiede una conferma d'identità. Accedi nuovamente tramite Internet Identity per continuare.",
    cancel: "Annulla",
    confirm: "Conferma identità",
    confirming: "Verifica in corso…",
  },
  pt: {
    title: "Confirmar identidade para alterar o IBAN",
    body: "Por razões de segurança, a alteração dos dados bancários requer confirmação de identidade. Volte a ligar-se via Internet Identity para continuar.",
    cancel: "Cancelar",
    confirm: "Confirmar identidade",
    confirming: "A verificar…",
  },
  nl: {
    title: "Bevestig uw identiteit om IBAN te wijzigen",
    body: "Om veiligheidsredenen vereist het wijzigen van uw bankgegevens een identiteitsbevestiging. Meld u opnieuw aan via Internet Identity om door te gaan.",
    cancel: "Annuleren",
    confirm: "Identiteit bevestigen",
    confirming: "Bezig met verifiëren…",
  },
  el: {
    title: "Επιβεβαίωση ταυτότητας για αλλαγή IBAN",
    body: "Για λόγους ασφαλείας, η τροποποίηση των τραπεζικών στοιχείων απαιτεί επιβεβαίωση ταυτότητας. Επανασυνδεθείτε μέσω Internet Identity για να συνεχίσετε.",
    cancel: "Ακύρωση",
    confirm: "Επιβεβαίωση ταυτότητας",
    confirming: "Επαλήθευση…",
  },
};

interface IbanLockModalProps {
  open: boolean;
  lang: string;
  onClose: () => void;
  onUnlock: () => void;
}

export function IbanLockModal({
  open,
  lang,
  onClose,
  onUnlock,
}: IbanLockModalProps) {
  const [loading, setLoading] = useState(false);
  const t = TEXTS[lang] ?? TEXTS.en;

  function handleConfirm() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onUnlock();
      onClose();
    }, 2000);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md" data-ocid="iban_lock.dialog">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle className="text-base font-semibold leading-tight">
              {t.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {t.body}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
            data-ocid="iban_lock.cancel_button"
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            data-ocid="iban_lock.confirm_button"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? t.confirming : t.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
