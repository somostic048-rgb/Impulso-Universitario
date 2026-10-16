(() => {
 if(location.protocol==='file:')return;
 const isEditor=!!document.getElementById('editor'),isPreview=new URLSearchParams(location.search).has('editor')||new URLSearchParams(location.search).has('preview');if(isPreview)return;
 let running=false,baseline={},lastBuild=document.querySelector('meta[name=impulso-build]')?.content||'',notice;
 async function get(url,headers={}){const r=await fetch(url,{cache:'no-store',headers,signal:AbortSignal.timeout(8000)});if(!r.ok)return null;return r.json();}
 function reload(){const u=new URL(location.href);u.searchParams.set('_sync',Date.now());location.replace(u.href);}
 function changed(){if(!isEditor){reload();return;}if(notice)return;notice=document.createElement('div');notice.className='sync-notice';notice.setAttribute('role','status');const text=document.createElement('span');text.textContent='Se publicaron cambios desde otra sesión. Tu borrador se conserva; carga la versión actual antes de seguir editando.';const button=document.createElement('button');button.type='button';button.textContent='Cargar cambios actuales';button.onclick=()=>{if(confirm('Se cargarán los datos publicados y se descartará el borrador sin guardar de esta pestaña. ¿Continuar?'))reload();};notice.append(text,button);document.getElementById('mode')?.after(notice);}
 async function poll(){if(running||document.hidden)return;running=true;try{
   const c=window.IMPULSO_CONFIG||{};let site,posts;
   if(c.supabaseUrl&&c.supabaseAnonKey){const base=c.supabaseUrl.replace(/\/$/,'');const result=await Promise.allSettled([get(base+'/rest/v1/site_settings?id=eq.main&select=content',{apikey:c.supabaseAnonKey}),get(base+'/rest/v1/posts?published=eq.true&order=created_at.desc',{apikey:c.supabaseAnonKey})]);if(result[0].status==='fulfilled'&&result[0].value)site=result[0].value[0]?.content||{};if(result[1].status==='fulfilled')posts=result[1].value;}
   else{try{site=await get('/api/portal/site-settings');}catch{}}
   if(site!==undefined&&site!==null){const signature=JSON.stringify(site),known=window.impulsoSiteSnapshot??baseline.site;if(known!==undefined&&signature!==known){changed();return;}baseline.site=signature;}
   if(posts!==undefined&&posts!==null){const signature=JSON.stringify(posts),known=window.impulsoPostsSnapshot??baseline.posts;if(known!==undefined&&signature!==known){changed();return;}baseline.posts=signature;}
   const result=await Promise.allSettled([get('/api/portal/settings'),get('/api/portal/faqs'),get('version.json')]);for(let i=0;i<2;i++){const r=result[i];if(r.status!=='fulfilled'||!r.value)continue;const signature=JSON.stringify(r.value);if(baseline[i]!==undefined&&baseline[i]!==signature){changed();return;}baseline[i]=signature;}
   if(result[2].status==='fulfilled'&&result[2].value?.version){const version=result[2].value.version;if(lastBuild&&lastBuild!==version)changed();lastBuild=version;}
 }catch{}finally{running=false;}}
 (window.impulsoVideoReady||window.impulsoContentReady||window.impulsoSettingsReady||Promise.resolve()).then(poll);setInterval(poll,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll();});window.addEventListener('online',poll);
})();
