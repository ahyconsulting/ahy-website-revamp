// Team Slider 3D Carousel with GSAP
(function() {
  // console.log('Team Slider Script Loading...');
  
  function initCarousel() {
    const carousel = document.getElementById('carousel3d');
    
    if (!carousel) {
      // console.error('Carousel element not found!');
      return;
    }

    const items = Array.from(carousel.querySelectorAll('.carousel-item'));
    const numItems = items.length;
    
    if (numItems === 0) {
      // console.error('No carousel items found!');
      return;
    }

    // console.log(`✓ Initializing carousel with ${numItems} items`);

    // Configuration - Responsive radius based on screen size
    let radius = 650; // Desktop
    
    if (window.innerWidth <= 480) {
      radius = 280; // Mobile - smaller radius for more visible curve
    } else if (window.innerWidth <= 768) {
      radius = 400; // Tablet
    }
    
    const theta = 360 / numItems;
    
    let currentAngle = 0;
    let targetAngle = 0;
    let autoRotate = true;
    let isDragging = false;
    let startX = 0;
    let startAngle = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;

    // Set carousel container properties
    gsap.set(carousel, {
      transformStyle: 'preserve-3d',
      transformOrigin: 'center center'
    });

    // Position items in 3D circle
    items.forEach((item, i) => {
      gsap.set(item, {
        xPercent: -50,
        yPercent: -50,
      });
    });

    // Function to update positions based on rotation
    function updatePositions() {
      items.forEach((item, i) => {
        const angle = theta * i + currentAngle;
        const angleRad = (angle * Math.PI) / 180;
        
        // Calculate position on circle
        const x = Math.sin(angleRad) * radius;
        const z = Math.cos(angleRad) * radius - radius;
        
        // Normalize angle to 0-360
        const normalizedAngle = ((angle % 360) + 360) % 360;
        
        // Calculate opacity based on position (hide cards at back)
        let opacity = 1;
        if (normalizedAngle > 90 && normalizedAngle < 270) {
          // Cards at the back - fade them out
          opacity = 0;
        } else if (normalizedAngle > 70 && normalizedAngle <= 90) {
          // Fade transition on left side
          opacity = (90 - normalizedAngle) / 20;
        } else if (normalizedAngle >= 270 && normalizedAngle < 290) {
          // Fade transition on right side
          opacity = (normalizedAngle - 270) / 20;
        }
        
        gsap.set(item, {
          x: x,
          z: z,
          rotationY: -angle,
          opacity: opacity,
        });
      });
    }

    // Initial positioning
    updatePositions();

    // Animation loop
    function animate() {
      if (autoRotate && !isDragging) {
        targetAngle += 0.2;
      }
      
      // Smooth interpolation
      currentAngle += (targetAngle - currentAngle) * 0.1;
      
      // Apply momentum when not dragging
      if (!isDragging && Math.abs(velocity) > 0.01) {
        targetAngle += velocity;
        velocity *= 0.95; // Friction
      }
      
      updatePositions();
      requestAnimationFrame(animate);
    }

    // Drag handlers
    function onPointerDown(e) {
      isDragging = true;
      autoRotate = false;
      velocity = 0;
      startX = e.clientX || e.touches[0].clientX;
      lastX = startX;
      startAngle = targetAngle;
      lastTime = Date.now();
      carousel.style.cursor = 'grabbing';
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      
      e.preventDefault();
      const x = e.clientX || e.touches[0].clientX;
      const delta = x - startX;
      const currentTime = Date.now();
      const timeDelta = currentTime - lastTime;
      
      // Calculate velocity for momentum
      if (timeDelta > 0) {
        velocity = (x - lastX) / timeDelta * 0.5;
      }
      
      targetAngle = startAngle + delta * 0.5;
      
      lastX = x;
      lastTime = currentTime;
    }

    function onPointerUp() {
      if (!isDragging) return;
      
      isDragging = false;
      carousel.style.cursor = 'grab';
      
      // Resume auto-rotation after momentum dies down
      setTimeout(() => {
        if (Math.abs(velocity) < 0.1) {
          autoRotate = true;
        }
      }, 2000);
    }

    // Event listeners
    carousel.addEventListener('mousedown', onPointerDown);
    carousel.addEventListener('touchstart', onPointerDown, { passive: true });
    
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchend', onPointerUp);

    // Start animation
    animate();
    console.log('✓ Carousel initialized and animating!');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
  } else {
    initCarousel();
  }
})();