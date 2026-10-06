import fs from 'node:fs';
fs.mkdirSync('dist/client',{recursive:true});fs.mkdirSync('dist/server',{recursive:true});
for(const f of fs.readdirSync('web'))if(!f.endsWith('.html'))fs.cpSync('web/'+f,'dist/client/'+f,{recursive:true});
const root=fs.realpathSync('dist');for(const f of fs.readdirSync('dist'))if(!['client','server','.openai'].includes(f)){const target=root+'/'+f;if(!fs.realpathSync(target).startsWith(root+'/')&&!fs.realpathSync(target).startsWith(root+'\\'))throw Error('Unexpected output path');fs.rmSync(target,{recursive:true,force:true})}
fs.writeFileSync('dist/server/pages.js','export const home='+JSON.stringify(fs.readFileSync('web/index.html','utf8'))+';\nexport const admin='+JSON.stringify(fs.readFileSync('web/admin.html','utf8'))+';');
fs.copyFileSync('server/worker.js','dist/server/index.js');fs.mkdirSync('dist/.openai',{recursive:true});fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
