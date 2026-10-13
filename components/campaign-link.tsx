'use client';
import NextLink from 'next/link';
import {useSearchParams} from 'next/navigation';
import type {ComponentProps} from 'react';
import {cleanCampaign} from '@/lib/project-options';
import {withCampaign} from '@/lib/email-destination';
export default function CampaignLink({href,...props}:ComponentProps<typeof NextLink>){
 const search=useSearchParams();
 const campaign=cleanCampaign(search?.get('utm_campaign'));
 return <NextLink {...props} href={typeof href==='string'?withCampaign(href,campaign):href}/>;
}
