import Link from 'next/link';
import SiteArrow from '@/components/site/SiteArrow';
import RichHeading from '@/components/site/RichHeading';
import {
  MusicNotes,
  HandsPraying,
  Lightning,
  Article,
  Heart,
  HandWaving,
} from '@phosphor-icons/react/dist/ssr';
import { getPageContent, parseList } from '@/lib/cms/content';
import { resolvePreview, type SiteSearchParams } from '@/lib/cms/preview';

const ICONS: Record<string, typeof MusicNotes> = {
  MusicNotes,
  HandsPraying,
  Lightning,
  Article,
  Heart,
  HandWaving,
};

export default async function DepartmentsPage({ searchParams }: { searchParams: SiteSearchParams }) {
  const preview = await resolvePreview(searchParams);
  const c = await getPageContent('departments', preview);

  const departments = parseList<{ name: string; text: string; linkLabel: string; icon: string }>(c['grid.items']);
  const steps = parseList<{ number: string; title: string; text: string }>(c['steps.items']);

  return (
    <>
      {/* ============ Page Hero ============ */}
      <section className="page-hero">
        <div className="inner page-hero-inner">
          <h1 data-reveal>
            <RichHeading text={c['hero.heading']} />
          </h1>
          <div className="lede" data-reveal data-reveal-delay="120">
            <p>{c['hero.body']}</p>
          </div>
        </div>
      </section>

      {/* ============ Departments ============ */}
      <section className="departments-section">
        <div className="inner">
          <div className="section-head" data-reveal>
            <div>
              <div className="badge">{c['grid.badge']}</div>
              <h2>
                <RichHeading text={c['grid.heading']} />
              </h2>
            </div>
            <p>{c['grid.subheading']}</p>
          </div>
          <div className="departments-grid">
            {departments.map((dept, index) => {
              const Icon = ICONS[dept.icon] ?? MusicNotes;
              return (
                <div className="dept-card" data-reveal data-reveal-delay={index * 80} key={index}>
                  <div className="dept-symbol">
                    <Icon size={20} weight="fill" />
                  </div>
                  <div>
                    <h3>{dept.name}</h3>
                    <p>{dept.text}</p>
                  </div>
                  <a href="#join" className="join-link">
                    {dept.linkLabel} &rarr;
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ How to Join ============ */}
      <section className="steps-section" id="join">
        <div className="inner">
          <div className="section-head" data-reveal>
            <div>
              <div className="badge">{c['steps.badge']}</div>
              <h2>
                <RichHeading text={c['steps.heading']} />
              </h2>
            </div>
            <p>{c['steps.subheading']}</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div className="step-card" data-reveal data-reveal-delay={index * 100} key={index}>
                <div className="step-num">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA Band ============ */}
      <section className="cta-band">
        <div className="inner cta-band-inner">
          <div data-reveal>
            <h2>
              <RichHeading text={c['cta.heading']} />
            </h2>
            <p>{c['cta.body']}</p>
          </div>
          <Link href={c['cta.ctaHref']} className="btn btn-lime" data-reveal data-reveal-delay="120">
            {c['cta.ctaLabel']}
            <SiteArrow stroke="#0D47A1" />
          </Link>
        </div>
      </section>
    </>
  );
}
