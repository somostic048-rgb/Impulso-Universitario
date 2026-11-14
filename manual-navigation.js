(() => {
 document.addEventListener('DOMContentLoaded',()=>{
  if(document.getElementById('extract')){
   // El flujo gratuito es manual. Conservamos el código/API anterior sin presentarlo como operativo.
   for(const id of ['extract','send']){const section=document.getElementById(id)?.closest('section');if(section){section.hidden=true;section.style.display='none';}}
   const note=document.querySelector('main > p');if(note?.textContent.includes('Importa contactos'))note.textContent='Gestiona el chatbot o abre WhatsApp manual para cargar contactos y trabajar en equipo.';
   document.querySelectorAll('main > p').forEach(p=>{if(p.textContent.includes('Para importar contactos y enviar mensajes, conecta un servidor'))p.hidden=true;});
  }
 });
})();
