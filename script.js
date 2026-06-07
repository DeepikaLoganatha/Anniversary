// Simple confetti particle system + balloons generator for the celebration page
(() => {
  // Canvas confetti
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  let particles = [];
  const colors = ['#ff6b6b','#ffd166','#06d6a0','#4d96ff','#c580ff','#ff9ff3'];

  function rand(min,max){return Math.random()*(max-min)+min}

  function createParticle(x,y){
    const r = rand(6,12);
    return {
      x,y,
      vx:rand(-6,6),
      vy:rand(-12,-3),
      r,
      rot:rand(0,360),
      vr:rand(-10,10),
      color:colors[Math.floor(Math.random()*colors.length)],
      life:0,
      ttl:rand(60,140)
    }
  }

  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight}
  window.addEventListener('resize', resize);

  function render(){
    ctx.clearRect(0,0,W,H);
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.life++;
      p.vy += 0.12; // gravity
      p.x += p.vx; p.y += p.vy; if(p.vr) p.rot += p.vr;
      if(p.size){
        // draw heart shape
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate((p.rot||0)*Math.PI/180);
        ctx.fillStyle = p.color; drawHeart(ctx, 0, 0, p.size);
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate((p.rot||0) * Math.PI/180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6);
        ctx.restore();
      }
      if(p.life > p.ttl || p.y > H + 50) particles.splice(i,1);
    }
    requestAnimationFrame(render);
  }
  render();

  // draw a simple heart at x,y with size (half-width)
  function drawHeart(ctx,x,y,size){
    const s = size/16;
    ctx.beginPath();
    ctx.moveTo(x, y + 3*s);
    ctx.bezierCurveTo(x - 6*s, y - 6*s, x - 12*s, y + 6*s, x, y + 12*s);
    ctx.bezierCurveTo(x + 12*s, y + 6*s, x + 6*s, y - 6*s, x, y + 3*s);
    ctx.fill();
  }

  // Public trigger
  function burst(x,y,count=40){
    for(let i=0;i<count;i++) particles.push(createParticle(x + rand(-20,20), y + rand(-20,20)));
  }

  // Heart particle system drawn on the confetti canvas
  const heartColors = ['#ff6b6b','#ff9ff3','#ffb3c6','#ffd166','#c580ff'];
  function createHeartParticle(x,y){
    return {
      x,y,
      vx:rand(-3,3),
      vy:rand(-10,-3),
      size:rand(8,18),
      color:heartColors[Math.floor(Math.random()*heartColors.length)],
      life:0,ttl:rand(80,160),rot:rand(-20,20),vr:rand(-2,2)
    };
  }
  function launchHearts(x,y,count=12){
    for(let i=0;i<count;i++) particles.push(createHeartParticle(x+rand(-40,40), y+rand(-20,20)));
  }

  // Button wiring
  const celebrateBtn = document.getElementById('celebrateBtn');
  const message = document.getElementById('message');

  // Hero slideshow (combines images with the Happy Anniversary text)
  const hero = document.getElementById('hero');
  const heroImages = [
    'Images/IMG-20250528-WA0016.jpg',
    'Images/IMG_0089.JPG',
    'Images/IMG_0261.JPG',
    'Images/IMG_0432.JPG',
    'Images/IMG_20241218_111640.jpg',
    'Images/IMG_20250131_073808.jpg',
    'Images/SAK04110.JPG',
    'Images/SAK04128.JPG',
    'Images/SAK04147.JPG',
    'Images/SAK04983.JPG'
  ];
  let heroIndex = 0;
  // preload
  heroImages.forEach(s=>{ const i=new Image(); i.src=s; });
  // kept-background key and forced background (declare early so it can be used below)
  const KEPT_KEY = 'celebration_kept_bg';
  const FORCED_BG = 'Images/SAK04988.JPG';
  try{ localStorage.setItem(KEPT_KEY, FORCED_BG); }catch(e){}
  const kept = localStorage.getItem(KEPT_KEY);
  function setHeroImage(i){
    if(!hero) return;
    const src = heroImages[i];
    // immediately set the original image so a preview appears
    hero.style.backgroundImage = `url('${src}')`;
    // load and if large, downscale for display and detection
    const img = new Image(); img.crossOrigin='anonymous'; img.src = src;
    img.onload = ()=>{
      const maxDim = 1600;
      const w = img.naturalWidth || img.width; const h = img.naturalHeight || img.height;
      if(Math.max(w,h) > maxDim){
        const scale = maxDim / Math.max(w,h);
        const cw = Math.round(w * scale), ch = Math.round(h * scale);
        const oc = document.createElement('canvas'); oc.width = cw; oc.height = ch;
        const octx = oc.getContext('2d');
        octx.drawImage(img,0,0,cw,ch);
        try{
          const dataUrl = oc.toDataURL('image/jpeg', 0.85);
          hero.style.backgroundImage = `url('${dataUrl}')`;
          // run face detection on the resized image
          detectFacesAndFocus(dataUrl);
        }catch(e){
          // fallback if toDataURL fails
          detectFacesAndFocus(src);
        }
      } else {
        // small enough - use original src
        detectFacesAndFocus(src);
      }
    };
    img.onerror = ()=>{ detectFacesAndFocus(src); };
  }
  // initial
  setHeroImage(heroIndex);
  // start auto slideshow only if no kept background is present
  let heroTimer = null;
  if(!kept){
    heroTimer = setInterval(()=>{ heroIndex = (heroIndex+1) % heroImages.length; setHeroImage(heroIndex); }, 6000);
  }
  // pause slideshow when page not visible
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden){ clearInterval(heroTimer); heroTimer = null; }
    else if(!heroTimer){ heroTimer = setInterval(()=>{ heroIndex = (heroIndex+1) % heroImages.length; setHeroImage(heroIndex); }, 6000); }
  });

  celebrateBtn.addEventListener('click', (e)=>{
    const rect = celebrateBtn.getBoundingClientRect();
    const x = rect.left + rect.width/2;
    const y = rect.top + rect.height/2;
    burst(x,y,80);
    burst(x-80,y,40);
    burst(x+80,y,40);
  launchHearts(x,y,18);
    message.textContent = "Wishing you many more years of love and joy 💖";
    // small heart sparkle
    celebrateBtn.classList.add('btn-success');
    setTimeout(()=>celebrateBtn.classList.remove('btn-success'),1500);
  });


  // launch a gentle auto celebration once on page load
  window.addEventListener('load', ()=>{
    setTimeout(()=>{
      burst(W/2,H/2,60);
      // hearts drawn on canvas will be launched with burst when user clicks; no DOM balloons here
    },900);
  });

  // Settings panel wiring: overlay opacity, widget scale, auto-adjust
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsBody = document.querySelector('.settings-body');
  const overlayRange = document.getElementById('overlayRange');
  const widgetRange = document.getElementById('widgetRange');
  const autoAdjust = document.getElementById('autoAdjust');
  const keepOnClick = document.getElementById('keepOnClick');
  const clearKept = document.getElementById('clearKept');

  // load kept background if present (kept variable declared earlier)
  const keptFinal = localStorage.getItem(KEPT_KEY) || kept;
  if(keptFinal){
    hero.style.backgroundImage = `url('${keptFinal}')`;
    // if the kept image is in our heroImages list, set heroIndex so the correct thumb becomes active
    const keptIdx = heroImages.indexOf(keptFinal);
    if(keptIdx >= 0) heroIndex = keptIdx;
  }

  settingsToggle && settingsToggle.addEventListener('click', ()=>{
    settingsBody.classList.toggle('show');
    const hidden = settingsBody.getAttribute('aria-hidden') === 'true';
    settingsBody.setAttribute('aria-hidden', (!hidden).toString());
  });

  clearKept && clearKept.addEventListener('click', ()=>{ localStorage.removeItem(KEPT_KEY); });

  // apply overlay opacity
  function applyOverlay(op){
    const ov = document.querySelector('.hero-overlay');
    if(ov) ov.style.background = `linear-gradient(180deg, rgba(0,0,0,${op}), rgba(0,0,0,${Math.max(0, op-0.06)}))`;
  }
  overlayRange && overlayRange.addEventListener('input', (e)=> applyOverlay(e.target.value));

  // apply widget scaling
  widgetRange && widgetRange.addEventListener('input', (e)=>{
    const val = e.target.value; document.documentElement.style.setProperty('--widget-scale', val);
  });

  // analyze brightness of current hero image to auto adjust overlay / text color
  function analyzeBrightness(imgSrc, cb){
    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = imgSrc;
    img.onload = ()=>{
      const oc = document.createElement('canvas'); oc.width = Math.min(200, img.width); oc.height = Math.min(120, img.height);
      const octx = oc.getContext('2d'); octx.drawImage(img,0,0,oc.width,oc.height);
      const data = octx.getImageData(0,0,oc.width,oc.height).data;
      let sum = 0; for(let i=0;i<data.length;i+=4){ const r=data[i],g=data[i+1],b=data[i+2]; sum += (0.299*r + 0.587*g + 0.114*b); }
      const avg = sum / (oc.width*oc.height);
      cb(avg/255);
    };
    img.onerror = ()=> cb(0.5);
  }

  // auto adjust logic when hero image changes
  function maybeAutoAdjust(){
    if(!autoAdjust || !autoAdjust.checked) return;
    const src = heroImages[heroIndex];
    analyzeBrightness(src, (lum)=>{
      // darker images -> lower overlay opacity, light images -> higher overlay to keep text readable
      const target = lum < 0.5 ? 0.18 : 0.36;
      overlayRange.value = target; applyOverlay(target);
      // set text color depending on luminance
      const title = document.querySelector('.hero-title');
      if(title) title.style.color = lum < 0.6 ? '#fff' : '#111';
    });
  }

  // Face detection and focus using the browser FaceDetector API when available
  async function detectFacesAndFocus(imgSrc){
    const ov = document.querySelector('.hero-overlay');
    if(!imgSrc || !hero) return;
    try{
      const img = new Image(); img.crossOrigin = 'anonymous'; img.src = imgSrc; await img.decode();
      if('FaceDetector' in window){
        const fd = new window.FaceDetector({fastMode:true, maxDetectedFaces:5});
        const bitmap = await createImageBitmap(img);
        const faces = await fd.detect(bitmap);
        if(faces && faces.length){
          // limit to first two faces for group focus
          const sel = faces.slice(0,2);
          // compute enclosing bounding box
          let minX=Infinity,minY=Infinity,maxX=0,maxY=0;
          sel.forEach(f=>{
            minX = Math.min(minX, f.boundingBox.x);
            minY = Math.min(minY, f.boundingBox.y);
            maxX = Math.max(maxX, f.boundingBox.x + f.boundingBox.width);
            maxY = Math.max(maxY, f.boundingBox.y + f.boundingBox.height);
          });
          const cx = (minX + maxX)/2; const cy = (minY + maxY)/2;
          const boxW = maxX - minX; const boxH = maxY - minY;
          const xPercent = Math.round((cx / img.width) * 100);
          const yPercent = Math.round((cy / img.height) * 100);
          // focus background position toward face center
          hero.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
          // radius to cover both faces
          const cover = Math.max(boxW/img.width, boxH/img.height) * 120; // percent multiplier
          const radius = Math.max(18, Math.min(40, cover));
          if(ov) ov.style.backgroundImage = `radial-gradient(circle ${radius}% at ${xPercent}% ${yPercent}%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 20%, rgba(0,0,0,0.52) 70%), linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.06))`;
          return;
        }
      }
      hero.style.backgroundPosition = 'center center'; if(ov) ov.style.backgroundImage = '';
    }catch(e){ hero.style.backgroundPosition = 'center center'; if(ov) ov.style.backgroundImage = ''; }
  }

  // hook into hero image changes
  const originalSetHero = setHeroImage;
  setHeroImage = function(i){ originalSetHero(i); maybeAutoAdjust(); detectFacesAndFocus(heroImages[i]); };
  // run initial adjust
  maybeAutoAdjust();
  detectFacesAndFocus(heroImages[heroIndex]);

  // Build circular image ring with thumbnails
  const ring = document.getElementById('imageRing');
  function buildRing(){
    if(!ring) return;
    ring.innerHTML = '';
    heroImages.forEach((s, idx)=>{
      const t = document.createElement('div'); t.className='thumb';
      const im = document.createElement('img'); im.src = s; im.alt = `Memory ${idx+1}`;
      t.appendChild(im);
      t.addEventListener('click', ()=>{
        heroIndex = idx; setHeroImage(idx); document.querySelectorAll('.image-ring .thumb').forEach(el=>el.classList.remove('active')); t.classList.add('active');
        if(keepOnClick && keepOnClick.checked){ localStorage.setItem(KEPT_KEY, s); }
      });
      if(idx===heroIndex) t.classList.add('active');
      ring.appendChild(t);
    });
  }
  buildRing();

  // Mosaic: show all images fully touching
  const showMosaicBtn = document.getElementById('showMosaicBtn');
  const mosaicOverlay = document.getElementById('mosaicOverlay');
  const mosaic = document.getElementById('mosaic');
  const closeMosaic = document.getElementById('closeMosaic');
  const viewer = document.getElementById('viewer');
  const viewerImg = document.getElementById('viewerImg');
  const closeViewer = document.getElementById('closeViewer');

  // Memories: open a full-screen single-image slideshow that advances every 2s
  let slideshowTimer = null;
  let slideshowIndex = 0;
  let slideshowPaused = false;
  function startSlideshow(startIndex = 0){
    stopSlideshow();
    slideshowIndex = startIndex || 0;
    slideshowPaused = false;
    viewerImg.src = heroImages[slideshowIndex];
    viewer.classList.add('show'); viewer.setAttribute('aria-hidden','false');
    slideshowTimer = setInterval(()=>{
      if(slideshowPaused) return;
      slideshowIndex = (slideshowIndex + 1) % heroImages.length;
      viewerImg.src = heroImages[slideshowIndex];
    }, 2000);
  }
  function stopSlideshow(){ if(slideshowTimer){ clearInterval(slideshowTimer); slideshowTimer = null; } slideshowPaused = false; }

  // Memories sequence: show images one-by-one (fade in, hold, fade out)
  let memoriesTask = null;
  let stopMemories = false;
  function sleep(ms){ return new Promise(res=>setTimeout(res, ms)); }
  // audio elements
  const memAudio = document.getElementById('memAudio');
  const audioThumb = document.getElementById('audioThumb');
  // set a default source if none provided. Use the actual Audio folder filename if present.
  if(memAudio && !memAudio.src){
    memAudio.src = 'Audio/Neeyum-Naanum-Anbe-MassTamilan.com.mp3';
    try{ memAudio.load(); }catch(e){}
    memAudio.volume = 0.88;
  }
  async function startAudio(){
    if(!memAudio) return;
    try{
      // attempt play and show thumb when playback begins
      const p = memAudio.play();
      if(p && p.then){
        await p;
      }
      if(audioThumb) audioThumb.classList.add('show');
    }catch(e){
      console.warn('Audio playback failed (maybe browser blocked autoplay):', e);
    }
  }
  function stopAudio(){
    if(memAudio){ try{ memAudio.pause(); memAudio.currentTime = 0; }catch(e){} }
    if(audioThumb) audioThumb.classList.remove('show');
  }
  // keep thumb state in sync with audio events
  if(memAudio){
    memAudio.addEventListener('play', ()=>{ if(audioThumb) audioThumb.classList.add('show'); });
    memAudio.addEventListener('pause', ()=>{ if(audioThumb) audioThumb.classList.remove('show'); });
    memAudio.addEventListener('ended', ()=>{ if(audioThumb) audioThumb.classList.remove('show'); });
  }

  async function startMemoriesSequence(){
  stopMemories = false;
    // show mosaic overlay so viewer is visible
    if(mosaicOverlay){ mosaicOverlay.classList.add('show'); mosaicOverlay.setAttribute('aria-hidden','false'); }
    viewer.classList.add('show'); viewer.setAttribute('aria-hidden','false');
  // start audio
  startAudio();
  // loop until stopped
    while(!stopMemories){
      for(let i=0;i<heroImages.length;i++){
        if(stopMemories) break;
        viewerImg.style.opacity = 0; // ensure starting opacity
        viewerImg.src = heroImages[i];
        // wait for image to be at least decoded or timeout
        try{ await Promise.race([viewerImg.decode(), sleep(800)]); }catch(e){}
        // fade in
        viewerImg.style.transition = 'opacity 500ms ease';
        await sleep(50);
        viewerImg.style.opacity = 1;
  // hold visible (longer pause requested: 3s)
  await sleep(3000);
        // fade out
        viewerImg.style.opacity = 0;
        await sleep(300);
      }
    }
    // finish / cleanup
    viewer.classList.remove('show'); viewer.setAttribute('aria-hidden','true');
    if(mosaicOverlay){ mosaicOverlay.classList.remove('show'); mosaicOverlay.setAttribute('aria-hidden','true'); }
    viewerImg.style.transition = '';
    viewerImg.style.opacity = '';
    // stop audio when done
    stopAudio();
  }

  function openMosaic(){
    stopMemories = false;
    if(mosaicOverlay){ mosaicOverlay.classList.add('show'); mosaicOverlay.setAttribute('aria-hidden','false'); }
    startMemoriesSequence();
  }

  showMosaicBtn && showMosaicBtn.addEventListener('click', openMosaic);
  closeMosaic && closeMosaic.addEventListener('click', ()=>{ mosaicOverlay.classList.remove('show'); mosaicOverlay.setAttribute('aria-hidden','true'); stopSlideshow(); });
  closeViewer && closeViewer.addEventListener('click', ()=>{
    // stop memories loop (if running) and hide overlays
    stopMemories = true;
    stopSlideshow();
    if(mosaicOverlay){ mosaicOverlay.classList.remove('show'); mosaicOverlay.setAttribute('aria-hidden','true'); }
    viewer.classList.remove('show'); viewer.setAttribute('aria-hidden','true');
  });
  viewer && viewer.addEventListener('click', (e)=>{ if(e.target===viewer) {
    // stop memories loop and hide
    stopMemories = true; stopSlideshow();
    if(mosaicOverlay){ mosaicOverlay.classList.remove('show'); mosaicOverlay.setAttribute('aria-hidden','true'); }
    viewer.classList.remove('show'); viewer.setAttribute('aria-hidden','true'); } });

  // toggle pause/resume when clicking the image itself
  viewerImg && viewerImg.addEventListener('click', (e)=>{ slideshowPaused = !slideshowPaused; });

  // Old DOM balloon logic removed; hearts are now rendered on canvas as particles

})();
