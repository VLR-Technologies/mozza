import Image from 'next/image';
export default function Loading(){return <div className="route-loading" role="status"><Image src="/brand/mozza-italia.png" width={100} height={100} alt="Mozza Italia" loading="eager"/><span className="loading-ring"/><p>Taste Brings People Together</p></div>;}
