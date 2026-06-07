// Gallery and Audio playlist script
(() => {
  // Hard-coded image list from your Images folder
  const images = [
    'Images/IMG-20250528-WA0016.jpg',
    'Images/IMG_0089.JPG',
    'Images/IMG_0261.JPG',
    'Images/IMG_0432.JPG',
    'Images/IMG_1524.HEIC',
    'Images/IMG_1705.HEIC',
    'Images/IMG_20241218_111640.jpg',
    'Images/IMG_20250131_073808.jpg',
    'Images/SAK04110.JPG',
    'Images/SAK04128.JPG',
    'Images/SAK04147.JPG',
    'Images/SAK04983.JPG',
    'Images/SAK04988.JPG',
    'Images/SAK05876.JPG',
    'Images/SAK06167.JPG',
    'Images/SAK06219.JPG',
    'Images/SAK06329.JPG'
  ];

  const gallery = document.getElementById('gallery');
  images.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Memory ${i+1}`;
    img.dataset.index = i;
    img.addEventListener('click', (e) => openModal(i));
    gallery.appendChild(img);
  });

  // Modal viewer
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');
  const modalCaption = document.getElementById('modalCaption');
  const closeModal = document.getElementById('closeModal');
  const modalPrev = document.getElementById('modalPrev');
  const modalNext = document.getElementById('modalNext');
  let current = 0;

  function openModal(index){
    current = index;
    modalImg.src = images[current];
    modalCaption.textContent = `Memory ${current+1} of ${images.length}`;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
  }
  function close(){modal.classList.remove('show');modal.setAttribute('aria-hidden','true')}
  function prev(){current = (current-1+images.length)%images.length; openModal(current)}
  function next(){current = (current+1)%images.length; openModal(current)}
  closeModal.addEventListener('click', close);
  modalPrev.addEventListener('click', prev);
  modalNext.addEventListener('click', next);
  modal.addEventListener('click', (e)=>{ if(e.target===modal) close() });
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') close(); if(e.key==='ArrowLeft') prev(); if(e.key==='ArrowRight') next(); });

  // Slideshow controls
  let slideTimer = null;
  const startSlideshow = document.getElementById('startSlideshow');
  const pauseSlideshow = document.getElementById('pauseSlideshow');
  startSlideshow.addEventListener('click', ()=>{
    if(slideTimer) return;
    openModal(0);
    slideTimer = setInterval(()=> next(), 4000);
  });
  pauseSlideshow.addEventListener('click', ()=>{ if(slideTimer){ clearInterval(slideTimer); slideTimer=null; } });

  // Audio player and playlist
  const audio = document.getElementById('audioPlayer');
  const audioFiles = document.getElementById('audioFiles');
  const addSamples = document.getElementById('addSamples');
  const clearPlaylist = document.getElementById('clearPlaylist');
  const playlistEl = document.getElementById('playlist');
  const playPause = document.getElementById('playPause');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const vol = document.getElementById('vol');
  const shuffleBtn = document.getElementById('shuffle');

  let playlist = [];
  let currentTrack = -1;
  let isShuffled = false;

  function renderPlaylist(){
    playlistEl.innerHTML = '';
    playlist.forEach((t,i)=>{
      const row = document.createElement('div');
      row.className = 'track' + (i===currentTrack? ' active' : '');
      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = t.name || `Track ${i+1}`;
      const dur = document.createElement('div');
      dur.className = 'text-muted small';
      dur.textContent = '';
      const btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-outline-primary';
      btn.textContent = 'Play';
      btn.addEventListener('click', ()=> playIndex(i));
      row.appendChild(title); row.appendChild(btn);
      playlistEl.appendChild(row);
    });
  }

  function playIndex(i){
    if(i<0 || i>=playlist.length) return;
    currentTrack = i;
    audio.src = playlist[i].url;
    audio.play();
    renderPlaylist();
    playPause.textContent = '⏸';
  }
  function playNext(){
    if(playlist.length===0) return;
    if(isShuffled) playIndex(Math.floor(Math.random()*playlist.length));
    else playIndex((currentTrack+1)%playlist.length);
  }
  function playPrev(){
    if(playlist.length===0) return;
    playIndex((currentTrack-1+playlist.length)%playlist.length);
  }

  playPause.addEventListener('click', ()=>{
    if(!audio.src && playlist.length>0) return playIndex(0);
    if(audio.paused) { audio.play(); playPause.textContent='⏸'; }
    else { audio.pause(); playPause.textContent='▶️'; }
  });
  nextBtn.addEventListener('click', playNext);
  prevBtn.addEventListener('click', playPrev);
  shuffleBtn.addEventListener('click', ()=>{ isShuffled = !isShuffled; shuffleBtn.classList.toggle('active'); });

  vol.addEventListener('input', ()=>{ audio.volume = parseFloat(vol.value); });
  audio.addEventListener('ended', playNext);

  audioFiles.addEventListener('change', (e)=>{
    const files = Array.from(e.target.files);
    files.forEach(f=>{
      const url = URL.createObjectURL(f);
      playlist.push({name: f.name, url});
    });
    if(currentTrack===-1 && playlist.length>0) playIndex(0);
    renderPlaylist();
  });

  addSamples.addEventListener('click', ()=>{
    // Sample public domain/example mp3s; will work when online. They are optional - local files work offline.
    const samples = [
      {name:'Sample Track 1', url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'},
      {name:'Sample Track 2', url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'}
    ];
    samples.forEach(s=>playlist.push(s));
    if(currentTrack===-1) playIndex(0);
    renderPlaylist();
  });

  clearPlaylist.addEventListener('click', ()=>{
    playlist = []; currentTrack=-1; audio.src=''; renderPlaylist(); playPause.textContent='▶️';
  });

  // Initial UI state
  vol.dispatchEvent(new Event('input'));
  renderPlaylist();

})();
