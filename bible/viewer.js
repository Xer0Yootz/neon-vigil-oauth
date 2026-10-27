(()=>{'use strict';const d=window.NEON_BIBLE_DATA;const book=document.getElementById('book');const toc=document.getElementById('toc');const search=document.getElementById('search');const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));if(!d){book.textContent='Missing bible-data.js. Run python3 render.py.';return;}const sectionMap=new Map();for(const e of d.entries){const wrap=document.createElement('section');wrap.id=e.id;wrap.className='entry';wrap.dataset.title=(e.title+' '+e.section).toLowerCase();wrap.innerHTML='<div class="entry-head"><span>'+esc(e.section)+' · source p. '+e.source_page+'</span><a href="#'+encodeURIComponent(e.id)+'">#'+esc(e.id)+'</a></div>'+e.html;book.append(wrap);if(!sectionMap.has(e.section))sectionMap.set(e.section,[]);sectionMap.get(e.section).push(e);}for(const [name,items] of sectionMap){const details=document.createElement('details');details.innerHTML='<summary>'+esc(name)+' ('+items.length+')</summary><ul>'+items.map(e=>'<li><a href="#'+encodeURIComponent(e.id)+'">'+esc(e.title)+'</a></li>').join('')+'</ul>';toc.append(details);}document.getElementById('toggle').onclick=()=>{toc.hidden=!toc.hidden};search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();document.querySelectorAll('.entry').forEach(el=>{el.hidden=!!q&&!el.dataset.title.includes(q)});if(q)toc.hidden=true});})();
/* Interactive graphic novel hover (Oct 27, 2026): Neon swirl + astral lights, GIF hover-play. */
(()=>{'use strict';
  document.querySelectorAll('img.nv-hover-neon').forEach(img=>{
    img.addEventListener('mouseenter',()=>document.body.classList.add('nv-astral-on'));
    img.addEventListener('mouseleave',()=>document.body.classList.remove('nv-astral-on'));
  });
  document.querySelectorAll('img.nv-gif-hover').forEach(img=>{
    const gifSrc=img.getAttribute('src');let poster=null;
    const snap=()=>{try{const c=document.createElement('canvas');c.width=img.naturalWidth||768;c.height=img.naturalHeight||768;
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);poster=c.toDataURL('image/png');img.src=poster;}catch(err){/* keep animated GIF if snapshot blocked */}};
    if(img.complete&&img.naturalWidth){snap();}else{img.addEventListener('load',snap,{once:true});}
    img.addEventListener('mouseenter',()=>{if(poster)img.src=gifSrc;});
    img.addEventListener('mouseleave',()=>{if(poster)img.src=poster;});
  });
})();
