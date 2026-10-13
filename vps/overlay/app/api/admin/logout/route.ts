import {cookies} from 'next/headers';
import {endSession,sessionCookie} from '@/runtime/auth.mjs';
import {SITE_URL} from '@/lib/seo';
export async function POST(request:Request){if(request.headers.get('origin')!==SITE_URL)return new Response('Forbidden',{status:403});const jar=await cookies();endSession(jar.get(sessionCookie)?.value);jar.set(sessionCookie,'',{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:0});return new Response(null,{status:303,headers:{Location:'/admin/login','Cache-Control':'no-store'}})}
