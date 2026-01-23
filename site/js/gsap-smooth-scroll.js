function initScrollSmoother() {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,      // smooth scrolling strength
        effects: true     // allow data-speed / data-lag
    });

    console.log("GSAP ScrollSmoother running");
}

initScrollSmoother();
if ('serviceWorker' in navigator) {

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        // Optional: listen for updates
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing;
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available — you can prompt user to refresh
            //   console.log('New content available; consider refreshing.');
            }
          });
        });
      })
      .catch(err => {
        // console.error('ServiceWorker registration failed:', err);
      });
  });
}