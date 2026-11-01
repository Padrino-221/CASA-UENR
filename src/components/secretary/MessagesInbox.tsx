'use client';
import { useEffect, useState } from 'react';
import { EnvelopeSimple, ArrowClockwise, Archive, ArrowUUpLeft } from '@phosphor-icons/react';
import { useNotification } from '@/context/NotificationContext';

interface Message { id: string; name: string; email: string; topic: string; message: string; status: string; createdAt: string; }
const date = (value: string) => new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
export default function MessagesInbox() {
  const notification = useNotification();
  const [messages,setMessages] = useState<Message[]>([]);
  const [page,setPage] = useState(1);
  const [total,setTotal] = useState(0);
  const [unread,setUnread] = useState(0);
  const [selectedId,setSelectedId] = useState('');
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const selected = messages.find(item => item.id === selectedId);
  const load = async () => {
    setLoading(true);setError('');
    try {
      const res=await fetch(`/api/messages?page=${page}`,{cache:'no-store'});
      if(!res.ok) throw new Error('Could not load messages.');
      const data=await res.json();setMessages(data.messages);setTotal(data.total);setUnread(data.unread);
    } catch {setError('Could not load messages. Please try again.');}
    finally {setLoading(false);}
  };
  useEffect(()=>{load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  },[page]);
  const changeStatus = async (item:Message,status:string) => {
    setBusy(true);
    try {
      const res=await fetch('/api/messages',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id,status})});
      if(!res.ok) throw new Error();
      setMessages(current=>current.map(message=>message.id===item.id?{...message,status}:message));
      if(item.status==='NEW'&&status!=='NEW') setUnread(value=>Math.max(0,value-1));
      if(item.status!=='NEW'&&status==='NEW') setUnread(value=>value+1);
    }catch{notification.error('Could not update this message.');}
    finally{setBusy(false);}
  };
  return <div className="secretary-page">
    <header className="premium-header"><div className="header-content-root"><div><h1>Messages</h1><p>Contact-form messages for your chapter. Only secretaries can access this inbox.</p></div><button className="btn-glass-alt" onClick={load} disabled={loading}><ArrowClockwise size={18}/>Refresh</button></div></header>
    <div className="secretary-summary"><span><strong>{unread}</strong> unread</span><span>{total} messages</span></div>
    {error&&<p className="secretary-error" role="alert">{error}</p>}
    <div className="inbox-layout">
      <section className="inbox-list" aria-label="Contact messages">
        {loading?<p className="secretary-empty">Loading messages...</p>:messages.length?messages.map(item=><button key={item.id} className={`inbox-item ${selectedId===item.id?'is-selected':''} ${item.status==='NEW'?'is-unread':''}`} disabled={busy} onClick={()=>{setSelectedId(item.id);if(item.status==='NEW')changeStatus(item,'READ');}}>
          <span className="inbox-item-top"><strong>{item.name}</strong><span className={`message-status status-${item.status.toLowerCase()}`}>{item.status.toLowerCase()}</span></span><span className="inbox-item-topic">{item.topic}</span><span className="inbox-item-snippet">{item.message}</span><time>{date(item.createdAt)}</time>
        </button>):<div className="secretary-empty"><EnvelopeSimple size={28}/><p>No messages yet.</p><span>Messages sent from the website contact form will appear here.</span></div>}
        <footer className="inbox-pagination"><button disabled={page===1||loading} onClick={()=>{setSelectedId('');setPage(value=>value-1);}}>Previous</button><span>{page} / {Math.max(1,Math.ceil(total/30))}</span><button disabled={page*30>=total||loading} onClick={()=>{setSelectedId('');setPage(value=>value+1);}}>Next</button></footer>
      </section>
      <section className="inbox-detail" aria-label="Message detail">
        {selected?<><header><span className="secretary-eyebrow">{date(selected.createdAt)}</span><h2>{selected.topic}</h2><p>From <strong>{selected.name}</strong></p><a href={`mailto:${encodeURIComponent(selected.email)}`}>{selected.email}</a></header><div className="inbox-message-body">{selected.message}</div><footer><a className="btn-lux-primary" href={`mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent(`Re: ${selected.topic}`)}`}><ArrowUUpLeft size={17}/>Reply by email</a><button className="btn-glass-alt" disabled={busy} onClick={()=>changeStatus(selected,selected.status==='ARCHIVED'?'READ':'ARCHIVED')}><Archive size={17}/>{selected.status==='ARCHIVED'?'Restore':'Archive'}</button></footer></>:<div className="secretary-empty"><EnvelopeSimple size={30}/><h2>Select a message</h2><p>Choose a message to read it and view the sender details.</p></div>}
      </section>
    </div>
  </div>;
}
