import { useState, lazy, Suspense, useCallback } from "react";
import { PublicNavbar } from "../../../components/PublicNavbar";
import Footer from "../Footer";
import { USPSlider } from "./USPSlider";
import { Hero } from "./Hero";
import { Demo } from "./Demo";

const AuthDialog = lazy(() =>
  import("../AuthDialog").then((m) => ({ default: m.AuthDialog }))
);

const Features = lazy(() => import("./Features").then(m => ({ default: m.Features })));
const Services = lazy(() => import("./ServicesSection").then(m => ({ default: m.Services })));
const HowItWorks = lazy(() => import("./HowItWorks").then(m => ({ default: m.HowItWorks })));
const Comparison = lazy(() => import("./Comparison").then(m => ({ default: m.Comparison })));
const Industry = lazy(() => import("./Industry").then(m => ({ default: m.Industry })));
const AddOns = lazy(() => import("./AddOns").then(m => ({ default: m.AddOns })));
const Testimonials = lazy(() => import("./Testimonials").then(m => ({ default: m.Testimonials })));
const CaseStudiesSection = lazy(() => import("./CaseStudiesSection").then(m => ({ default: m.CaseStudiesSection })));
const CTABanner = lazy(() => import("./CTABanner").then(m => ({ default: m.CTABanner })));
const FAQ = lazy(() => import("./FAQ").then(m => ({ default: m.FAQ })));
const Blog = lazy(() => import("./Blog").then(m => ({ default: m.Blog })));
const Pricing = lazy(() => import("./Pricing").then(m => ({ default: m.Pricing })));
const Contact = lazy(() => import("./Contact").then(m => ({ default: m.Contact })));

export function LandingSection() {
  const [authDialog, setAuthDialog] = useState<'login' | 'register' | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeUseCase, setActiveUseCase] = useState(0);

  const openAuth = useCallback((mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthDialog(mode);
  }, []);

  const closeAuth = useCallback(() => setAuthDialog(null), []);

  return (
    <div className="landing-page" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <PublicNavbar />
      <div className="page-bg" style={{ paddingTop: 120, paddingBottom: 8 }}>
        <div className="box-wrap">
          <USPSlider />
          <Hero openAuth={openAuth} />
          <Demo />
          <Suspense fallback={null}>
            <div id="features">
              <Features />
            </div>
            <Services />
            <Comparison />
            <div id="how-it-works">
              <HowItWorks openAuth={openAuth} />
            </div>
            
            <Industry activeUseCase={activeUseCase} setActiveUseCase={setActiveUseCase} openAuth={openAuth} />
            <AddOns />
            <Testimonials />
           
            
            <FAQ />
             <CaseStudiesSection />
            <Blog />
            
            <Pricing openAuth={openAuth} />
            <Contact />
            <CTABanner openAuth={openAuth} />
          </Suspense>
        </div>
      </div>
      <Footer />

      <Suspense fallback={null}>
        <AuthDialog
          isOpen={authDialog !== null}
          mode={authMode}
          onClose={closeAuth}
          onSwitch={(m) => {
            setAuthMode(m === 'forgot_password' || m === 'reset_password' ? 'login' : m);
            setAuthDialog(m === 'forgot_password' || m === 'reset_password' ? 'login' : m);
          }}
        />
      </Suspense>
    </div>
  );
}
