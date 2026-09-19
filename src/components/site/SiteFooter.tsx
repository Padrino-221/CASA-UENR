import Link from 'next/link';
import Image from 'next/image';

interface FooterGathering {
  name?: string;
  time?: string;
}

const DEFAULT_GATHERINGS: FooterGathering[] = [
  { name: 'Celebration Service', time: 'Sun · 8:00 AM' },
  { name: 'Bible Study', time: 'Wed · 5:30 PM' },
  { name: 'Prayer Meeting', time: 'Fri · 6:00 PM' },
];

export default function SiteFooter({
  content = {},
  gatherings = [],
  venue = '',
}: {
  content?: Record<string, string>;
  gatherings?: FooterGathering[];
  venue?: string;
}) {
  const siteName = content['brand.siteName'] || 'CASA UENR';
  const times = gatherings.length > 0 ? gatherings : DEFAULT_GATHERINGS;
  const location = venue || 'Chapel Annex, Main Campus';
  const description =
    content['footer.description'] ||
    'Christ Apostolic Students and Associates, University of Energy and Natural Resources (UENR) — raising students rooted in Christ, on campus and beyond.';
  const copyright = content['footer.copyright'] || '© 2026 Christ Apostolic Students and Associates';
  const tagline = content['footer.tagline'] || 'Rooted in Christ. Raised for purpose.';

  return (
    <footer className="footer">
      <div className="inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo">
              <span className="logo-icon">
                <Image src="/casa-logo-white.png" alt={`${siteName} logo`} width={56} height={56} />
              </span>
              {siteName}
            </Link>
            <p>{description}</p>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <Link href="/">Home</Link>
            <Link href="/about">About Us</Link>
            <Link href="/departments">Departments</Link>
            <Link href="/news">News &amp; Events</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="footer-col">
            <h4>Worship with us</h4>
            {times.map((gathering, index) => (
              <span key={index}>{[gathering.name, gathering.time].filter(Boolean).join(' · ')}</span>
            ))}
            <span>{location}</span>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">{copyright}</div>
          <div className="footer-copy">{tagline}</div>
        </div>
      </div>
    </footer>
  );
}
