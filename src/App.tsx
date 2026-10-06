import { Suspense, lazy, useCallback, useState } from "react";
import { Preloader } from "./components/Preloader";
import { Cursor } from "./components/Cursor";
import { Nav } from "./components/Nav";
import { Seo } from "./components/Seo";
import { Hero } from "./components/sections/Hero";
import { Services } from "./components/sections/Services";
import { Statement } from "./components/sections/Statement";
import { Automation } from "./components/sections/Automation";
import { Stack } from "./components/sections/Stack";
import { Process } from "./components/sections/Process";
import { Work } from "./components/sections/Work";
import { Faq } from "./components/sections/Faq";
import { Contact } from "./components/sections/Contact";
import { Footer } from "./components/sections/Footer";
import { LandingPage } from "./components/pages/LandingPage";
import { LegalNotice, PrivacyPolicy } from "./components/pages/LegalPage";
import { CityPage, HubPage, ZonesPage } from "./components/pages/CityPage";
import { NotFoundPage } from "./components/pages/NotFoundPage";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { useLowPower } from "./hooks/useEnvironment";
import { routeFor } from "./data/routes";
import { LANDINGS } from "./data/landings";
import { HUBS, cityBySlug, hubBySlug } from "./data/cities";

/**
 * three.js pèse plus que tout le reste du site réuni. En import dynamique, il
 * part dans un chunk séparé chargé après le premier rendu : le LCP ne l'attend
 * pas, et le build SSR du pré-rendu ne l'évalue jamais.
 */
const HeroScene = lazy(() =>
  import("./components/three/HeroScene").then((m) => ({ default: m.HeroScene })),
);

type AppProps = {
  /** Coupe tout ce qui n'a pas de sens hors navigateur (canvas, curseur, préchargeur). */
  prerender?: boolean;
  /** Chemin à rendre. Fourni par le pré-rendu ; lu dans l'URL côté navigateur. */
  pathname?: string;
};

function HomePage({ ready }: { ready: boolean }) {
  return (
    <main>
      <Hero ready={ready} />
      <Services />
      <Statement />
      <Automation />
      <Stack />
      <Process />
      <Work />
      <Faq />
      <Contact />
    </main>
  );
}

export default function App({ prerender = false, pathname }: AppProps) {
  const [ready, setReady] = useState(prerender);
  useSmoothScroll();
  /* Mobile, `prefers-reduced-motion`, ou machine modeste : la scène WebGL n'est
     alors pas chargée du tout. */
  const lowPower = useLowPower();

  const handleLoaded = useCallback(() => setReady(true), []);

  const currentPath = pathname ?? (typeof window === "undefined" ? "/" : window.location.pathname);
  const route = routeFor(currentPath);
  const isHome = route.kind === "home";
  // Les pages ville et departement sont generees depuis les donnees : on les
  // resout ici plutot que d'enumerer un composant par URL.
  const city =
    route.kind === "city"
      ? cityBySlug(route.path.replace("/creation-site-internet-", ""))
      : undefined;
  const hub = route.kind === "hub" ? hubBySlug(route.path) : undefined;

  return (
    <>
      <Seo route={route} />

      {!prerender && (
        <>
          <Preloader onDone={handleLoaded} />
          <Cursor />
        </>
      )}

      {/* Barre de progression de lecture — timeline de défilement CSS, aucun
          écouteur d'événement, aucun calcul par image. */}
      <div className="sf-progress" aria-hidden="true" />

      <Nav isHome={isHome} />

      {/*
        Décor WebGL — accueil uniquement, et seulement sur une machine capable.
        Il était chargé partout : sur mobile, three.js et son moteur de rendu
        repoussaient le plus grand rendu (LCP) à près de 11 s sous Lighthouse.
        C'est précisément la mesure que Google utilise pour classer, et il
        l'évalue sur mobile. Les appareils écartés gardent les dégradés CSS du
        hero — la page reste habitée, elle s'affiche simplement tout de suite.
      */}
      {!prerender && isHome && !lowPower && (
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      )}

      {route.kind === "notFound" && <NotFoundPage />}
      {isHome && <HomePage ready={ready} />}
      {route.path === "/mentions-legales" && <LegalNotice />}
      {route.path === "/politique-de-confidentialite" && <PrivacyPolicy />}
      {route.path === "/zones-desservies" && <ZonesPage hubs={HUBS} />}
      {LANDINGS[route.path] && <LandingPage landing={LANDINGS[route.path]} />}
      {city && <CityPage city={city} />}
      {hub && <HubPage hub={hub} />}

      <Footer />

      {/* Grain sur toute la page */}
      <div
        aria-hidden="true"
        className="noise pointer-events-none fixed inset-0 z-[150] opacity-[0.028] mix-blend-overlay"
      />
    </>
  );
}
