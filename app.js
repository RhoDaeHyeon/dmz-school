const toggle=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
function closeMenu(){navigation.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','메뉴 열기');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';navigation.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');});
navigation.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&navigation.classList.contains('open')){closeMenu();toggle.focus();}});
window.matchMedia('(min-width: 761px)').addEventListener('change',closeMenu);

(function(){function openLinkedProposal(){const id=decodeURIComponent(location.hash.slice(1));const node=document.getElementById(id);if(node&&node.matches('details[data-proposal]'))node.open=true;}window.addEventListener('hashchange',openLinkedProposal);openLinkedProposal();})();
