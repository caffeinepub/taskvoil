import { CookieBanner } from "@/components/CookieBanner";
import { AIAssistantFAB } from "@/components/layout/AIAssistantFAB";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CountrySelector } from "@/components/onboarding/CountrySelector";
import { SwUpdateBanner } from "@/components/pwa/SwUpdateBanner";
import { AppLockGate } from "@/components/security/AppLockGate";
import { Toaster } from "@/components/ui/sonner";
import { BlurGate } from "@/components/visitor/BlurGate";
import { VisitorGateProvider } from "@/components/visitor/VisitorGate";
import { AdminStoreProvider } from "@/lib/admin-store";
import { AuthStoreProvider, useAuthStore } from "@/lib/auth-store";
import { CalendarStoreProvider } from "@/lib/calendar-store";
import { ChatStoreProvider } from "@/lib/chat-store";
import { CommentStoreProvider } from "@/lib/comment-store";
import { CountryStoreProvider, useCountryStore } from "@/lib/country-store";
import { DocumentStoreProvider } from "@/lib/document-store";
import { I18nProvider, type Language } from "@/lib/i18n";
import { KYCStoreProvider } from "@/lib/kyc-store";
import { MissionStoreProvider } from "@/lib/mission-store";
import { NFTStoreProvider } from "@/lib/nft-store";
import { OfferStoreProvider } from "@/lib/offer-store";
import { PaymentStoreProvider } from "@/lib/payment-store";
import { ProfileStoreProvider } from "@/lib/profile-store";
import { PromoStoreProvider } from "@/lib/promo-store";
import { RentalStoreProvider } from "@/lib/rental-store";
import { SecurityStoreProvider } from "@/lib/security-store";
import { SubscriptionStoreProvider } from "@/lib/subscription-store";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { BookingDetailPage } from "@/pages/BookingDetailPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { ClientDashboard } from "@/pages/ClientDashboard";
import { CompleteProfilePage } from "@/pages/CompleteProfilePage";
import { CookiePolicyPage } from "@/pages/CookiePolicyPage";
import { DocumentsPage } from "@/pages/DocumentsPage";
import { EditProfilePage } from "@/pages/EditProfilePage";
import { FAQPage } from "@/pages/FAQPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { MapPage } from "@/pages/MapPage";
import { MarketplacePage } from "@/pages/MarketplacePage";
import { MessagesPage } from "@/pages/MessagesPage";
import { MissionDetailPage } from "@/pages/MissionDetailPage";
import { NFTGalleryPage } from "@/pages/NFTGalleryPage";
import { PaymentPage } from "@/pages/PaymentPage";
import { PostRentalPage } from "@/pages/PostRentalPage";
import { PostTaskPage } from "@/pages/PostTaskPage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { ProDashboard } from "@/pages/ProDashboard";
import { ProDetailPage } from "@/pages/ProDetailPage";
import { ProSchedulePage } from "@/pages/ProSchedulePage";
import { ProsListPage } from "@/pages/ProsListPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { RentalCategoryPage } from "@/pages/RentalCategoryPage";
import { RentalHomePage } from "@/pages/RentalHomePage";
import { RentalListingPage } from "@/pages/RentalListingPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { StripeCancelPage } from "@/pages/StripeCancelPage";
import { StripeSuccessPage } from "@/pages/StripeSuccessPage";
import { SubscriptionPage } from "@/pages/SubscriptionPage";
import { TermsPage } from "@/pages/TermsPage";
import { VerifyEmailPage } from "@/pages/VerifyEmailPage";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type ReactNode, useCallback, useState } from "react";

// Switzerland country code — the ONLY country where a lang toggle (FR/DE) is shown
const SWITZERLAND_CODE = "CH";

// Root Layout — VisitorGateProvider lives here, INSIDE the RouterProvider context
function AppLayout() {
  return (
    <VisitorGateProvider>
      <div className="flex flex-col min-h-screen min-h-dvh">
        <Navbar />
        <div
          className="flex-1 pt-16 pb-20 md:pb-0"
          style={{
            paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <Outlet />
        </div>
        <Footer />
        {/* PWA update banner — appears when a new service worker activates */}
        <SwUpdateBanner />
        <BottomNav />
        <AIAssistantFAB />
      </div>
    </VisitorGateProvider>
  );
}

// Protected layout for any logged-in user (marketplace, categories, pros, post-task)
function ProtectedMemberLayout() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return <Navigate to="/login" />;
  return <Outlet />;
}

// Protected Dashboard Layout
function ProtectedClientLayout() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role !== "client") {
    if (currentUser.role === "admin") return <Navigate to="/dashboard/admin" />;
    if (currentUser.role === "pro") return <Navigate to="/dashboard/pro" />;
  }
  return <Outlet />;
}

function ProtectedProLayout() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role !== "pro") {
    if (currentUser.role === "admin") return <Navigate to="/dashboard/admin" />;
    if (currentUser.role === "client")
      return <Navigate to="/dashboard/client" />;
  }
  return <Outlet />;
}

function ProtectedAdminLayout() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role !== "admin") {
    if (currentUser.role === "pro") return <Navigate to="/dashboard/pro" />;
    if (currentUser.role === "client")
      return <Navigate to="/dashboard/client" />;
  }
  return <Outlet />;
}

// Blurred access layout — accessible without login, but blurs after 3s to prompt sign-up
function BlurredAccessLayout() {
  return (
    <BlurGate>
      <Outlet />
    </BlurGate>
  );
}

// Route definitions
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
      <CookieBanner />
    </>
  ),
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: LandingPage,
});

const blurredAccessRoute = createRoute({
  getParentRoute: () => layoutRoute,
  id: "blurred-access",
  component: BlurredAccessLayout,
});

const proDetailRoute = createRoute({
  getParentRoute: () => blurredAccessRoute,
  path: "/pro/$id",
  component: ProDetailPage,
});

const missionRoute = createRoute({
  getParentRoute: () => blurredAccessRoute,
  path: "/mission/$id",
  component: MissionDetailPage,
});

const messagesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/messages",
  component: MessagesPage,
});

const documentsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/documents",
  component: DocumentsPage,
});

const nftGalleryRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/nfts",
  component: NFTGalleryPage,
});

const subscriptionRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/subscription",
  component: SubscriptionPage,
});

const paymentRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/payment/$missionId",
  component: PaymentPage,
});

const stripeSuccessRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/payment/success",
  component: StripeSuccessPage,
});

const stripeCancelRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/payment/cancel",
  component: StripeCancelPage,
});

const termsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/terms",
  component: TermsPage,
});

const faqRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/faq",
  component: FAQPage,
});

const privacyRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/privacy",
  component: PrivacyPolicyPage,
});

const cookiesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/cookies",
  component: CookiePolicyPage,
});
const favoritesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/favorites",
  component: FavoritesPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-email",
  component: VerifyEmailPage,
});

const completeProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/complete-profile",
  component: CompleteProfilePage,
});

// Protected member routes (any logged-in user)
const protectedMemberRoute = createRoute({
  getParentRoute: () => layoutRoute,
  id: "protected-member",
  component: ProtectedMemberLayout,
});

const marketplaceRoute = createRoute({
  getParentRoute: () => blurredAccessRoute,
  path: "/marketplace",
  component: MarketplacePage,
});

const prosRoute = createRoute({
  getParentRoute: () => blurredAccessRoute,
  path: "/pros",
  component: ProsListPage,
});

const categoriesRoute = createRoute({
  getParentRoute: () => blurredAccessRoute,
  path: "/categories",
  component: CategoriesPage,
});

const mapRoute = createRoute({
  getParentRoute: () => blurredAccessRoute,
  path: "/map",
  component: MapPage,
});

const rentalHomeRoute = createRoute({
  getParentRoute: () => blurredAccessRoute,
  path: "/rental",
  component: RentalHomePage,
});

const rentalCategoryRoute = createRoute({
  getParentRoute: () => blurredAccessRoute,
  path: "/rental/category/$categoryId",
  component: RentalCategoryPage,
});

const rentalListingRoute = createRoute({
  getParentRoute: () => blurredAccessRoute,
  path: "/rental/listing/$listingId",
  component: RentalListingPage,
});

const postRentalRoute = createRoute({
  getParentRoute: () => protectedMemberRoute,
  path: "/rental/post",
  component: PostRentalPage,
});

const postTaskRoute = createRoute({
  getParentRoute: () => protectedMemberRoute,
  path: "/post-task",
  component: PostTaskPage,
});

// Protected routes
const protectedClientRoute = createRoute({
  getParentRoute: () => layoutRoute,
  id: "protected-client",
  component: ProtectedClientLayout,
});

const clientDashboardRoute = createRoute({
  getParentRoute: () => protectedClientRoute,
  path: "/dashboard/client",
  component: ClientDashboard,
});

const protectedProRoute = createRoute({
  getParentRoute: () => layoutRoute,
  id: "protected-pro",
  component: ProtectedProLayout,
});

const proDashboardRoute = createRoute({
  getParentRoute: () => protectedProRoute,
  path: "/dashboard/pro",
  component: ProDashboard,
});

const protectedAdminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  id: "protected-admin",
  component: ProtectedAdminLayout,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => protectedAdminRoute,
  path: "/dashboard/admin",
  component: AdminDashboard,
});

const settingsRoute = createRoute({
  getParentRoute: () => protectedMemberRoute,
  path: "/settings",
  component: SettingsPage,
});

const editProfileRoute = createRoute({
  getParentRoute: () => protectedMemberRoute,
  path: "/profile/edit",
  component: EditProfilePage,
});
const proScheduleRoute = createRoute({
  getParentRoute: () => protectedProRoute,
  path: "/pro/schedule",
  component: ProSchedulePage,
});

const bookingDetailRoute = createRoute({
  getParentRoute: () => protectedMemberRoute,
  path: "/booking/$id",
  component: BookingDetailPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    messagesRoute,
    documentsRoute,
    nftGalleryRoute,
    subscriptionRoute,
    stripeSuccessRoute,
    stripeCancelRoute,
    paymentRoute,
    privacyRoute,
    termsRoute,
    faqRoute,
    cookiesRoute,
    favoritesRoute,
    blurredAccessRoute.addChildren([
      proDetailRoute,
      missionRoute,
      marketplaceRoute,
      prosRoute,
      categoriesRoute,
      mapRoute,
      rentalHomeRoute,
      rentalCategoryRoute,
      rentalListingRoute,
    ]),
    protectedMemberRoute.addChildren([
      postTaskRoute,
      settingsRoute,
      editProfileRoute,
      bookingDetailRoute,
      postRentalRoute,
    ]),
    protectedClientRoute.addChildren([clientDashboardRoute]),
    protectedProRoute.addChildren([proDashboardRoute, proScheduleRoute]),
    protectedAdminRoute.addChildren([adminDashboardRoute]),
  ]),
  loginRoute,
  registerRoute,
  verifyEmailRoute,
  completeProfileRoute,
]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppInner() {
  return (
    <AppLockGate>
      <RouterProvider router={router} />
    </AppLockGate>
  );
}

/**
 * Gate: shows CountrySelector if no country is chosen yet.
 *
 * Language rules:
 * - Every country maps to exactly ONE fixed language (set in countries-data.ts).
 * - Switzerland (CH) is the ONLY exception: FR by default, with an optional DE toggle.
 * - No other country has a language toggle.
 *
 * I18nProvider is ALWAYS mounted so /login and /register never crash.
 */
function CountryGate({ children }: { children: ReactNode }) {
  const { isCountrySelected, selectedLang, selectedCountry } =
    useCountryStore();

  const isSwiss = selectedCountry === SWITZERLAND_CODE;
  const [swissLangOverride, setSwissLangOverride] = useState<Language | null>(
    null,
  );

  const effectiveLang: Language = isSwiss
    ? (swissLangOverride ?? (selectedLang as Language))
    : (selectedLang as Language);

  const handleSetLang = useCallback(
    (lang: Language) => {
      if (isSwiss) {
        setSwissLangOverride(lang === selectedLang ? null : lang);
      }
    },
    [isSwiss, selectedLang],
  );

  return (
    <I18nProvider lang={effectiveLang} setLang={handleSetLang}>
      {!isCountrySelected ? (
        <CountrySelector
          onComplete={() => {
            setSwissLangOverride(null);
          }}
        />
      ) : (
        children
      )}
    </I18nProvider>
  );
}

export default function App() {
  return (
    <CountryStoreProvider>
      <CountryGate>
        <MissionStoreProvider>
          <RentalStoreProvider>
            <OfferStoreProvider>
              <SecurityStoreProvider>
                <AuthStoreProvider>
                  <ChatStoreProvider>
                    <DocumentStoreProvider>
                      <NFTStoreProvider>
                        <SubscriptionStoreProvider>
                          <PromoStoreProvider>
                            <PaymentStoreProvider>
                              <ProfileStoreProvider>
                                <CommentStoreProvider>
                                  <KYCStoreProvider>
                                    <CalendarStoreProvider>
                                      <AdminStoreProvider>
                                        <AppInner />
                                      </AdminStoreProvider>
                                    </CalendarStoreProvider>
                                  </KYCStoreProvider>
                                </CommentStoreProvider>
                              </ProfileStoreProvider>
                            </PaymentStoreProvider>
                          </PromoStoreProvider>
                        </SubscriptionStoreProvider>
                      </NFTStoreProvider>
                    </DocumentStoreProvider>
                  </ChatStoreProvider>
                </AuthStoreProvider>
              </SecurityStoreProvider>
            </OfferStoreProvider>
          </RentalStoreProvider>
        </MissionStoreProvider>
      </CountryGate>
    </CountryStoreProvider>
  );
}
