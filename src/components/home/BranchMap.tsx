'use client';
import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { branchMapEmbedUrl, type Branch } from '@/config/restaurant';
import './branch-map.css';

// One map per branch. The tile map and the maximized map both read
// branchMapEmbedUrl(branch), so they can never show different locations.
function MapFrame({ branch }: { branch: Branch }) {
  return <iframe className="branch-map-frame" src={branchMapEmbedUrl(branch)} title={`Map of Mozza Italia ${branch.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />;
}

export function BranchMap({ branch }: { branch: Branch }) {
  const [expanded, setExpanded] = useState(false);
  return <>
    <div className="branch-map">
      <MapFrame branch={branch} />
      <button type="button" className="icon-button branch-map-expand" aria-label={`Maximize ${branch.name} map`} aria-haspopup="dialog" onClick={() => setExpanded(true)}><Maximize2 size={17} /></button>
    </div>
    <Modal open={expanded} onClose={() => setExpanded(false)} title={`Mozza Italia ${branch.name} map`} className="branch-map-dialog">
      <div className="branch-map-dialog-head"><h3>Mozza Italia {branch.name}</h3><p>{branch.region}</p></div>
      {expanded && <div className="branch-map branch-map-large"><MapFrame branch={branch} /></div>}
    </Modal>
  </>;
}
