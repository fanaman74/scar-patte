import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';import {localDB} from './local-db.mjs';import {credentialsValid,session,sessionValid,loginPage} from './railway-auth.mjs';
const types={'.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.ttf':'font/ttf'};
export async function startRailway(env=process.env){
 if(!env.ADMIN_USERNAME||!env.ADMIN_PASSWORD||env.ADMIN_PASSWORD.length<20||!env.ADMIN_SESSION_SECRET||env.ADMIN_SESSION_SECRET.length<32)throw Error('Configure ADMIN_USERNAME, a strong ADMIN_PASSWORD and ADMIN_SESSION_SECRET before starting.');
 const dbPath=env.DB_PATH||(!env.RAILWAY_PROJECT_ID?'.local/railway.sqlite':null);if(!dbPath)throw Error('DB_PATH must point to a mounted persistent volume.');fs.mkdirSync(path.dirname(dbPath),{recursive:true});const DB=localDB(dbPath);const worker=(await import('../dist/server/index.js')).default;const root=fs.realpathSync('dist/client');
 const ASSETS={async fetch(request){let target;try{target=path.resolve(root,'.'+decodeURIComponent(new URL(request.url).pathname))}catch{return new Response('Not found',{status:404})}if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()||!fs.realpathSync(target).startsWith(root+path.sep))return new Response('Not found',{status:404});return new Response(fs.readFileSync(target),{headers:{'Content-Type':types[path.extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff'}})}};
 const attempts=new Map();
 const server=http.createServer(async(req,res)=>{try{
  const proto=String(req.headers['x-forwarded-proto']||'http').split(',')[0].trim();const origin=proto+'://'+req.headers.host;const url=new URL(req.url,origin);const headers=new Headers(req.headers);for(const key of [...headers.keys()])if(key.startsWith('oai-authenticated-user-'))headers.delete(key);
  if(url.pathname==='/health'){await DB.prepare('SELECT 1').all();res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end('{"ok":true}');return}
  const cookies=String(headers.get('cookie')||'').split(';').map(x=>x.trim());const tokens=cookies.filter(x=>x.startsWith('scar_admin=')).map(x=>x.slice(11));const authorized=tokens.length===1&&sessionValid(tokens[0],env.ADMIN_SESSION_SECRET);if(authorized)headers.set('oai-authenticated-user-email','railway-admin');
  const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>12000){res.writeHead(413);res.end('Request too large');return}chunks.push(chunk)}const body=Buffer.concat(chunks);
  const cookie=value=>'scar_admin='+value+'; Path=/; HttpOnly; SameSite=Strict; '+(proto==='https'?'Secure; ':'')+'Max-Age='+(value?'28800':'0');
  if(url.pathname==='/admin/login'||url.pathname==='/signin-with-chatgpt'){
   if(req.method==='POST'){
    if(headers.get('origin')!==origin){res.writeHead(403);res.end('Forbidden');return}const ip=req.socket.remoteAddress;const previous=attempts.get(ip);const count=previous&&previous.until>Date.now()?previous:{count:0,until:Date.now()+15*60000};if(count.count>=10){res.writeHead(429,{'Retry-After':'900'});res.end('Too many attempts. Try again later.');return}
    const form=new URLSearchParams(body.toString());if(credentialsValid(form.get('username'),form.get('password'),env)){attempts.delete(ip);res.writeHead(303,{'Location':'/admin','Set-Cookie':cookie(session(env.ADMIN_SESSION_SECRET)),'Cache-Control':'no-store'});res.end();return}count.count++;if(attempts.size>10000)attempts.delete(attempts.keys().next().value);attempts.set(ip,count);res.writeHead(401,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(loginPage(url.searchParams.get('lang'),true));return
   }
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(loginPage(url.searchParams.get('lang')));return;
  }
  if(url.pathname==='/admin/logout'&&req.method==='POST'){if(headers.get('origin')!==origin){res.writeHead(403);res.end();return}res.writeHead(303,{'Location':'/admin/login','Set-Cookie':cookie(''),'Cache-Control':'no-store'});res.end();return}
  if((url.pathname==='/admin'||url.pathname==='/admin/')&&!authorized){res.writeHead(302,{'Location':'/admin/login','Cache-Control':'no-store'});res.end();return}
  const request=new Request(url,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body}:{})});let response=await worker.fetch(request,{DB,ASSETS,ADMIN_EMAIL:'railway-admin'});
  if(url.pathname==='/admin'&&response.status===200){const html=(await response.text()).replace('</header>','<form action="/admin/logout" method="post"><button class="admin-button">Déconnexion / Sign out / Afmelden</button></form></header>');response=new Response(html,{status:200,headers:response.headers})}
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
 }catch(e){console.error('Railway request failed',e?.message);if(!res.headersSent)res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"unavailable"}')}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(env.PORT===undefined?3000:Number(env.PORT),'0.0.0.0',resolve)});console.log('Scar-Patte listening on port '+server.address().port);return {server,DB,async close(){await new Promise(resolve=>server.close(resolve));DB.close()}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const app=await startRailway();for(const s of ['SIGTERM','SIGINT'])process.on(s,async()=>{await app.close();process.exit(0)})}
