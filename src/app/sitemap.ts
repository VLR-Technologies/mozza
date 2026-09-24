import type {MetadataRoute} from 'next';
import {restaurant} from '@/config/restaurant';
export default function sitemap():MetadataRoute.Sitemap{return restaurant.siteUrl?['','/menu','/about','/gallery','/contact','/privacy'].map(path=>({url:`${restaurant.siteUrl}${path}`})):[];}
