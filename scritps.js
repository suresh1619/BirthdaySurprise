window.addEventListener('DOMContentLoaded', () => {
  const mediaElements = [
    document.getElementById('violinMusic'),
    document.getElementById('loveMusic'),
    document.getElementById('scaryVideo'),
    document.getElementById('reelVideo') 
  ];
  mediaElements.forEach(media => {
    if (media) {
      media.load(); 
    }
  });
});

// --- PARALLAX EFFECT ---
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 30; // Move between -15px and 15px
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  
  // Shift star layers opposite to mouse movement
  gsap.to('.star-container', { x: -x, y: -y, duration: 1, ease: 'power2.out' });
  // Shift ambient glows slightly more for 3D depth
  gsap.to('.ambient-glow', { x: -x * 1.5, y: -y * 1.5, duration: 1.5, ease: 'power2.out' });
});

window.addEventListener('deviceorientation', (e) => {
  if (!e.gamma || !e.beta) return;
  // limit tilt to reasonable ranges
  let gamma = Math.max(-45, Math.min(45, e.gamma)); 
  let beta = Math.max(-45, Math.min(45, e.beta - 45)); // assume holding phone at ~45deg
  
  const x = (gamma / 45) * 20; 
  const y = (beta / 45) * 20;
  
  gsap.to('.star-container', { x: x, y: y, duration: 0.5, ease: 'power1.out' });
  gsap.to('.ambient-glow', { x: x * 1.5, y: y * 1.5, duration: 0.8, ease: 'power1.out' });
});
// -----------------------

const surpriseBtn = document.getElementById('surpriseBtn');
const reelPopup = document.getElementById('reel-popup');
const closeReelBtn = document.getElementById('closeReelBtn');
const reelVideo = document.getElementById('reelVideo');

surpriseBtn.addEventListener('click', () => {
  reelPopup.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  const playPromise = reelVideo.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => console.error("Reel video playback prevented by browser:", error));
  }
});

closeReelBtn.addEventListener('click', () => {
  reelPopup.style.display = 'none';
  document.body.style.overflow = 'auto';
  reelVideo.pause();
  reelVideo.currentTime = 0; 
});

function createStars(containerId, count) {
  const container = document.getElementById(containerId);
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%'; star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 4 + 's';
    star.style.width = (Math.random() * 5 + 2) + 'px'; star.style.height = star.style.width;
    container.appendChild(star);
  }
}
createStars('main-stars', 150); createStars('lantern-stars', 150);

function shootStar() {
  setTimeout(shootStar, Math.random() * 5000 + 3000); 
  if (document.getElementById('lantern-page').style.display === 'flex' || 
      document.getElementById('scary-popup').style.display === 'flex' ||
      document.getElementById('reel-popup').style.display === 'flex') return; 

  const star = document.createElement('div');
  star.className = 'shooting-star';
  const startX = Math.random() * (window.innerWidth / 2) + (window.innerWidth / 4);
  const startY = Math.random() * (window.innerHeight / 3);
  const length = Math.random() * 100 + 150;
  const angle = 20 + Math.random() * 15; 
  
  star.style.left = startX + 'px'; star.style.top = startY + 'px';
  star.style.width = length + 'px'; star.style.transform = `rotate(${angle}deg)`;
  document.body.appendChild(star);
  
  gsap.fromTo(star, { opacity: 1, x: 0, y: 0, scaleX: 0 }, {
    opacity: 0, x: length * Math.cos(angle * (Math.PI / 180)) * 1.5,
    y: length * Math.sin(angle * (Math.PI / 180)) * 1.5,
    scaleX: 1, duration: 1.5 + Math.random() * 1, ease: "power2.out",
    onComplete: () => star.remove()
  });
}
setTimeout(shootStar, 2000);

const cvs = document.getElementById('interactive-canvas');
const ctx = cvs.getContext('2d');
let cw = cvs.width = window.innerWidth;
let ch = cvs.height = window.innerHeight;
let mouse = { x: null, y: null };

window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('resize', () => { cw = cvs.width = window.innerWidth; ch = cvs.height = window.innerHeight; });

const constelRatios = [ {x:0.2, y:0.2}, {x:0.35, y:0.3}, {x:0.45, y:0.2}, {x:0.6, y:0.4}, {x:0.75, y:0.25}, {x:0.8, y:0.45} ];
let fireflies = [];
for(let i=0; i<30; i++) {
    fireflies.push({
        x: Math.random() * cw, y: Math.random() * ch,
        vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1,
        size: Math.random() * 2 + 1,
        hue: Math.random() > 0.5 ? 45 : 15 
    });
}

function drawInteractiveElements() {
    ctx.clearRect(0, 0, cw, ch);
    ctx.beginPath();
    ctx.moveTo(constelRatios[0].x * cw, constelRatios[0].y * ch);
    for(let i=1; i<constelRatios.length; i++) {
        ctx.lineTo(constelRatios[i].x * cw, constelRatios[i].y * ch);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 1; ctx.stroke();
    
    constelRatios.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x * cw, p.y * ch, 2, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; ctx.fill();
    });

    fireflies.forEach(f => {
        f.x += f.vx; f.y += f.vy;
        if(f.x < 0 || f.x > cw) f.vx *= -1; if(f.y < 0 || f.y > ch) f.vy *= -1;
        if(mouse.x !== null) { let dx = mouse.x - f.x, dy = mouse.y - f.y; let dist = Math.sqrt(dx*dx + dy*dy); if(dist < 80) { f.x -= dx * 0.03; f.y -= dy * 0.03; } }
        ctx.beginPath(); ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${f.hue}, 100%, 70%, 0.8)`; 
        ctx.shadowBlur = 10; ctx.shadowColor = `hsla(${f.hue}, 100%, 60%, 1)`;
        ctx.fill(); ctx.shadowBlur = 0;
    });
    requestAnimationFrame(drawInteractiveElements);
}
drawInteractiveElements();

document.getElementById('ocean-bottom').addEventListener('click', function(e) {
  if (e.target.className === 'moon-reflection') return; 
  let ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.left = e.clientX + 'px'; ripple.style.top = e.clientY + 'px';
  document.getElementById('ocean-bottom').appendChild(ripple); 
  setTimeout(() => ripple.remove(), 1500);
});

(function() {
  const wishes = ["Happiness", "Great Health", "True Love", "Success", "puppies", "good kdramas", "Prosperity", "Mavayya", "Kindness", "music", "Laughter", "Confidence", "Grace", "Strength", "Mavayya", "Anime", "Wealth", "Creativity", "Patience", "Courage", "mavayya", "Harmonious Life", "Golden Dreams", "Smile Always", "Blessings", "Magic", "Serenity", "Brightness", "Victory", "Ambition", "Wonder", "Radiance" ];
  
  function getDisplayData() {
    if (window.innerWidth < 640) {
      return { lines: ['HAPPY', 'BIRTHDAY', 'ATHAYYA'], html: 'HAPPY<br>BIRTHDAY<br>ATHAYYA' };
    } else {
      return { lines: ['HAPPY BIRTHDAY', 'ATHAYYA'], html: 'HAPPY BIRTHDAY<br>ATHAYYA' };
    }
  }

  function getTextPoints(textArray) { 
    const canvas = document.createElement("canvas"); 
    const ctx = canvas.getContext("2d", { willReadFrequently: true }); 
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
    ctx.fillStyle = "#000"; 
    
    const fontSize = window.innerWidth < 640 ? canvas.width / 5.5 : Math.max(60, Math.min(canvas.width / 10, 120)); 
    
    ctx.font = `900 ${fontSize}px "Segoe UI", Arial, sans-serif`; 
    ctx.textAlign = "center"; 
    ctx.textBaseline = "middle"; 
    
    const lines = textArray; 
    const lineHeight = fontSize * 1.1; 
    const totalHeight = lineHeight * lines.length; 
    const centerY = (canvas.height / 2) - (totalHeight - lineHeight) / 2; 
    
    lines.forEach((line, i) => { 
      ctx.fillText(line, canvas.width / 2, centerY + i * lineHeight); 
    }); 
    
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data; 
    const points = []; 
    
    const step = window.innerWidth < 640 ? 7 : 6; 
    
    for (let y = 0; y < canvas.height; y += step) { 
      for (let x = 0; x < canvas.width; x += step) { 
        if (data[(y * canvas.width + x) * 4 + 3] > 128) { 
          points.push({ x: (x / canvas.width) * 100, y: (y / canvas.height) * 100 }); 
        } 
      } 
    } 
    return points; 
  }
  
  function shuffleArray(arr) { const array = [...arr]; for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }
  
  const state = { activeObjects: [], animationInterval: null, isAnimating: false, masterTimeline: null };
  const elements = { secondPage: document.getElementById('lantern-page'), container: document.getElementById('floatingObjectsContainer'), headline: document.getElementById('celebrateHeadline') };
  
  function launchCracker() {
    const container = elements.secondPage;
    const colors = ['#fde68a', '#f59e0b', '#fbbf24', '#facc15', '#ffffff', '#ff9999', '#99ff99', '#99ccff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const startX = window.innerWidth * 0.1 + Math.random() * (window.innerWidth * 0.8);
    const targetY = Math.random() * (window.innerHeight * 0.4) + 50; 
    
    const rocket = document.createElement('div');
    rocket.className = 'absolute z-[70] rounded-full';
    rocket.style.width = '6px'; rocket.style.height = '30px';
    rocket.style.background = `linear-gradient(to bottom, #fff, ${color}, transparent)`;
    rocket.style.boxShadow = `0 -5px 15px ${color}`;
    rocket.style.left = startX + 'px'; rocket.style.top = window.innerHeight + 'px';
    container.appendChild(rocket);

    gsap.to(rocket, {
      top: targetY, duration: 1 + Math.random() * 0.5, ease: "power1.out",
      onComplete: () => {
        rocket.remove(); blastCracker(startX, targetY, color, container);
        let ripple = document.createElement('div'); ripple.className = 'ripple';
        ripple.style.left = startX + 'px'; ripple.style.top = '20px'; ripple.style.transform = 'translate(-50%, -50%) scale(1.5)';
        document.getElementById('ocean-bottom').appendChild(ripple); setTimeout(() => ripple.remove(), 1500);
      }
    });
  }

  function blastCracker(x, y, color, container) {
    const isMobile = window.innerWidth < 640;
    const particleCount = isMobile ? 25 + Math.floor(Math.random() * 15) : 80 + Math.floor(Math.random() * 30);
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute z-[70] rounded-full';
      particle.style.width = isMobile ? '4px' : '5px'; 
      particle.style.height = isMobile ? '4px' : '5px';
      particle.style.backgroundColor = (Math.random() > 0.3 ? '#fff' : color);
      particle.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
      particle.style.left = x + 'px'; particle.style.top = y + 'px';
      container.appendChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const velocity = (isMobile ? 50 : 80) + Math.random() * (isMobile ? 120 : 200);
      gsap.to(particle, {
        x: Math.cos(angle) * velocity, y: (Math.sin(angle) * velocity) + 120, opacity: 0, scale: 0.1,
        duration: 1 + Math.random() * 1, ease: "power2.out", onComplete: () => particle.remove()
      });
    }
  }
  
  // Updated with faster text-forming speed
  function createBalloon(targetX, targetY, isLantern = false, isTextForming = false, wish = null, isTapped = false) { 
    if (!elements.container) return; 
    const el = document.createElement('div'); 
    el.className = 'float-object ' + (isLantern ? 'lantern-obj' : 'balloon-obj'); 
    
    if (!isLantern) { 
      const hue = Math.floor(Math.random() * 360); 
      el.style.background = `linear-gradient(135deg, hsl(${hue}, 90%, 65%), hsl(${hue}, 85%, 50%))`; 
    } 
    if (wish) { 
      const wishSpan = document.createElement('span'); wishSpan.className = 'wish-label'; wishSpan.innerText = wish; el.appendChild(wishSpan); 
    } 
    
    let scale; 
    if (isTextForming) { 
        scale = window.innerWidth < 640 ? 0.25 : 0.3; 
    } 
    else if (isLantern) { scale = 0.8 + Math.random() * 0.4; } 
    else { scale = 1.0 + Math.random() * 0.6; } 
    
    el.style.width = (50 * scale) + 'px'; el.style.height = (65 * scale) + 'px'; 
    el.style.left = targetX + '%'; el.style.top = isTapped ? targetY + '%' : '110%'; 
    
    elements.container.appendChild(el); state.activeObjects.push(el); 
    
    const tl = gsap.timeline({ onComplete: () => { el.remove(); }}); 
    if (isTextForming) { 
      // Sped up balloon floating time
      tl.to(el, { top: targetY + '%', left: targetX + '%', duration: 1.2 + Math.random() * 0.6, ease: 'back.out(1.2)' }) 
        .to(el, { top: targetY - 2 + '%', duration: 3, ease: 'sine.inOut', yoyo: true, repeat: 1 }) 
        .to(el, { top: '-20%', left: targetX + (Math.random() * 20 - 10) + '%', opacity: 0, duration: 4 + Math.random() * 2, ease: 'power1.in' }); 
    } else if (isTapped) { 
      tl.to(el, { top: '-20%', left: targetX + (Math.random() * 10 - 5) + '%', opacity: 0, duration: 6 + Math.random() * 3, ease: 'power1.out' }); 
    } else { 
      tl.to(el, { top: '-30%', left: targetX + (Math.random() * 20 - 10) + '%', opacity: 0, duration: 10 + Math.random() * 6, ease: 'none' }); 
    } 
    gsap.to(el, { rotation: Math.random() * 10 - 5, duration: 2 + Math.random() * 2, repeat: -1, yoyo: true, ease: 'sine.inOut' }); 
  }
  
  function startCelebrationSequence() { 
    if (state.isAnimating) return; state.isAnimating = true; 
    
    const displayData = getDisplayData();
    elements.headline.innerHTML = displayData.html;
    
    gsap.set("#celebrateHeadline", { opacity: 0 }); 
    gsap.set(".reaction-wrapper", { display: "none", opacity: 0 }); 
    gsap.set([".reactant-1", ".reactant-2", ".reactant-3", ".catalyst-text", ".arrow-head", ".product"], { opacity: 0 }); 
    gsap.set(".arrow-line", { width: 0 }); 
    
    const textPoints = shuffleArray(getTextPoints(displayData.lines)); 
    textPoints.forEach(point => createBalloon(point.x, point.y, false, true));
    
    if (state.animationInterval) clearInterval(state.animationInterval); 
    state.animationInterval = setInterval(() => { 
      if (!state.isAnimating) return; 
      createBalloon(5 + Math.random() * 90, -10, Math.random() > 0.5, false); 
    }, 800); 
    
    state.masterTimeline = gsap.timeline(); 
    state.masterTimeline 
      // Fade in slowly exactly after 0.5s instead of 7s
      .to("#celebrateHeadline", { opacity: 1, duration: 1.5, ease: "power2.inOut", delay: 0.5 }) 
      .to("#celebrateHeadline", { opacity: 0, duration: 1.5, ease: "power2.inOut", delay: 3 }) 
      
      .set(".reaction-wrapper", { display: "flex", opacity: 1 }) 
      .fromTo(".reactant-1", { scale: 0.5, opacity: 0, rotation: -15 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: "back.out(1.5)" }) 
      .fromTo(".reactant-2", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }, "+=0.2") 
      .fromTo(".reactant-3", { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "+=0.2") 
      .fromTo(".catalyst-text", { y: -20, opacity: 0, filter: "blur(5px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power2.out" }, "+=0.4") 
      
      .to(".arrow-line", { width: window.innerWidth < 768 ? "70px" : "140px", duration: 1.2, ease: "power2.inOut" }) 
      .fromTo(".arrow-head", { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, "-=0.3") 
      
      .fromTo(".product", { scale: 0.2, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 1.5, ease: "elastic.out(1, 0.4)" }, "+=0.4") 
      
      .call(() => {
          let fwCount = 0;
          const isMobile = window.innerWidth < 640;
          const fwInterval = setInterval(() => {
            launchCracker(); 
            if (!isMobile && Math.random() > 0.3) launchCracker(); 
            fwCount++; 
            if (fwCount > (isMobile ? 5 : 10)) clearInterval(fwInterval);
          }, isMobile ? 600 : 350);
      })
      
      .to(".reaction-wrapper", { y: -15, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" }, "+=0.5"); 
  }
  
  function stopEverything() { 
    state.isAnimating = false; 
    if (state.animationInterval) clearInterval(state.animationInterval); state.animationInterval = null; 
    if (state.masterTimeline) state.masterTimeline.kill(); 
    state.activeObjects.forEach(obj => { gsap.killTweensOf(obj); obj.remove(); }); 
    state.activeObjects = []; 
  }
  
  let hasBeenPranked = false;

  function triggerRealCelebration() {
    elements.secondPage.style.display = 'flex'; 
    document.body.style.overflow = 'hidden'; 
    
    const violinMusic = document.getElementById('violinMusic'); 
    const loveMusic = document.getElementById('loveMusic'); 
    
    violinMusic.currentTime = 0; 
    loveMusic.currentTime = 0; 
    
    const playPromise = violinMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Audio playback failed. Please verify that 'music/oy_violin_bgm.mp3' exists in your directory.", error);
      });
    }
    
    violinMusic.onended = () => { 
      loveMusic.play().catch(e => console.error("Love music failed to play:", e)); 
    }; 
    
    setTimeout(startCelebrationSequence, 300);
  }

  document.getElementById('lanternButton').addEventListener('click', () => { 
    if (!hasBeenPranked) {
      const scaryPopup = document.getElementById('scary-popup');
      const scaryVideo = document.getElementById('scaryVideo');
      scaryPopup.style.display = 'flex'; document.body.style.overflow = 'hidden';
      scaryVideo.play();
    } else {
      triggerRealCelebration();
    }
  });

  document.getElementById('tryAgainBtn').addEventListener('click', () => {
    hasBeenPranked = true; 
    const scaryPopup = document.getElementById('scary-popup');
    const scaryVideo = document.getElementById('scaryVideo');
    scaryVideo.pause(); scaryVideo.currentTime = 0;
    scaryPopup.style.display = 'none';
    triggerRealCelebration();
  });

  let lastTapTime = 0;
  
  function releaseWishLantern(e) { 
    if (e.target.id === 'closeLanternPage') return; 

    const currentTime = new Date().getTime();
    if (currentTime - lastTapTime < 300) return;
    lastTapTime = currentTime;

    let clientX = e.clientX;
    let clientY = e.clientY;
    
    if (e.type === 'touchstart') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    const x = (clientX / window.innerWidth) * 100; 
    const y = (clientY / window.innerHeight) * 100; 
    const wishText = wishes[Math.floor(Math.random() * wishes.length)]; 
    
    createBalloon(x, y, true, false, wishText, true); 
  }

  elements.secondPage.addEventListener('click', releaseWishLantern);
  elements.secondPage.addEventListener('touchstart', (e) => {
      if (e.target.id !== 'closeLanternPage') {
          e.preventDefault(); 
      }
      releaseWishLantern(e);
  }, { passive: false });
  
  document.getElementById('closeLanternPage').addEventListener('click', () => { 
    const violinMusic = document.getElementById('violinMusic'); const loveMusic = document.getElementById('loveMusic'); 
    violinMusic.pause(); loveMusic.pause(); 
    elements.secondPage.style.display = 'none'; document.body.style.overflow = 'auto'; 
    stopEverything(); 
  });
  
  window.addEventListener('keydown', (e) => { 
    if (e.key === 'Escape' && elements.secondPage.style.display === 'flex') { 
      const violinMusic = document.getElementById('violinMusic'); const loveMusic = document.getElementById('loveMusic'); 
      violinMusic.pause(); loveMusic.pause(); 
      elements.secondPage.style.display = 'none'; document.body.style.overflow = 'auto'; 
      stopEverything(); 
    }
  });
})();