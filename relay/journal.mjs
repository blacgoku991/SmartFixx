import {mkdirSync,writeFileSync,openSync,fsyncSync,closeSync,renameSync,readdirSync,readFileSync,unlinkSync} from 'node:fs';
import {join} from 'node:path';
export class Journal{
 constructor(directory){this.directory=directory;mkdirSync(directory,{recursive:true,mode:0o700})}
 path(id){if(!/^[a-f0-9-]{36}$/.test(id))throw new Error('Invalid receipt id');return join(this.directory,id+'.json')}
 save(receipt){const path=this.path(receipt.id),temp=path+'.tmp';writeFileSync(temp,JSON.stringify(receipt),{mode:0o600});const fd=openSync(temp,'r');try{fsyncSync(fd)}finally{closeSync(fd)}renameSync(temp,path);try{const dir=openSync(this.directory,'r');try{fsyncSync(dir)}finally{closeSync(dir)}}catch{/* Directory fsync is unavailable on some operating systems. */}}
 pending(){return readdirSync(this.directory).filter(n=>/^[a-f0-9-]{36}\.json$/.test(n)).map(n=>{try{return JSON.parse(readFileSync(join(this.directory,n),'utf8'))}catch(e){if(e.code==='ENOENT')return null;throw new Error('Journal illisible : intervention nécessaire')}}).filter(Boolean)}
 remove(id){try{unlinkSync(this.path(id))}catch(e){if(e.code!=='ENOENT')throw e}}
}
