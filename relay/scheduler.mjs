/** One shared pacer per relay. Missed time never turns into a catch-up burst. */
export class Pacer {
 constructor({now=()=>performance.now(),sleep=ms=>new Promise(r=>setTimeout(r,ms))}={}){this.now=now;this.sleep=sleep;this.last=-Infinity;this.next=0;this.tail=Promise.resolve()}
 async take(rate){if(!Number.isFinite(rate)||rate<=0)throw new Error('Invalid sending rate');const task=this.tail.then(async()=>{const delay=this.last+1000/rate-this.now();if(delay>0)await this.sleep(delay);this.last=this.now();this.next=this.last+1000/rate});this.tail=task.catch(()=>{});return task}
}
export class TransportPool {
 constructor(factory){this.factory=factory;this.key='';this.promise=null}
 async get(config){const key=JSON.stringify(config);if(key!==this.key||!this.promise){const previous=this.promise;this.key=key;const current=this.factory(config);this.promise=current;previous?.then(t=>t.close()).catch(()=>{});current.catch(()=>{if(this.promise===current){this.promise=null;this.key=''}})}return this.promise}
 async close(){const current=this.promise;this.promise=null;this.key='';try{(await current)?.close()}catch{}}
}
