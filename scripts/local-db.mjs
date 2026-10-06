import {DatabaseSync} from 'node:sqlite';import fs from 'node:fs';
export function localDB(file=':memory:'){
 const db=new DatabaseSync(file);db.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
 for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())if(!db.prepare('SELECT name FROM local_migrations WHERE name=?').get(f)){db.exec(fs.readFileSync('drizzle/'+f,'utf8'));db.prepare('INSERT INTO local_migrations(name) VALUES(?)').run(f)}
 return {close:()=>db.close(),prepare(sql){let args=[];const query={bind(...values){args=values;return query},async run(){const r=db.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}}},async all(){return {results:db.prepare(sql).all(...args)}}};return query}};
}
