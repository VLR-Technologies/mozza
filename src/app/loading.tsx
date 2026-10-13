import Image from 'next/image';
export default function Loading(){return <div className="route-loading" role="status"><Image src="/brand/mozza-italia-logo.png" width={1600} height={649} alt="Mozza Italia" sizes="240px" loading="eager"/><span className="loading-ring"/><p>Taste Brings People Together</p></div>;}
