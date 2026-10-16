(() => {
 const defaults={featuredVideo:'assets/impulso-presentacion.mp4',videoCover:'assets/impulso-video-portada.jpg',videoTitle:'Un impulso para alcanzar tus metas',videoDescription:'Organiza tus ideas, construye tu proyecto y avanza con apoyo académico. Juntos damos el siguiente paso.',videoTag:'IMPULSO EN 12 SEGUNDOS',featuredVideoEnabled:true};
 window.impulsoVideoDefaults=defaults;
 function safe(value,type='video'){if(typeof value!=='string'||!value.trim())return '';if(type==='video'&&/^data:video\/mp4;base64,[a-z0-9+/=]+$/i.test(value))return value;if(type==='image'&&/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value))return value;try{const u=new URL(value,location.href);return ['https:','http:'].includes(u.protocol)||(u.protocol==='file:'&&/^assets\/[\w/ .-]+$/.test(value)&&!value.includes('..'))?u.href:'';}catch{return '';}}
 window.impulsoVideoUrl=safe;
 window.impulsoVideoReady=(window.impulsoContentReady||window.impulsoSettingsReady||Promise.resolve()).then(()=>{
 const c=window.IMPULSO_CONFIG||{};let saved={};try{if(!c.supabaseUrl&&!window.impulsoContenidoCompartido)saved=JSON.parse(localStorage.getItem('impulso-video')||'{}');}catch{}
 for(const [key,value]of Object.entries(defaults))if(c[key]===undefined||(key==='featuredVideo'&&!c[key]))c[key]=value;
 Object.assign(c,saved);window.IMPULSO_CONFIG=c;
 const card=document.querySelector('.video-card');if(!card)return c;
 card.hidden=c.featuredVideoEnabled===false;if(card.hidden)return c;
 card.replaceChildren();const art=document.createElement('div');art.className='video-art';
 const src=safe(c.featuredVideo),cover=safe(c.videoCover,'image');let embed=window.impulsoYouTubeEmbed?.(c.featuredVideo);
 if(!embed){try{const u=new URL(c.featuredVideo);let id;if(u.hostname==='youtu.be')id=u.pathname.slice(1);else if(['youtube.com','www.youtube.com'].includes(u.hostname))id=u.pathname.startsWith('/shorts/')?u.pathname.split('/')[2]:u.searchParams.get('v');if(/^[\w-]{11}$/.test(id||''))embed='https://www.youtube-nocookie.com/embed/'+id;}catch{}}
 if(embed){const f=document.createElement('iframe');f.src=embed;f.title=c.videoTitle;f.allowFullscreen=true;f.className='featured-embed';art.append(f);}else if(src){const v=document.createElement('video');v.id='featured-video';v.controls=true;v.preload='metadata';v.playsInline=true;v.src=src;v.poster=cover;v.setAttribute('aria-label',c.videoTitle);art.append(v);}else{const p=document.createElement('p');p.textContent='Selecciona un video desde el administrador.';art.append(p);}
 const text=document.createElement('div'),tag=document.createElement('span'),h=document.createElement('h3'),p=document.createElement('p');tag.className='tag';tag.textContent=c.videoTag;h.textContent=c.videoTitle;p.textContent=c.videoDescription;text.append(tag,h,p);card.append(art,text);return c;
 });
})();
