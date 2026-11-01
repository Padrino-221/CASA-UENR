'use client';
import { useState, useEffect } from 'react';
import { ShieldCheck, Target, Lightning, UsersFour } from '@phosphor-icons/react';
import Modal from './ui/Modal';

const directives = [
  { title: 'Our mission', text: 'Connect all chapters in one church community and support the people you serve.', icon: Target },
  { title: 'Accurate records', text: 'Keep member details, attendance, and financial records complete and up to date.', icon: ShieldCheck },
  { title: 'Account security', text: 'Protect your login details. Your account gives access to the tasks and chapter assigned to you.', icon: Lightning },
  { title: 'Useful insights', text: 'Use reports to understand participation and identify where your chapter needs support.', icon: UsersFour },
];
export default function GuidanceModal() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const trigger = () => setActive(true);
    window.addEventListener('retrigger-uchms-guidance', trigger);
    let timer: ReturnType<typeof setTimeout> | undefined;
    try { if (!localStorage.getItem('uchms-guidance-seen')) timer = setTimeout(trigger, 1500); } catch { /* Guidance is still available from Help. */ }
    return () => { if (timer) clearTimeout(timer); window.removeEventListener('retrigger-uchms-guidance', trigger); };
  }, []);
  const dismiss = () => {
    setActive(false);
    try { localStorage.setItem('uchms-guidance-seen', 'true'); } catch { /* Browser storage is optional. */ }
  };
  return <Modal isOpen={active} onClose={dismiss} title="Welcome to CASA UENR" description="A few principles to help you care for your fellowship." maxWidth="max-w-3xl">
    <div className="admin-guide-grid">{directives.map(item => <section className="admin-guide-card" key={item.title}><item.icon size={27} aria-hidden="true"/><h3>{item.title}</h3><p>{item.text}</p></section>)}</div>
    <div className="admin-guide-actions"><button type="button" onClick={dismiss}>Continue to workspace</button></div>
  </Modal>;
}
