import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {startRailway} from '../scripts/railway-server.mjs';import {session,sessionValid} from '../scripts/railway-auth.mjs';
const config={PORT:'0',ADMIN_USERNAME:'admin',ADMIN_PASSWORD:'a-test-password-longer-than-twenty',ADMIN_SESSION_SECRET:'test-session-secret-longer-than-thirty-two'};
test('Railway serves the site, protects admin, and retains requests across restarts',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'scar-railway-'));const env={...config,DB_PATH:path.join(dir,'requests.sqlite')};let app=await startRailway(env);t.after(async()=>{await app.close();fs.rmSync(dir,{recursive:true,force:true})});let origin='http://127.0.0.1:'+app.server.address().port;
 const get=p=>fetch(origin+p,{redirect:'manual'});
 assert.equal((await get('/health')).status,200);assert.equal((await get('/')).status,200);assert.equal((await get('/admin.css')).status,200);assert.equal((await get('/admin')).status,302);
 assert.equal((await fetch(origin+'/api/admin/requests',{headers:{'oai-authenticated-user-email':'railway-admin'}})).status,403);
 const login=await fetch(origin+'/admin/login',{method:'POST',redirect:'manual',headers:{Origin:origin},body:new URLSearchParams({username:env.ADMIN_USERNAME,password:env.ADMIN_PASSWORD})});assert.equal(login.status,303);const cookie=login.headers.get('set-cookie').split(';')[0];assert.match(login.headers.get('set-cookie'),/HttpOnly/);
 assert.equal((await fetch(origin+'/admin',{headers:{cookie}})).status,200);assert.equal((await fetch(origin+'/api/admin/requests',{headers:{cookie:cookie+'tampered'}})).status,403);
 const sample={id:crypto.randomUUID(),name:'Test owner',email:'owner@example.test',phone:'+32 400 123 456',pet_name:'Milo',pet:'cat',service:'trim',preferred_date:new Date(Date.now()+7*86400000).toISOString().slice(0,10),preferred_time:'morning',language:'nl',consent:'on'};
 assert.equal((await fetch(origin+'/api/requests',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(sample)})).status,201);
 await app.close();app=await startRailway(env);origin='http://127.0.0.1:'+app.server.address().port;const rows=await (await fetch(origin+'/api/admin/requests',{headers:{cookie}})).json();assert.equal(rows.requests.length,1);assert.equal(rows.requests[0].pet_name,'Milo');
 assert.equal((await fetch(origin+'/admin/logout',{method:'POST',headers:{Origin:origin,cookie},redirect:'manual'})).headers.get('set-cookie').includes('Max-Age=0'),true);
});
test('Railway fails closed without secrets or persistent storage; sessions expire',async()=>{
 await assert.rejects(startRailway({}),/Configure ADMIN/);await assert.rejects(startRailway({...config,RAILWAY_PROJECT_ID:'test'}),/persistent volume/);const token=session(config.ADMIN_SESSION_SECRET,1000);assert.equal(sessionValid(token,config.ADMIN_SESSION_SECRET,1001),true);assert.equal(sessionValid(token,config.ADMIN_SESSION_SECRET,1000+8*3600000),false);
});
