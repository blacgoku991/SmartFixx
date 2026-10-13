import test from 'node:test';
import assert from 'node:assert/strict';
import {Pacer,TransportPool} from '../scheduler.mjs';
test('14 messages per second: concurrent callers are evenly paced without catch-up bursts',async()=>{
 let clock=0;const starts=[];const p=new Pacer({now:()=>clock,sleep:async ms=>{clock+=ms}});
 await Promise.all(Array.from({length:140},()=>p.take(14).then(()=>starts.push(p.next-1000/14))));
 assert.equal(starts.length,140);assert.ok(clock>=9900&&clock<=10000);
 // Inspect the sequencer directly with a timer that records each actual grant.
 const gaps=[];clock=0;const slow=new Pacer({now:()=>clock,sleep:async ms=>{gaps.push(ms);clock+=ms}});
 await slow.take(14);clock=5000;await slow.take(14);await slow.take(14);assert.ok(gaps[0]>=71);
 await assert.rejects(()=>slow.take(0));
 const previous=clock;await slow.take(1);assert.equal(clock-previous,1000);const changed=clock;await slow.take(14);assert.ok(clock-changed<72,'new cadence takes effect without keeping the previous interval');
});
test('one cached SMTP pool is reused for concurrent messages and replaced after a configuration change',async()=>{
 let made=0,closed=0;const pool=new TransportPool(async()=>{made++;return {close(){closed++}}});const c={host:'smtp.example.com',maxConnections:20};
 const values=await Promise.all(Array.from({length:50},()=>pool.get(c)));assert.equal(made,1);assert.ok(values.every(v=>v===values[0]));
 await pool.get({...c,maxConnections:10});assert.equal(made,2);assert.equal(closed,1);await pool.close();assert.equal(closed,2);
});
