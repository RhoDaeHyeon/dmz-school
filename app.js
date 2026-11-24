const toggle=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
function closeMenu(){navigation.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','메뉴 열기');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';navigation.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');});
navigation.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&navigation.classList.contains('open')){closeMenu();toggle.focus();}});
window.matchMedia('(min-width: 761px)').addEventListener('change',closeMenu);

(function(){
function revealHash(hash){if(!hash||hash==='#')return;let id;try{id=decodeURIComponent(hash.slice(1));}catch{return;}let node=document.getElementById(id);while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}}
function revealCurrent(){revealHash(location.hash);}
document.addEventListener('click',function(e){const link=e.target.closest('a[href^="#"]');if(link)revealHash(link.getAttribute('href'));});
window.addEventListener('hashchange',revealCurrent);revealCurrent();
const picker=document.querySelector('details.proposal-picker');if(picker){const label=picker.querySelector('[data-picker-label]');const update=function(){label.textContent=picker.open?'예시 교육과정 접기':'예시 교육과정 보기';};picker.addEventListener('toggle',update);update();}
})();
