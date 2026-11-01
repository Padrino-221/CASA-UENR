import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MapPin } from '@phosphor-icons/react/dist/ssr';

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
    'Christ Apostolic Students and Associates at the University of Energy and Natural Resources. A community for worship, friendship, and growing in Christ.';
  const copyright = content['footer.copyright'] || '© 2026 Christ Apostolic Students and Associates';
  const tagline = content['footer.tagline'] || 'Rooted in Christ. Raised for purpose.';

  return (
    <footer className="church-footer">
      <div className="inner">
        <div className="church-footer-invite">
          <div><span>Faith. Friendship. University life.</span><h2>There is a place for you here.</h2></div>
          <Link href="/contact" className="church-footer-visit">Plan your first visit <ArrowUpRight size={19} aria-hidden="true" /></Link>
        </div>
        <div className="church-footer-main">
          <div className="church-footer-brand">
            <Link href="/" className="church-footer-logo" aria-label={`${siteName} home`}><Image src="/casa-logo.png" alt="" width={60} height={60}/><span>{siteName}<small>Christ Apostolic Students and Associates</small></span></Link>
            <p>{description}</p>
          </div>
          <nav className="church-footer-links" aria-label="Footer navigation"><h3>Find your place</h3><Link href="/about">Our story</Link><Link href="/about#leadership">Meet the leadership</Link><Link href="/departments">Departments</Link><Link href="/news">News &amp; gatherings</Link><Link href="/contact">Get in touch</Link></nav>
          <div className="church-footer-gatherings"><h3>Gather with us</h3><ul>{times.map((gathering,index)=><li key={index}><span>{gathering.name}</span><strong>{gathering.time}</strong></li>)}</ul><Link href="/contact" className="church-footer-location"><MapPin size={18} aria-hidden="true"/><span>{location}</span></Link></div>
        </div>
        <div className="church-footer-base"><span>{copyright}</span><span>{tagline}</span></div>
      </div>
    </footer>
  );
}
