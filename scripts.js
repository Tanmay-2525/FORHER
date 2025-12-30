// Shared scripts for page transitions, particles, gallery reveals, and small animations.
// Author: Generated for a romantic New Year interactive site.
// Notes/TODOs are embedded below for easy customization.

/* ============================
   UTILITY: DOM helpers
   ============================ */
const q = (s, el=document) => el.querySelector(s);
const qa = (s, el=document) => Array.from(el.querySelectorAll(s));

/* ============================
   PAGE TRANSITIONS
   - Intercepts internal links with the .js-link class and plays an animation
   - Then navigates to the target page (simple fade/scale)
   ============================ */
document.addEventListener('click', (e) => {
  const link = e.target.closest('.js-link');
  if (!link) return;
  const target = link.dataset.target || link.getAttribute('href');
  if (!target || target.startsWith('#')) return; // allow anchors

  e.preventDefault();

  // play small animation (scale out) on body
  document.body.style.transition = 'opacity .42s ease, transform .42s ease';
  document.body.style.opacity = 0;
  document.body.style.transform = 'scale(.98)';

  // after animation navigate
  setTimeout(() => {
   window.location.href = "gallery.html";
  }, 420);
});

/* ============================
   PARTICLES: floating hearts and sparkles
   - Creates decorative floating elements (no heavy performance cost)
   - Configurable count and size
   ============================ */
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  container.innerHTML = ''; // clear

  const colors = ['#FFD1E6', '#FFE0F0', '#FFF2D8', '#FFE9F2', '#FFECF5'];
  const emojis = ['💖','💗','✨','🎆','🌸'];
  const count = Math.min(20, Math.max(8, Math.floor(window.innerWidth / 120)));

  for (let i=0;i<count;i++){
    const span = document.createElement('span');
    span.className = 'particle';
    span.style.position = 'absolute';
    // random position
    span.style.left = `${Math.random()*100}%`;
    span.style.top = `${Math.random()*80}%`;
    span.style.fontSize = `${10 + Math.random()*28}px`;
    span.style.opacity = 0.85 - Math.random()*0.5;
    span.style.pointerEvents = 'none';
    span.style.transform = `translateY(${Math.random()*8}px)`;
    span.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    // animate float
    span.animate([
      { transform:`translateY(0)`, opacity: span.style.opacity },
      { transform:`translateY(-18px)`, opacity: Math.max(0.3, +span.style.opacity - 0.2) },
      { transform:`translateY(0)`, opacity: span.style.opacity }
    ], {
      duration: 3000 + Math.random()*4000,
      iterations: Infinity,
      direction: 'alternate',
      easing: 'ease-in-out',
      delay: Math.random()*1000
    });
    container.appendChild(span);
  }
}

/* ============================
   GALLERY: Reveal images on load / intersection
   - Adds .is-visible to .reveal elements when in viewport
   - Also handles simple hover heart overlay (CSS handles visual)
   ============================ */
function setupGalleryReveal(){
  const reveals = qa('.reveal');
  if (!reveals.length) return;

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => obs.observe(el));
}

/* ============================
   NOTES: Pop-in bounce animation for each note
   ============================ */
function animateNotes(){
  const notes = qa('.note--pop');
  if (!notes.length) return;

  notes.forEach((note, i) => {
    setTimeout(()=> {
      note.style.transform = '';
      note.style.opacity = '1';
      // warm bounce via small anime.js if available
      if (window.anime) {
        anime({
          targets: note,
          translateY: [-10,0],
          scale: [0.98,1],
          duration: 700,
          easing: 'spring(1, 80, 10, 0)'
        });
      }
    }, 160 + i * 120);
  });
}

/* ============================
   FINAL MESSAGE: typing effect
   - Reads innerText from #personalMessage element and animates
   - If the element is edited (contenteditable), user can update and re-run
   ============================ */
function typingEffect(target, opts={}) {
  const el = typeof target === 'string' ? q(target) : target;
  if (!el) return;
  const text = el.textContent.trim() || 'Your personal message goes here...'; // placeholder
  el.textContent = ''; // clear for typing

  let cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  cursor.textContent = '▌';
  cursor.style.display = 'inline-block';
  cursor.style.marginLeft = '6px';
  cursor.style.opacity = '1';
  el.parentNode && el.parentNode.appendChild(cursor);

  let i = 0;
  const speed = opts.speed || 36;
  const timer = setInterval(() => {
    if (i >= text.length) {
      clearInterval(timer);
      // fade out cursor
      cursor.animate([{opacity:1},{opacity:0}],{duration:500,fill:'forwards'});
      setTimeout(()=> cursor.remove(), 700);
      return;
    }
    el.textContent += text[i++];
  }, speed);
  return () => {
    clearInterval(timer);
    cursor.remove();
  };
}

/* ============================
   Small helpers: auto-run behaviours on pages
   ============================ */
document.addEventListener('DOMContentLoaded', () => {
  // Particle decorations
  createParticles();
  window.addEventListener('resize', () => {
    // rebuild on resize for better distribution (cheap)
    createParticles();
  });

  // gallery reveal
  setupGalleryReveal();

  // notes animation
  animateNotes();

  // If on final page, add event to reveal button
  const revealBtn = q('#revealBtn');
  if (revealBtn) {
    revealBtn.addEventListener('click', () => {
      // take a snapshot of current message and animate
      const pm = q('#personalMessage');
      if (!pm) return;
      // TODO: If you prefer fade-in instead of typing, replace this with a fade animation
      typingEffect(pm, {speed: 28});
      // small heart burst animation on the big heart (if anime.js present)
      const bigHeart = q('.big-heart');
      if (bigHeart && window.anime) {
        anime({
          targets: bigHeart,
          scale: [1,1.18,1],
          duration: 1200,
          easing: 'easeInOutQuad'
        });
      }
    }, {once:true});
  }

  // If on any page that has clickable images or captions, enable double-click to edit hint
  qa('figure.photo figcaption').forEach(c => {
    c.addEventListener('dblclick', () => c.focus());
  });

  // On landing page, small heading entrance using anime.js if available
  const heading = q('#landingHeading');
  if (heading && window.anime) {
    anime.timeline()
      .add({
        targets: heading,
        translateY: [-18,0],
        opacity: [0,1],
        duration: 900,
        easing: 'easeOutExpo'
      })
      .add({
        targets: '.emoji',
        scale: [0.8,1.06],
        duration: 800,
        easing: 'easeOutElastic(1, .6)'
      }, '-=500');
  } else if (heading) {
    heading.style.opacity = 1;
  }
});

/* ============================
   END OF FILE
   ============================ */

/* Developer TODOs (quick list)
   - Replace placeholder images in gallery.html with your photos.
   - Edit captions and notes inline or in the HTML files (figcaption and .note elements).
   - Edit final message: open final.html and replace text inside div#personalMessage.
   - Optionally tweak animation speeds in assets/scripts.js (typingEffect).
*/
/* ===== Final page auto typing ===== */

/* ===== Final page auto typing (spacing-safe) ===== */

document.addEventListener("DOMContentLoaded", () => {
  const msg = document.getElementById("personalMessage");
  if (!msg) return;

  const originalHTML = msg.innerHTML;
  msg.innerHTML = "";

  let i = 0;
  const speed = 40;

  function typeWriter() {
    if (i < originalHTML.length) {
      msg.innerHTML += originalHTML.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  }

  setTimeout(typeWriter, 1200);
});
/* ===== Voice Notes Play Animations ===== */

document.addEventListener("DOMContentLoaded", () => {
  const voiceCards = document.querySelectorAll(".voice-card");

  voiceCards.forEach(card => {
    const audio = card.querySelector("audio");
    if (!audio) return;

    audio.addEventListener("play", () => {
      // Stop others
      voiceCards.forEach(c => {
        if (c !== card) {
          c.classList.remove("playing");
          const otherAudio = c.querySelector("audio");
          if (otherAudio && !otherAudio.paused) {
            otherAudio.pause();
          }
        }
      });

      card.classList.add("playing");
    });

    audio.addEventListener("pause", () => {
      card.classList.remove("playing");
    });

    audio.addEventListener("ended", () => {
      card.classList.remove("playing");
    });
  });
});
/* ===== Voice Notes: Advanced Interactions ===== */

document.addEventListener("DOMContentLoaded", () => {
  const voiceCards = document.querySelectorAll(".voice-card");
  const page = document.querySelector(".page--voice");

  voiceCards.forEach(card => {
    const audio = card.querySelector("audio");
    if (!audio) return;

    audio.addEventListener("play", () => {
      // Stop others
      voiceCards.forEach(c => {
        if (c !== card) {
          c.classList.remove("playing");
          const otherAudio = c.querySelector("audio");
          if (otherAudio && !otherAudio.paused) {
            otherAudio.pause();
          }
        }
      });

      card.classList.add("playing");
      page.classList.add("playing-focus");
    });

    audio.addEventListener("pause", () => {
      card.classList.remove("playing");
      if (![...voiceCards].some(c => c.classList.contains("playing"))) {
        page.classList.remove("playing-focus");
      }
    });

    audio.addEventListener("ended", () => {
      card.classList.remove("playing");
      page.classList.remove("playing-focus");
    });
  });
});
/* ============================= */
/* Things I Miss – Scroll Anim  */
/* ============================= */

document.addEventListener("DOMContentLoaded", () => {
  const animatedItems = document.querySelectorAll(".fade-up");

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    },
    {
      threshold: 0.2
    }
  );

  animatedItems.forEach(item => observer.observe(item));
});
