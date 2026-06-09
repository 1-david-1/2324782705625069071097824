    const body = document.body;
    const nav = document.getElementById('nav');
    const mobMenu = document.getElementById('mobMenu');
    const ham = document.getElementById('ham');
            const pageWipe = document.getElementById('pageWipe');
    const preloader = document.getElementById('preloader');
    const scrollProgress = document.getElementById('scrollProgress');
    const scrollProgressFill = document.getElementById('scrollProgressFill');
    const toastStack = document.getElementById('toastStack');
    const homeStats = document.getElementById('homeStats');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
    const scrollHeavyPages = new Set(['home', 'tips', 'process']);
    const FORMSPREE_ID = 'xvzveqvz';
    const SITE_CONFIG = {
      email: 'david@inbox-elevate.de',
      linkedin: 'https://www.linkedin.com/company/inboxelevate/'
    };
    const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const tipsCats = ['Alle', 'Webseite', 'Google Ads', 'Meta Ads', 'Kein Budget'];
    const HERO_TYPEWRITER_TERMS = [
      'Sicherheitsunternehmen',
      'Wachdienstleister',
      'Alarmanlagen-Anbieter',
      'Objektschutz-Firmen'
    ];

    let tipsActive = 'Alle';
    let reducedMotion = motionQuery.matches;
        let revealObserver;
    let scrambleObserver;
    let counterObserver;
    let countersRun = false;
    let scrollTarget = window.scrollY || 0;
    let scrollCurrent = window.scrollY || 0;
    let smoothScrollEnabled = false;
    let smoothRaf = 0;
    let isNavigating = false;
    let heroPrepared = false;
    let typewriterTimeout = 0;
    let smoothBindingsReady = false;
    const submitBtnHtml = document.getElementById('submitBtn') ? document.getElementById('submitBtn').innerHTML : '';

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function getScrollMax() {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }

    function handleKeyAction(event, callback) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        callback();
      }
    }

    function getFooterHTML() {
      return `
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="#" onclick="navigate('home');return false;" class="logo" style="color:var(--cream);">
              <svg viewBox="0 0 40 40" width="26" fill="none">
                <path d="M8 32L34 8M34 8L14 6M34 8L32 28" stroke="#1dba6e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M34 8L20 22" stroke="#1dba6e" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M20 22L18 32L23 26" stroke="#1dba6e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              InboxElevate
            </a>
            <p>Mehr Anfragen. Mehr Bewerbungen. Spezialisiert auf Sicherheitsunternehmen.</p>
          </div>
          <div class="footer-col">
            <h5>Navigation</h5>
            <a href="#" onclick="navigate('home');return false;">Start</a>
            <a href="#" onclick="openLeistungenModal();return false;">Leistungen</a>
            <a href="#" onclick="navigate('process');return false;">Prozess</a>
            <a href="#" onclick="navigate('about');return false;">Über uns</a>
            <a href="#" onclick="navigate('tips');return false;">Tipps</a>
          </div>
          <div class="footer-col">
            <h5>Leistungen</h5>
            <a href="#" onclick="showService('web');return false;">Webentwicklung</a>
            <a href="#" onclick="showService('meta');return false;">Paid Ads</a>
            <a href="#" onclick="navigate('ki');return false;">KI im Unternehmen</a>
            <a href="#" onclick="showService('linkedin');return false;">LinkedIn Ads</a>
          </div>
          <div class="footer-col">
            <h5>Kontakt</h5>
            <a href="mailto:${SITE_CONFIG.email}">${SITE_CONFIG.email}</a>
            <a href="#" onclick="goToKontakt();return false;">Anfrage stellen</a>
            <a href="#" onclick="navigate('datenschutz');return false;">Datenschutz</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 InboxElevate. Alle Rechte vorbehalten.</p>
          <div class="socials">
            <a href="${SITE_CONFIG.linkedin}" target="_blank" rel="noopener noreferrer" class="soc">in</a>
            <a href="mailto:${SITE_CONFIG.email}" class="soc">✉</a>
          </div>
        </div>`;
    }

    function injectFooters() {
      document.querySelectorAll('[data-site-footer]').forEach(el => {
        el.innerHTML = getFooterHTML();
      });
          }

          navigate('contact');
      setTimeout(() => {
        const el = document.getElementById('kontakt');
        if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
      }, 500);
    }

    function openLeistungenModal() {
      const modal = document.getElementById('leistungenModal');
      if (modal) modal.classList.add('open');
    }

    function closeLeistungenModal() {
      const modal = document.getElementById('leistungenModal');
      if (modal) modal.classList.remove('open');
    }

    function initStickyMobileCta() {
      const bar = document.getElementById('stickyMobileCta');
      if (!bar) return;
      body.classList.add('has-sticky-cta');
      const onScroll = () => {
        const show = window.innerWidth <= 768 && window.scrollY > 320 && currentPage !== 'contact';
        bar.classList.toggle('visible', show);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();
    }

    function showToast(title, message, type = 'success') {
      if (!toastStack) return;
      const toast = document.createElement('div');
      toast.className = `toast ${type === 'error' ? 'error' : ''}`.trim();
      toast.innerHTML = `<div class="toast-title">${title}</div><p>${message}</p>`;
      toastStack.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('show'));
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 320);
      }, 4000);
    }

    
    function bindCursorHover(root = document) {
      if (!useCustomCursor) return;
      root.querySelectorAll('a,button,.services-nav-item,[role="button"]').forEach(el => {
        if (el.dataset.cursorBound === 'true') return;
        el.dataset.cursorBound = 'true';
        el.addEventListener('mouseenter', () => {
          cur.style.transform = 'scale(2.2)';
          ring.style.opacity = '0';
        });
        el.addEventListener('mouseleave', () => {
          cur.style.transform = 'scale(1)';
          ring.style.opacity = '.5';
        });
      });
    }

    
    
    function updateScrollChrome() {
      const y = window.scrollY || 0;
      nav.classList.toggle('nav-shrink', y > 80);
      const visible = scrollHeavyPages.has(currentPage) && getScrollMax() > 240;
      scrollProgress.classList.toggle('visible', visible);
      const progress = visible ? clamp(y / Math.max(getScrollMax(), 1), 0, 1) : 0;
      scrollProgressFill.style.width = `${progress * 100}%`;
    }

    function syncScrollTarget() {
      scrollCurrent = window.scrollY || 0;
      scrollTarget = scrollCurrent;
      updateScrollChrome();
    }

    function smoothStep() {
      scrollCurrent += (scrollTarget - scrollCurrent) * 0.08;
      if (Math.abs(scrollTarget - scrollCurrent) < 0.4) {
        scrollCurrent = scrollTarget;
      }
      window.scrollTo(0, scrollCurrent);
      updateScrollChrome();
      if (Math.abs(scrollTarget - scrollCurrent) >= 0.4) {
        smoothRaf = requestAnimationFrame(smoothStep);
      } else {
        smoothRaf = 0;
      }
    }

    function requestSmoothScroll() {
      if (!smoothRaf) {
        smoothRaf = requestAnimationFrame(smoothStep);
      }
    }

    function scrollPageTo(y, instant = false) {
      const nextY = clamp(y, 0, getScrollMax());
      if (!smoothScrollEnabled || instant || reducedMotion) {
        window.scrollTo(0, nextY);
        syncScrollTarget();
        return;
      }
      scrollTarget = nextY;
      requestSmoothScroll();
    }

    function initSmoothScroll() {
      smoothScrollEnabled = !reducedMotion && !coarsePointerQuery.matches && window.innerWidth > 900;
      if (!smoothBindingsReady) {
        smoothBindingsReady = true;
        window.addEventListener('wheel', event => {
          if (!smoothScrollEnabled) return;
          event.preventDefault();
          scrollTarget = clamp(scrollTarget + event.deltaY, 0, getScrollMax());
          requestSmoothScroll();
        }, { passive: false });

        window.addEventListener('keydown', event => {
          if (!smoothScrollEnabled) return;
          const tag = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : '';
          if (['input', 'textarea', 'select', 'button'].includes(tag) || event.metaKey || event.ctrlKey || event.altKey) return;
          const map = {
            ArrowDown: 100,
            ArrowUp: -100,
            PageDown: window.innerHeight * 0.9,
            PageUp: -window.innerHeight * 0.9,
            ' ': window.innerHeight * 0.9
          };
          if (event.key === 'Home') {
            event.preventDefault();
            scrollPageTo(0);
            return;
          }
          if (event.key === 'End') {
            event.preventDefault();
            scrollPageTo(getScrollMax());
            return;
          }
          if (map[event.key] != null) {
            event.preventDefault();
            const delta = event.shiftKey && event.key === ' ' ? -window.innerHeight * 0.9 : map[event.key];
            scrollTarget = clamp(scrollTarget + delta, 0, getScrollMax());
            requestSmoothScroll();
          }
        });
      }
      if (!smoothScrollEnabled) {
        cancelAnimationFrame(smoothRaf);
        smoothRaf = 0;
        syncScrollTarget();
        return;
      }
    }

    function runPageWipe(callback) {
      if (reducedMotion || !pageWipe) {
        callback();
        return Promise.resolve();
      }
      return new Promise(resolve => {
        pageWipe.style.transition = 'transform 350ms cubic-bezier(.22,1,.36,1)';
        pageWipe.style.transform = 'translateX(0)';
        setTimeout(() => {
          callback();
          pageWipe.style.transition = 'transform 250ms cubic-bezier(.22,1,.36,1)';
          pageWipe.style.transform = 'translateX(100%)';
          setTimeout(() => {
            pageWipe.style.transition = 'none';
            pageWipe.style.transform = 'translateX(-100%)';
            resolve();
          }, 250);
        }, 350);
      });
    }

    
    function showAdsTab(id, btn) {
      ['meta', 'google', 'linkedin'].forEach(key => {
        const panel = document.getElementById(`svc-${key}`);
        if (panel) panel.classList.remove('active');
      });
      document.querySelectorAll('#adsTabs .svc-cat-tab').forEach(tab => tab.classList.remove('active'));
      const activePanel = document.getElementById(`svc-${id}`);
      if (activePanel) activePanel.classList.add('active');
      if (btn) btn.classList.add('active');
    }

          navigate(page);
    }

          navigate('services');
      const adsMap = { meta: 'meta', google: 'google', linkedin: 'linkedin' };
      if (adsMap[id]) {
        setTimeout(() => {
          const btn = document.querySelector(`#adsTabs .svc-cat-tab[onclick*="${id}"]`);
          showAdsTab(id, btn);
        }, 120);
      }
    }

    function toggleFaq(button) {
      const card = button.closest('.faq-card');
      const open = card.classList.contains('open');
      const scope = card.closest('.faq-col, .home-faq-list') || card.parentElement;
      scope.querySelectorAll('.faq-card').forEach(item => item.classList.remove('open'));
      if (!open) card.classList.add('open');
    }

    function toggleMob(force) {
      const shouldOpen = typeof force === 'boolean' ? force : !ham.classList.contains('open');
      ham.classList.toggle('open', shouldOpen);
      mobMenu.classList.toggle('open', shouldOpen);
    }

    async function submitForm(event) {
      event.preventDefault();
      const form = document.getElementById('contactForm');
      const btn = document.getElementById('submitBtn');
      btn.disabled = true;
      btn.textContent = 'Wird gesendet...';
      const data = new FormData(form);

      try {
        const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('server-error');
        document.getElementById('cForm').style.display = 'none';
        document.getElementById('cFormOk').style.display = 'block';
        showToast('Nachricht gesendet', 'Wir melden uns innerhalb von 48 Stunden mit einer ehrlichen Einschaetzung.', 'success');
      } catch (error) {
        btn.disabled = false;
        btn.innerHTML = submitBtnHtml;
        showToast('Senden fehlgeschlagen', 'Bitte schreib uns direkt an david@inbox-elevate.de oder versuche es gleich erneut.', 'error');
      }
    }

    function initReveal() {
      if (revealObserver) revealObserver.disconnect();
      if (reducedMotion) {
        document.querySelectorAll('.sr,.sr-l,.sr-r').forEach(el => el.classList.add('v'));
        return;
      }
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('v');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('.sr,.sr-l,.sr-r').forEach(el => {
        el.classList.remove('v');
        revealObserver.observe(el);
      });
    }

    function scrambleText(el) {
      if (reducedMotion || el.dataset.scrambled === 'true') {
        el.textContent = el.dataset.original || el.textContent;
        el.dataset.scrambled = 'true';
        return;
      }
      const original = el.dataset.original || el.textContent.trim();
      el.dataset.original = original;
      let frame = 0;
      const totalFrames = 18;
      const interval = setInterval(() => {
        const progress = frame / totalFrames;
        el.textContent = original.split('').map((char, index) => {
          if (char === ' ') return ' ';
          return index < progress * original.length ? original[index] : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }).join('');
        frame += 1;
        if (frame > totalFrames) {
          clearInterval(interval);
          el.textContent = original;
          el.dataset.scrambled = 'true';
        }
      }, 600 / totalFrames);
    }

    function observeScrambleTargets() {
      if (scrambleObserver) scrambleObserver.disconnect();
      const labels = document.querySelectorAll('.page-label,.hero-label');
      if (reducedMotion) {
        labels.forEach(label => {
          if (label.dataset.original) label.textContent = label.dataset.original;
          label.dataset.scrambled = 'true';
        });
        return;
      }
      scrambleObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            scrambleText(entry.target);
            scrambleObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      labels.forEach(label => {
        if (!label.dataset.original) label.dataset.original = label.textContent.trim();
        if (label.dataset.scrambled !== 'true') scrambleObserver.observe(label);
      });
    }

    function prepareHeroWords() {
      if (heroPrepared) return;
      ['tw-line1', 'tw-line2'].forEach(id => {
        const line = document.getElementById(id);
        if (!line) return;
        const words = line.textContent.trim().split(/\s+/);
        line.innerHTML = words.map((word, index) => `<span class="hero-word-clip"><span class="hero-word" style="--word-delay:${index * 60}ms">${word}</span></span>`).join(' ');
      });
      heroPrepared = true;
    }

    function stopHeroTypewriter() {
      if (typewriterTimeout) {
        clearTimeout(typewriterTimeout);
        typewriterTimeout = 0;
      }
    }

    function initHeroTypewriter() {
      stopHeroTypewriter();
      const el = document.getElementById('tw-text');
      if (!el || currentPage !== 'home') return;

      if (reducedMotion) {
        el.textContent = HERO_TYPEWRITER_TERMS[0];
        return;
      }

      let termIndex = 0;
      let charIndex = el.textContent.trim().length || HERO_TYPEWRITER_TERMS[0].length;
      let isDeleting = false;
      const typeMs = 58;
      const deleteMs = 32;
      const pauseTyped = 2400;
      const pauseDeleted = 400;

      function schedule(fn, ms) {
        typewriterTimeout = window.setTimeout(fn, ms);
      }

      function step() {
        const target = document.getElementById('tw-text');
        if (!target || currentPage !== 'home') return;

        const word = HERO_TYPEWRITER_TERMS[termIndex];

        if (!isDeleting) {
          if (charIndex < word.length) {
            charIndex += 1;
            target.textContent = word.slice(0, charIndex);
            schedule(step, typeMs);
          } else {
            schedule(() => {
              isDeleting = true;
              step();
            }, pauseTyped);
          }
          return;
        }

        if (charIndex > 0) {
          charIndex -= 1;
          target.textContent = word.slice(0, charIndex);
          schedule(step, deleteMs);
          return;
        }

        isDeleting = false;
        termIndex = (termIndex + 1) % HERO_TYPEWRITER_TERMS.length;
        schedule(step, pauseDeleted);
      }

      schedule(() => {
        isDeleting = true;
        charIndex = HERO_TYPEWRITER_TERMS[termIndex].length;
        step();
      }, pauseTyped);
    }

    function startHeroAnimations() {
      prepareHeroWords();
      const heroHeadline = document.querySelector('.hero-h1');
      if (!heroHeadline) return;
      if (reducedMotion) {
        heroHeadline.classList.add('ready');
        heroHeadline.querySelectorAll('.hero-word').forEach(word => word.classList.add('no-animate'));
        initHeroTypewriter();
        return;
      }
      requestAnimationFrame(() => heroHeadline.classList.add('ready'));
      initHeroTypewriter();
    }

    function initMagneticButtons() {
      document.querySelectorAll('.btn-ink,.nav-cta').forEach(btn => {
        btn.classList.add('magnetic');
        if (btn.dataset.magneticBound === 'true') return;
        btn.dataset.magneticBound = 'true';
        if (reducedMotion) return;
        btn.addEventListener('mousemove', event => {
          if (reducedMotion) {
            btn.style.transform = '';
            return;
          }
          const rect = btn.getBoundingClientRect();
          const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
          const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 16;
          btn.style.transform = `translate(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px)`;
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
        });
      });
    }

    function initSpotlights() {
      document.querySelectorAll('.panel-feat').forEach(card => card.classList.add('spotlight-card', 'hover-underline-card'));
      document.querySelectorAll('.faq-card').forEach(card => card.classList.add('hover-underline-card'));
      document.querySelectorAll('.spotlight-card').forEach(card => {
        if (card.dataset.spotlightBound === 'true') return;
        card.dataset.spotlightBound = 'true';
        card.addEventListener('mousemove', event => {
          const rect = card.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--x', `${x}%`);
          card.style.setProperty('--y', `${y}%`);
        });
      });
    }

    function animateCounter(el) {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const duration = 1600;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${prefix}${Math.round(ease * target)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    function initCounters() {
      if (!homeStats) return;
      if (counterObserver) counterObserver.disconnect();
      counterObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !countersRun) {
          countersRun = true;
          document.querySelectorAll('.stat-counter').forEach((el, index) => {
            if (reducedMotion) {
              el.textContent = `${el.dataset.prefix || ''}${el.dataset.target}${el.dataset.suffix || ''}`;
              return;
            }
            setTimeout(() => animateCounter(el), index * 120);
          });
        }
      }, { threshold: 0.3 });
      counterObserver.observe(homeStats);
    }

    function applyInteractiveRoles() {
      document.querySelectorAll('.tip-card-ie').forEach(card => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
      });
    }

    function enhanceDynamicUI(root = document) {
            initMagneticButtons();
      initSpotlights();
      applyInteractiveRoles();
    }

    function initPreloader() {
      const ready = () => {
        preloader.classList.add('hide');
        startHeroAnimations();
        setTimeout(() => preloader.style.display = 'none', 720);
      };
      Promise.race([
        new Promise(resolve => window.addEventListener('load', resolve, { once: true })),
        new Promise(resolve => setTimeout(resolve, 1500))
      ]).then(ready);
    }

    
    
    
    document.getElementById('leistungenModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'leistungenModal') closeLeistungenModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLeistungenModal();
    });

        initSmoothScroll();
    initReveal();
    observeScrambleTargets();
    initCounters();
    initMagneticButtons();
    initSpotlights();
    initPreloader();
    injectFooters();
    initStickyMobileCta();
    updateNavLinks(currentPage);
    updateScrollChrome();
        
        }

    
    motionQuery.addEventListener('change', event => {
      reducedMotion = event.matches;
      initReveal();
      observeScrambleTargets();
      initSmoothScroll();
      initMagneticButtons();
      if (currentPage === 'home') initHeroTypewriter();
    });

    coarsePointerQuery.addEventListener('change', () => {
            initSmoothScroll();
    });

    window.addEventListener('resize', () => {
      initSmoothScroll();
      updateScrollChrome();
    });

    window.addEventListener('scroll', () => {
      if (!smoothScrollEnabled) {
        syncScrollTarget();
        return;
      }
      updateScrollChrome();
      if (!smoothRaf && Math.abs(window.scrollY - scrollTarget) > 4) {
        syncScrollTarget();
      }
    }, { passive: true });
