import {cookies} from 'next/headers';
import {sessionOwner,sessionCookie} from '@/runtime/auth.mjs';
export async function getAdmin(){return sessionOwner((await cookies()).get(sessionCookie)?.value)}
