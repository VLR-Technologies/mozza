'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { branches } from '@/config/restaurant';
import { useWebsiteRequest } from '@/lib/use-website-request';

// Options validated server-side in lib/website-requests.ts — keep both in step.
const eventTypes = [
  'Birthday',
  'Office / Corporate Event',
  'Private Party',
  'Family Gathering',
  'Wedding / Engagement Related Event',
  'College / Student Event',
  'Bulk Food Order',
  'Other',
];

const guestOptions = ['Under 10', '10–20', '21–30', '31–50', '51–75', '76–100', '100+'];
const serviceOptions = ['Pickup', 'Delivery / Venue Service', 'Need Help Deciding'];
const foodOptions = ['Vegetarian', 'Non-Vegetarian', 'Mixed', 'Not decided'];

export function CateringEnquiryForm() {
  const [request, setRequest] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { save, saving } = useWebsiteRequest();
  const today = useMemo(() => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()), []);

  async function prepareEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const phoneDigits = phone.replace(/\D/g, '');
    const outlet = branches.find(branch => branch.id === data.get('outlet'))?.name;
    const eventType = String(data.get('eventType') || '');
    const eventDate = String(data.get('eventDate') || '');
    const preferredTime = String(data.get('preferredTime') || '');
    const guests = String(data.get('guests') || '');
    const service = String(data.get('service') || '');
    const food = String(data.get('food') || 'Not decided');
    const notes = String(data.get('notes') || '').trim();

    if (!name || phoneDigits.length < 10 || phoneDigits.length > 12) {
      setError('Please enter your name and a valid phone number.');
      return;
    }
    if (!outlet || !eventType || !eventDate || !guests || !service) {
      setError('Please complete each required event detail.');
      return;
    }
    if (eventDate < today) {
      setError('Please choose today or a future event date.');
      return;
    }
    if (preferredTime && new Date(`${eventDate}T${preferredTime}:00+05:30`).getTime() <= Date.now()) {
      setError('Please choose a future preferred time.');
      return;
    }

    setError('');
    try {
      const saved = await save({ kind: 'enquiry', name, phone, branch: String(data.get('outlet')), eventType, eventDate, preferredTime, guestRange: guests, service, food, notes });
      if (saved) setRequest(saved.whatsappUrl);
    } catch (error) { setError((error as Error).message); }
  }

  return <div className="catering-form-panel" id="catering-form">
    <div className="catering-form-heading">
      <div><span className="kicker">Event enquiry</span><h2>Request a catering quote.</h2><p>Share the essentials and review your enquiry in WhatsApp. The restaurant team will confirm availability, menu options and pricing.</p></div>
    </div>
    <form inert={saving} aria-busy={saving} className="catering-form" onSubmit={prepareEnquiry} onChange={() => { setRequest(null); setError(''); }}>
      <div className="catering-form-grid">
        <label htmlFor="catering-name">Name<input id="catering-name" name="name" required autoComplete="name" maxLength={80} placeholder="Your name" /></label>
        <label htmlFor="catering-phone">Phone number<input id="catering-phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" pattern="[+0-9 \(\)\-]{10,18}" maxLength={18} placeholder="Your phone number" /></label>
        <label htmlFor="catering-outlet">Nearest Mozza Italia location<select id="catering-outlet" name="outlet" required defaultValue="shadnagar">{branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
        <label htmlFor="catering-event-type">Event type<select id="catering-event-type" name="eventType" required defaultValue=""><option value="" disabled>Select event type</option>{eventTypes.map(type => <option key={type} value={type}>{type}</option>)}</select></label>
        <label htmlFor="catering-date">Event date<input id="catering-date" name="eventDate" type="date" min={today} required /></label>
        <label htmlFor="catering-time">Preferred time <span>(optional, IST)</span><input id="catering-time" name="preferredTime" type="time" /></label>
        <label htmlFor="catering-guests">Number of people<select id="catering-guests" name="guests" required defaultValue=""><option value="" disabled>Select group size</option>{guestOptions.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
        <label htmlFor="catering-service">Service preference<select id="catering-service" name="service" required defaultValue=""><option value="" disabled>Select a preference</option>{serviceOptions.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
        <label htmlFor="catering-food">Food preference <span>(optional)</span><select id="catering-food" name="food" defaultValue="Not decided">{foodOptions.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
        <label className="catering-form-wide" htmlFor="catering-notes">Tell us a little about the event <span>(optional)</span><textarea id="catering-notes" name="notes" maxLength={600} rows={4} placeholder="Preferred dishes, timing, venue or special requests" /></label>
      </div>
      <p className="catering-form-hint">Delivery or venue service is an enquiry preference and is subject to restaurant confirmation.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary button-full" type="submit" disabled={saving}>{saving ? 'Saving enquiry…' : 'Request catering quote'} <ArrowRight size={18} /></button>
      {request && <div className="request-ready" role="status"><p>Your enquiry has been saved for the team. You can continue in WhatsApp.</p><a className="button button-secondary" href={request} target="_blank" rel="noreferrer">Continue to WhatsApp <ArrowRight size={18} /></a></div>}
      <p className="form-privacy">Submitting securely saves your event details for the restaurant to review. You choose whether to continue in WhatsApp.</p>
    </form>
  </div>;
}
