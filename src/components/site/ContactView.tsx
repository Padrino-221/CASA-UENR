'use client';

import Link from 'next/link';
import { useState } from 'react';
import SiteArrow from '@/components/site/SiteArrow';
import RichHeading from '@/components/site/RichHeading';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { parseLines } from '@/lib/cms/parse';
import {
  MapPin,
  Clock,
  EnvelopeSimple,
  Phone,
  InstagramLogo,
  WhatsappLogo,
  XLogo,
  YoutubeLogo,
} from '@phosphor-icons/react';

const TOPIC_OPTIONS = [
  { label: "I'm new and want to visit", value: 'new-visitor' },
  { label: 'I want to join a department', value: 'join-department' },
  { label: 'Prayer request', value: 'prayer-request' },
  { label: 'Counselling', value: 'counselling' },
  { label: 'Something else', value: 'something-else' },
];

export default function ContactView({ content }: { content: Record<string, string> }) {
  const [topic, setTopic] = useState('new-visitor');
  const addressLines = parseLines(content['info.address']);
  const gatheringLines = parseLines(content['info.gatherings']);

  return (
    <>
      {/* ============ Page Hero ============ */}
      <section className="page-hero">
        <div className="inner page-hero-inner">
          <h1 data-reveal>
            <RichHeading text={content['hero.heading']} />
          </h1>
          <div className="lede" data-reveal data-reveal-delay="120">
            <p>{content['hero.body']}</p>
          </div>
        </div>
      </section>

      {/* ============ Contact ============ */}
      <section className="contact-section" id="message">
        <div className="inner">
          <div className="contact-grid">
            <div className="form-card" data-reveal>
              <h3>
                <RichHeading text={content['form.heading']} />
              </h3>
              <form action="#" method="post">
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="name">Full name</label>
                    <input type="text" id="name" name="name" placeholder="Your name" required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="form-field">
                  <CustomDropdown label="What's this about?" options={TOPIC_OPTIONS} value={topic} onChange={setTopic} />
                </div>
                <div className="form-field">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" placeholder="Write your message here&hellip;" required />
                </div>
                <button type="submit" className="btn btn-ink">
                  Send message
                  <SiteArrow stroke="#0D47A1" />
                </button>
                <p className="form-note">{content['form.note']}</p>
              </form>
            </div>

            <div className="info-card" data-reveal data-reveal-delay="120">
              <h3>
                <RichHeading text={content['info.heading']} />
              </h3>
              <p className="info-sub">{content['info.subheading']}</p>

              <div className="info-row">
                <div className="info-row-icon">
                  <MapPin size={19} weight="regular" />
                </div>
                <div>
                  <h4>Find us</h4>
                  <p>
                    {addressLines.map((line, index) => (
                      <span key={index}>
                        {line}
                        {index < addressLines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              <div className="info-row">
                <div className="info-row-icon">
                  <Clock size={19} weight="regular" />
                </div>
                <div>
                  <h4>Worship gatherings</h4>
                  <p>
                    {gatheringLines.map((line, index) => (
                      <span key={index}>
                        {line}
                        {index < gatheringLines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              <div className="info-row">
                <div className="info-row-icon">
                  <EnvelopeSimple size={19} weight="regular" />
                </div>
                <div>
                  <h4>Email</h4>
                  <p>
                    <a href={`mailto:${content['info.email']}`}>{content['info.email']}</a>
                  </p>
                </div>
              </div>

              <div className="info-row">
                <div className="info-row-icon">
                  <Phone size={19} weight="regular" />
                </div>
                <div>
                  <h4>Phone / WhatsApp</h4>
                  <p>
                    <a href={`tel:${content['info.phone']}`}>{content['info.phone']}</a>
                  </p>
                </div>
              </div>

              <div className="socials-row">
                <a href={content['socials.instagram'] || '#'} className="social-chip" aria-label="Instagram">
                  <InstagramLogo size={19} weight="regular" />
                </a>
                <a href={content['socials.whatsapp'] || '#'} className="social-chip" aria-label="WhatsApp">
                  <WhatsappLogo size={19} weight="regular" />
                </a>
                <a href={content['socials.twitter'] || '#'} className="social-chip" aria-label="X">
                  <XLogo size={19} weight="regular" />
                </a>
                <a href={content['socials.youtube'] || '#'} className="social-chip" aria-label="YouTube">
                  <YoutubeLogo size={19} weight="regular" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA Band ============ */}
      <section className="cta-band">
        <div className="inner cta-band-inner">
          <div data-reveal>
            <h2>
              <RichHeading text={content['cta.heading']} />
            </h2>
            <p>{content['cta.body']}</p>
          </div>
          <Link href={content['cta.ctaHref']} className="btn btn-lime" data-reveal data-reveal-delay="120">
            {content['cta.ctaLabel']}
            <SiteArrow stroke="#0D47A1" />
          </Link>
        </div>
      </section>
    </>
  );
}
