export type AnalyticsData = {
 from:string; to:string;
 totals:{orders:number;confirmed:number;completed:number;subtotal:number;unpricedOrders:number;drafts:number;reservations:number;enquiries:number};
 trend:{date:string;orders:number;subtotal:number}[];
 statuses:Record<string,number>;sources:Record<string,number>;fulfilment:Record<string,number>;
 topItems:{id:string;name:string;variant:string;quantity:number;subtotal:number|null}[];
 reservations:Record<string,number>;enquiries:Record<string,number>;
 enquiryStatuses:Record<string,number>;
 drafts:{created:number;active:number;expired:number;consumed:number;linkedConfirmed:number};
};
