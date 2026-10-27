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

// Tabs navigate (Oct 27, 2026): each .tabbar tab jumps to the first entry
// where that tab is the active (.on) one, i.e. the first page of its part.
(()=>{'use strict';
  const firstByTab=new Map();
  document.querySelectorAll('.entry').forEach(el=>{
    el.querySelectorAll('.tabbar .tab.on').forEach(t=>{
      const label=t.textContent.trim();
      if(label&&!firstByTab.has(label))firstByTab.set(label,el.id);
    });
  });
  document.querySelectorAll('.tabbar .tab').forEach(t=>{
    const label=t.textContent.trim();
    const target=firstByTab.get(label);
    if(!target)return;
    t.style.cursor='pointer';
    t.addEventListener('click',()=>{
      const dest=document.getElementById(target);
      if(dest){dest.scrollIntoView();history.replaceState(null,'','#'+encodeURIComponent(target));}
    });
  });
})();

// Hover music (Oct 27, 2026, TEST: Neon Ultra + Himhun only).
// Hovering a mapped character's pictures plays their track via the
// SoundCloud widget; leaving the picture pauses it. A badge on each
// mapped entry also works as a click-to-play fallback, since browsers
// may block sound that starts on hover alone before any click on the page.
// Neon Ultra = Jasmine Infiniti's own track (SoundCloud, verified top track).
// Himhun has NO original track attached yet — her badge says so plainly;
// no other artist's music is presented as hers. Her canon atmosphere is
// deconstructed club, which is a style note, not a track.
(()=>{'use strict';
  const TRACKS={
    'neon':'https://soundcloud.com/jasmineinfiniti/vortexxx',
    'neon-ultra-jasmine-infiniti-2':'https://soundcloud.com/jasmineinfiniti/vortexxx',
    'himhun':null,
    'himhun-2':null
  };
  const LABELS={
    'neon':'Pu$$y Vortexxx — Jasmine Infiniti (SoundCloud)',
    'neon-ultra-jasmine-infiniti-2':'Pu$$y Vortexxx — Jasmine Infiniti (SoundCloud)',
    'himhun':'No Himhun track attached yet',
    'himhun-2':'No Himhun track attached yet'
  };
  let widget=null, current=null;
  const sc=document.createElement('script');
  sc.src='https://w.soundcloud.com/player/api.js';
  document.head.append(sc);
  const frame=document.createElement('iframe');
  frame.id='nv-music-player';
  frame.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;bottom:0;left:0;border:0;';
  frame.allow='autoplay';
  frame.src='https://w.soundcloud.com/player/?url='+encodeURIComponent('https://soundcloud.com/jasmineinfiniti/vortexxx')+'&auto_play=false&show_artwork=false';
  document.body.append(frame);
  const ready=()=>{try{if(window.SC&&window.SC.Widget&&!widget)widget=window.SC.Widget(frame);}catch(err){}};
  sc.addEventListener('load',ready);
  const play=(id)=>{
    const url=TRACKS[id]; if(!url)return;
    ready(); if(!widget)return;
    current=id;
    try{widget.load(url,{auto_play:true,show_artwork:false});}catch(err){}
  };
  const pause=()=>{if(widget){try{widget.pause();}catch(err){}} current=null;};
  Object.keys(TRACKS).forEach(id=>{
    const el=document.getElementById(id); if(!el)return;
    const head=el.querySelector('.entry-head'); if(!head)return;
    const badge=document.createElement('span');
    badge.className='nv-music-badge';
    badge.textContent='♪ '+(TRACKS[id]?LABELS[id]:LABELS[id]+' — pick a track to wire in');
    badge.style.cssText='cursor:pointer;font-size:11px;color:#f8d68e;';
    badge.title=TRACKS[id]?'Hover the pictures to play; click here to play/stop':'No track attached yet';
    badge.addEventListener('click',()=>{if(current===id)pause();else play(id);});
    head.append(badge);
    el.querySelectorAll('figure').forEach(fig=>{
      fig.addEventListener('mouseenter',()=>play(id));
      fig.addEventListener('mouseleave',pause);
    });
  });
})();
