// Build dot nav from sections
const sections=[...document.querySelectorAll('section.project')];
const dotsEl=document.getElementById('dots');
const scrollEl=document.getElementById('scroll');

sections.forEach((sec,i)=>{
    const dot=document.createElement('button');
    dot.className='dot';
    dot.title=sec.dataset.title||`Project ${i+1}`;
    dot.addEventListener('click',()=>sec.scrollIntoView({behavior:'smooth'}));
    dotsEl.appendChild(dot);
});

// Highlight active dot
const dots=[...dotsEl.children];
const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
    if(e.isIntersecting){
        const idx=sections.indexOf(e.target);
        dots.forEach(d=>d.classList.remove('active'));
        if(idx>-1) dots[idx].classList.add('active');
        history.replaceState(null,'',`#${e.target.id}`);
    }
    })
},{root:scrollEl,threshold:.6});
sections.forEach(s=>io.observe(s));

// Smooth anchor links to work inside the scroller
document.querySelectorAll('.links a').forEach(a=>{
    a.addEventListener('click',e=>{
    e.preventDefault();
    const id=a.getAttribute('href');
    document.querySelector(id).scrollIntoView({behavior:'smooth'});
    })
})

// Year
document.getElementById('year').textContent=new Date().getFullYear();

    // Promote gallery item to primary media
// Promote gallery item to primary media (με fit/position)
document.querySelectorAll('.card').forEach(card => {
  const primary = card.querySelector('.media .primary');
  if (!primary) return;

  card.querySelectorAll('.gallery .thumb, .gallery video').forEach(el => {
    el.addEventListener('click', () => {
      const kind  = el.dataset.kind || (el.tagName.toLowerCase()==='video' ? 'video' : 'image');
      const src   = el.dataset.src || el.currentSrc || el.src;
      const poster = el.dataset.poster || '';
      const fit = (el.dataset.fit || 'cover').toLowerCase();    // 'cover' | 'contain'
      const pos = el.dataset.pos || '';                          // example 'top center'

      primary.innerHTML = '';

      if (kind === 'video') {
        const v = document.createElement('video');
        v.className = `media-obj ${fit === 'contain' ? 'fit-contain' : 'fit-cover'}`;
        v.controls = true;
        if (poster) v.poster = poster;
        const s = document.createElement('source');
        s.src = src; s.type = 'video/mp4';
        v.appendChild(s);
        if (pos) v.style.objectPosition = pos;
        primary.appendChild(v);
        v.play().catch(()=>{});
      } else if (kind === 'iframe') {
        const ifr = document.createElement('iframe');
        ifr.className = 'media-obj'; // iframes don't have object-fit, but we keep the structure
        ifr.src = src;
        ifr.title = 'Embedded preview';
        ifr.allowFullscreen = true;
        primary.appendChild(ifr);
      } else { // image
        const img = new Image();
        img.className = `media-obj ${fit === 'contain' ? 'fit-contain' : 'fit-cover'}`;
        img.src = src;
        img.alt = el.alt || 'preview';
        if (pos) img.style.objectPosition = pos;
        primary.appendChild(img);
      }
        setActiveThumb(el);
      card.querySelector('.media').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
});

document.querySelectorAll('.card').forEach(card => {
  const primary = card.querySelector('.media .primary');
  const gallery = card.querySelector('.media .gallery');
  if (!primary || !gallery) return;

  // σώσε το αρχικό HTML
  const originalHtml = primary.innerHTML;

  // create an "Original" thumbnail 
  const orig = document.createElement('img');
  orig.className = 'thumb thumb-contain';
  orig.alt = 'Original';
  // small icon/image from poster or from the first img/video
  const snapshot = primary.querySelector('img')?.src || primary.querySelector('video')?.poster || '';
  if (snapshot) orig.src = snapshot; else orig.src = 'images/original-thumb.png';

  // after click → reset
  orig.addEventListener('click', () => {
    primary.innerHTML = originalHtml;
    const v = primary.querySelector('video');
    if (v) {
        v.play().catch(()=>{}); // ignore if the browser blocks autoplay
    }
    setActiveThumb(orig);
    card.querySelector('.media').scrollIntoView({ behavior:'smooth', block:'center' });
  });

  // put “Original” first in gallery
  gallery.prepend(orig);
});

document.querySelectorAll('.gallery').forEach(gallery => {
  const first = gallery.querySelector('.thumb');
  if (first) first.classList.add('active');
});

document.querySelectorAll('.primary').forEach(primary => {
  const btn = primary.querySelector('.maximize-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const media = primary.querySelector('.media-obj');
    if (!media) return;

    lightbox.classList.add("active");
    lightboxContent.innerHTML = "";

    if (media.tagName.toLowerCase() === "video") {
      const clone = media.cloneNode(true);
      clone.controls = true;
      lightboxContent.appendChild(clone);
      clone.play().catch(()=>{});
    } else if (media.tagName.toLowerCase() === "iframe") {
      const ifr = document.createElement("iframe");
      ifr.src = media.src;
      ifr.title = media.title || "Embedded preview";
      ifr.allowFullscreen = true;
      ifr.className = "media-obj";
      lightboxContent.appendChild(ifr);
    } else if (media.tagName.toLowerCase() === "img") {
      const img = new Image();
      img.src = media.src;
      img.alt = media.alt || "preview";
      img.className = "media-obj fit-contain";
      lightboxContent.appendChild(img);
    }
  });
});

function setActiveThumb(el) {
  const gallery = el.closest('.gallery');
  if (!gallery) return;
  gallery.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}


//Overlay refs
const overlay        = document.getElementById("overlay");
const overlayContent = document.getElementById("overlay-content");
const overlayClose   = document.getElementById("overlay-close");
const overlayPrev    = document.getElementById("overlay-prev");
const overlayNext    = document.getElementById("overlay-next");

let currentGallery = null;
let currentIndex   = -1; 

function renderOverlayItem(el) {
  overlayContent.innerHTML = "";

  const kind = (el.dataset.kind || "").toLowerCase();
  const src  = el.dataset.src || el.currentSrc || el.src || "";
  const poster = el.dataset.poster || "";

  if (kind === "video") {
    const v = document.createElement("video");
    v.controls = true;
    if (poster) v.poster = poster;
    v.src = src;
    overlayContent.appendChild(v);
    v.play?.().catch(()=>{});
  } else if (kind === "iframe") {
    const ifr = document.createElement("iframe");
    ifr.src = src;
    ifr.allowFullscreen = true;
    overlayContent.appendChild(ifr);
  } else { // image (or anything without a kind)
    const img = new Image();
    img.src = src;
    img.alt = el.alt || "preview";
    overlayContent.appendChild(img);
  }
}

function openOverlayFromIndex(gallery, index) {
  if (!gallery || !gallery.length) return;
  currentGallery = gallery;
  currentIndex   = Math.max(0, Math.min(index, gallery.length - 1));
  renderOverlayItem(currentGallery[currentIndex]);
  overlay.classList.add("active");
}

function closeOverlay() {
  overlay.classList.remove("active");
  overlayContent.innerHTML = "";
  currentGallery = null;
  currentIndex = -1;
}

function goPrev() {
  if (!currentGallery) return;
  currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
  renderOverlayItem(currentGallery[currentIndex]);
}

function goNext() {
  if (!currentGallery) return;
  currentIndex = (currentIndex + 1) % currentGallery.length;
  renderOverlayItem(currentGallery[currentIndex]);
}

// Only primary opens the overlay 
document.querySelectorAll(".content .primary").forEach(primary => {
  primary.addEventListener("click", () => {
    // Find gallery of the same card
    const card    = primary.closest(".card");
    const gallery = card?.querySelectorAll(".gallery .thumb");
    if (!gallery || !gallery.length) return;

    // If thumbnail is "active" , begin from this one, otherwise from the first
    const active = card.querySelector(".gallery .thumb.active");
    const startIndex = active
      ? Array.from(gallery).indexOf(active)
      : 0;

    openOverlayFromIndex(gallery, startIndex);
  });
});

// Thumbnails dont open the overlay 

// Overlay buttons (X, ←, →)
overlayClose?.addEventListener("click", closeOverlay);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});
overlayPrev?.addEventListener("click", goPrev);
overlayNext?.addEventListener("click", goNext);

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (!overlay.classList.contains("active")) return;

  if (e.key === "Escape") {
    e.preventDefault();
    closeOverlay();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    goPrev();
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    goNext();
  }
});

