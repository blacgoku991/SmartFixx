'use client';
import NextLink from 'next/link';
import {useSearchParams} from 'next/navigation';
import type {ComponentProps} from 'react';
/* Seul import du site : lib/campaign-href (sans dépendance), pour ne pas charger lib/seo ni les libellés du
   panel dans le JavaScript partagé de toutes les pages. */
import {cleanCampaign,withCampaign} from '@/lib/campaign-href';
export default function CampaignLink({href,...props}:ComponentProps<typeof NextLink>){
 const search=useSearchParams();
 const campaign=cleanCampaign(search?.get('utm_campaign'));
 return <NextLink {...props} href={typeof href==='string'?withCampaign(href,campaign):href}/>;
}
