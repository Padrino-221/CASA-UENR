import Link from 'next/link';
import Image from 'next/image';
import { parseList } from '@/lib/cms/parse';
import { cmsText, safeHref, sectionVisible } from '@/lib/cms/display';
import { ArrowUpRight, MapPin } from '@phosphor-icons/react/dist/ssr';

interface FooterGathering {
  name?: string;
  time?: string;
}

export default function SiteFooter({
  content = {},
  gatherings = [],
  venue = '',
}: {
  content?: Record<string, string>;
  gatherings?: FooterGathering[];
  venue?: string;
}) {
  if (!sectionVisible(content,'footer')) return null;
  const siteName = content['brand.siteName'];
  const links = parseList<{label:string;href:string}>(content['footer.links']);
  return (
    <footer className="church-footer">
      <div className="inner">
        <div className="church-footer-invite">
          <div><span>{content['footer.eyebrow']}</span><h2>{cmsText(content['footer.heading'])}</h2></div>
          {content['footer.ctaLabel']&&<Link href={safeHref(content['footer.ctaHref'])} className="church-footer-visit">{content['footer.ctaLabel']} <ArrowUpRight size={19} aria-hidden="true" /></Link>}
        </div>
        <div className="church-footer-main">
          <div className="church-footer-brand">
            <Link href="/" className="church-footer-logo" aria-label={`${siteName} home`}>{content['brand.logo']&&<Image src={content['brand.logo']} alt="" width={60} height={60} unoptimized/>}<span>{siteName}<small>{content['brand.fullName']}</small></span></Link>
            <p>{content['footer.description']}</p>
          </div>
          <nav className="church-footer-links" aria-label="Footer navigation"><h3>{content['footer.linksHeading']}</h3>{links.map((link,index)=><Link key={index} href={safeHref(link.href)}>{link.label}</Link>)}</nav>
          <div className="church-footer-gatherings"><h3>{content['footer.gatheringsHeading']}</h3><ul>{gatherings.map((gathering,index)=><li key={index}><span>{gathering.name}</span><strong>{gathering.time}</strong></li>)}</ul>{venue&&<Link href={safeHref(content['footer.ctaHref'])} className="church-footer-location"><MapPin size={18} aria-hidden="true"/><span>{venue}</span></Link>}</div>
        </div>
        <div className="church-footer-base"><span>{content['footer.copyright']}</span><span>{content['footer.tagline']}</span></div>
      </div>
    </footer>
  );
}
