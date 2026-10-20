(async () => {
 await window.impulsoAdminReady;if(window.impulsoIsAdmin!==true)return;
 const editor=document.getElementById('editor'),tabs=document.querySelector('.admin-tabs');
 if(!editor||!tabs)return;
 const tab=document.createElement('button');tab.type='button';tab.dataset.adminTab='backups';tab.setAttribute('role','tab');tab.setAttribute('aria-selected','false');tab.textContent='Copias y recuperación';tabs.append(tab);
 const panel=document.createElement('section');panel.dataset.adminPanel='backups';panel.hidden=true;
 panel.innerHTML=`<h2>Copias y recuperación</h2>
 <h3>Contraseñas de usuarios</h3><p>Para crear usuarios normales o asignarles una contraseña, abre la pestaña Usuarios normales.</p><h3>Volver a una copia anterior</h3>
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
})();
