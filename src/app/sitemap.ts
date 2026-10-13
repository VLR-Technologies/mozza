import type {MetadataRoute} from 'next';
import {restaurant} from '@/config/restaurant';
export default function sitemap():MetadataRoute.Sitemap{return restaurant.siteUrl?['','/menu','/order','/locations','/catering','/reservation','/about','/gallery','/contact','/privacy'].map(path=>({url:`${restaurant.siteUrl}${path}`})):[];}
