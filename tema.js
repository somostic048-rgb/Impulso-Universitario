(() => {
 const defaults={navy:'#082d60',blue:'#155cf3',yellow:'#ffdf4f',muted:'#697487',paper:'#f7f9fc',line:'#e3e8ef',background:'#ffffff',font:'original',radius:'9'};
 window.impulsoThemeDefaults=defaults;
 const fonts={original:"'DM Sans',Arial,sans-serif",system:'system-ui,Arial,sans-serif',serif:'Georgia,serif'};
 window.impulsoApplyTheme=theme=>{const t={...defaults,...theme};for(const k of ['navy','blue','yellow','muted','paper','line'])if(/^#[a-f0-9]{6}$/i.test(t[k]))document.documentElement.style.setProperty('--'+k,t[k]);if(/^#[a-f0-9]{6}$/i.test(t.background))document.body.style.background=t.background;document.body.style.fontFamily=fonts[t.font]||fonts.original;let style=document.getElementById('site-theme-style');if(!style){style=document.createElement('style');style.id='site-theme-style';document.head.append(style);}const radius=Math.min(32,Math.max(0,Number(t.radius)||0));style.textContent='.button{border-radius:'+radius+'px}'+(t.font!=='original'&&fonts[t.font]?'h1,h2,h3,.brand{font-family:'+fonts[t.font]+'}':'');};
 if(!document.getElementById('full-settings'))(window.impulsoContentReady||window.impulsoSettingsReady||Promise.resolve()).then(()=>window.impulsoApplyTheme(window.IMPULSO_CONFIG?.theme));
})();
