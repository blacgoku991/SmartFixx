import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Copy, Mail, MapPin, Phone, Timer } from "lucide-react";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { Magnetic } from "../ui/Magnetic";
import { BUDGET_RANGES, PROJECT_TYPES, site } from "@/data/site";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";

const FIELDS = [
  "name",
  "company",
  "email",
  "phone",
  "type",
  "budget",
  "message",
  "ref_interne",
] as const;

/**
 * L'envoi passe par `api/contact.ts`, une fonction serverless qui relaie la
 * demande par e-mail.
 *
 * Le formulaire composait auparavant un `mailto:` : il fallait que le visiteur
 * envoie lui-même le message depuis son logiciel de messagerie, et l'écran de
 * confirmation s'affichait de toute façon. Sur mobile ou sur un webmail, le
 * clic ne produisait rien et la demande était perdue des deux côtés sans que
 * personne ne le sache. Ici l'état affiché suit la réponse du serveur : une
 * confirmation signifie que l'e-mail est parti.
 */
export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = Object.fromEntries(
      FIELDS.map((key) => [key, String(data.get(key) ?? "").trim()]),
    );

    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const detail: unknown = await response.json().catch(() => null);
        const message =
          detail && typeof detail === "object" && "error" in detail
            ? String((detail as { error: unknown }).error)
            : "";
        throw new Error(message || "L'envoi a échoué.");
      }

      setStatus("sent");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "L'envoi a échoué.");
      setStatus("error");
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard refusée (contexte non sécurisé) : le lien mailto reste disponible.
    }
  };

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className="pointer-events-none absolute -left-32 top-1/4 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(79,240,212,0.09),transparent_66%)] blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(139,92,255,0.10),transparent_66%)] blur-3xl" />

      <div className="container-x relative">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Contact"
              title={
                <>
                  Parlons de votre projet.{" "}
                  <span className="grad-accent">Le premier échange est gratuit.</span>
                </>
              }
              description="Décrivez votre besoin en quelques lignes. On revient vers vous avec un premier avis honnête — y compris quand la réponse est « ce n'est pas nécessaire »."
            />

            <div className="mt-10 space-y-3">
              <Reveal delay={0.1}>
                <div className="panel flex items-center justify-between gap-4 p-4">
                  <span className="flex min-w-0 items-center gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-mint/[0.07] text-mint">
                      <Mail className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-fog-faint">
                        E-mail
                      </span>
                      <a
                        href={`mailto:${site.email}`}
                        className="block truncate text-[14.5px] font-medium text-white hover:text-mint"
                      >
                        {site.email}
                      </a>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-fog-dim transition-colors hover:border-mint/40 hover:text-mint"
                    aria-label="Copier l'adresse e-mail"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-mint" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Reveal>

              {site.phone && (
                <Reveal delay={0.15}>
                  <a
                    href={`tel:${site.phone.replace(/\s/g, "")}`}
                    className="panel panel-hover flex items-center gap-3.5 p-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-violet/[0.08] text-violet-400">
                      <Phone className="h-[18px] w-[18px]" />
                    </span>
                    <span>
                      <span className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-fog-faint">
                        Téléphone
                      </span>
                      <span className="block text-[14.5px] font-medium text-white">
                        {site.phone}
                      </span>
                    </span>
                  </a>
                </Reveal>
              )}

              <Reveal delay={0.2}>
                <div className="panel flex items-center gap-3.5 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-fog-dim">
                    <MapPin className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-fog-faint">
                      Zone d&apos;intervention
                    </span>
                    <span className="block text-[14px] text-fog">{site.location}</span>
                  </span>
                </div>
              </Reveal>

              <Reveal delay={0.25}>
                <div className="flex items-center gap-2.5 px-1 pt-2 text-[13px] text-fog-dim">
                  <Timer className="h-4 w-4 text-mint" />
                  {site.responseTime}
                </div>
              </Reveal>
            </div>
          </div>

          <Reveal delay={0.1}>
            <div className="panel relative overflow-hidden p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {status === "sent" ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[440px] flex-col items-center justify-center gap-5 text-center"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-mint/30 bg-mint/10">
                      <Check className="h-7 w-7 text-mint" />
                    </span>
                    <h3 className="text-2xl font-semibold">Demande envoyée.</h3>
                    <p className="max-w-sm text-[14.5px] leading-relaxed text-fog-dim">
                      Nous l&apos;avons bien reçue et vous répondons sous 24 h ouvrées. Un doute,
                      une pièce à joindre ? Écrivez-nous à{" "}
                      <a href={`mailto:${site.email}`} className="text-mint underline">
                        {site.email}
                      </a>
                      .
                    </p>
                    <button
                      type="button"
                      onClick={() => setStatus("idle")}
                      className="btn-ghost mt-2"
                    >
                      Envoyer une autre demande
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-4"
                  >
                    {/* Pot de miel : hors écran et hors tabulation, donc invisible pour un
                        visiteur et pour un lecteur d'écran. Rempli, il fait seulement
                        signaler la demande dans l'objet de l'e-mail — elle est envoyée
                        quand même, voir api/contact.ts.
                        Le nom ne doit correspondre à aucune catégorie de remplissage
                        automatique : Chrome remplit « website », « url » ou « nickname »
                        même avec autocomplete="off". */}
                    <input
                      type="text"
                      name="ref_interne"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Nom et prénom" required>
                        <input
                          name="name"
                          required
                          className="field"
                          placeholder="Camille Dubois"
                        />
                      </Field>
                      <Field label="Société">
                        <input name="company" className="field" placeholder="Nom de l'entreprise" />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="E-mail" required>
                        <input
                          name="email"
                          type="email"
                          required
                          className="field"
                          placeholder="camille@societe.fr"
                        />
                      </Field>
                      <Field label="Téléphone">
                        <input
                          name="phone"
                          type="tel"
                          className="field"
                          placeholder="06 12 34 56 78"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Type de projet" required>
                        <select
                          name="type"
                          required
                          defaultValue={PROJECT_TYPES[0]}
                          className="field"
                        >
                          {PROJECT_TYPES.map((option) => (
                            <option key={option} value={option} className="bg-ink-850">
                              {option}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Budget envisagé">
                        <select
                          name="budget"
                          defaultValue={BUDGET_RANGES[BUDGET_RANGES.length - 1]}
                          className="field"
                        >
                          {BUDGET_RANGES.map((option) => (
                            <option key={option} value={option} className="bg-ink-850">
                              {option}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <Field label="Votre projet" required>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        className="field resize-none"
                        placeholder="Ce que vous avez aujourd'hui, ce qui vous bloque, ce que vous aimeriez obtenir…"
                      />
                    </Field>

                    <label className="flex items-start gap-3 pt-1 text-[12.5px] leading-relaxed text-fog-dim">
                      <input
                        type="checkbox"
                        required
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[#4FF0D4]"
                      />
                      J&apos;accepte que ces informations soient utilisées pour répondre à ma
                      demande.
                    </label>

                    {status === "error" && (
                      <p
                        role="alert"
                        className="rounded-lg border border-[#FF5C8A]/30 bg-[#FF5C8A]/10 px-4 py-3 text-[13.5px] leading-relaxed text-[#FFC2D4]"
                      >
                        {error} Rien n&apos;est perdu : écrivez-nous à{" "}
                        <a href={`mailto:${site.email}`} className="underline">
                          {site.email}
                        </a>
                        , ou réessayez dans un instant.
                      </p>
                    )}

                    <Magnetic strength={0.16} className="pt-2">
                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="btn-primary group w-full disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {status === "sending" ? "Envoi…" : "Envoyer ma demande"}
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>
                    </Magnetic>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-fog-faint">
        {label}
        {required && <span className="ml-1 text-mint">*</span>}
      </span>
      {children}
    </label>
  );
}
