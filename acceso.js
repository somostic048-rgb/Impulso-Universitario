(() => {
 if(location.protocol==='file:'){location.replace('http://localhost:5173/acceso.html'+location.hash);return;}
 const $=id=>document.getElementById(id);let challenge='';const hash=new URLSearchParams(location.hash.slice(1)),reset=hash.get('reset');if(reset){history.replaceState(null,'',location.pathname);$('login-password').hidden=true;$('reset-password').hidden=false;}
 async function api(route,data){let r;try{r=await fetch('/api/portal/auth/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});}catch{throw Error('No se pudo conectar con el servidor de acceso. En este equipo abre ABRIR ADMINISTRADOR y vuelve a intentarlo.');}let result;try{result=await r.json();}catch{throw Error('Esta dirección solo está mostrando los archivos HTML. Abre http://localhost:5173/acceso.html para el acceso local. En la web publicada necesitas alojar la API del servidor.');}if(!r.ok)throw Error(result.error||'No se pudo completar.');return result;}
 const report=e=>$('access-status').textContent=e.message||e;
 if(new URLSearchParams(location.search).get('session')==='expired')report('Tu sesión venció o fue cerrada por seguridad. Inicia sesión nuevamente.');
 function enter(data){sessionStorage.setItem('impulso-admin-session',data.token);location.href='administrador.html';}
 async function action(button,fn){button.disabled=true;try{await fn();}catch(e){report(e);}finally{button.disabled=false;}}
 $('login-password').onsubmit=e=>{e.preventDefault();action(e.submitter,async()=>enter(await api('login',Object.fromEntries(new FormData(e.target)))));};
 $('request-code').onclick=e=>action(e.target,async()=>{if(!$('account-email').reportValidity())return;const result=await api('request-code',{email:$('account-email').value});challenge=result.id;$('verify-code').hidden=false;report(result.message);});
 $('verify-code').onsubmit=e=>{e.preventDefault();action(e.submitter,async()=>enter(await api('verify-code',{id:challenge,code:e.target.code.value})));};
 $('request-reset').onclick=e=>action(e.target,async()=>{if(!$('account-email').reportValidity())return;report((await api('request-reset',{email:$('account-email').value})).message);});
 $('reset-password').onsubmit=e=>{e.preventDefault();action(e.submitter,async()=>{if(e.target.password.value!==e.target.repeat.value)throw Error('Las contraseñas no coinciden.');const result=await api('reset',{token:reset,password:e.target.password.value});report(result.message);$('reset-password').hidden=true;$('login-password').hidden=false;});};
})();
