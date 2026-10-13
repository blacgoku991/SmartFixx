import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync,existsSync,chmodSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
export const dataDir=resolve(process.env.SMARTFIXX_DATA_DIR||'/data');
let connection;
export function sqlite(){
 if(connection)return connection;
 mkdirSync(dataDir,{recursive:true,mode:0o700});
 const file=resolve(dataDir,'smartfixx.sqlite');
 const db=new DatabaseSync(file);db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');chmodSync(file,0o600);
 db.exec('CREATE TABLE IF NOT EXISTS vps_migrations(name TEXT PRIMARY KEY);');
 const folder=resolve(process.env.SMARTFIXX_MIGRATIONS_DIR||'drizzle');
 for(const name of readdirSync(folder).filter(n=>/^\d{4}_[a-z_]+\.sql$/.test(n)).sort()){
  if(db.prepare('SELECT name FROM vps_migrations WHERE name=?').get(name))continue;
  db.exec('BEGIN IMMEDIATE');try{db.exec(readFileSync(resolve(folder,name),'utf8'));db.prepare('INSERT INTO vps_migrations(name) VALUES (?)').run(name);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');db.close();throw e}
 }
 db.exec(`CREATE TABLE IF NOT EXISTS vps_owner(id TEXT PRIMARY KEY CHECK(id='owner'),email TEXT NOT NULL,password_hash TEXT NOT NULL,created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS vps_sessions(token_hash TEXT PRIMARY KEY,expires_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS vps_sessions_expiry ON vps_sessions(expires_at);
 CREATE TABLE IF NOT EXISTS vps_secrets(key TEXT PRIMARY KEY,value TEXT NOT NULL);`);
 connection=db;return db;
}
export function execute(sql,args=[],mode='all'){
 const statement=sqlite().prepare(sql);
 const parameters=args.map(x=>typeof x==='boolean'?Number(x):x instanceof ArrayBuffer?new Uint8Array(x):x);
 if(mode==='first')return statement.get(...parameters)||null;
 if(mode==='run'){const r=statement.run(...parameters);return {results:[],success:true,meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}}}
 const before=Number(sqlite().prepare('SELECT total_changes() AS n').get().n);const results=statement.all(...parameters);const changes=Number(sqlite().prepare('SELECT total_changes() AS n').get().n)-before;return {results,success:true,meta:{changes}};
}
class Prepared {
 constructor(sql,args=[]){this.sql=sql;this.args=args}
 bind(...args){return new Prepared(this.sql,args)}
 async first(column){const r=execute(this.sql,this.args,'first');return column?r?.[column]??null:r}
 async all(){return execute(this.sql,this.args)}
 async run(){return execute(this.sql,this.args,'run')}
 async raw(){return (await this.all()).results.map(r=>Object.values(r))}
}
export const database={prepare:sql=>new Prepared(sql),async batch(statements){const db=sqlite();db.exec('BEGIN IMMEDIATE');try{const result=statements.map(s=>execute(s.sql,s.args));db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}},async exec(sql){sqlite().exec(sql);return {count:0,duration:0}}};
export function closeDatabase(){connection?.close();connection=null}
