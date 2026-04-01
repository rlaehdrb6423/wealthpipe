import { type Locale, getTexts } from "@/lib/i18n";
import HeroCanvasLoader from "./HeroCanvasLoader";
import RevealOnScroll from "./RevealOnScroll";
import NewsletterForm from "./NewsletterForm";
import NewsletterBenefits from "./NewsletterBenefits";
import ContactForm from "./ContactForm";

interface WealthPipePageProps {
  locale: Locale;
}

export default function WealthPipePage({ locale }: WealthPipePageProps) {
  const t = getTexts(locale);
  const isKo = locale === "ko";

  return (
    <main className="wp-main">
      {/* NAV */}
      <nav className="wp-nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <span className="nav-dot" />
            <span className="nav-brand">WealthPipe</span>
          </div>
          <div className="nav-links">
            <a href="#tools" className="nav-a">{t.nav.tools}</a>
            <a href="#newsletter" className="nav-a">{t.nav.newsletter}</a>
            <a href="#contact" className="nav-a">{t.nav.agency}</a>
          </div>
          <div className="nav-right">
            <a href="/ko" className={`lang-btn${isKo ? " lang-active" : ""}`}>KO</a>
            <a href="/" className={`lang-btn${!isKo ? " lang-active" : ""}`}>EN</a>
            <a href="#newsletter"><button className="btn-w nav-cta">{t.nav.subscribeCta}</button></a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <HeroCanvasLoader />
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-tagline-wrap">
            <span className="hero-tagline">{t.hero.tagline}</span>
          </div>
          <div className="big hero-anim-1">
            <div>{t.hero.line1a}</div>
            <div>{t.hero.line1b}</div>
          </div>
          <div className="hero-spacer" />
          <div className="big hero-anim-2">
            <div className="stroke">{t.hero.line2a}</div>
            <div className="stroke">{t.hero.line2b}</div>
          </div>
          <div className="hero-bottom two-col">
            <p className="hero-desc hero-anim-3">
              {t.hero.desc}<br />
              <span className="hero-desc-highlight">{t.hero.descHighlight}</span>
            </p>
            <div className="hero-cta-group hero-anim-4">
              <a href="#tools"><button className="btn-w">{t.hero.ctaPrimary}</button></a>
              <a href="#newsletter"><button className="btn-ghost">{t.hero.ctaSecondary}</button></a>
            </div>
          </div>
        </div>
        <div className="hero-fade" />
      </section>

      {/* MARQUEE */}
      <div className="marquee-section">
        <div className="marquee-track">
          {Array(4)
            .fill(["AI PIPELINE", "WEALTH SIGNAL", "DATA FLOW", "MARKET INTEL", "ALPHA ENGINE", "SEO POWER", "AUTO CRAWL", "INVEST DATA"])
            .flat()
            .map((text, i) => (
              <span key={i} className="m-item">
                {text}<span className="m-dot"> &middot; </span>
              </span>
            ))}
        </div>
      </div>

      {/* STATS */}
      <section className="stats-section">
        <div className="stats-grid">
          {t.stats.map(([n, l], i) => (
            <RevealOnScroll key={i} delay={i * 0.08} className="stat-item" style={{ borderLeft: i === 0 ? "2px solid #fff" : "1px solid #1a1a1a", paddingLeft: 28 }}>
              <div className={`stat-number${i === 0 ? " stat-number-active" : ""}`}>{n}</div>
              <div className="stat-label">{l}</div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section id="tools" className="tools-section">
        <RevealOnScroll className="tools-header">
          <h2 className="tools-heading">
            {t.tools.heading1}<br /><span className="stroke">{t.tools.heading2}</span>
          </h2>
          <p className="tools-subtext">{t.tools.subtext}</p>
        </RevealOnScroll>
        <div>
          {t.tools.items.map((tool, i) => {
            const content = (
              <RevealOnScroll key={i} delay={i * 0.1} className="tool-card">
                <div className="tool-num">{tool.n}</div>
                <div>
                  <div className="tool-tag">{tool.tag}</div>
                  <h3 className="card-title">{tool.title}</h3>
                  <p className="tool-desc">{tool.desc}</p>
                </div>
                <div className="tool-status-col">
                  <span className={`tool-status${tool.status === "LIVE" ? " tool-status-live" : ""}`}>{tool.status}</span>
                  <span className="card-arrow">↗</span>
                </div>
              </RevealOnScroll>
            );
            if (tool.status === "LIVE") {
              const toolPaths: Record<string, string> = {
                "01": "/tools/keyword",
                "02": "/tools/news",
                "03": "/tools/signals",
              };
              const path = toolPaths[tool.n] || "/tools/keyword";
              const href = isKo ? `/ko${path}` : path;
              return <a key={i} href={href} style={{ textDecoration: "none", color: "inherit" }}>{content}</a>;
            }
            return content;
          })}
          <div className="tools-end-border" />
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter" className="newsletter-section">
        <div className="newsletter-inner two-col">
          <div>
            <span className="nl-frequency">{t.newsletter.frequency}</span>
            <h2 className="nl-heading">
              {t.newsletter.heading.split("\n").map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h2>
            <RevealOnScroll>
              <NewsletterBenefits items={t.newsletter.benefits} />
            </RevealOnScroll>
          </div>
          <RevealOnScroll className="nl-form-col">
            <p className="nl-form-note">{t.newsletter.formNote}</p>
            <NewsletterForm
              namePlaceholder={t.newsletter.namePlaceholder}
              emailPlaceholder={t.newsletter.emailPlaceholder}
              submitBtn={t.newsletter.submitBtn}
              successTitle={t.newsletter.successTitle}
              successDesc={t.newsletter.successDesc}
            />
          </RevealOnScroll>
        </div>
      </section>

      {/* AGENCY */}
      <section id="contact" className="agency-section">
        <div className="agency-inner two-col">
          <RevealOnScroll>
            <span className="agency-label">{t.agency.label}</span>
            <h2 className="agency-heading">
              {t.agency.heading.split("\n").map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h2>
            <p className="agency-desc">{t.agency.desc}</p>
            <div className="agency-services">
              {t.agency.services.map((s, i) => (
                <div key={i} className="agency-service-row">
                  <span className="agency-service-num">{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </div>
              ))}
            </div>
          </RevealOnScroll>
          <RevealOnScroll>
            <ContactForm
              formLabel={t.agency.formLabel}
              namePlaceholder={t.agency.namePlaceholder}
              emailPlaceholder={t.agency.emailPlaceholder}
              msgPlaceholder={t.agency.msgPlaceholder}
              submitBtn={t.agency.submitBtn}
              successTitle={t.agency.successTitle}
              successDesc={t.agency.successDesc}
            />
          </RevealOnScroll>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="wp-footer">
        <div className="footer-inner">
          <span className="footer-brand">
            WealthPipe<span className="footer-tld">.net</span>
          </span>
          <span className="footer-copy">{t.footer.copyright}</span>
          <div className="footer-links">
            {[[t.nav.tools, "#tools"], [t.nav.newsletter, "#newsletter"], [t.nav.agency, "#contact"]].map(([l, h]) => (
              <a key={l} href={h} className="nav-a">{l}</a>
            ))}
            <a href={t.footer.langSwitchHref} className="lang-btn">{t.footer.langSwitchLabel}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
