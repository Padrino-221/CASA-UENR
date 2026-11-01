'use client';
import { useState } from 'react';
import { MapPin, EnvelopeSimple, Phone } from '@phosphor-icons/react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { parseLines } from '@/lib/cms/parse';

const TOPICS = ['Planning a first visit', 'Joining a department', 'Prayer or pastoral support', 'Something else'];

export default function ContactView({ content }: { content: Record<string,string> }) {
  const [topic,setTopic]=useState(TOPICS[0]);
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);
  const [error,setError]=useState('');
  const address=parseLines(content['info.address']);
  const email=content['info.email'];
  const phone=content['info.phone'];
  const hasPhone=phone&&!/000[\s-]*0000/.test(phone);
  return <div className="church-inner-page">
    <section className="church-page-intro"><div className="inner"><h1>We would love to meet you</h1><p>Planning your first visit, looking for a department, or need someone to pray with? Get in touch with the fellowship.</p></div></section>
    <section className="church-section"><div className="inner church-contact-layout">
      <div className="church-contact-details"><h2>Talk to the team</h2><p>You are welcome to come to a gathering and introduce yourself. If you would like help finding us, send a message before you visit.</p>
        <div className="church-contact-detail"><MapPin size={24} aria-hidden="true"/><div><h3>Find us on campus</h3><p>{address.map((line,index)=><span key={index}>{line}{index<address.length-1&&<br/>}</span>)}</p></div></div>
        {email&&<div className="church-contact-detail"><EnvelopeSimple size={24} aria-hidden="true"/><div><h3>Email</h3><a href={`mailto:${email}`}>{email}</a></div></div>}
        {hasPhone&&<div className="church-contact-detail"><Phone size={24} aria-hidden="true"/><div><h3>Phone</h3><a href={`tel:${phone.replace(/[\s()-]/g,'')}`}>{phone}</a></div></div>}
      </div>
      <div className="church-contact-form"><h2>Send a message</h2><form onSubmit={async event=>{
        event.preventDefault();
        const element=event.currentTarget;
        const form=new FormData(element);
        setSending(true);setSent(false);setError('');
        try {
          const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:form.get('name'),email:form.get('email'),message:form.get('message'),website:form.get('website'),topic})});
          const result=await res.json();
          if(!res.ok) throw new Error(result.error||'Could not send your message.');
          setSent(true);element.reset();
        } catch(error) {setError(error instanceof Error?error.message:'Could not send your message. Please try again.');}
        finally {setSending(false);}
      }}>
        <div hidden aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off"/></div>
        <div className="church-form-row"><div><label htmlFor="name">Your name</label><input id="name" name="name" autoComplete="name" maxLength={120} required/></div><div><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required/></div></div>
        <CustomDropdown label="How can we help?" value={topic} onChange={setTopic} options={TOPICS.map(item=>({label:item,value:item}))} className="church-contact-topic"/>
        <label htmlFor="message">Your message</label><textarea id="message" name="message" rows={5} maxLength={5000} required/>
        <button type="submit" className="btn btn-ink" disabled={sending}>{sending?'Sending...':'Send message'}</button>
        <p className="church-form-note">Your message goes directly to the chapter secretary.</p>
        {sent&&<p role="status" className="church-form-note">Message received. The secretary will contact you using the email address you provided.</p>}
        {error&&<p role="alert" className="church-form-note" style={{color:'#be123c'}}>{error}</p>}
      </form></div>
    </div></section>
  </div>;
}
