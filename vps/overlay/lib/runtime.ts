import {database,sqlite} from '@/runtime/database.mjs';
export const env={
 get DB(){return database as unknown as D1Database},
 get RATE_LIMIT_SECRET(){const row=sqlite().prepare("SELECT value FROM vps_secrets WHERE key='RATE_LIMIT_SECRET'").get() as {value:string}|undefined;if(!row?.value)throw new Error('Initialisation VPS requise');return row.value;},
};
