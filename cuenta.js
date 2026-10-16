(() => {
 const form=document.getElementById('account-form'),status=document.getElementById('account-status');const token=sessionStorage.getItem('impulso-admin-session')||'';
 async function api(path,options={}){const r=await fetch('/api/portal'+path,{...options,headers:{Authorization:'Bearer '+token,...options.headers}});let data;try{data=await r.json();}catch{throw Error('El servicio de cuenta no está disponible.');}if(!r.ok)throw Error(data.error);return data;}
 api('/admin/account').then(data=>{form.email.value=data.email;form.alternate.value=data.alternate;}).catch(()=>location.href='acceso.html');
 form.onsubmit=async e=>{e.preventDefault();const button=e.submitter;button.disabled=true;try{const result=await api('/admin/request-password-change',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});status.textContent=result.message;}catch(e){status.textContent=e.message;}finally{button.disabled=false;}};
 document.getElementById('logout-account').onclick=async()=>{try{await api('/auth/logout',{method:'POST'});}catch{}sessionStorage.removeItem('impulso-admin-session');location.href='acceso.html';};
 document.getElementById('logout-everywhere').onclick=async()=>{try{await api('/admin/logout-all',{method:'POST'});sessionStorage.removeItem('impulso-admin-session');location.href='acceso.html';}catch(e){status.textContent=e.message;}};
})();
