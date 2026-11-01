'use client';
import { useCallback, useEffect, useState } from 'react';
import { PaperPlaneTilt, Megaphone } from '@phosphor-icons/react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import Modal from '@/components/ui/Modal';
import { useNotification } from '@/context/NotificationContext';
import { smsSegments } from '@/lib/sms-format';

interface Member { id:string;name:string;phone:string|null;isLeader:boolean; }
interface Announcement { id:string;title:string;message:string;sender:string;audience:string;recipientCount:number;skippedCount:number;status:string;error:string|null;createdAt:string;sentAt:string|null; }
interface Preview { id:string;title:string;message:string;sender:string;recipientCount:number;skippedCount:number;configured:boolean;segments:number;encoding:string; }
export default function Announcements() {
  const notification=useNotification();
  const [history,setHistory]=useState<Announcement[]>([]);
  const [members,setMembers]=useState<Member[]>([]);
  const [configured,setConfigured]=useState(false);
  const [sender,setSender]=useState('');
  const [title,setTitle]=useState('');
  const [message,setMessage]=useState('');
  const [audience,setAudience]=useState('ACTIVE_MEMBERS');
  const [selected,setSelected]=useState<string[]>([]);
  const [search,setSearch]=useState('');
  const [preview,setPreview]=useState<Preview|null>(null);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [detail,setDetail]=useState<Announcement|null>(null);
  const parts=smsSegments(message);
  const load=useCallback(async()=>{
    try{const res=await fetch('/api/announcements',{cache:'no-store'});if(!res.ok)throw new Error();const data=await res.json();setHistory(data.announcements);setMembers(data.members);setConfigured(data.configured);setSender(data.sender);}
    catch{setError('Could not load announcements. Please refresh.');}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);
  const makePreview=async(event:React.FormEvent)=>{
    event.preventDefault();setBusy(true);setError('');
    try{const res=await fetch('/api/announcements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,message,audience,studentIds:selected})});const data=await res.json();if(!res.ok)throw new Error(data.error);setPreview(data);await load();}
    catch(error){setError(error instanceof Error?error.message:'Could not prepare announcement.');}
    finally{setBusy(false);}
  };
  const send=async()=>{
    if(!preview)return;setBusy(true);setError('');
    try{const res=await fetch(`/api/announcements/${preview.id}/send`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({confirm:true})});const data=await res.json();if(!res.ok)throw new Error(data.error);notification.success('Announcement accepted by Arkesel. Final delivery is not yet confirmed.');setTitle('');setMessage('');setSelected([]);}
    catch(error){notification.error(error instanceof Error?error.message:'Could not confirm submission. Check Arkesel before sending again.');}
    finally{setPreview(null);setBusy(false);await load();}
  };
  const reopen=(item:Announcement)=>{setTitle(item.title);setMessage(item.message);setAudience(item.audience);setSelected([]);setDetail(null);};
  return <div className="secretary-page">
    <header className="premium-header"><div className="header-content-root"><div><h1>Announcements</h1><p>Send chapter announcements by SMS through Arkesel.</p></div></div></header>
    {!loading&&!configured&&<div className="sms-setup-note"><strong>Arkesel setup required</strong><p>Ask your administrator to set the server API key and approved sender ID. You can prepare and preview announcements while setup is pending.</p></div>}
    {error&&<p className="secretary-error" role="alert">{error}</p>}
    <div className="announcements-layout"><section className="announcement-compose"><header><Megaphone size={21}/><h2>New announcement</h2></header><form onSubmit={makePreview}>
      <label htmlFor="announcement-title">Title <span>For your records</span></label><input id="announcement-title" maxLength={100} value={title} onChange={event=>setTitle(event.target.value)} required disabled={busy} placeholder="e.g. Sunday service reminder"/>
      <CustomDropdown label="Recipients" value={audience} onChange={value=>{setAudience(value);setSelected([]);}} options={[{value:'ACTIVE_MEMBERS',label:'All active chapter members'},{value:'LEADERS',label:'Student leaders'},{value:'SELECTED',label:'Choose chapter members'}]}/>
      {audience==='SELECTED'&&<fieldset className="sms-member-picker"><legend>Select members ({selected.length})</legend><input aria-label="Search chapter members" placeholder="Search members" value={search} onChange={event=>setSearch(event.target.value)}/><div>{members.filter(item=>item.name.toLowerCase().includes(search.toLowerCase())).map(item=><label key={item.id}><input type="checkbox" checked={selected.includes(item.id)} disabled={busy} onChange={event=>setSelected(values=>event.target.checked?[...values,item.id]:values.filter(id=>id!==item.id))}/><span>{item.name}<small>{item.phone||'No phone number'}</small></span></label>)}</div></fieldset>}
      <label htmlFor="announcement-message">SMS message</label><textarea id="announcement-message" rows={6} maxLength={1600} value={message} onChange={event=>setMessage(event.target.value)} required disabled={busy} placeholder="Write your announcement..."/>
      <div className="sms-composer-meta"><span>{message.length} / 1,600 characters</span><span>{parts.segments} SMS {parts.segments===1?'part':'parts'} · {parts.encoding}</span></div>
      <p className="sms-help">Invalid numbers and duplicate phone numbers are removed in the preview. Up to 1,000 recipients per announcement.</p>
      <footer><span>Sender: <strong>{sender||'Not configured'}</strong></span><button className="btn-lux-primary" disabled={busy||loading} type="submit">{busy?'Preparing...':'Preview announcement'}</button></footer>
    </form></section>
    <section className="announcement-history"><header><h2>Recent announcements</h2><span>{history.length}</span></header>{loading?<p className="secretary-empty">Loading...</p>:history.length?<div>{history.map(item=><button className="announcement-history-item" key={item.id} onClick={()=>setDetail(item)}><span className="inbox-item-top"><strong>{item.title}</strong><span className={`message-status status-${item.status.toLowerCase()}`}>{item.status.toLowerCase()}</span></span><span>{item.recipientCount} recipients · {new Date(item.createdAt).toLocaleDateString('en-GB')}</span></button>)}</div>:<p className="secretary-empty">No announcements yet. Prepare your first message on the left.</p>}<p className="sms-history-note">Accepted means Arkesel received the request. Check your Arkesel dashboard for final delivery reports. Unknown or sending submissions must be checked before sending again.</p></section></div>
    <Modal isOpen={Boolean(preview)} onClose={()=>{if(!busy)setPreview(null);}} title="Review announcement" maxWidth="max-w-xl">{preview&&<div className="sms-preview"><dl><div><dt>Sender</dt><dd>{preview.sender||'Not configured'}</dd></div><div><dt>Recipients</dt><dd>{preview.recipientCount}</dd></div><div><dt>SMS parts per recipient</dt><dd>{preview.segments} ({preview.encoding})</dd></div><div><dt>Estimated SMS units</dt><dd>{preview.segments*preview.recipientCount}</dd></div></dl><h3>{preview.title}</h3><p className="sms-preview-message">{preview.message}</p><p className="sms-help">{preview.skippedCount} missing, invalid, or duplicate numbers excluded. Sending uses your Arkesel SMS balance.</p><div className="sms-preview-actions"><button className="btn-glass-alt" disabled={busy} onClick={()=>setPreview(null)}>Keep as draft</button><button className="btn-lux-primary" disabled={busy||!preview.configured} onClick={send}><PaperPlaneTilt size={17}/>{busy?'Submitting...':`Send to ${preview.recipientCount} recipients`}</button></div></div>}</Modal>
    <Modal isOpen={Boolean(detail)} onClose={()=>setDetail(null)} title={detail?.title||'Announcement'} maxWidth="max-w-xl">{detail&&<div className="sms-preview"><p className="sms-help">{detail.recipientCount} recipients · {detail.status.toLowerCase()} · Sender: {detail.sender||'Not configured'}</p><p className="sms-preview-message">{detail.message}</p>{detail.error&&<p className="secretary-error">{detail.error}</p>}{detail.status==='DRAFT'&&<button className="btn-lux-primary" onClick={()=>reopen(detail)}>Use this draft</button>}</div>}</Modal>
  </div>;
}
