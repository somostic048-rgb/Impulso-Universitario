(() => {
 const auth=window.impulsoAuth;if(!auth?.configured)return;
 const defaults={enabled:true,name:'Asistente Impulso',launcher:'¿Tienes una pregunta?',avatar:'🤖',greeting:'Hola. Soy el asistente de Impulso Universitario. Elige un tema o escribe tu pregunta.',fallback:'No encuentro una respuesta clara. Puedes dejar tu consulta para que el equipo te contacte.',humanLabel:'Hablar con el equipo',success:'Tu consulta quedó registrada. El equipo podrá contactarte.',color:'#103f82',animation:'bounce',humanEnabled:true,suggestions:true};
 async function request(path,options={}){const s=await auth.restore();if(!s)throw Error('Inicia sesión como admin o editora.');return auth.request('/rest/v1/'+path,{...options,access:s.access_token});}
 async function readContent(){const rows=await request('site_settings?id=eq.main&select=content');return {exists:!!rows.length,content:rows[0]?.content||{}};}
 async function saveContent(key,value){const current=await readContent();const body={content:{...current.content,[key]:value}};if(current.exists)await request('site_settings?id=eq.main',{method:'PATCH',body});else await request('site_settings',{method:'POST',body:{id:'main',...body}});return {message:'Guardado en Supabase.'};}
 window.impulsoPortalAPI=async(path,options={})=>{
  const data=typeof options.body==='string'?JSON.parse(options.body):options.body;
  if(path==='/settings')return {...defaults,...(await readContent()).content.chatbot};
  if(path==='/faqs')return (await readContent()).content.chatFaqs||[];
  if(path==='/admin/settings'){
   for(const key of ['name','launcher','avatar','greeting','fallback','humanLabel','success'])if(typeof data?.[key]!=='string'||!data[key].trim()||data[key].length>(['greeting','fallback','success'].includes(key)?1000:key==='avatar'?20:100))throw Error('Revisa los textos del chatbot.');
   if(!/^#[0-9a-f]{6}$/i.test(data.color)||!['bounce','pulse','none'].includes(data.animation))throw Error('Revisa el color y la animación.');
   const clean={};for(const key of Object.keys(defaults))clean[key]=typeof defaults[key]==='boolean'?data[key]===true:data[key];return saveContent('chatbot',clean);
  }
  if(path==='/admin/faqs'){
   if(!Array.isArray(data)||data.length>100||data.some(row=>!row||typeof row.question!=='string'||!row.question.trim()||row.question.length>300||typeof row.answer!=='string'||!row.answer.trim()||row.answer.length>2000||(row.keywords!==undefined&&(typeof row.keywords!=='string'||row.keywords.length>500))))throw Error('Revisa las preguntas y respuestas.');
   return saveContent('chatFaqs',data.map(row=>({question:row.question,answer:row.answer,keywords:row.keywords||''})));
  }
  if(path==='/admin/leads')return request('chat_leads?select=*&order=created.desc&limit=200');
  const lead=path.match(/^\/admin\/leads\/([0-9a-f-]{36})$/i);
  if(lead&&options.method==='PATCH'){if(!['pending','contacted','closed'].includes(data?.status))throw Error('Estado no válido.');return request('chat_leads?id=eq.'+lead[1],{method:'PATCH',body:{status:data.status}});}
  throw Error('El envío masivo y la extracción de documentos necesitan el servidor de mensajería publicado. La edición del chatbot y las consultas ya usan Supabase.');
 };
 document.addEventListener('DOMContentLoaded',async()=>{
  const connection=document.getElementById('key')?.closest('section');document.querySelector('main')?.prepend(document.getElementById('status'));connection?.setAttribute('hidden','');
  for(const id of ['extract','send'])document.getElementById(id)?.closest('section')?.setAttribute('hidden','');
  try{const s=await auth.restore();if(!s){location.replace('login.html?role=user');return;}document.getElementById('key').value=s.access_token;sessionStorage.removeItem('impulso-job');document.getElementById('connect').click();}catch(error){document.getElementById('status').textContent=error.message;}
 });
})();
