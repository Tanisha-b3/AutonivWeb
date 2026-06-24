import { useState, useEffect, lazy, Suspense } from "react";
import { PublicNavbar } from "../../../components/PublicNavbar";
import Footer from "../Footer";
import { USPSlider } from "./USPSlider";
import { Hero } from "./Hero";
import { Demo } from "./Demo";
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

export function LandingSection({ openAuth }: { openAuth: (mode: 'login' | 'register') => void }) {
  const [activeUseCase, setActiveUseCase] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing-page" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <PublicNavbar scrolled={scrolled} openAuth={openAuth} />
      <div className="page-bg" style={{ paddingTop: 120, paddingBottom: 8 }}>
        <div className="box-wrap">
          <Suspense fallback={null}>
            <USPSlider />
            <Hero openAuth={openAuth} />
            <Demo />
            <div id="features">
              <Features />
            </div>
            <Services />
            <div id="how-it-works">
              <HowItWorks openAuth={openAuth} />
            </div>
            <Comparison />
            <Industry activeUseCase={activeUseCase} setActiveUseCase={setActiveUseCase} openAuth={openAuth} />
            <AddOns />
            <Testimonials />
            <CaseStudiesSection />
            <CTABanner openAuth={openAuth} />
            <FAQ />
            <Blog />
            <Pricing openAuth={openAuth} />
            <Contact />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
