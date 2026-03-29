import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type AdminUser, maskIBAN, useAdminStore } from "@/lib/admin-store";
import { type CurrentUser, useAuthStore } from "@/lib/auth-store";
import type {
  DemoDispute as AdminDispute,
  DemoReport as AdminReport,
  DemoTask as AdminTask,
  DemoUser as DemoUserRecord,
} from "@/lib/demo-data";
import { LOCALE_MAP, useTranslation } from "@/lib/i18n";
import { useKYCStore } from "@/lib/kyc-store";
import {
  type PromoTarget,
  type PromoType,
  usePromoStore,
} from "@/lib/promo-store";
import { PLAN_DETAILS, useSubscriptionStore } from "@/lib/subscription-store";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Briefcase,
  Check,
  Crown,
  Download,
  FileText,
  Flag,
  MessageSquareWarning,
  Plus,
  Scale,
  Settings,
  ShieldCheck,
  ShieldPlus,
  Tag,
  Trash2,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserX,
  Users,
  X,
} from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";

// ─── Helpers ────────────────────────────────────────────────────────────────

const roleColors: Record<string, string> = {
  client: "bg-secondary/20 text-secondary border-secondary/30",
  pro: "bg-primary/20 text-primary border-primary/30",
  admin: "bg-destructive/20 text-destructive border-destructive/30",
};

const statusColors: Record<string, string> = {
  active: "bg-secondary/20 text-secondary border-secondary/30",
  verified: "bg-primary/20 text-primary border-primary/30",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  suspended: "bg-destructive/20 text-destructive border-destructive/30",
};

const COUNTRY_FLAGS: Record<string, string> = {
  FR: "🇫🇷",
  BE: "🇧🇪",
  GB: "🇬🇧",
  DE: "🇩🇪",
  ES: "🇪🇸",
  IE: "🇮🇪",
  LU: "🇱🇺",
  IT: "🇮🇹",
  PT: "🇵🇹",
  GR: "🇬🇷",
  CH: "🇨🇭",
  NL: "🇳🇱",
};

// No hardcoded revenue data — will be populated from real transactions
const monthlyRevenue: {
  month: string;
  missions: number;
  amount: number;
  commission: number;
}[] = [];
const maxAmount = 0;

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="bg-card rounded-xl p-5 border border-border/50"
      style={{ boxShadow: "0 1px 6px 0 rgba(0,0,0,0.06)" }}
    >
      <div
        className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}
      >
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {trend && (
        <p className="text-xs text-secondary font-medium mt-1">↑ {trend}</p>
      )}
    </div>
  );
}

function TabBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground">
      {count}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { t, lang } = useTranslation();
  const a = t.dashboard.admin;
  const { currentUser } = useAuthStore();
  const {
    adminUsers,
    adminIds,
    promoteToAdmin,
    revokeAdmin,
    approveUser,
    suspendUser,
    deleteUser,
    validateKYC,
    rejectKYC,
    flagVerified,
    flagSuspended,
  } = useAdminStore();

  // Admin tabs state
  const [regRoleFilter, setRegRoleFilter] = useState("all");
  const [regCountryFilter, setRegCountryFilter] = useState("all");
  const [regStatusFilter, setRegStatusFilter] = useState("all");
  const [regPage, setRegPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);
  const [promoteSearch, setPromoteSearch] = useState("");

  const [dac7CountryFilter, setDac7CountryFilter] = useState("all");
  const [dac7StatusFilter, setDac7StatusFilter] = useState("all");

  // i18n helper for admin
  const adminLang = lang as string;
  function at(
    fr: string,
    en: string,
    de?: string,
    es?: string,
    it?: string,
    pt?: string,
    nl?: string,
    el?: string,
  ): string {
    const map: Record<string, string> = {
      fr,
      en,
      de: de ?? en,
      es: es ?? en,
      it: it ?? en,
      pt: pt ?? en,
      nl: nl ?? en,
      el: el ?? en,
      lu: fr,
    };
    return map[adminLang] ?? en;
  }
  const { subscriptions } = useSubscriptionStore();
  const { promoCodes, togglePromoCode, deletePromoCode, createPromoCode } =
    usePromoStore();
  const {
    allRequests,
    approveKYC,
    rejectKYC: rejectKYCRequest,
  } = useKYCStore();

  // Settings state
  const [commission, setCommission] = useState("8");
  const [insurance, setInsurance] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [proTeamPrice, setProTeamPrice] = useState("29");
  const [grandGroupePrice, setGrandGroupePrice] = useState("199");
  const [aiPrice, setAiPrice] = useState("19");
  const [carouselSlots, setCarouselSlots] = useState("6");

  // Promo code create form state
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [promoForm, setPromoForm] = useState<{
    code: string;
    type: PromoType;
    value: string;
    usageLimit: string;
    expiresAt: string;
    targetRole: PromoTarget;
    descriptionFR: string;
    descriptionEN: string;
    active: boolean;
  }>({
    code: "",
    type: "percent",
    value: "",
    usageLimit: "0",
    expiresAt: "",
    targetRole: "all",
    descriptionFR: "",
    descriptionEN: "",
    active: true,
  });

  function handleCreatePromo() {
    if (!promoForm.code.trim() || !promoForm.value) {
      toast.error("Code et valeur requis");
      return;
    }
    createPromoCode({
      code: promoForm.code.toUpperCase(),
      type: promoForm.type,
      value: Number(promoForm.value),
      usageLimit: Number(promoForm.usageLimit),
      expiresAt: promoForm.expiresAt
        ? new Date(promoForm.expiresAt).toISOString()
        : null,
      targetRole: promoForm.targetRole,
      active: promoForm.active,
      descriptionFR: promoForm.descriptionFR,
      descriptionEN: promoForm.descriptionEN,
    });
    setPromoDialogOpen(false);
    setPromoForm({
      code: "",
      type: "percent",
      value: "",
      usageLimit: "0",
      expiresAt: "",
      targetRole: "all",
      descriptionFR: "",
      descriptionEN: "",
      active: true,
    });
    toast.success("Code promo créé !");
  }

  // Users filter state
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");

  // Local dispute/report state (so actions update UI)
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);

  // Derived
  const pendingVerifications: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    country: string;
    createdAt: string;
    status: string;
  }[] = [];
  const pendingDisputes = disputes.filter((d) => d.status === "pending");
  const pendingReports = reports.filter((r) => r.status === "pending");
  const pendingKYC = allRequests.filter((r) => r.status === "pending");

  const filteredUsers: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    country: string;
    createdAt: string;
    status: string;
  }[] = [];

  // Revenue totals
  const totalRevenue = 0;
  const totalCommission = 0;
  const subscriptionRevenue = 0;

  // CSV export
  function handleExportCSV() {
    const header = ["Mission", "Montant €", "Commission €", "Date", "Statut"];
    const rows: string[][] = [];
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "taskvoila-revenus-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé !");
  }

  // Dispute actions
  function resolveDispute(
    id: number,
    resolution: "resolved_client" | "resolved_pro" | "split",
  ) {
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: resolution } : d)),
    );
    toast.success(a.disputeResolved);
  }

  // Report actions
  function updateReport(
    id: number,
    status: "resolved" | "dismissed",
    action: string,
  ) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(action);
  }

  const recentActivity: { icon: string; text: string; time: string }[] = [];

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {a.title}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Gestion complète de la plateforme TaskVoilà
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label={a.totalUsers}
            value={"0"}
            trend="+12% ce mois"
            color="text-primary"
            bg="bg-primary/10"
          />
          <StatCard
            icon={Briefcase}
            label={a.totalMissions}
            value={"0"}
            trend="+20% ce mois"
            color="text-secondary"
            bg="bg-secondary/10"
          />
          <StatCard
            icon={TrendingUp}
            label={a.totalRevenue}
            value={`${totalRevenue.toLocaleString()}€`}
            trend="+8% ce mois"
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            icon={AlertCircle}
            label={a.pendingVerifications}
            value={pendingVerifications.length.toString()}
            color="text-destructive"
            bg="bg-destructive/10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <div className="overflow-x-auto pb-1">
            <TabsList className="bg-card border border-border rounded-xl p-1 h-auto flex gap-1 min-w-max">
              <TabsTrigger
                value="overview"
                className="rounded-lg text-xs sm:text-sm"
                data-ocid="admin.overview.tab"
              >
                {a.overview}
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="rounded-lg text-xs sm:text-sm"
                data-ocid="admin.users.tab"
              >
                {a.users}
              </TabsTrigger>
              <TabsTrigger
                value="missions"
                className="rounded-lg text-xs sm:text-sm"
                data-ocid="admin.missions.tab"
              >
                {a.missions}
              </TabsTrigger>
              <TabsTrigger
                value="disputes"
                className="rounded-lg text-xs sm:text-sm"
                data-ocid="admin.disputes.tab"
              >
                {a.disputes}
                <TabBadge count={pendingDisputes.length} />
              </TabsTrigger>
              <TabsTrigger
                value="verifications"
                className="rounded-lg text-xs sm:text-sm"
                data-ocid="admin.verifications.tab"
              >
                {a.verifications}
                <TabBadge count={pendingVerifications.length} />
              </TabsTrigger>
              <TabsTrigger
                value="moderation"
                className="rounded-lg text-xs sm:text-sm"
                data-ocid="admin.moderation.tab"
              >
                {a.moderation}
                <TabBadge count={pendingReports.length} />
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="rounded-lg text-xs sm:text-sm"
                data-ocid="admin.revenue.tab"
              >
                <BarChart3 className="h-3.5 w-3.5 mr-1" />
                {a.revenue}
              </TabsTrigger>
              <TabsTrigger
                value="subscriptions"
                className="rounded-lg text-xs sm:text-sm"
                data-ocid="admin.subscriptions.tab"
              >
                <Crown className="h-3.5 w-3.5 mr-1" />
                {lang === "fr" ? "Abonnements" : "Subscriptions"}
              </TabsTrigger>
              <TabsTrigger
                value="kyc"
                className="rounded-lg text-xs sm:text-sm"
                data-ocid="admin.kyc.tab"
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                KYC
                <TabBadge count={pendingKYC.length} />
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-lg text-xs sm:text-sm"
                data-ocid="admin.settings.tab"
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                {a.settings}
              </TabsTrigger>
              <TabsTrigger
                value="registrations"
                className="rounded-lg text-xs sm:text-sm"
                data-ocid="admin.registrations.tab"
              >
                <Users className="h-3.5 w-3.5 mr-1" />
                {at(
                  "Inscriptions",
                  "Registrations",
                  "Registrierungen",
                  "Inscripciones",
                  "Registrazioni",
                  "Inscrições",
                  "Registraties",
                  "Εγγραφές",
                )}
                <TabBadge
                  count={
                    adminUsers.filter(
                      (u) => u.approvalStatus === "pending_approval",
                    ).length
                  }
                />
              </TabsTrigger>
              <TabsTrigger
                value="dac7"
                className="rounded-lg text-xs sm:text-sm"
                data-ocid="admin.dac7.tab"
              >
                <FileText className="h-3.5 w-3.5 mr-1" />
                {at(
                  "DAC7 & Fiscal",
                  "DAC7 & Tax",
                  "DAC7 & Steuer",
                  "DAC7 & Fiscal",
                  "DAC7 & Fiscale",
                  "DAC7 & Fiscal",
                  "DAC7 & Fiscaal",
                  "DAC7 & Φορολογικά",
                )}
              </TabsTrigger>
              <TabsTrigger
                value="admin-mgmt"
                className="rounded-lg text-xs sm:text-sm"
                data-ocid="admin.admin_mgmt.tab"
              >
                <ShieldPlus className="h-3.5 w-3.5 mr-1" />
                {at(
                  "Gestion des Admins",
                  "Admin Management",
                  "Admin-Verwaltung",
                  "Gestión de Admins",
                  "Gestione Admin",
                  "Gestão de Admins",
                  "Beheer Admins",
                  "Διαχείριση Admin",
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Overview ───────────────────────────────────────────────────── */}
          <TabsContent value="overview" className="mt-5">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Revenue bar chart */}
              <div className="bg-card rounded-xl border border-border/50 p-5">
                <h2 className="font-display font-bold text-sm text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  {a.monthlyRevenue}
                </h2>
                <div className="flex items-end gap-2 h-36">
                  {monthlyRevenue.map((m) => (
                    <div
                      key={m.month}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span className="text-[9px] text-muted-foreground font-semibold">
                        {m.commission}€
                      </span>
                      <div
                        className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors"
                        style={{
                          height: `${(m.amount / maxAmount) * 96}px`,
                          minHeight: "8px",
                        }}
                        title={`${m.month}: ${m.amount}€`}
                      />
                      <span className="text-[8px] text-muted-foreground text-center leading-tight">
                        {m.month.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-card rounded-xl border border-border/50 p-5">
                <h2 className="font-display font-bold text-sm text-foreground mb-4">
                  {a.recentActivity}
                </h2>
                <div className="space-y-0">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.text}
                      className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
                    >
                      <span className="text-base w-7 shrink-0">
                        {activity.icon}
                      </span>
                      <span className="flex-1 text-xs text-foreground/80 leading-snug">
                        {activity.text}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0 bg-muted rounded px-1.5 py-0.5">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Users ──────────────────────────────────────────────────────── */}
          <TabsContent value="users" className="mt-5">
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              {/* Filters */}
              <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Input
                    placeholder={a.searchUsers}
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="h-9 pl-3 text-sm"
                    data-ocid="admin.users.search_input"
                  />
                </div>
                <Select
                  value={userRoleFilter}
                  onValueChange={setUserRoleFilter}
                >
                  <SelectTrigger
                    className="w-36 h-9 text-sm"
                    data-ocid="admin.users.role.select"
                  >
                    <SelectValue placeholder={a.allRoles} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{a.allRoles}</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={userStatusFilter}
                  onValueChange={setUserStatusFilter}
                >
                  <SelectTrigger
                    className="w-40 h-9 text-sm"
                    data-ocid="admin.users.status.select"
                  >
                    <SelectValue placeholder={a.allStatuses} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{a.allStatuses}</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                {filteredUsers.length === 0 ? (
                  <div
                    className="p-12 text-center"
                    data-ocid="admin.users.empty_state"
                  >
                    <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      {a.noUsersFound}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Nom</TableHead>
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs">
                          {a.filterRole}
                        </TableHead>
                        <TableHead className="text-xs">
                          {a.filterStatus}
                        </TableHead>
                        <TableHead className="text-xs">Pays</TableHead>
                        <TableHead className="text-xs">
                          {a.registeredOn}
                        </TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user, idx) => (
                        <TableRow
                          key={user.id}
                          data-ocid={`admin.users.row.${idx + 1}`}
                        >
                          <TableCell className="font-medium text-sm">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-[10px] ${roleColors[user.role]}`}
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-[10px] ${statusColors[user.status]}`}
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {COUNTRY_FLAGS[user.country] ?? user.country}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {user.createdAt}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {user.status === "suspended" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-secondary border-secondary/30"
                                  data-ocid={`admin.users.activate.button.${idx + 1}`}
                                  onClick={() =>
                                    toast.success(
                                      `Compte ${user.firstName} activé`,
                                    )
                                  }
                                >
                                  {a.activate}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-destructive border-destructive/30"
                                  data-ocid={`admin.users.suspend.button.${idx + 1}`}
                                  onClick={() =>
                                    toast.success(
                                      `Compte ${user.firstName} suspendu`,
                                    )
                                  }
                                >
                                  {a.suspend}
                                </Button>
                              )}
                              {user.status === "pending" && (
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                                  data-ocid={`admin.users.verify.button.${idx + 1}`}
                                  onClick={() =>
                                    toast.success(`${user.firstName} vérifié !`)
                                  }
                                >
                                  {a.verify}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Missions ───────────────────────────────────────────────────── */}
          <TabsContent value="missions" className="mt-5">
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Mission</TableHead>
                      <TableHead className="text-xs">Ville</TableHead>
                      <TableHead className="text-xs">Budget</TableHead>
                      <TableHead className="text-xs">
                        {a.filterStatus}
                      </TableHead>
                      <TableHead className="text-xs">Offres</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {([] as AdminTask[]).map((task, idx) => (
                      <TableRow
                        key={task.id}
                        data-ocid={`admin.missions.row.${idx + 1}`}
                      >
                        <TableCell className="font-medium text-sm max-w-[180px] truncate">
                          {task.title}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {COUNTRY_FLAGS[task.country ?? ""] ?? ""} {task.city}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-primary whitespace-nowrap">
                          {task.budgetMin}€–{task.budgetMax}€
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] ${
                              task.status === "open"
                                ? "bg-secondary/20 text-secondary border-secondary/30"
                                : task.status === "inProgress"
                                  ? "bg-amber-100 text-amber-700 border-amber-200"
                                  : task.status === "disputed"
                                    ? "bg-destructive/20 text-destructive border-destructive/30"
                                    : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {t.mission.status[task.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-center">
                          {task.offerCount}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {task.createdAt}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                            data-ocid={`admin.missions.flag.button.${idx + 1}`}
                            onClick={() =>
                              toast.success(
                                `Mission #${task.id} signalée en litige`,
                              )
                            }
                          >
                            <Flag className="h-3 w-3 mr-1" />
                            {a.flagDisputed}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ── Disputes ───────────────────────────────────────────────────── */}
          <TabsContent value="disputes" className="mt-5">
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              {pendingDisputes.length === 0 ? (
                <div
                  className="p-14 text-center"
                  data-ocid="admin.disputes.empty_state"
                >
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <Scale className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-1">
                    {a.noDisputes}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {a.noDisputesDesc}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {disputes.map((dispute, idx) => {
                    const task = undefined as AdminTask | undefined;
                    const client = ([] as AdminUser[]).find(
                      (u) => u.id === String(dispute.clientId),
                    );
                    const pro = ([] as AdminUser[]).find(
                      (u) => u.id === String(dispute.proId),
                    );
                    const isPending = dispute.status === "pending";

                    return (
                      <div
                        key={dispute.id}
                        className="p-5"
                        data-ocid={`admin.disputes.item.${idx + 1}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                              <h3 className="font-semibold text-sm text-foreground truncate">
                                {task?.title ?? `Mission #${dispute.taskId}`}
                              </h3>
                              <Badge
                                className={`text-[10px] shrink-0 ${
                                  isPending
                                    ? "bg-amber-100 text-amber-700 border-amber-200"
                                    : "bg-secondary/20 text-secondary border-secondary/30"
                                }`}
                              >
                                {isPending ? "En attente" : dispute.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                              <div>
                                <span className="font-medium text-foreground/70">
                                  Client:{" "}
                                </span>
                                {client?.firstName} {client?.lastName}
                              </div>
                              <div>
                                <span className="font-medium text-foreground/70">
                                  Pro:{" "}
                                </span>
                                {pro?.firstName} {pro?.lastName}
                              </div>
                              <div>
                                <span className="font-medium text-foreground/70">
                                  {a.disputeAmount}:{" "}
                                </span>
                                <span className="text-destructive font-semibold">
                                  {dispute.amount}€
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-foreground/70">
                                  Date:{" "}
                                </span>
                                {dispute.createdAt}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {a.disputeReason} : {dispute.reason}
                            </p>
                          </div>
                          {isPending && (
                            <div className="flex flex-wrap gap-2 shrink-0">
                              <Button
                                size="sm"
                                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
                                data-ocid={`admin.disputes.client.button.${idx + 1}`}
                                onClick={() =>
                                  resolveDispute(dispute.id, "resolved_client")
                                }
                              >
                                👤 {a.resolveClient}
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 text-xs bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-1"
                                data-ocid={`admin.disputes.pro.button.${idx + 1}`}
                                onClick={() =>
                                  resolveDispute(dispute.id, "resolved_pro")
                                }
                              >
                                💼 {a.resolvePro}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs gap-1"
                                data-ocid={`admin.disputes.split.button.${idx + 1}`}
                                onClick={() =>
                                  resolveDispute(dispute.id, "split")
                                }
                              >
                                <Scale className="h-3 w-3" />
                                {a.splitEqual}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Verifications ──────────────────────────────────────────────── */}
          <TabsContent value="verifications" className="mt-5">
            <div className="grid md:grid-cols-3 gap-4 mb-5">
              <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pros vérifiés
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {pendingVerifications.length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  En attente
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pros total
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              {pendingVerifications.length === 0 ? (
                <div className="p-14 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-1">
                    Tout est à jour !
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Aucune vérification en attente
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {pendingVerifications.map((user, idx) => (
                    <div
                      key={user.id}
                      className="p-5 flex flex-wrap items-center justify-between gap-4"
                      data-ocid={`admin.verifications.item.${idx + 1}`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-sm">
                            {user.firstName} {user.lastName}
                          </h3>
                          <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200">
                            {user.role}
                          </Badge>
                          <span className="text-sm">
                            {COUNTRY_FLAGS[user.country] ?? user.country}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {a.registeredOn} {user.createdAt}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="h-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-1 text-xs"
                          data-ocid={`admin.verifications.approve.button.${idx + 1}`}
                          onClick={() =>
                            toast.success(`${user.firstName} approuvé !`)
                          }
                        >
                          <Check className="h-3 w-3" />
                          {a.approve}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-destructive/30 text-destructive gap-1 text-xs"
                          data-ocid={`admin.verifications.reject.button.${idx + 1}`}
                          onClick={() =>
                            toast.error(`${user.firstName} rejeté`)
                          }
                        >
                          <X className="h-3 w-3" />
                          {a.reject}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Moderation ─────────────────────────────────────────────────── */}
          <TabsContent value="moderation" className="mt-5">
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              {reports.length === 0 ? (
                <div
                  className="p-14 text-center"
                  data-ocid="admin.moderation.empty_state"
                >
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquareWarning className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-1">
                    {a.noReports}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {a.noReportsDesc}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {reports.map((report: AdminReport, idx) => {
                    const reporter = ([] as AdminUser[]).find(
                      (u) => u.id === String(report.reporterId),
                    );
                    const isPending = report.status === "pending";

                    const typeLabel =
                      a.reportType[report.type as keyof typeof a.reportType] ??
                      report.type;

                    return (
                      <div
                        key={report.id}
                        className={`p-5 ${!isPending ? "opacity-60" : ""}`}
                        data-ocid={`admin.moderation.item.${idx + 1}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                className={`text-[10px] shrink-0 ${
                                  report.type === "message"
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : report.type === "profile"
                                      ? "bg-purple-100 text-purple-700 border-purple-200"
                                      : "bg-amber-100 text-amber-700 border-amber-200"
                                }`}
                              >
                                {typeLabel}
                              </Badge>
                              <Badge
                                className={`text-[10px] shrink-0 ${
                                  isPending
                                    ? "bg-red-100 text-red-700 border-red-200"
                                    : "bg-muted text-muted-foreground border-border"
                                }`}
                              >
                                {isPending ? "En attente" : report.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-foreground/80 italic mb-2 leading-relaxed">
                              "{report.contentPreview}"
                            </p>
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-[10px] text-muted-foreground">
                              <span>
                                {a.reportedBy}:{" "}
                                <strong>
                                  {reporter?.firstName} {reporter?.lastName}
                                </strong>
                              </span>
                              <span>
                                {a.reportDate}: {report.createdAt}
                              </span>
                            </div>
                          </div>
                          {isPending && (
                            <div className="flex flex-wrap gap-2 shrink-0">
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-1"
                                data-ocid={`admin.moderation.delete.button.${idx + 1}`}
                                onClick={() =>
                                  updateReport(
                                    report.id,
                                    "resolved",
                                    "Contenu supprimé",
                                  )
                                }
                              >
                                <X className="h-3 w-3" />
                                {a.deleteContent}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-50 gap-1"
                                data-ocid={`admin.moderation.warn.button.${idx + 1}`}
                                onClick={() =>
                                  updateReport(
                                    report.id,
                                    "resolved",
                                    "Utilisateur averti",
                                  )
                                }
                              >
                                <AlertTriangle className="h-3 w-3" />
                                {a.warnUser}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                data-ocid={`admin.moderation.dismiss.button.${idx + 1}`}
                                onClick={() =>
                                  updateReport(
                                    report.id,
                                    "dismissed",
                                    "Signalement ignoré",
                                  )
                                }
                              >
                                {a.dismissReport}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Revenue ────────────────────────────────────────────────────── */}
          <TabsContent value="revenue" className="mt-5">
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card rounded-xl border border-border/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {a.totalRevenueLabel}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalRevenue.toLocaleString()}€
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {a.commissionsEarned}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {totalCommission.toLocaleString()}€
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {a.subscriptionRevenue}
                </p>
                <p className="text-2xl font-bold text-secondary">
                  {subscriptionRevenue}€
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Total combiné
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {(totalCommission + subscriptionRevenue).toLocaleString()}€
                </p>
              </div>
            </div>

            {/* Monthly breakdown table */}
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden mb-4">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display font-bold text-sm text-foreground">
                  {a.monthlyBreakdown}
                </h2>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                  data-ocid="admin.revenue.export.button"
                  onClick={handleExportCSV}
                >
                  <Download className="h-3.5 w-3.5" />
                  {a.exportCSV}
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{a.month}</TableHead>
                      <TableHead className="text-xs text-right">
                        Missions
                      </TableHead>
                      <TableHead className="text-xs text-right">
                        {a.amount}
                      </TableHead>
                      <TableHead className="text-xs text-right">
                        Commission (8%)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyRevenue.map((row, idx) => (
                      <TableRow
                        key={row.month}
                        data-ocid={`admin.revenue.row.${idx + 1}`}
                      >
                        <TableCell className="text-sm font-medium">
                          {row.month}
                        </TableCell>
                        <TableCell className="text-sm text-right text-muted-foreground">
                          {row.missions}
                        </TableCell>
                        <TableCell className="text-sm text-right font-semibold text-foreground">
                          {row.amount.toLocaleString()}€
                        </TableCell>
                        <TableCell className="text-sm text-right font-semibold text-primary">
                          {row.commission}€
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell className="text-sm font-bold">Total</TableCell>
                      <TableCell className="text-sm text-right font-bold">
                        {monthlyRevenue.reduce((s, m) => s + m.missions, 0)}
                      </TableCell>
                      <TableCell className="text-sm text-right font-bold">
                        {totalRevenue.toLocaleString()}€
                      </TableCell>
                      <TableCell className="text-sm text-right font-bold text-primary">
                        {totalCommission.toLocaleString()}€
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ── Subscriptions ───────────────────────────────────────────── */}
          <TabsContent value="subscriptions" className="mt-5">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card rounded-xl border border-border/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {lang === "fr"
                    ? "Abonnements actifs"
                    : "Active subscriptions"}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {subscriptions.filter((s) => s.status === "active").length}
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {lang === "fr" ? "Revenus mensuels" : "Monthly revenue"}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {subscriptions
                    .filter((s) => s.status === "active")
                    .reduce((sum, s) => sum + s.price, 0)}
                  €
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">Pro Équipe</p>
                <p className="text-2xl font-bold text-blue-600">
                  {subscriptions.filter((s) => s.plan === "team").length}
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Grand Groupe
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {subscriptions.filter((s) => s.plan === "enterprise").length}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">User ID</TableHead>
                      <TableHead className="text-xs">Plan</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                      <TableHead className="text-xs">Prix</TableHead>
                      <TableHead className="text-xs">
                        {lang === "fr" ? "Renouvellement" : "Renewal"}
                      </TableHead>
                      <TableHead className="text-xs">
                        {lang === "fr" ? "Assistant IA" : "AI Assistant"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub, idx) => (
                      <TableRow
                        key={sub.userId}
                        data-ocid={`admin.subscriptions.row.${idx + 1}`}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {sub.userId}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] ${
                              sub.plan === "team"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : sub.plan === "enterprise"
                                  ? "bg-purple-100 text-purple-700 border-purple-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {lang === "fr"
                              ? PLAN_DETAILS[sub.plan].labelFR
                              : PLAN_DETAILS[sub.plan].labelEN}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] ${
                              sub.status === "active"
                                ? "bg-secondary/20 text-secondary border-secondary/30"
                                : sub.status === "trial"
                                  ? "bg-amber-100 text-amber-700 border-amber-200"
                                  : "bg-destructive/20 text-destructive border-destructive/30"
                            }`}
                          >
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-sm text-primary">
                          {sub.price}€/mois
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(sub.renewsAt).toLocaleDateString(
                            LOCALE_MAP[lang as keyof typeof LOCALE_MAP] ??
                              "en-GB",
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] ${
                              sub.aiAssistantEnabled
                                ? "bg-secondary/15 text-secondary border-secondary/30"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {sub.aiAssistantEnabled
                              ? lang === "fr"
                                ? "Activé"
                                : "On"
                              : lang === "fr"
                                ? "Désactivé"
                                : "Off"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ── KYC ──────────────────────────────────────────────────────── */}
          <TabsContent value="kyc" className="mt-5">
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="font-display font-bold text-base text-foreground">
                  {t.kyc.adminSection}
                </h2>
                {pendingKYC.length > 0 && (
                  <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs ml-auto">
                    {pendingKYC.length}{" "}
                    {lang === "fr" ? "en attente" : "pending"}
                  </Badge>
                )}
              </div>

              {pendingKYC.length === 0 ? (
                <div
                  className="p-14 text-center"
                  data-ocid="admin.kyc.empty_state"
                >
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-1">
                    {t.kyc.adminNoRequests}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {lang === "fr"
                      ? "Toutes les demandes KYC ont été traitées."
                      : "All KYC requests have been processed."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {pendingKYC.map((req, idx) => {
                    // req.userId is "pro_1", "pro_2" etc.; demoUsers.id is numeric
                    const userIdNum = Number(req.userId.replace(/\D/g, ""));
                    const userInfo = ([] as AdminUser[]).find(
                      (u) => u.id === String(userIdNum),
                    );
                    return (
                      <div
                        key={req.userId}
                        className="p-5 flex flex-wrap items-center justify-between gap-4"
                        data-ocid={`admin.kyc.item.${idx + 1}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-sm text-foreground">
                              {userInfo
                                ? `${userInfo.firstName} ${userInfo.lastName}`
                                : req.userId}
                            </h3>
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                              {t.kyc.status.pending}
                            </Badge>
                            <span className="text-base">
                              {COUNTRY_FLAGS[req.country] ?? req.country}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium text-foreground/70">
                                {t.kyc.adminPro} :{" "}
                              </span>
                              {req.userId}
                            </div>
                            <div>
                              <span className="font-medium text-foreground/70">
                                {t.kyc.adminCountry} :{" "}
                              </span>
                              {req.country}
                            </div>
                            <div>
                              <span className="font-medium text-foreground/70">
                                {t.kyc.adminIdType} :{" "}
                              </span>
                              <span className="font-bold text-primary">
                                {(t.kyc.countryCodes as Record<string, string>)[
                                  req.country
                                ] ?? req.idType}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-foreground/70">
                                {t.kyc.adminIdNumber} :{" "}
                              </span>
                              <span className="font-mono">{req.idNumber}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1.5">
                            {t.kyc.adminSubmittedAt}{" "}
                            {new Date(req.submittedAt).toLocaleDateString(
                              LOCALE_MAP[lang as keyof typeof LOCALE_MAP] ??
                                "en-GB",
                            )}{" "}
                            {new Date(req.submittedAt).toLocaleTimeString(
                              LOCALE_MAP[lang as keyof typeof LOCALE_MAP] ??
                                "en-GB",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            className="h-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-1 text-xs"
                            data-ocid={`admin.kyc.approve_button.${idx + 1}`}
                            onClick={() => {
                              approveKYC(req.userId);
                              toast.success(
                                lang === "fr"
                                  ? `KYC approuvé pour ${req.userId}`
                                  : `KYC approved for ${req.userId}`,
                              );
                            }}
                          >
                            <Check className="h-3 w-3" />
                            {t.kyc.adminApprove}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-destructive/30 text-destructive gap-1 text-xs"
                            data-ocid={`admin.kyc.reject_button.${idx + 1}`}
                            onClick={() => {
                              rejectKYCRequest(req.userId);
                              toast.error(
                                lang === "fr"
                                  ? `KYC rejeté pour ${req.userId}`
                                  : `KYC rejected for ${req.userId}`,
                              );
                            }}
                          >
                            <X className="h-3 w-3" />
                            {t.kyc.adminReject}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Settings ───────────────────────────────────────────────────── */}
          <TabsContent value="settings" className="mt-5">
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-0">
              <h2 className="font-display font-bold text-base text-foreground mb-6">
                {a.platformSettings}
              </h2>

              {/* Commission */}
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <Label className="text-sm font-semibold">
                    {a.commission}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.commissionDesc}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    className="w-20 text-right text-sm h-9"
                    data-ocid="admin.settings.commission.input"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>

              {/* Insurance */}
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <Label className="text-sm font-semibold">{a.insurance}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.insuranceDesc}
                  </p>
                </div>
                <Switch
                  checked={insurance}
                  onCheckedChange={setInsurance}
                  data-ocid="admin.settings.insurance.switch"
                />
              </div>

              {/* Maintenance */}
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <Label className="text-sm font-semibold">
                    {a.maintenance}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.maintenanceDesc}
                  </p>
                </div>
                <Switch
                  checked={maintenance}
                  onCheckedChange={(val) => {
                    setMaintenance(val);
                    toast.success(
                      val
                        ? "Mode maintenance activé"
                        : "Mode maintenance désactivé",
                    );
                  }}
                  data-ocid="admin.settings.maintenance.switch"
                />
              </div>

              {/* Carousel slots */}
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <Label className="text-sm font-semibold">
                    {a.carouselSlots}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Nombre de slots pros premium sur la homepage
                  </p>
                </div>
                <Select value={carouselSlots} onValueChange={setCarouselSlots}>
                  <SelectTrigger
                    className="w-24 h-9 text-sm"
                    data-ocid="admin.settings.carousel.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 slots</SelectItem>
                    <SelectItem value="12">12 slots</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subscription prices */}
              <div className="py-4 border-b border-border">
                <Label className="text-sm font-semibold block mb-3">
                  {a.subscriptionPrices}
                </Label>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {a.proTeamPrice}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        value={proTeamPrice}
                        onChange={(e) => setProTeamPrice(e.target.value)}
                        className="w-24 h-9 text-sm text-right"
                        data-ocid="admin.settings.proteam.input"
                      />
                      <span className="text-sm text-muted-foreground">
                        €/mois
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {a.grandGroupePrice}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        value={grandGroupePrice}
                        onChange={(e) => setGrandGroupePrice(e.target.value)}
                        className="w-24 h-9 text-sm text-right"
                        data-ocid="admin.settings.grandgroupe.input"
                      />
                      <span className="text-sm text-muted-foreground">
                        €/mois
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {a.aiAssistantPrice}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        value={aiPrice}
                        onChange={(e) => setAiPrice(e.target.value)}
                        className="w-24 h-9 text-sm text-right"
                        data-ocid="admin.settings.ai.input"
                      />
                      <span className="text-sm text-muted-foreground">
                        €/mois
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10"
                  data-ocid="admin.settings.save.button"
                  onClick={() => toast.success(a.saved)}
                >
                  {t.common.save}
                </Button>
              </div>
            </div>

            {/* Promo Codes section */}
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden mt-6">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <h2 className="font-display font-bold text-base text-foreground">
                    {lang === "fr" ? "Codes Promo" : "Promo Codes"}
                  </h2>
                  <Badge className="bg-muted text-muted-foreground border-border text-xs">
                    {promoCodes.length}
                  </Badge>
                </div>
                <Dialog
                  open={promoDialogOpen}
                  onOpenChange={setPromoDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white gap-1.5 text-xs"
                      data-ocid="admin.promo.open_modal_button"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {lang === "fr" ? "Créer un code" : "Create code"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="max-w-md max-h-[90vh] overflow-y-auto"
                    data-ocid="admin.promo.dialog"
                  >
                    <DialogHeader>
                      <DialogTitle className="font-display flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        {lang === "fr"
                          ? "Créer un code promo"
                          : "Create promo code"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Code</Label>
                        <Input
                          value={promoForm.code}
                          onChange={(e) =>
                            setPromoForm((f) => ({
                              ...f,
                              code: e.target.value.toUpperCase(),
                            }))
                          }
                          placeholder="BIENVENUE20"
                          className="font-mono uppercase"
                          data-ocid="admin.promo.code.input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Type</Label>
                          <Select
                            value={promoForm.type}
                            onValueChange={(v) =>
                              setPromoForm((f) => ({
                                ...f,
                                type: v as PromoType,
                              }))
                            }
                          >
                            <SelectTrigger
                              className="h-9 text-sm"
                              data-ocid="admin.promo.type.select"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percent">
                                % Pourcentage
                              </SelectItem>
                              <SelectItem value="fixed">
                                € Montant fixe
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">
                            {promoForm.type === "percent"
                              ? "Valeur (%)"
                              : "Valeur (€)"}
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            value={promoForm.value}
                            onChange={(e) =>
                              setPromoForm((f) => ({
                                ...f,
                                value: e.target.value,
                              }))
                            }
                            placeholder={
                              promoForm.type === "percent" ? "20" : "25"
                            }
                            className="h-9 text-sm"
                            data-ocid="admin.promo.value.input"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">
                            {lang === "fr"
                              ? "Limite d'usage (0 = illimité)"
                              : "Usage limit (0 = unlimited)"}
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            value={promoForm.usageLimit}
                            onChange={(e) =>
                              setPromoForm((f) => ({
                                ...f,
                                usageLimit: e.target.value,
                              }))
                            }
                            className="h-9 text-sm"
                            data-ocid="admin.promo.usage_limit.input"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">
                            {lang === "fr" ? "Expiration" : "Expires at"}
                          </Label>
                          <Input
                            type="date"
                            value={promoForm.expiresAt}
                            onChange={(e) =>
                              setPromoForm((f) => ({
                                ...f,
                                expiresAt: e.target.value,
                              }))
                            }
                            className="h-9 text-sm"
                            data-ocid="admin.promo.expires.input"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                          {lang === "fr" ? "Cible" : "Target"}
                        </Label>
                        <Select
                          value={promoForm.targetRole}
                          onValueChange={(v) =>
                            setPromoForm((f) => ({
                              ...f,
                              targetRole: v as PromoTarget,
                            }))
                          }
                        >
                          <SelectTrigger
                            className="h-9 text-sm"
                            data-ocid="admin.promo.target.select"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="client">Clients</SelectItem>
                            <SelectItem value="pro">Professionnels</SelectItem>
                            <SelectItem value="new_user">
                              Nouveaux utilisateurs
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                          Description FR
                        </Label>
                        <Input
                          value={promoForm.descriptionFR}
                          onChange={(e) =>
                            setPromoForm((f) => ({
                              ...f,
                              descriptionFR: e.target.value,
                            }))
                          }
                          placeholder="20% de réduction pour les nouveaux"
                          className="h-9 text-sm"
                          data-ocid="admin.promo.desc_fr.input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                          Description EN
                        </Label>
                        <Input
                          value={promoForm.descriptionEN}
                          onChange={(e) =>
                            setPromoForm((f) => ({
                              ...f,
                              descriptionEN: e.target.value,
                            }))
                          }
                          placeholder="20% off for new users"
                          className="h-9 text-sm"
                          data-ocid="admin.promo.desc_en.input"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setPromoDialogOpen(false)}
                          data-ocid="admin.promo.cancel_button"
                        >
                          {t.common.cancel}
                        </Button>
                        <Button
                          className="flex-1 bg-primary hover:bg-primary/90 text-white"
                          onClick={handleCreatePromo}
                          data-ocid="admin.promo.submit_button"
                        >
                          {lang === "fr" ? "Créer" : "Create"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {promoCodes.length === 0 ? (
                <div
                  className="p-10 text-center"
                  data-ocid="admin.promo.empty_state"
                >
                  <Tag className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    {lang === "fr" ? "Aucun code promo." : "No promo codes."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Code</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs">
                          {lang === "fr" ? "Usages" : "Usage"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {lang === "fr" ? "Expiration" : "Expires"}
                        </TableHead>
                        <TableHead className="text-xs">Cible</TableHead>
                        <TableHead className="text-xs">Actif</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promoCodes.map((promo, idx) => (
                        <TableRow
                          key={promo.id}
                          data-ocid={`admin.promo.row.${idx + 1}`}
                        >
                          <TableCell>
                            <span className="font-mono font-bold text-xs bg-muted px-2 py-0.5 rounded">
                              {promo.code}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-[10px] ${
                                promo.type === "percent"
                                  ? "bg-blue-100 text-blue-700 border-blue-200"
                                  : "bg-amber-100 text-amber-700 border-amber-200"
                              }`}
                            >
                              {promo.type === "percent"
                                ? `-${promo.value}%`
                                : `-${promo.value}€`}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {promo.usageCount}
                            {promo.usageLimit > 0 ? `/${promo.usageLimit}` : ""}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {promo.expiresAt
                              ? new Date(promo.expiresAt).toLocaleDateString(
                                  LOCALE_MAP[lang as keyof typeof LOCALE_MAP] ??
                                    "en-GB",
                                )
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge className="text-[10px] bg-muted text-muted-foreground border-border">
                              {promo.targetRole}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={promo.active}
                              onCheckedChange={() => togglePromoCode(promo.id)}
                              data-ocid={`admin.promo.toggle.${idx + 1}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                deletePromoCode(promo.id);
                                toast.success(
                                  lang === "fr"
                                    ? `Code ${promo.code} supprimé`
                                    : `Code ${promo.code} deleted`,
                                );
                              }}
                              data-ocid={`admin.promo.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Registrations Tab ─────────────────────────────────────────── */}
          <TabsContent value="registrations" className="mt-5">
            <RegistrationsTab
              adminUsers={adminUsers}
              lang={adminLang}
              at={at}
              regRoleFilter={regRoleFilter}
              setRegRoleFilter={setRegRoleFilter}
              regCountryFilter={regCountryFilter}
              setRegCountryFilter={setRegCountryFilter}
              regStatusFilter={regStatusFilter}
              setRegStatusFilter={setRegStatusFilter}
              regPage={regPage}
              setRegPage={setRegPage}
              deleteConfirmId={deleteConfirmId}
              setDeleteConfirmId={setDeleteConfirmId}
              approveUser={approveUser}
              suspendUser={suspendUser}
              deleteUser={deleteUser}
            />
          </TabsContent>

          {/* ── DAC7 Tab ───────────────────────────────────────────────────── */}
          <TabsContent value="dac7" className="mt-5">
            <DAC7Tab
              adminUsers={adminUsers}
              at={at}
              dac7CountryFilter={dac7CountryFilter}
              setDac7CountryFilter={setDac7CountryFilter}
              dac7StatusFilter={dac7StatusFilter}
              setDac7StatusFilter={setDac7StatusFilter}
              validateKYC={validateKYC}
              rejectKYC={rejectKYC}
              flagVerified={flagVerified}
              flagSuspended={flagSuspended}
            />
          </TabsContent>

          {/* ── Admin Management Tab ──────────────────────────────────────── */}
          <TabsContent value="admin-mgmt" className="mt-5">
            <AdminMgmtTab
              adminUsers={adminUsers}
              adminIds={adminIds}
              currentUser={currentUser}
              lang={adminLang}
              at={at}
              promoteToAdmin={promoteToAdmin}
              revokeAdmin={revokeAdmin}
              revokeConfirmId={revokeConfirmId}
              setRevokeConfirmId={setRevokeConfirmId}
              promoteSearch={promoteSearch}
              setPromoteSearch={setPromoteSearch}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

// ─── Registrations Tab ────────────────────────────────────────────────────────

const COUNTRY_NAMES: Record<string, string> = {
  FR: "France",
  BE: "Belgique",
  GB: "United Kingdom",
  DE: "Deutschland",
  ES: "España",
  IE: "Ireland",
  LU: "Luxembourg",
  IT: "Italia",
  PT: "Portugal",
  GR: "Ελλάδα",
  CH: "Schweiz",
  NL: "Nederland",
};

function ApprovalBadge({
  status,
  at,
}: { status: string; at: (fr: string, en: string) => string }) {
  if (status === "pending_approval")
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
        {at("En attente", "Pending")}
      </Badge>
    );
  if (status === "approved")
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
        {at("Approuvé", "Approved")}
      </Badge>
    );
  if (status === "suspended")
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
        {at("Suspendu", "Suspended")}
      </Badge>
    );
  if (status === "deleted")
    return (
      <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
        {at("Supprimé", "Deleted")}
      </Badge>
    );
  return null;
}

function RegistrationsTab({
  adminUsers,
  lang,
  at,
  regRoleFilter,
  setRegRoleFilter,
  regCountryFilter,
  setRegCountryFilter,
  regStatusFilter,
  setRegStatusFilter,
  regPage,
  setRegPage,
  deleteConfirmId,
  setDeleteConfirmId,
  approveUser,
  suspendUser,
  deleteUser,
}: {
  adminUsers: AdminUser[];
  lang: string;
  at: (
    fr: string,
    en: string,
    de?: string,
    es?: string,
    it?: string,
    pt?: string,
    nl?: string,
    el?: string,
  ) => string;
  regRoleFilter: string;
  setRegRoleFilter: (v: string) => void;
  regCountryFilter: string;
  setRegCountryFilter: (v: string) => void;
  regStatusFilter: string;
  setRegStatusFilter: (v: string) => void;
  regPage: number;
  setRegPage: (v: number) => void;
  deleteConfirmId: string | null;
  setDeleteConfirmId: (v: string | null) => void;
  approveUser: (id: string) => void;
  suspendUser: (id: string) => void;
  deleteUser: (id: string) => void;
}) {
  const activeUsers = adminUsers.filter((u) => u.approvalStatus !== "deleted");
  const pendingCount = activeUsers.filter(
    (u) => u.approvalStatus === "pending_approval",
  ).length;
  const suspendedCount = activeUsers.filter(
    (u) => u.approvalStatus === "suspended",
  ).length;
  const countries = Array.from(new Set(activeUsers.map((u) => u.country)));

  let filtered = activeUsers;
  if (regRoleFilter !== "all")
    filtered = filtered.filter((u) => u.role === regRoleFilter);
  if (regCountryFilter !== "all")
    filtered = filtered.filter((u) => u.country === regCountryFilter);
  if (regStatusFilter !== "all")
    filtered = filtered.filter((u) => u.approvalStatus === regStatusFilter);

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageUsers = filtered.slice(
    (regPage - 1) * PAGE_SIZE,
    regPage * PAGE_SIZE,
  );
  const recent = [...activeUsers]
    .sort((a, b) => b.registeredAt - a.registeredAt)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {activeUsers.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {at(
              "Utilisateurs total",
              "Total Users",
              "Benutzer gesamt",
              "Usuarios totales",
              "Utenti totali",
              "Utilizadores",
              "Totaal gebruikers",
              "Σύνολο χρηστών",
            )}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-amber-600 text-white">
                {pendingCount}
              </span>
            )}
          </div>
          <p className="text-xs text-amber-700 mt-1">
            {at(
              "En attente",
              "Pending Approval",
              "Ausstehend",
              "Pendiente",
              "In attesa",
              "Pendente",
              "In behandeling",
              "Εκκρεμεί",
            )}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{suspendedCount}</p>
          <p className="text-xs text-red-700 mt-1">
            {at(
              "Suspendus",
              "Suspended",
              "Gesperrt",
              "Suspendidos",
              "Sospesi",
              "Suspensos",
              "Geschorst",
              "Ανεσταλμένοι",
            )}
          </p>
        </div>
      </div>

      {/* Recent registrations */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          {at(
            "Inscriptions récentes",
            "Recent Registrations",
            "Neueste Registrierungen",
            "Registros recientes",
            "Registrazioni recenti",
            "Registos recentes",
            "Recente registraties",
            "Πρόσφατες εγγραφές",
          )}
        </h3>
        <div className="space-y-2">
          {recent.map((u, i) => (
            <div
              key={u.id}
              className="flex items-center justify-between text-xs"
              data-ocid={`admin.reg.item.${i + 1}`}
            >
              <span className="font-medium text-foreground">
                {u.pseudo} ({u.firstName} {u.lastName})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {COUNTRY_FLAGS[u.country] ?? u.country}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {u.role}
                </Badge>
                <ApprovalBadge status={u.approvalStatus} at={at} />
              </div>
            </div>
          ))}
          {recent.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {at("Aucune inscription récente", "No recent registrations")}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select
          value={regRoleFilter}
          onValueChange={(v) => {
            setRegRoleFilter(v);
            setRegPage(1);
          }}
        >
          <SelectTrigger
            className="w-36 h-8 text-xs"
            data-ocid="admin.reg.role_filter"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {at("Tous les rôles", "All Roles")}
            </SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={regCountryFilter}
          onValueChange={(v) => {
            setRegCountryFilter(v);
            setRegPage(1);
          }}
        >
          <SelectTrigger
            className="w-36 h-8 text-xs"
            data-ocid="admin.reg.country_filter"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {at("Tous les pays", "All Countries")}
            </SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {COUNTRY_FLAGS[c] ?? c} {COUNTRY_NAMES[c] ?? c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={regStatusFilter}
          onValueChange={(v) => {
            setRegStatusFilter(v);
            setRegPage(1);
          }}
        >
          <SelectTrigger
            className="w-40 h-8 text-xs"
            data-ocid="admin.reg.status_filter"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {at("Tous les statuts", "All Statuses")}
            </SelectItem>
            <SelectItem value="pending_approval">
              {at("En attente", "Pending")}
            </SelectItem>
            <SelectItem value="approved">
              {at("Approuvé", "Approved")}
            </SelectItem>
            <SelectItem value="suspended">
              {at("Suspendu", "Suspended")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div
        className="bg-card border border-border rounded-xl overflow-hidden"
        data-ocid="admin.reg.table"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">
                {at(
                  "Nom",
                  "Name",
                  "Name",
                  "Nombre",
                  "Nome",
                  "Nome",
                  "Naam",
                  "Όνομα",
                )}
              </TableHead>
              <TableHead className="text-xs">
                {at(
                  "Rôle",
                  "Role",
                  "Rolle",
                  "Rol",
                  "Ruolo",
                  "Papel",
                  "Rol",
                  "Ρόλος",
                )}
              </TableHead>
              <TableHead className="text-xs">
                {at(
                  "Pays",
                  "Country",
                  "Land",
                  "País",
                  "Paese",
                  "País",
                  "Land",
                  "Χώρα",
                )}
              </TableHead>
              <TableHead className="text-xs">
                {at(
                  "Date",
                  "Date",
                  "Datum",
                  "Fecha",
                  "Data",
                  "Data",
                  "Datum",
                  "Ημερομηνία",
                )}
              </TableHead>
              <TableHead className="text-xs">
                {at(
                  "Statut",
                  "Status",
                  "Status",
                  "Estado",
                  "Stato",
                  "Estado",
                  "Status",
                  "Κατάσταση",
                )}
              </TableHead>
              <TableHead className="text-xs">
                {at(
                  "Actions",
                  "Actions",
                  "Aktionen",
                  "Acciones",
                  "Azioni",
                  "Ações",
                  "Acties",
                  "Ενέργειες",
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageUsers.map((u, idx) => (
              <TableRow key={u.id} data-ocid={`admin.reg.row.${idx + 1}`}>
                <TableCell className="text-xs font-medium">
                  {u.pseudo}{" "}
                  <span className="text-muted-foreground">
                    ({u.firstName} {u.lastName})
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${roleColors[u.role] ?? ""}`}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {COUNTRY_FLAGS[u.country] ?? u.country}{" "}
                  {COUNTRY_NAMES[u.country] ?? u.country}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(u.registeredAt).toLocaleDateString(
                    LOCALE_MAP[lang as keyof typeof LOCALE_MAP] ?? "en-GB",
                  )}
                </TableCell>
                <TableCell>
                  <ApprovalBadge status={u.approvalStatus} at={at} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {u.approvalStatus === "pending_approval" && (
                      <>
                        <Button
                          size="sm"
                          className="h-6 px-2 text-[10px] bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => approveUser(u.id)}
                          data-ocid={`admin.reg.approve_button.${idx + 1}`}
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          {at(
                            "Approuver",
                            "Approve",
                            "Genehmigen",
                            "Aprobar",
                            "Approva",
                            "Aprovar",
                            "Goedkeuren",
                            "Έγκριση",
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-[10px] text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => suspendUser(u.id)}
                          data-ocid={`admin.reg.reject_button.${idx + 1}`}
                        >
                          {at(
                            "Rejeter",
                            "Reject",
                            "Ablehnen",
                            "Rechazar",
                            "Rifiuta",
                            "Rejeitar",
                            "Afwijzen",
                            "Απόρριψη",
                          )}
                        </Button>
                      </>
                    )}
                    {u.approvalStatus === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-[10px] text-orange-600 border-orange-200 hover:bg-orange-50"
                        onClick={() => suspendUser(u.id)}
                        data-ocid={`admin.reg.suspend_button.${idx + 1}`}
                      >
                        <UserMinus className="h-3 w-3 mr-1" />
                        {at(
                          "Suspendre",
                          "Suspend",
                          "Sperren",
                          "Suspender",
                          "Sospendi",
                          "Suspender",
                          "Schorsen",
                          "Αναστολή",
                        )}
                      </Button>
                    )}
                    {u.approvalStatus === "suspended" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-[10px] text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => approveUser(u.id)}
                        data-ocid={`admin.reg.reactivate_button.${idx + 1}`}
                      >
                        {at(
                          "Réactiver",
                          "Reactivate",
                          "Reaktivieren",
                          "Reactivar",
                          "Riattiva",
                          "Reativar",
                          "Heractiveren",
                          "Επανενεργοποίηση",
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteConfirmId(u.id)}
                      data-ocid={`admin.reg.delete_button.${idx + 1}`}
                    >
                      <UserX className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pageUsers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-xs text-muted-foreground py-8"
                  data-ocid="admin.reg.empty_state"
                >
                  {at("Aucun utilisateur trouvé", "No users found")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={regPage <= 1}
            onClick={() => setRegPage(regPage - 1)}
            data-ocid="admin.reg.pagination_prev"
          >
            ←
          </Button>
          <span className="text-xs text-muted-foreground">
            {regPage} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={regPage >= totalPages}
            onClick={() => setRegPage(regPage + 1)}
            data-ocid="admin.reg.pagination_next"
          >
            →
          </Button>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteConfirmId && (
        <Dialog
          open={!!deleteConfirmId}
          onOpenChange={() => setDeleteConfirmId(null)}
        >
          <DialogContent data-ocid="admin.reg.dialog">
            <DialogHeader>
              <DialogTitle className="text-destructive">
                {at("Supprimer le compte", "Delete Account")}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {at(
                "Cette action est irréversible. L'utilisateur ne pourra plus accéder à TaskVoilà.",
                "This action is irreversible. The user will no longer be able to access TaskVoilà.",
              )}
            </p>
            <div className="flex gap-2 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                data-ocid="admin.reg.cancel_button"
              >
                {at("Annuler", "Cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteUser(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                data-ocid="admin.reg.confirm_button"
              >
                {at("Supprimer", "Delete")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── DAC7 Tab ─────────────────────────────────────────────────────────────────

function KYCBadge({
  status,
  at,
}: { status?: string; at: (fr: string, en: string) => string }) {
  if (!status || status === "none")
    return (
      <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-[10px]">
        {at("Aucun", "None")}
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
        {at("En attente", "Pending")}
      </Badge>
    );
  if (status === "verified")
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px]">
        {at("Vérifié", "Verified")}
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px]">
        {at("Rejeté", "Rejected")}
      </Badge>
    );
  return null;
}

function DAC7StatusBadge({
  user,
  at,
}: { user: AdminUser; at: (fr: string, en: string) => string }) {
  const complete =
    user.dac7Complete ||
    (user.taxId && user.iban && user.proStatus && user.dac7Accepted);
  const kycVerified = user.kycStatus === "verified";
  if (complete && !kycVerified)
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
        {at("Vérif. en attente", "Pending Verif.")}
      </Badge>
    );
  if (complete && kycVerified)
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px]">
        {at("Complet", "Complete")}
      </Badge>
    );
  return (
    <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px]">
      {at("Incomplet", "Incomplete")}
    </Badge>
  );
}

function DAC7Tab({
  adminUsers,
  at,
  dac7CountryFilter,
  setDac7CountryFilter,
  dac7StatusFilter,
  setDac7StatusFilter,
  validateKYC,
  rejectKYC,
  flagVerified,
  flagSuspended,
}: {
  adminUsers: AdminUser[];
  at: (
    fr: string,
    en: string,
    de?: string,
    es?: string,
    it?: string,
    pt?: string,
    nl?: string,
    el?: string,
  ) => string;
  dac7CountryFilter: string;
  setDac7CountryFilter: (v: string) => void;
  dac7StatusFilter: string;
  setDac7StatusFilter: (v: string) => void;
  validateKYC: (id: string) => void;
  rejectKYC: (id: string) => void;
  flagVerified: (id: string) => void;
  flagSuspended: (id: string) => void;
}) {
  const proUsers = adminUsers.filter(
    (u) => u.role === "pro" && u.approvalStatus !== "deleted",
  );
  const countries = Array.from(new Set(proUsers.map((u) => u.country)));

  let filtered = proUsers;
  if (dac7CountryFilter !== "all")
    filtered = filtered.filter((u) => u.country === dac7CountryFilter);
  if (dac7StatusFilter !== "all") {
    filtered = filtered.filter((u) => {
      const complete =
        u.dac7Complete || (u.taxId && u.iban && u.proStatus && u.dac7Accepted);
      const kycVerified = u.kycStatus === "verified";
      if (dac7StatusFilter === "complete") return complete && kycVerified;
      if (dac7StatusFilter === "incomplete") return !complete;
      if (dac7StatusFilter === "pending_verification")
        return complete && !kycVerified;
      return true;
    });
  }

  function exportCSV() {
    const year = new Date().getFullYear();
    const headers = [
      "Pseudo",
      "Legal Name",
      "Country",
      "Tax ID",
      "IBAN",
      "Tax Country",
      "Pro Status",
      "DAC7 Accepted",
      "KYC Status",
    ];
    const rows = proUsers.map((u) => [
      u.pseudo,
      u.companyName ?? `${u.firstName} ${u.lastName}`,
      u.country,
      u.taxId ?? "",
      u.iban ? maskIBAN(u.iban) : "",
      u.taxResidenceCountry ?? "",
      u.proStatus ?? "",
      u.dac7Accepted ? "Yes" : "No",
      u.kycStatus ?? "none",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taskvoila-dac7-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const year = new Date().getFullYear();
    const rows = proUsers
      .map(
        (u) => `
      <tr>
        <td>${u.pseudo}</td>
        <td>${u.companyName ?? `${u.firstName} ${u.lastName}`}</td>
        <td>${u.country}</td>
        <td>${u.taxId ?? "-"}</td>
        <td>${u.iban ? maskIBAN(u.iban) : "-"}</td>
        <td>${u.taxResidenceCountry ?? "-"}</td>
        <td>${u.proStatus ?? "-"}</td>
        <td>${u.dac7Accepted ? "✓" : "✗"}</td>
      </tr>
    `,
      )
      .join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>TaskVoilà — Rapport DAC7 ${year}</title>
    <style>body{font-family:sans-serif;padding:24px}h1{color:#92400e}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #ddd;padding:8px;font-size:12px;text-align:left}th{background:#fef3c7;font-weight:600}</style></head>
    <body><h1>TaskVoilà — Rapport DAC7 ${year}</h1><p style="font-size:12px;color:#6b7280">Rapport annuel — Irish Revenue Commissioners (ROS) — À soumettre avant le 31 janvier ${year + 1}</p>
    <table><thead><tr><th>Pseudo</th><th>Nom légal</th><th>Pays</th><th>N° Fiscal</th><th>IBAN</th><th>Pays résidence fiscale</th><th>Statut pro</th><th>DAC7</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  }

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            {at(
              "Rapport annuel DAC7",
              "DAC7 Annual Report",
              "DAC7 Jahresbericht",
              "Informe anual DAC7",
              "Rapporto annuale DAC7",
              "Relatório anual DAC7",
              "Jaarlijks DAC7-rapport",
              "Ετήσια Έκθεση DAC7",
            )}
          </p>
          <p className="text-xs text-amber-700 mt-1">
            {at(
              "Rapport annuel à soumettre avant le 31 janvier à Irish Revenue (ROS) — Council Directive 2021/514/EU",
              "Annual report to be submitted before January 31st to Irish Revenue (ROS) — Council Directive 2021/514/EU",
            )}
          </p>
        </div>
      </div>

      {/* Export buttons + filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <Select
            value={dac7CountryFilter}
            onValueChange={setDac7CountryFilter}
          >
            <SelectTrigger
              className="w-36 h-8 text-xs"
              data-ocid="admin.dac7.country_filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {at("Tous les pays", "All Countries")}
              </SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {COUNTRY_FLAGS[c] ?? c} {COUNTRY_NAMES[c] ?? c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dac7StatusFilter} onValueChange={setDac7StatusFilter}>
            <SelectTrigger
              className="w-44 h-8 text-xs"
              data-ocid="admin.dac7.status_filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {at("Tous les statuts", "All Statuses")}
              </SelectItem>
              <SelectItem value="complete">
                {at("Complet", "Complete")}
              </SelectItem>
              <SelectItem value="incomplete">
                {at("Incomplet", "Incomplete")}
              </SelectItem>
              <SelectItem value="pending_verification">
                {at("Vérif. en attente", "Pending Verification")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            onClick={exportCSV}
            data-ocid="admin.dac7.export_csv_button"
          >
            <Download className="h-3.5 w-3.5" />
            {at(
              "Exporter CSV",
              "Export CSV",
              "CSV exportieren",
              "Exportar CSV",
              "Esporta CSV",
              "Exportar CSV",
              "CSV exporteren",
              "Εξαγωγή CSV",
            )}
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90"
            onClick={exportPDF}
            data-ocid="admin.dac7.export_pdf_button"
          >
            <FileText className="h-3.5 w-3.5" />
            {at(
              "Exporter PDF",
              "Export PDF",
              "PDF exportieren",
              "Exportar PDF",
              "Esporta PDF",
              "Exportar PDF",
              "PDF exporteren",
              "Εξαγωγή PDF",
            )}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-card border border-border rounded-xl overflow-hidden"
        data-ocid="admin.dac7.table"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">
                  {at("Nom légal / Société", "Legal Name / Company")}
                </TableHead>
                <TableHead className="text-xs">
                  {at("Pays", "Country")}
                </TableHead>
                <TableHead className="text-xs">
                  {at("N° Fiscal", "Tax ID")}
                </TableHead>
                <TableHead className="text-xs">IBAN</TableHead>
                <TableHead className="text-xs">
                  {at("Résidence fiscale", "Tax Residence")}
                </TableHead>
                <TableHead className="text-xs">
                  {at("Statut pro", "Pro Status")}
                </TableHead>
                <TableHead className="text-xs">DAC7</TableHead>
                <TableHead className="text-xs">KYC</TableHead>
                <TableHead className="text-xs">
                  {at("Actions", "Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u, idx) => (
                <TableRow key={u.id} data-ocid={`admin.dac7.row.${idx + 1}`}>
                  <TableCell className="text-xs font-medium">
                    {u.companyName ?? `${u.firstName} ${u.lastName}`}
                    <br />
                    <span className="text-muted-foreground">@{u.pseudo}</span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {COUNTRY_FLAGS[u.country] ?? u.country}
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    {u.taxId ?? <span className="text-red-500">—</span>}
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    {u.iban ? (
                      maskIBAN(u.iban)
                    ) : (
                      <span className="text-red-500">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {u.taxResidenceCountry
                      ? (COUNTRY_FLAGS[u.taxResidenceCountry] ??
                        u.taxResidenceCountry)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {u.proStatus ?? "—"}
                  </TableCell>
                  <TableCell>
                    <DAC7StatusBadge user={u} at={at} />
                  </TableCell>
                  <TableCell>
                    <KYCBadge status={u.kycStatus} at={at} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {(!u.kycStatus ||
                        u.kycStatus === "pending" ||
                        u.kycStatus === "none") && (
                        <>
                          <Button
                            size="sm"
                            className="h-6 px-2 text-[10px] bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => validateKYC(u.id)}
                            data-ocid={`admin.dac7.validate_kyc_button.${idx + 1}`}
                          >
                            <Check className="h-3 w-3 mr-0.5" />
                            {at("Valider KYC", "Validate KYC")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-[10px] text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => rejectKYC(u.id)}
                            data-ocid={`admin.dac7.reject_kyc_button.${idx + 1}`}
                          >
                            {at("Rejeter KYC", "Reject KYC")}
                          </Button>
                        </>
                      )}
                      {u.kycStatus === "rejected" && (
                        <Button
                          size="sm"
                          className="h-6 px-2 text-[10px] bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => flagVerified(u.id)}
                          data-ocid={`admin.dac7.flag_verified_button.${idx + 1}`}
                        >
                          {at("Marquer vérifié", "Mark Verified")}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] text-orange-600 hover:bg-orange-50"
                        onClick={() => flagSuspended(u.id)}
                        data-ocid={`admin.dac7.suspend_button.${idx + 1}`}
                      >
                        {at("Suspendre", "Suspend")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-xs text-muted-foreground py-8"
                    data-ocid="admin.dac7.empty_state"
                  >
                    {at("Aucun professionnel trouvé", "No professionals found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Management Tab ─────────────────────────────────────────────────────

function AdminMgmtTab({
  adminUsers,
  adminIds,
  currentUser,
  lang,
  at,
  promoteToAdmin,
  revokeAdmin,
  revokeConfirmId,
  setRevokeConfirmId,
  promoteSearch,
  setPromoteSearch,
}: {
  adminUsers: AdminUser[];
  adminIds: string[];
  currentUser: CurrentUser | null;
  lang: string;
  at: (
    fr: string,
    en: string,
    de?: string,
    es?: string,
    it?: string,
    pt?: string,
    nl?: string,
    el?: string,
  ) => string;
  promoteToAdmin: (id: string) => void;
  revokeAdmin: (id: string) => void;
  revokeConfirmId: string | null;
  setRevokeConfirmId: (v: string | null) => void;
  promoteSearch: string;
  setPromoteSearch: (v: string) => void;
}) {
  const currentAdmins = adminUsers.filter(
    (u) => adminIds.includes(u.id) || u.role === "admin",
  );
  const nonAdmins = adminUsers.filter(
    (u) =>
      !adminIds.includes(u.id) &&
      u.role !== "admin" &&
      u.approvalStatus !== "deleted",
  );
  const searchResults = promoteSearch.trim()
    ? nonAdmins.filter(
        (u) =>
          u.pseudo.toLowerCase().includes(promoteSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(promoteSearch.toLowerCase()) ||
          `${u.firstName} ${u.lastName}`
            .toLowerCase()
            .includes(promoteSearch.toLowerCase()),
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          {at(
            "Vous êtes l'administrateur principal. Assurez-vous de toujours avoir au moins un administrateur actif.",
            "You are the primary administrator. Make sure there is always at least one active administrator.",
            "Sie sind der Hauptadministrator. Stellen Sie sicher, dass immer mindestens ein aktiver Administrator vorhanden ist.",
            "Usted es el administrador principal. Asegúrese de que siempre haya al menos un administrador activo.",
            "Sei l'amministratore principale. Assicurati di avere sempre almeno un amministratore attivo.",
            "Você é o administrador principal. Certifique-se de ter sempre pelo menos um administrador ativo.",
            "U bent de hoofdbeheerder. Zorg ervoor dat er altijd minimaal één actieve beheerder is.",
            "Είστε ο κύριος διαχειριστής. Βεβαιωθείτε ότι υπάρχει πάντα τουλάχιστον ένας ενεργός διαχειριστής.",
          )}
        </p>
      </div>

      {/* Current admins list */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
          <ShieldPlus className="h-4 w-4 text-primary" />
          {at(
            "Administrateurs actuels",
            "Current Administrators",
            "Aktuelle Administratoren",
            "Administradores actuales",
            "Amministratori attuali",
            "Administradores atuais",
            "Huidige beheerders",
            "Τρέχοντες διαχειριστές",
          )}
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs ml-1">
            {currentAdmins.length}
          </Badge>
        </h3>
        <div className="space-y-3" data-ocid="admin.mgmt.list">
          {currentAdmins.map((admin, idx) => {
            const isSelf = currentUser && String(currentUser.id) === admin.id;
            return (
              <div
                key={admin.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                data-ocid={`admin.mgmt.item.${idx + 1}`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {admin.pseudo}{" "}
                    <span className="text-muted-foreground text-xs">
                      ({admin.firstName} {admin.lastName})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {admin.email} ·{" "}
                    {COUNTRY_FLAGS[admin.country] ?? admin.country}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {at("Promu le", "Promoted on")}{" "}
                    {new Date(admin.registeredAt).toLocaleDateString(
                      LOCALE_MAP[lang as keyof typeof LOCALE_MAP] ?? "en-GB",
                    )}
                    {isSelf && (
                      <span className="ml-2 text-primary font-medium">
                        ({at("Vous", "You")})
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs text-destructive border-destructive/20 hover:bg-destructive/10"
                  disabled={!!isSelf}
                  onClick={() => setRevokeConfirmId(admin.id)}
                  data-ocid={`admin.mgmt.revoke_button.${idx + 1}`}
                >
                  {at(
                    "Révoquer",
                    "Revoke",
                    "Widerrufen",
                    "Revocar",
                    "Revoca",
                    "Revogar",
                    "Intrekken",
                    "Ανάκληση",
                  )}
                </Button>
              </div>
            );
          })}
          {currentAdmins.length === 0 && (
            <p
              className="text-xs text-muted-foreground text-center py-4"
              data-ocid="admin.mgmt.empty_state"
            >
              {at("Aucun administrateur", "No administrators")}
            </p>
          )}
        </div>
      </div>

      {/* Promote new admin */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-primary" />
          {at(
            "Promouvoir un administrateur",
            "Promote an Administrator",
            "Administrator befördern",
            "Promover un administrador",
            "Promuovi un amministratore",
            "Promover um administrador",
            "Beheerder bevorderen",
            "Προώθηση διαχειριστή",
          )}
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder={at(
              "Rechercher par pseudo ou email…",
              "Search by pseudo or email…",
            )}
            value={promoteSearch}
            onChange={(e) => setPromoteSearch(e.target.value)}
            className="text-sm h-9"
            data-ocid="admin.mgmt.promote_search_input"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2 border border-border rounded-lg overflow-hidden">
            {searchResults.slice(0, 5).map((u, idx) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 hover:bg-muted/30"
                data-ocid={`admin.mgmt.promote_result.${idx + 1}`}
              >
                <div>
                  <p className="text-sm font-medium">{u.pseudo}</p>
                  <p className="text-xs text-muted-foreground">
                    {u.email} · {COUNTRY_FLAGS[u.country] ?? u.country} ·{" "}
                    <Badge variant="outline" className="text-[10px]">
                      {u.role}
                    </Badge>
                  </p>
                </div>
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs bg-primary hover:bg-primary/90"
                  onClick={() => {
                    promoteToAdmin(u.id);
                    setPromoteSearch("");
                  }}
                  data-ocid={`admin.mgmt.promote_button.${idx + 1}`}
                >
                  {at(
                    "Promouvoir",
                    "Promote",
                    "Befördern",
                    "Promover",
                    "Promuovi",
                    "Promover",
                    "Bevorderen",
                    "Προώθηση",
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
        {promoteSearch.trim() && searchResults.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {at("Aucun utilisateur trouvé", "No user found")}
          </p>
        )}
      </div>

      {/* Revoke confirm dialog */}
      {revokeConfirmId && (
        <Dialog
          open={!!revokeConfirmId}
          onOpenChange={() => setRevokeConfirmId(null)}
        >
          <DialogContent data-ocid="admin.mgmt.dialog">
            <DialogHeader>
              <DialogTitle>
                {at("Révoquer les droits admin", "Revoke Admin Rights")}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {at(
                "Cet utilisateur perdra l'accès au tableau de bord admin. Cette action peut être annulée en le repromotant.",
                "This user will lose access to the admin dashboard. This action can be undone by promoting them again.",
              )}
            </p>
            <div className="flex gap-2 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setRevokeConfirmId(null)}
                data-ocid="admin.mgmt.cancel_button"
              >
                {at("Annuler", "Cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  revokeAdmin(revokeConfirmId);
                  setRevokeConfirmId(null);
                }}
                data-ocid="admin.mgmt.confirm_button"
              >
                {at("Révoquer", "Revoke")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
