(function () {
  'use strict';

  const flow = document.querySelector('[data-process-flow]');
  if (!flow) return;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopQuery = window.matchMedia('(min-width: 769px)');
  let triggers = [];
  let nativeFrame = 0;

  function getSections() {
    return Array.from(flow.querySelectorAll('[data-flow-section]'));
  }

  function updateNativeFlow() {
    nativeFrame = 0;
    if (motionQuery.matches || !desktopQuery.matches) return;

    getSections().forEach((section, index) => {
      if (index === 0) return;
      const inner = section.querySelector('.process-flow-inner');
      if (!inner) return;
      const top = section.getBoundingClientRect().top;
      const progress = Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight * .75)));
      inner.style.transform = `rotate(${30 * (1 - progress)}deg)`;
    });
  }

  function requestNativeUpdate() {
    if (!nativeFrame) nativeFrame = requestAnimationFrame(updateNativeFlow);
  }

  function enableNativeFlow() {
    flow.classList.add('process-flow--native');
    getSections().forEach((section, index) => { section.style.zIndex = String(index + 1); });
    window.addEventListener('scroll', requestNativeUpdate, { passive: true });
    window.addEventListener('resize', requestNativeUpdate);
    requestNativeUpdate();
  }

  function clearFlow() {
    flow.classList.remove('process-flow--native');
    triggers.forEach(trigger => trigger.kill());
    triggers = [];
    if (typeof gsap !== 'undefined') {
      flow.querySelectorAll('.process-flow-inner').forEach(inner => gsap.set(inner, { clearProps: 'transform' }));
    } else {
      flow.querySelectorAll('.process-flow-inner').forEach(inner => { inner.style.transform = ''; });
    }
  }

  function createFlow() {
    clearFlow();
    if (motionQuery.matches || !desktopQuery.matches) return;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      enableNativeFlow();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const sections = getSections();

    sections.forEach((section, index) => {
      section.style.zIndex = String(index + 1);
      const inner = section.querySelector('.process-flow-inner');
      if (!inner) return;

      if (index > 0) {
        gsap.set(inner, { rotation: 30, transformOrigin: 'bottom left' });
        const tween = gsap.to(inner, {
          rotation: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'top 25%',
            scrub: true
          }
        });
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
      }

      if (index < sections.length - 1) {
        triggers.push(ScrollTrigger.create({
          trigger: section,
          start: 'bottom bottom',
          end: 'bottom top',
          pin: true,
          pinSpacing: false
        }));
      }
    });

    ScrollTrigger.refresh();
  }

  motionQuery.addEventListener('change', createFlow);
  desktopQuery.addEventListener('change', createFlow);
  window.addEventListener('load', createFlow, { once: true });
  createFlow();
})();
