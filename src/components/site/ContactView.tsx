'use client';
import { useState } from 'react';
import { MapPin, EnvelopeSimple, Phone } from '@phosphor-icons/react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { cmsText, sectionVisible, safeHref } from '@/lib/cms/display';
import { parseList } from '@/lib/cms/parse';
import { parseLines } from '@/lib/cms/parse';


export default function ContactView({ content }: { content: Record<string,string> }) {
  const topics=parseList<{label:string}>(content['form.topics']).map(item=>item.label).filter(Boolean);
  const [topic,setTopic]=useState(topics[0]||'');
  const currentTopic=topics.includes(topic)?topic:(topics[0]||'General enquiry');
  const socials=[['instagram','Instagram'],['whatsapp','WhatsApp'],['twitter','X'],['youtube','YouTube']].map(([key,label])=>({label,href:safeHref(content[`socials.${key}`],'')})).filter(link=>link.href);
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);
  const [error,setError]=useState('');
  const address=parseLines(content['info.address']);
  const email=content['info.email'];
  const phone=content['info.phone'];
  const hasPhone=phone&&!/000[\s-]*0000/.test(phone);
  return <div className="church-inner-page">
    {sectionVisible(content,'hero')&&<section className="church-page-intro"><div className="inner"><h1>{cmsText(content['hero.heading'])}</h1><p>{content['hero.body']}</p></div></section>}
    <section className="church-section"><div className="inner church-contact-layout">
      {sectionVisible(content,'info')&&<div className="church-contact-details"><h2>{cmsText(content['info.heading'])}</h2><p>{content['info.subheading']}</p>
        <div className="church-contact-detail"><MapPin size={24} aria-hidden="true"/><div><h3>{content['info.addressLabel']}</h3><p>{address.map((line,index)=><span key={index}>{line}{index<address.length-1&&<br/>}</span>)}</p></div></div>
        {email&&<div className="church-contact-detail"><EnvelopeSimple size={24} aria-hidden="true"/><div><h3>{content['info.emailLabel']}</h3><a href={`mailto:${email}`}>{email}</a></div></div>}
        {hasPhone&&<div className="church-contact-detail"><Phone size={24} aria-hidden="true"/><div><h3>{content['info.phoneLabel']}</h3><a href={`tel:${phone.replace(/[\s()-]/g,'')}`}>{phone}</a></div></div>}
      </div>}
      {sectionVisible(content,'form')&&<div className="church-contact-form"><h2>{cmsText(content['form.heading'])}</h2><form onSubmit={async event=>{
        event.preventDefault();
        const element=event.currentTarget;
        const form=new FormData(element);
        setSending(true);setSent(false);setError('');
        try {
          const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:form.get('name'),email:form.get('email'),message:form.get('message'),website:form.get('website'),topic:currentTopic})});
          const result=await res.json();
          if(!res.ok) throw new Error(result.error||'Could not send your message.');
          setSent(true);element.reset();
        } catch(error) {setError(error instanceof Error?error.message:'Could not send your message. Please try again.');}
        finally {setSending(false);}
      }}>
        <div hidden aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off"/></div>
        <div className="church-form-row"><div><label htmlFor="name">{content['form.nameLabel']}</label><input id="name" name="name" autoComplete="name" maxLength={120} required/></div><div><label htmlFor="email">{content['form.emailLabel']}</label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required/></div></div>
        {topics.length>0&&<CustomDropdown label={content['form.topicLabel']} value={currentTopic} onChange={setTopic} options={topics.map(item=>({label:item,value:item}))} className="church-contact-topic"/>}
        <label htmlFor="message">{content['form.messageLabel']}</label><textarea id="message" name="message" rows={5} maxLength={5000} required/>
        <button type="submit" className="btn btn-ink" disabled={sending}>{sending?content['form.sendingLabel']:content['form.buttonLabel']}</button>
        <p className="church-form-note">{content['form.note']}</p>
        {sent&&<p role="status" className="church-form-note">{content['form.success']}</p>}
        {error&&<p role="alert" className="church-form-note" style={{color:'#be123c'}}>{error}</p>}
      </form></div>}
    </div></section>
    {sectionVisible(content,'socials')&&socials.length>0&&<section className="church-section church-soft"><div className="inner"><h2>{cmsText(content['socials.heading'])}</h2><nav className="church-social-links" aria-label="Social links">{socials.map(link=><a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>)}</nav></div></section>}
  </div>;
}
