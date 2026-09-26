'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, Check, MapPin, Search, ShoppingBag, Users } from 'lucide-react';
import { branches, whatsappUrl } from '@/config/restaurant';

type Service = 'pickup' | 'reserve' | 'catering';

const services = [
  { id: 'pickup' as const, label: 'Pickup', icon: ShoppingBag, note: 'Browse & order' },
  { id: 'reserve' as const, label: 'Reserve', icon: CalendarDays, note: 'Request a table' },
  { id: 'catering' as const, label: 'Catering', icon: Users, note: 'Plan an event' },
];

export function ServicePlanner() {
  const router = useRouter();
  const [service, setService] = useState<Service>('pickup');
  const [branch, setBranch] = useState('shadnagar');
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [reservationUrl, setReservationUrl] = useState<string | null>(null);
  const selectedBranch = branches.find(item => item.id === branch) || branches[1];
  const today = useMemo(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()), []);

  function startPickup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ branch });
    if (query.trim()) params.set('q', query.trim());
    router.push(`/menu?${params.toString()}`);
  }

  function requestTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReservationUrl(whatsappUrl(`Hello Mozza Italia,\nI would like to check table availability.\n\nPreferred outlet: ${selectedBranch.name}\nDate: ${date}\nTime: ${time} (IST)\nGuests: ${guests}\n\nPlease confirm availability.`));
  }

  function openCateringEnquiry() {
    window.history.pushState(null, '', '/#catering');
    window.dispatchEvent(new Event('mozza:open-catering'));
  }

  return <div className="service-planner" aria-label="Choose how you would like to visit Mozza Italia">
    <div className="service-tabs" role="tablist" aria-label="Dining options">
      {services.map(item => {
        const Icon = item.icon;
        return <button key={item.id} role="tab" aria-selected={service === item.id} aria-controls={`service-${item.id}`} onClick={() => { setService(item.id); setReservationUrl(null); }}>
          <span className="service-icon"><Icon size={21} /></span>
          <span><strong>{item.label}</strong><small>{item.note}</small></span>
          {service === item.id && <Check className="service-check" size={16} />}
        </button>;
      })}
    </div>

    {service === 'pickup' && <form className="service-form pickup-form" id="service-pickup" role="tabpanel" onSubmit={startPickup}>
      <label><span><MapPin size={17} /> Pickup location</span><select value={branch} onChange={event => setBranch(event.target.value)}>{branches.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label><span><Search size={17} /> Search our menu</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Pizza, burger, pulav…" /></label>
      <button className="button button-primary service-submit" type="submit">Start order <ArrowRight size={18} /></button>
    </form>}

    {service === 'reserve' && <div id="service-reserve" role="tabpanel">
      <form className="service-form reserve-form" onSubmit={requestTable} onChange={() => setReservationUrl(null)}>
        <label><span><MapPin size={17} /> Location</span><select value={branch} onChange={event => setBranch(event.target.value)}>{branches.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label><span>Date</span><input type="date" required min={today} value={date} onChange={event => setDate(event.target.value)} /></label>
        <label><span>Time</span><input type="time" required value={time} onChange={event => setTime(event.target.value)} /></label>
        <label><span>Guests</span><select value={guests} onChange={event => setGuests(event.target.value)}>{Array.from({ length: 12 }, (_, index) => index + 1).map(count => <option key={count} value={count}>{count}</option>)}<option value="13+">13+</option></select></label>
        <button className="button button-primary service-submit" type="submit">Find a table <ArrowRight size={18} /></button>
      </form>
      {reservationUrl && <div className="service-response" role="status"><p>Availability is confirmed personally by the restaurant—nothing has been booked yet.</p><a className="button button-secondary" href={reservationUrl} target="_blank" rel="noreferrer">Continue on WhatsApp <ArrowRight size={17} /></a></div>}
    </div>}

    {service === 'catering' && <div className="catering-quick" id="service-catering" role="tabpanel">
      <div><span className="kicker">Planning something bigger?</span><h2>Food for the whole table—and then some.</h2><p>Birthdays, office events, parties, celebrations and bulk orders. Tell us what you are planning and the team will take it from there.</p></div>
      <button className="button button-primary" type="button" onClick={openCateringEnquiry}>Plan catering <ArrowRight size={18} /></button>
    </div>}
  </div>;
}
