import pg from 'pg';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';

const columns='id,name,email,phone,pet_name,pet,service,preferred_date,preferred_time,message,language,status,created_at,updated_at';
const insert=`INSERT INTO scar_patte.appointment_requests (${columns},is_example) VALUES (${Array.from({length:15},(_,i)=>'$'+(i+1)).join(',')}) ON CONFLICT(id) DO NOTHING`;
export function postgresSQL(sql){let n=0;return sql.replace(/\bappointment_requests\b/g,'scar_patte.appointment_requests').replace(/\?/g,()=>'$'+(++n));}
export async function postgresDB(env){
 const pool=new pg.Pool({connectionString:env.DATABASE_URL,max:5,connectionTimeoutMillis:10000});
 pool.on('error',()=>console.error('Postgres connection interrupted'));
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  await client.query("SELECT pg_advisory_xact_lock(1800,193)");
  await client.query('CREATE SCHEMA IF NOT EXISTS scar_patte');
  await client.query(`CREATE TABLE IF NOT EXISTS scar_patte.appointment_requests (
   id text PRIMARY KEY,name text NOT NULL,email text NOT NULL,phone text NOT NULL,pet_name text NOT NULL,pet text NOT NULL,service text NOT NULL,preferred_date text NOT NULL,preferred_time text NOT NULL,message text NOT NULL DEFAULT '',language text NOT NULL,status text NOT NULL DEFAULT 'new',created_at text NOT NULL,updated_at text NOT NULL,is_example integer NOT NULL DEFAULT 0)`);
  await client.query('CREATE INDEX IF NOT EXISTS requests_created ON scar_patte.appointment_requests(created_at)');
  await client.query('CREATE TABLE IF NOT EXISTS scar_patte.migrations (name text PRIMARY KEY)');
  const done=await client.query("SELECT name FROM scar_patte.migrations WHERE name='sqlite-import-v1'");
  if(!done.rowCount&&env.DB_PATH&&fs.existsSync(env.DB_PATH)){
   const old=new DatabaseSync(env.DB_PATH,{readOnly:true});
   try{const exists=old.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='appointment_requests'").get();if(exists){for(const row of old.prepare('SELECT '+columns+' FROM appointment_requests').all())await client.query(insert,[...columns.split(',').map(c=>row[c]),0]);}}finally{old.close()}
   await client.query("INSERT INTO scar_patte.migrations(name) VALUES('sqlite-import-v1')");
  }
  if(env.SEED_EXAMPLES==='true'){
   const now=new Date().toISOString();
   for(const [id,name,petName,pet,service,days,time,status,message] of [
    ['18000000-0000-4000-8000-000000000001','Camille (démo)','Milo','dog','bath',7,'morning','new','Exemple fictif : premier bain, brossage doux.'],
    ['18000000-0000-4000-8000-000000000002','Alex (démo)','Luna','cat','trim',9,'afternoon','confirmed','Exemple fictif : entretien du pelage, séance calme.']]){
    const date=new Date(Date.now()+days*86400000).toISOString().slice(0,10);
    await client.query(insert,[id,name,'demo@example.invalid','—',petName,pet,service,date,time,message,'fr',status,now,now,1]);
   }
  }
  await client.query('COMMIT');
 }catch(error){await client.query('ROLLBACK');client.release();await pool.end();throw error}
 client.release();
 return {kind:'postgres',close:()=>pool.end(),prepare(sql){let args=[];const query={bind(...values){args=values;return query},async run(){const r=await pool.query(postgresSQL(sql),args);return {meta:{changes:r.rowCount}}},async all(){const r=await pool.query(postgresSQL(sql),args);return {results:r.rows}}};return query}};
}
