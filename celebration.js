// celebration.js - Upgraded Balloon & Lantern Animation System
(function() {
  console.log('🎉 Celebration.js loading...');

  // ===== INJECT STYLES FOR REALISTIC BALLOONS =====
  const style = document.createElement('style');
  style.innerHTML = `
    .float-object {
      position: absolute;
      transform-origin: bottom center;
      z-index: 10;
    }
    .balloon-obj {
      border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
      box-shadow: inset -5px -5px 10px rgba(0,0,0,0.2), inset 5px 5px 10px rgba(255,255,255,0.4);
    }
    .balloon-obj::after {
      content: '';
      position: absolute;
      bottom: -30px;
      left: 50%;
      width: 1px;
      height: 30px;
      background: rgba(255, 255, 255, 0.6);
    }
    .lantern-obj {
      border-radius: 10px 10px 15px 15px;
      box-shadow: 0 0 20px rgba(247, 207, 124, 0.8), inset 0 -10px 20px rgba(229, 161, 65, 0.9);
      animation: flicker 2s infinite alternate;
    }
    @keyframes flicker {
      0% { box-shadow: 0 0 15px rgba(247, 207, 124, 0.6), inset 0 -10px 20px rgba(229, 161, 65, 0.9); }
      100% { box-shadow: 0 0 25px rgba(247, 207, 124, 1), inset 0 -5px 15px rgba(229, 161, 65, 0.7); }
    }
  `;
  document.head.appendChild(style);

  // ===== TEXT POINT GENERATION =====
  function generateTextPoints() {
    const canvas = document.createElement('canvas');
    // 1. Increased the canvas width from 900 to 1400 to fit the long text
    canvas.width = 1000; 
    canvas.height = 400;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    ctx.fillStyle = '#ffffff';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2. Tweaked the font size slightly so it fits beautifully
    ctx.font = 'bold 110px Arial'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 3. Adjusted the Y-spacing so the two lines aren't too squished
    ctx.fillText('HAPPY BIRTHDAY', canvas.width / 2, canvas.height / 2 - 80);
    ctx.fillText('ATHAYYA', canvas.width / 2, canvas.height / 2 + 80);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const points = [];
    
    // 4. Increased step to 12 to balance out the larger canvas size
    // This keeps the balloon count manageable so it doesn't lag
    const step = 11; 
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const index = (y * canvas.width + x) * 4;
        const alpha = data[index + 3];
        
        if (alpha > 200) {
          points.push({
            x: (x / canvas.width) * 100,
            y: (y / canvas.height) * 100 
          });
        }
      }
    }
    
    console.log(`✅ Generated ${points.length} text points`);
    return points;
  }
  // ===== UTILITY FUNCTIONS =====
  function shuffleArray(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // ===== STATE MANAGEMENT =====
  const state = {
    textPoints: [],
    textPointIndex: 0,
    activeObjects: [],
    animationInterval: null,
    isAnimating: false
  };

  const elements = {
    lanternBtn: document.getElementById('lanternButton'),
    secondPage: document.getElementById('lantern-page'),
    closeBtn: document.getElementById('closeLanternPage'),
    container: document.getElementById('floatingObjectsContainer')
  };

  // ===== CREATE FLOATING OBJECT =====
  function createBalloon(targetX, targetY, isLantern = false, isTextForming = false) {
    if (!elements.container) return;

    const el = document.createElement('div');
    el.className = 'float-object ' + (isLantern ? 'lantern-obj' : 'balloon-obj');
    
    if (isLantern) {
      el.style.background = 'linear-gradient(145deg, #f7cf7c, #e5a141)';
    } else {
      const hue = Math.floor(Math.random() * 360);
      el.style.background = `linear-gradient(135deg, hsl(${hue}, 90%, 65%), hsl(${hue}, 85%, 50%))`;
    }

    const scale = isLantern ? (0.4 + Math.random() * 0.3) : (0.5 + Math.random() * 0.4);
    el.style.width = (45 * scale) + 'px';
    el.style.height = (isLantern ? 60 * scale : 65 * scale) + 'px';

    // Start slightly below the screen
    el.style.left = targetX + '%';
    el.style.top = '110%'; 

    elements.container.appendChild(el);
    state.activeObjects.push(el);

    // Timeline for coordinated animation
    const tl = gsap.timeline({
      onComplete: () => {
        el.remove();
        const idx = state.activeObjects.indexOf(el);
        if (idx > -1) state.activeObjects.splice(idx, 1);
      }
    });

    if (isTextForming) {
      // Phase 1: Fly up and form the word (Hold for a few seconds)
      tl.to(el, {
        top: targetY + '%',
        left: targetX + '%',
        duration: 2.5 + Math.random() * 1.5,
        ease: 'back.out(1.2)'
      })
      // Phase 2: Hold position to make text readable
      .to(el, {
        top: targetY - 2 + '%', // Slight float while holding
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1
      })
      // Phase 3: Float away off-screen
      .to(el, {
        top: '-20%',
        left: targetX + (Math.random() * 10 - 5) + '%',
        opacity: 0,
        duration: 4 + Math.random() * 3,
        ease: 'power1.in'
      });
    } else {
      // Random background balloons/lanterns float straight up and away
      tl.to(el, {
        top: '-20%',
        left: targetX + (Math.random() * 15 - 7.5) + '%',
        opacity: 0,
        duration: 8 + Math.random() * 5,
        ease: 'none'
      });
    }

    // Gentle sway/rotation
    gsap.to(el, {
      rotation: Math.random() * 10 - 5,
      duration: 2 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  // ===== START BALLOON ANIMATION =====
  function startBalloons() {
    if (state.isAnimating) return;
    state.isAnimating = true;

    state.textPoints = shuffleArray(generateTextPoints());
    state.textPointIndex = 0;

    // Burst to form the text
    console.log(`💥 Creating text burst of ${state.textPoints.length} balloons`);
    state.textPoints.forEach(point => {
      createBalloon(point.x, point.y, false, true);
    });

    // Continuous random spawning in background
    if (state.animationInterval) clearInterval(state.animationInterval);
    state.animationInterval = setInterval(() => {
      if (!state.isAnimating) return;
      const randomX = 5 + Math.random() * 90;
      const isLantern = Math.random() > 0.5;
      // Background items don't have a target Y, they just float up
      createBalloon(randomX, -10, isLantern, false); 
    }, 400);
  }

  // ===== STOP BALLOON ANIMATION =====
  function stopBalloons() {
    state.isAnimating = false;
    if (state.animationInterval) {
      clearInterval(state.animationInterval);
      state.animationInterval = null;
    }
    
    state.activeObjects.forEach(obj => {
      gsap.killTweensOf(obj);
      obj.remove();
    });
    state.activeObjects = [];
  }

  // ===== PAGE TRANSITIONS =====
  function openCelebration() {
    elements.secondPage.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Add twinkling stars to celebration page
    const starsContainer = document.getElementById('celebrationStars');
    if (starsContainer) {
      starsContainer.innerHTML = ''; // Clear old stars
      for (let i = 0; i < 60; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.position = 'absolute';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = (Math.random() * 4 + 2) + 'px';
        star.style.height = star.style.width;
        star.style.background = 'white';
        star.style.borderRadius = '50%';
        star.style.boxShadow = '0 0 8px rgba(255,255,255,0.8)';
        star.style.animation = `twink ${3 + Math.random() * 4}s infinite`;
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
      }
    }

    // Play sound (Wrapped in interaction check to prevent browser blocking)
    try {
      const sound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-magic-spell-2964.mp3');
      sound.volume = 0.4;
      sound.play().catch(e => console.log('Audio autoplay prevented'));
    } catch (e) {}

    setTimeout(startBalloons, 300);

    // Show the headline text after balloons form the shape (~4.5 seconds)
    setTimeout(() => {
      const headline = document.getElementById('celebrateHeadline');
      if (headline) {
        headline.style.opacity = '1';
        console.log('✨ Text revealed after balloon transition!');
      }
    }, 4500);
  }

  function closeCelebration() {
    elements.secondPage.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Hide headline text again
    const headline = document.getElementById('celebrateHeadline');
    if (headline) {
      headline.style.opacity = '0';
    }
    
    stopBalloons();
  }

  // ===== EVENT LISTENERS =====
  if (elements.lanternBtn) elements.lanternBtn.addEventListener('click', openCelebration);
  if (elements.closeBtn) elements.closeBtn.addEventListener('click', closeCelebration);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.secondPage.style.display === 'flex') {
      closeCelebration();
    }
  });

  // ===== INITIALIZATION =====
  if (elements.secondPage) elements.secondPage.style.display = 'none';
  if (elements.container) {
    elements.container.style.position = 'relative';
    elements.container.style.width = '100vw';
    elements.container.style.height = '100vh';
    elements.container.style.overflow = 'hidden';
    elements.container.style.backgroundColor = '#1a1a2e'; // Added a nice night-sky background
  }
})();