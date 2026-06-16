// Mobile menu toggle
function toggleMenu(){
  document.getElementById('navLinks').classList.toggle('active');
}

// Dark/Light mode toggle
function toggleTheme(){
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if(savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
});

// FAQ accordion toggle
function toggleFAQ(el){
  const item = el.parentElement;
  item.classList.toggle('active');
  const icon = el.querySelector('span');
  icon.textContent = item.classList.contains('active') ? '-' : '+';
}

// Scroll reveal animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

// Contact form validation
function validateForm(e){
  e.preventDefault();
  let valid = true;
  
  const name = document.getElementById('name');
  const phone = document.getElementById('phone');
  const msg = document.getElementById('message');
  
  document.querySelectorAll('.error').forEach(er => er.style.display = 'none');
  
  if(name.value.trim().length < 3){
    document.getElementById('nameError').style.display = 'block';
    valid = false;
  }
  
  if(!phone.value.match(/^[+]?[0-9\s]{9,15}$/)){
    document.getElementById('phoneError').style.display = 'block';
    valid = false;
  }
  
  if(msg.value.trim().length < 10){
    document.getElementById('msgError').style.display = 'block';
    valid = false;
  }
  
  if(valid){
    document.getElementById('success').style.display = 'block';
    e.target.reset();
    setTimeout(() => {
      document.getElementById('success').style.display = 'none';
    }, 5000);
  }
  return false;
}

// Close mobile menu when clicking nav link
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('navLinks').classList.remove('active');
    });
  });
});

function initCarousel(carouselId, prevSelector, nextSelector){
  const carousel = document.getElementById(carouselId);
  if(!carousel) return;
  const prevBtn = document.querySelector(prevSelector);
  const nextBtn = document.querySelector(nextSelector);

  const scrollDistance = () => Math.min(carousel.clientWidth * 0.9, carousel.scrollWidth);

  prevBtn?.addEventListener('click', () => {
    carousel.scrollBy({ left: -scrollDistance(), behavior: 'smooth' });
  });

  nextBtn?.addEventListener('click', () => {
    carousel.scrollBy({ left: scrollDistance(), behavior: 'smooth' });
  });
}

// WHATSAPP ORDER BUTTON
function orderWhatsApp(plan, price){
  const phone = "2547XXXXXXXX"; // REPLACE with your WhatsApp number, no + sign
  const message = `Hello Mlinzi Kids! I want to order the ${plan} plan for ${price} XAF. Please send me payment and delivery details.`;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
  initCarousel('galleryCarousel', '.gallery-prev', '.gallery-next');
});

// --- Parent tracking: pairing, simulated GPS, parent dashboard ---
(function(){
  const STORAGE_KEY = 'mlinzi_pairs';
  let currentPair = null;
  let pollIntervalId = null;

  function randCoord(){
    // Example coords around Nairobi; replace with realistic generator if needed
    const lat = (-1.286389 + (Math.random() - 0.5) * 0.01).toFixed(6);
    const lng = (36.817223 + (Math.random() - 0.5) * 0.01).toFixed(6);
    return { lat, lng };
  }

  function emitLocationToPair(pairCode){
    const coord = randCoord();
    const payload = { coord, ts: Date.now() };
    localStorage.setItem(`pair_${pairCode}`, JSON.stringify(payload));
  }

  function updateParentView(coordObj){
    const locEl = document.getElementById('lastLocation');
    const tsEl = document.getElementById('lastTimestamp');
    if(locEl) locEl.textContent = coordObj ? `${coordObj.lat}, ${coordObj.lng}` : '—';
    if(tsEl) tsEl.textContent = coordObj ? new Date(coordObj.ts || Date.now()).toLocaleString() : '';
  }

  function startPolling(pairCode){
    if(pollIntervalId) clearInterval(pollIntervalId);
    pollIntervalId = setInterval(() => {
      const raw = localStorage.getItem(`pair_${pairCode}`);
      if(!raw) return;
      try{ const obj = JSON.parse(raw); updateParentView(obj.coord ? { ...obj.coord, ts: obj.ts } : null); }catch(e){}
    }, 3000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Simulate device sending location when pressed
    document.getElementById('deviceBtn')?.addEventListener('click', () => {
      let code = localStorage.getItem('lastGeneratedPair');
      if(!code){ code = Math.floor(100000 + Math.random() * 900000).toString(); localStorage.setItem('lastGeneratedPair', code); }
      emitLocationToPair(code);
      alert('Simulated SOS / location sent for device code: ' + code);
    });

    // Open parent dashboard modal
    document.getElementById('pairBtn')?.addEventListener('click', () => {
      document.getElementById('parentModal')?.classList.add('active');
    });
    document.getElementById('parentLoginLink')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('parentModal')?.classList.add('active'); });

    // Modal close
    document.getElementById('modalClose')?.addEventListener('click', () => { document.getElementById('parentModal')?.classList.remove('active'); });

    // Generate pairing code for device (demo)
    document.getElementById('generatePair')?.addEventListener('click', () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      document.getElementById('pairCodeDisplay').textContent = code;
      localStorage.setItem('lastGeneratedPair', code);
    });

    // Parent links to device/pairs
    document.getElementById('pairSubmit')?.addEventListener('click', () => {
      const name = (document.getElementById('parentName')?.value || '').trim();
      const code = (document.getElementById('parentCode')?.value || localStorage.getItem('lastGeneratedPair') || '').trim();
      if(!name || !code){ return alert('Enter parent name and pairing code (or generate one).'); }
      currentPair = code;
      const pairs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      pairs[code] = { name, linkedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs));

      document.getElementById('parentGreeting').textContent = `Hello, ${name}`;
      document.getElementById('pairArea').style.display = 'none';
      document.getElementById('parentView').style.display = 'block';

      // show existing last location
      const raw = localStorage.getItem(`pair_${code}`);
      if(raw){ try{ const obj = JSON.parse(raw); updateParentView(obj.coord ? { ...obj.coord, ts: obj.ts } : null); }catch(e){} }
      startPolling(code);
    });

    // Unpair
    document.getElementById('unpair')?.addEventListener('click', () => {
      if(!currentPair) return;
      const pairs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      delete pairs[currentPair];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs));
      currentPair = null;
      if(pollIntervalId) clearInterval(pollIntervalId);
      document.getElementById('pairArea').style.display = 'block';
      document.getElementById('parentView').style.display = 'none';
      alert('Device unlinked.');
    });

    // If there is a generated code from earlier, show it
    const initCode = localStorage.getItem('lastGeneratedPair');
    if(initCode) document.getElementById('pairCodeDisplay') && (document.getElementById('pairCodeDisplay').textContent = initCode);

  });
})();