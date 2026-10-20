(() => {
 const editor=document.getElementById('editor'),tabs=document.querySelector('.admin-tabs');
 if(!editor||!tabs)return;
 const tab=document.createElement('button');tab.type='button';tab.dataset.adminTab='backups';tab.setAttribute('role','tab');tab.setAttribute('aria-selected','false');tab.textContent='Copias y recuperación';tabs.append(tab);
 const panel=document.createElement('section');panel.dataset.adminPanel='backups';panel.hidden=true;
 panel.innerHTML=`<h2>Copias y recuperación</h2>
 <h3>Asignar contraseña al usuario normal</h3>
 <p>Puedes escribir una nueva contraseña aunque el usuario no reciba correos. Conserva su correo y la contraseña del admin. Cierra únicamente las sesiones anteriores del usuario.</p>
 <form id="backup-password-form"><fieldset id="backup-password-fields"><label>Tu contraseña de propietario<input name="ownerPassword" type="password" required autocomplete="current-password"></label><label>Nueva contraseña para el usuario<input name="newPassword" type="password" minlength="12" maxlength="128" required autocomplete="new-password"></label><label>Repetir nueva contraseña del usuario<input name="repeatPassword" type="password" minlength="12" maxlength="128" required autocomplete="new-password"></label><button class="button" type="submit">Guardar contraseña del usuario</button></fieldset></form>
 <p>El ingreso usuario actual se administra en el servidor del propietario. Desde allí puedes restablecer su contraseña o enviarle un enlace de recuperación.</p>
 <button type="button" class="button" id="backup-user-reset">Restablecer contraseña del usuario</button>
 <p id="backup-user-status" role="status"></p>
 <h3>Volver a una copia anterior</h3>
 <p>Restaura textos, contacto, enlaces, servicios y publicaciones. Cada copia muestra su fecha y hora en tu zona horaria. Se guarda otra copia antes de restaurar para poder deshacer el cambio.</p>
 <p>Las copias comienzan al instalar el historial. No recuperan versiones anteriores de código, contraseñas ni archivos multimedia eliminados.</p>
 <button type="button" class="button" id="backup-save">Crear copia ahora</button>
 <button type="button" class="button" id="backup-refresh">Actualizar lista</button>
 <label>Copia para restaurar<select id="backup-select"><option value="">Carga el historial para elegir una copia</option></select></label>
 <button type="button" class="button" id="backup-restore">Volver a la copia seleccionada</button>
 <button type="button" class="button" id="backup-initial">Volver al estado inicial del historial</button>
 <p id="backup-status" role="status" aria-live="polite"></p>`;
 editor.append(panel);
 const $=id=>panel.querySelector('#'+id),status=$('backup-status');
 const ownerLocal=['localhost','127.0.0.1'].includes(location.hostname)&&location.port==='5174';
 if(!ownerLocal){$('backup-password-fields').disabled=true;$('backup-user-status').textContent='Para asignar contraseñas utiliza el servidor local del propietario en http://localhost:5174/acceso-admin.html. Esta función necesita ese servidor; subir HTML a GitHub no la activa por Internet.';}
 $('backup-password-form').onsubmit=async e=>{e.preventDefault();const form=e.target,button=e.submitter;button.disabled=true;try{
   if(!ownerLocal)throw Error('Abre el panel local del propietario.');
   if(form.elements.newPassword.value!==form.elements.repeatPassword.value)throw Error('Las contraseñas del usuario no coinciden.');
   const ownerToken=sessionStorage.getItem('impulso-owner-session');if(!ownerToken)throw Error('Primero inicia sesión como propietario en acceso-admin.html.');
   const response=await fetch('/api/portal/owner/set-user-password',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+ownerToken},body:JSON.stringify({ownerPassword:form.elements.ownerPassword.value,newPassword:form.elements.newPassword.value})});
   let result;try{result=await response.json();}catch{throw Error('Actualiza y reinicia el servidor del propietario.');}
   if(!response.ok)throw Error(result.error||'No se pudo guardar la contraseña.');
   form.reset();$('backup-user-status').textContent=result.message;
 }catch(error){$('backup-user-status').textContent=error.message;}finally{button.disabled=false;}};
 const date=value=>new Date(value).toLocaleString('es-EC',{dateStyle:'medium',timeStyle:'medium'});
 async function request(route,body){const auth=window.impulsoAuth;if(!auth?.configured)throw Error('El historial compartido requiere Supabase.');const session=await auth.restore();if(!session)throw Error('Inicia sesión como administrador.');return auth.request('/rest/v1/'+route,{access:session.access_token,...(body!==undefined?{method:'POST',body}:{})});}
 async function load(){try{const copies=await request('content_backups?select=id,created_at,label&order=created_at.desc&limit=100');$('backup-select').replaceChildren();for(const copy of copies){const option=document.createElement('option');option.value=copy.id;option.textContent=date(copy.created_at)+' · '+copy.label;$('backup-select').append(option);}status.textContent=copies.length?'Últimas '+copies.length+' copias disponibles. Hora local de este equipo.':'Todavía no hay copias.';}catch(e){status.textContent='No se pudo cargar el historial. '+e.message+' Si falta la tabla, ejecuta historial-contenido.sql en Supabase.';}}
 async function action(button,fn){button.disabled=true;try{await fn();}catch(e){status.textContent=e.message;}finally{button.disabled=false;}}
 tab.onclick=()=>{document.querySelectorAll('[data-admin-tab]').forEach(b=>{b.classList.toggle('active',b===tab);b.setAttribute('aria-selected',String(b===tab));});document.querySelectorAll('[data-admin-panel]').forEach(p=>p.hidden=p!==panel);document.getElementById('content-panel').hidden=true;load();};
 $('backup-refresh').onclick=()=>load();
 $('backup-save').onclick=e=>action(e.target,async()=>{await request('rpc/save_content_backup',{p_label:'Copia manual del administrador'});await load();});
 async function restore(id,label){if(!id)throw Error('Selecciona una copia.');if(!confirm('¿Restaurar '+label+'? Reemplazará el contenido y las publicaciones actuales. Se conservará una copia antes del cambio.'))return;await request('rpc/restore_content_backup',{p_id:id});location.reload();}
 $('backup-restore').onclick=e=>action(e.target,()=>restore($('backup-select').value,$('backup-select').selectedOptions[0]?.textContent||''));
 $('backup-initial').onclick=e=>action(e.target,async()=>{const initial=await request('content_backups?select=id,created_at&order=created_at.asc&limit=1');if(!initial.length)throw Error('No hay copia inicial.');await restore(initial[0].id,'el estado inicial del '+date(initial[0].created_at));});
 $('backup-user-reset').onclick=()=>{if(['localhost','127.0.0.1'].includes(location.hostname))window.open('http://localhost:5174/acceso-admin.html','_blank','noopener');else $('backup-user-status').textContent='Esta cuenta de usuario pertenece al servidor local, no a Supabase. En la computadora del propietario, inicia el servidor y abre http://localhost:5174/acceso-admin.html → Restablecer usuario. Para hacerlo por Internet hace falta publicar ese servidor.';};
})();
