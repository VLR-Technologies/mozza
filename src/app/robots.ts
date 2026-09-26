import type {MetadataRoute} from 'next';
import {restaurant} from '@/config/restaurant';
export default function robots():MetadataRoute.Robots{return restaurant.siteUrl?{rules:{userAgent:'*',allow:'/',disallow:['/admin/','/api/']},sitemap:`${restaurant.siteUrl}/sitemap.xml`}:{rules:{userAgent:'*',disallow:'/'}};}
