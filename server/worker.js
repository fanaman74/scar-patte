import {home,admin} from './pages.js';
const statuses=['new','contacted','confirmed','closed'];
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const allowed=request=>request.headers.get('oai-authenticated-user-email');
const isAdmin=(request,env)=>Boolean(env.ADMIN_EMAIL&&allowed(request)?.toLowerCase()===env.ADMIN_EMAIL.toLowerCase());
const html=(body,status=200)=>new Response(body,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}});
function sameOrigin(request){return request.headers.get('Origin')===new URL(request.url).origin;}
function text(value,max){return typeof value==='string'&&value.trim().length<=max?value.trim():null;}
function validate(b){
 const v={id:text(b.id,36),name:text(b.name,100),email:text(b.email,160),phone:text(b.phone,40),pet_name:text(b.pet_name,100),pet:b.pet,service:b.service,preferred_date:b.preferred_date,preferred_time:b.preferred_time,message:text(b.message||'',2000),language:b.language};
 if(!/^[0-9a-f-]{36}$/i.test(v.id||'')||!v.name||!v.pet_name||!v.phone||!/^[+()\d\s.-]{6,40}$/.test(v.phone)||!v.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)||!['dog','cat','both'].includes(v.pet)||!['bath','trim','care'].includes(v.service)||!['morning','afternoon','flexible'].includes(v.preferred_time)||!['fr','en','nl'].includes(v.language)||v.message===null)return null;
 const d=new Date(v.preferred_date+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(v.preferred_date||'')||Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==v.preferred_date)return null;
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Brussels',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const today=['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('-');if(v.preferred_date<today||d.getTime()>Date.now()+366*86400000)return null;
 return v;
}
function store(env){if(!env.DB)throw new Error('Database binding unavailable');return env.DB;}
export default {async fetch(request,env){
 const url=new URL(request.url);const path=url.pathname;
 try{
 if(path==='/api/requests'&&request.method==='POST'){
  if(!sameOrigin(request))return json({error:'forbidden'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'invalid'},415);
  const body=await request.text();if(body.length>12000)return json({error:'invalid'},413);let b;try{b=JSON.parse(body)}catch{return json({error:'invalid'},400)}
  if(b.website||b.consent!=='on')return json({error:'invalid'},400);const v=validate(b);if(!v)return json({error:'invalid'},400);const db=store(env);
  const now=new Date().toISOString();await db.prepare('INSERT INTO appointment_requests (id,name,email,phone,pet_name,pet,service,preferred_date,preferred_time,message,language,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,\'new\',?,?) ON CONFLICT(id) DO NOTHING').bind(v.id,v.name,v.email,v.phone,v.pet_name,v.pet,v.service,v.preferred_date,v.preferred_time,v.message,v.language,now,now).run();return json({id:v.id,status:'new'},201);
 }
 if(path.startsWith('/api/admin/')){
  if(!isAdmin(request,env))return json({error:'forbidden'},403);
  const db=store(env);
  if(path==='/api/admin/requests'&&request.method==='GET'){
   const page=Math.max(0,Math.min(100000,parseInt(url.searchParams.get('page')||'0',10)||0));
   const rows=await db.prepare('SELECT * FROM appointment_requests ORDER BY created_at DESC, id DESC LIMIT 51 OFFSET ?').bind(page*50).all();return json({requests:rows.results.slice(0,50),hasMore:rows.results.length>50,page});
  }
  if(/^\/api\/admin\/requests\/[0-9a-f-]{36}$/.test(path)&&request.method==='PATCH'){
   if(!sameOrigin(request))return json({error:'forbidden'},403);const b=await request.json();if(!statuses.includes(b.status))return json({error:'invalid'},400);
   const result=await db.prepare('UPDATE appointment_requests SET status=?,updated_at=? WHERE id=?').bind(b.status,new Date().toISOString(),path.split('/').pop()).run();if(!result.meta.changes)return json({error:'not_found'},404);return json({ok:true});
  }return json({error:'not_found'},404);
 }
 if(path==='/admin'||path==='/admin/'){
  if(!allowed(request))return Response.redirect(url.origin+'/signin-with-chatgpt?return_to=%2Fadmin',302);
  if(!isAdmin(request,env))return html('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Scar-Patte · Restricted</title><body><h1>Admin access only</h1><p>This account cannot view appointment requests.</p><a href="/">Scar-Patte</a></body></html>',403);
  return html(admin);
 }
 if(path==='/'||path==='/index.html')return html(home);
 if(path.startsWith('/api/'))return json({error:'not_found'},404);
 return env.ASSETS?env.ASSETS.fetch(request):new Response('Not found',{status:404});
 }catch(e){console.error('Appointment route failed',path,e?.message);return json({error:'unavailable'},503)}
}};
