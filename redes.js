// Contacto y redes: configuración estática, vista local o datos públicos de Supabase.
window.impulsoSettingsReady=Promise.resolve().then(async()=>{
 const c=window.IMPULSO_CONFIG,base={...window.IMPULSO_DATOS};
 if(location.protocol!=='file:'){try{for(const key of ['impulso-settings','impulso-posts','impulso-video'])localStorage.removeItem(key);}catch{}}
 if(c.whatsapp)base.whatsapp=c.whatsapp;if(c.email)base.email=c.email;
 let values=base;
 if(c.supabaseUrl&&c.supabaseAnonKey){try{const r=await fetch(c.supabaseUrl.replace(/\/$/,'')+'/rest/v1/site_settings?id=eq.main&select=content',{cache:'no-store',headers:{apikey:c.supabaseAnonKey}});if(!r.ok)throw Error();const rows=await r.json();window.impulsoSiteSnapshot=JSON.stringify(rows[0]?.content||{});if(rows[0]?.content)values={...base,...rows[0].content}}catch{}}
 else{let shared=false;if(location.protocol!=='file:'){try{const response=await fetch('/api/portal/site-settings',{cache:'no-store'});if(response.ok){const content=await response.json();window.impulsoServerSiteVersion=response.headers.get('ETag');window.impulsoSiteSnapshot=JSON.stringify(content);if(content&&Object.keys(content).length){values={...base,...content};shared=true;window.impulsoContenidoCompartido=true;}}}catch{}}if(!shared&&location.protocol==='file:'){try{values={...base,...JSON.parse(localStorage.getItem('impulso-settings')||'{}')}}catch{}}}
 Object.assign(c,values);window.impulsoRenderSettings();return values;
});
window.impulsoRenderSettings=function(){
 const c=window.IMPULSO_CONFIG;
 window.impulsoWhatsAppLink=function(extra=''){const number=String(c.whatsapp||'').replace(/[+\s()-]/g,'');if(!/^\d{8,15}$/.test(number))return '';const message=(c.whatsappMessage||'Hola, estás contactando con Impulso Universitario. ¿En qué podemos ayudarte?')+(extra?'\n'+extra:'');return 'https://wa.me/'+number+'?text='+encodeURIComponent(message);};
 function url(s){if(typeof s!=='string'||!s.trim())return '';try{const u=new URL(s);return u.protocol==='https:'?u.href:''}catch{return ''}}
 const icons={whatsapp:'◉',facebook:'f',instagram:'◎',tiktok:'♪',youtube:'▶'},labels={whatsapp:'WhatsApp',facebook:'Facebook',instagram:'Instagram',tiktok:'TikTok',youtube:'YouTube'};
 document.querySelectorAll('[data-social]').forEach(a=>{const key=a.dataset.social,href=key==='whatsapp'?window.impulsoWhatsAppLink():url(c[key]);a.replaceChildren();if(key==='whatsapp'){const icon=document.createElement('img');icon.src='assets/whatsapp.svg';icon.alt='';icon.className='whatsapp-icon';a.append(icon)}else{const icon=document.createElement('span');icon.textContent=icons[key];a.append(icon)}const label=document.createElement('span');label.textContent=labels[key]+(href?' ↗':' · pronto');a.append(label);if(href){a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.removeAttribute('aria-disabled');a.title='Abrir '+labels[key]}else{a.removeAttribute('href');a.setAttribute('aria-disabled','true');a.title='Enlace pendiente de configurar'}});
 document.querySelectorAll('[data-setting-text]').forEach(el=>{el.textContent=c[el.dataset.settingText]||''});const email=document.getElementById('public-email');if(email){email.textContent=c.email||'Correo de contacto próximamente';if(c.email)email.href='mailto:'+encodeURIComponent(c.email);else email.removeAttribute('href')}
};
window.addEventListener('DOMContentLoaded',()=>window.impulsoRenderSettings());
