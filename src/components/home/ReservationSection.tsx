'use client';
import {useState,type FormEvent} from 'react';
import {ArrowRight, CalendarDays} from 'lucide-react';
import {branches,whatsappUrl} from '@/config/restaurant';

export function ReservationSection(){
 const [request,setRequest]=useState<string|null>(null);
 const [error,setError]=useState('');

 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  const name=String(data.get('name')||'').trim();
  const mobile=String(data.get('mobile')||'').replace(/\D/g,'');
  const date=String(data.get('date'));
  const time=String(data.get('time'));
  const when=new Date(`${date}T${time}:00+05:30`);
  const branch=branches.find(item=>item.id===data.get('branch'))?.name||'Shadnagar';
  if(!name||mobile.length<10||mobile.length>12){setError('Please enter your name and a valid mobile number.');return;}
  if(when.getTime()<=Date.now()){setError('Please choose a future date and time.');return;}
  setError('');
  setRequest(whatsappUrl(`Hello Mozza Italia,\nI would like to reserve a table.\n\nPreferred outlet: ${branch}\nName: ${name}\nMobile: ${data.get('mobile')}\nDate: ${date}\nTime: ${time} (IST)\nGuests: ${data.get('guests')}\n${data.get('message')?`Message: ${data.get('message')}\n`:''}\nPlease confirm availability.`));
 }

 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());

 return <section className="content-section reservation-section" id="reservation">
  <div className="reservation-copy"><span className="reservation-icon"><CalendarDays size={24}/></span><span className="kicker">A table for your people</span><h2>Save a seat.<br/>Make a moment.</h2><p>Send a table request to your preferred Mozza Italia location. The restaurant team will confirm availability on WhatsApp.</p><div className="reservation-note"><strong>No fake availability.</strong><span>This form prepares a request—it does not confirm a booking or store your information.</span></div></div>
  <form className="reservation-form" onSubmit={submit} onChange={()=>setRequest(null)}>
   <div className="form-grid">
    <label>Location<select name="branch" defaultValue="shadnagar">{branches.map(branch=><option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
    <label>Your name<input name="name" required autoComplete="name" placeholder="Name" maxLength={80}/></label>
    <label>Mobile number<input name="mobile" type="tel" required autoComplete="tel" placeholder="Your mobile number" pattern="[+0-9 ()-]{10,18}" maxLength={18}/></label>
    <label>Date<input type="date" name="date" min={today} required/></label>
    <label>Time (IST)<input type="time" name="time" required/></label>
    <label>Guests<select name="guests" defaultValue="2">{[1,2,3,4,5,6,7,8,9,10,11,12].map(n=><option value={n} key={n}>{n} {n===1?'guest':'guests'}</option>)}<option value="13+">13+ guests</option></select></label>
    <label className="form-wide">Anything else? <span>(optional)</span><input name="message" placeholder="A celebration, a preference…" maxLength={500}/></label>
   </div>
   {error&&<p role="alert" className="form-error">{error}</p>}
   <button className="button button-primary button-full" type="submit">Prepare table request <ArrowRight size={18}/></button>
   {request&&<div className="request-ready" role="status"><p>Your request is ready. Review it in WhatsApp before choosing to send.</p><a className="button button-secondary" href={request} target="_blank" rel="noreferrer">Continue to WhatsApp <ArrowRight size={18}/></a></div>}
   <p className="form-privacy">Your details stay in this form until you choose to open WhatsApp.</p>
  </form>
 </section>;
}
