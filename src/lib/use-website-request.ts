'use client';
import { useRef, useState } from 'react';
// One in-flight request and a stable idempotency key for unchanged form data, including retries.
export function useWebsiteRequest() {
 const inFlight = useRef(false), last = useRef<{payload:string;key:string}|null>(null);
 const [saving,setSaving] = useState(false);
 async function save(payload: Record<string,unknown>) {
  if (inFlight.current) return null;
  inFlight.current=true; setSaving(true);
  const fingerprint=JSON.stringify(payload);
  if (last.current?.payload!==fingerprint) last.current={payload:fingerprint,key:crypto.randomUUID()};
  try {
   const response=await fetch('/api/website-requests',{method:'POST',headers:{'Content-Type':'application/json','idempotency-key':last.current!.key},body:fingerprint});
   const result=await response.json();
   if(!response.ok) throw new Error(result.error || 'Could not save this request. Please retry.');
   return result as {reference:string;status:string;whatsappUrl:string};
  } finally { inFlight.current=false;setSaving(false); }
 }
 return {save,saving};
}
