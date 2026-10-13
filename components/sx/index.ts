/* Primitives partagées SmartFixx (lot 0). Gelées : les lots les utilisent, ne les modifient pas.
   Composants serveur sauf mention « client ». Contrat : docs/DESIGN_SYSTEM.md. */
export { PublicShell } from "./public-shell";
export { Section, Container, Eyebrow, SectionHead } from "./section";
export { PageHero, type PageHeroProps } from "./page-hero";
export { Breadcrumbs } from "./breadcrumbs";
export { ButtonLink, PhoneLink } from "./actions";
export { CtaBand } from "./cta-band";
export { ProofList } from "./proof-list";
export { Cartouche } from "./cartouche";
export { FaqList } from "./faq-list";
export { KineticHeading } from "./kinetic-heading";
export { Media, type MediaBase } from "./media";
export { DemoFrame } from "./demo-frame";
export { Glow, Skyline, SignalCard } from "./ambient";
export { Realisations } from "./realisations";
export { ScenePlayer } from "./scene-player"; // client
export { StateLoading, StateEmpty, StateError } from "./states"; // client
export { MotionGate, MotionToggle } from "./motion-gate"; // client
export { MobileCtaBar } from "./mobile-cta-bar"; // client
