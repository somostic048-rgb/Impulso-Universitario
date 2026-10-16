// Render seguro del contenido editable, sin ejecutar HTML introducido en el panel.
window.impulsoMediaUrl=function(value,type='image'){
 if(typeof value!=='string'||!value.trim())return '';
 if(type==='image'&&/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value))return value;
 if(type==='video'&&/^data:video\/mp4;base64,[a-z0-9+/=]+$/i.test(value))return value;
 try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}
};
window.impulsoYouTubeEmbed=function(value){try{const u=new URL(value);let id='';if(u.hostname==='youtu.be')id=u.pathname.slice(1);else if(['www.youtube.com','youtube.com'].includes(u.hostname))id=u.pathname.startsWith('/embed/')?u.pathname.split('/')[2]:u.pathname.startsWith('/shorts/')?u.pathname.split('/')[2]:u.searchParams.get('v');return /^[\w-]{11}$/.test(id||'')?'https://www.youtube-nocookie.com/embed/'+id:''}catch{return ''}};
window.impulsoContentReady=window.impulsoSettingsReady.then(()=>{
 const c=window.IMPULSO_CONFIG;
 document.querySelectorAll('[data-content]').forEach(el=>{const text=c.texts?.[el.dataset.content];if(typeof text==='string'&&text.replace(/\s+/g,' ').trim()!==(el.innerText||el.textContent).replace(/\s+/g,' ').trim())el.textContent=text});
 document.querySelectorAll('[data-media]').forEach(el=>{const url=window.impulsoMediaUrl(c[el.dataset.media]);if(url)el.src=url});
 document.querySelectorAll('[data-edit-link]').forEach(el=>{const value=c.links?.[el.dataset.editLink];if(value!==undefined){const href=typeof value==='string'&&value.startsWith('#')?value:window.impulsoSafeUrl(value);if(href)el.href=href;else el.removeAttribute('href')}});
 const catalog=document.getElementById('catalog-link');if(catalog&&c.catalogImage)catalog.href=window.impulsoMediaUrl(c.catalogImage)||'assets/servicios.png';
 const address=document.getElementById('public-address');if(address)address.textContent=c.address||'Atención en línea';
 function updateUniversity(){if(document.getElementById('university')?.value!=='UNEMI')return;const panel=document.getElementById('university-content');if(!panel)return;const h=panel.querySelector('h3'),p=panel.querySelector('p');if(c.universityName&&h)h.textContent=c.universityName;if(c.universityDescription&&p)p.textContent=c.universityDescription;panel.querySelectorAll('.uni-links a').forEach((a,i)=>{const value=c[['admissionUrl','enrollmentUrl','universityUrl'][i]];if(value){const url=window.impulsoSafeUrl(value);if(url)a.href=url}})}updateUniversity();document.getElementById('university')?.addEventListener('change',()=>queueMicrotask(updateUniversity));
 const video=document.getElementById('featured-video'),cover=document.getElementById('featured-cover'),empty=document.getElementById('featured-empty');
 if(video){const src=window.impulsoMediaUrl(c.featuredVideo,'video'),embed=window.impulsoYouTubeEmbed(c.featuredVideo);video.hidden=!src||!!embed;const image=window.impulsoMediaUrl(c.videoCover||c.resourcesImage);empty.hidden=!!src||!!image;if(embed){const frame=document.createElement('iframe');frame.src=embed;frame.title='Video de Impulso Universitario';frame.allowFullscreen=true;frame.loading='lazy';frame.className='featured-embed';video.after(frame)}else if(src){video.src=src;video.poster=image||''}cover.hidden=!image||!!src;if(image)cover.src=image}
 if(Array.isArray(c.services)){services=c.services.map(s=>[s.icon||'✦',s.title,s.description]);const host=document.getElementById('services');if(host){host.replaceChildren();for(const s of c.services){const article=document.createElement('article');article.className='service-card';const icon=document.createElement('div');icon.className='service-icon';icon.textContent=s.icon||'✦';const h=document.createElement('h3');h.textContent=s.title;const p=document.createElement('p');p.textContent=s.description;const b=document.createElement('button');b.textContent='Explorar asesoría ↗';b.onclick=()=>{document.getElementById('request-service').value=s.title;location.hash='contacto'};article.append(icon,h,p,b);host.append(article)}document.getElementById('request-service').replaceChildren(...c.services.map(s=>{const o=document.createElement('option');o.textContent=s.title;return o}))}}
 if(Array.isArray(c.posts)){window.IMPULSO_INITIAL_POSTS=c.posts;if(document.getElementById('posts')){initialPosts=c.posts;loadPosts()}}
 return c;
});
window.addEventListener('storage',()=>location.reload());
