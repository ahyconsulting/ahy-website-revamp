!(function () {
  // Import only the Matter.js modules we need
  async function loadMatterModules() {
    if (typeof window.Matter === 'undefined') {
      // Option 1: Use a custom build with only needed modules
      // You can build this at https://github.com/liabru/matter-js
      // For now, we'll load the full library but structure code for future optimization
      
      try {
        await new Promise((resolve, reject) => {
          if (document.querySelector('script[src*="matter"]')) return resolve();
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js';
          s.defer = true;
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      } catch (err) {
        console.warn('Failed to load Matter.js', err);
        throw err;
      }
    }
    
    // Extract only the modules we use
    const { Engine, Bodies, World, Body, Mouse, MouseConstraint, Events, Runner, Sleeping } = Matter;
    return { Engine, Bodies, World, Body, Mouse, MouseConstraint, Events, Runner, Sleeping };
  }

  async function init() {
    // Load GSAP and register ScrollTrigger
    // gsap.registerPlugin(ScrollTrigger);
    
    // Physics constants
    const GRAVITY = { x: 0, y: 2 };
    const RESTITUTION = 0.2;
    const FRICTION = 0.5;
    const FRICTION_AIR = 0.02;
    const FRICTION_STATIC = 0.8;
    const DENSITY = 0.0015;
    const WALL_THICKNESS = 200;
    const MOUSE_STIFFNESS = 0.8;
    const BODY_SLOP = 0.05;

    let engine, runner, mouseConstraint;
    let physicsObjects = [];
    let topWall = null;

    function clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }

    async function initPhysics(container) {
      // Load only needed Matter.js modules
      const Matter = await loadMatterModules();
      
      const objects = container.querySelectorAll(".object");
      objects.forEach(el => el.classList.add("physics-active"));

      // Create engine
      engine = Matter.Engine.create();
      engine.gravity = GRAVITY;
      engine.constraintIterations = 10;
      engine.positionIterations = 30;
      engine.velocityIterations = 20;
      engine.timing.timeScale = 1;
      engine.enableSleeping = true;

      const bounds = container.getBoundingClientRect();
      const thickness = WALL_THICKNESS;

      // Create walls (bottom, left, right)
      const walls = [
        Matter.Bodies.rectangle(
          bounds.width / 2,
          bounds.height + thickness / 2,
          bounds.width + 2 * thickness,
          thickness,
          { isStatic: true, restitution: 0.4, friction: 0.8 }
        ),
        Matter.Bodies.rectangle(
          -thickness / 2,
          bounds.height / 2,
          thickness,
          bounds.height + 2 * thickness,
          { isStatic: true, restitution: 0.4, friction: 0.8 }
        ),
        Matter.Bodies.rectangle(
          bounds.width + thickness / 2,
          bounds.height / 2,
          thickness,
          bounds.height + 2 * thickness,
          { isStatic: true, restitution: 0.4, friction: 0.8 }
        ),
      ];
      Matter.World.add(engine.world, walls);

      // Create physics bodies for objects
      objects.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        const x = Math.random() * (bounds.width - rect.width) + rect.width / 2;
        const y = -150 - 120 * idx;
        const angle = 0.3 * (Math.random() - 0.5);

        const body = Matter.Bodies.rectangle(x, y, rect.width, rect.height, {
          restitution: RESTITUTION,
          friction: FRICTION,
          frictionAir: FRICTION_AIR,
          frictionStatic: FRICTION_STATIC,
          density: DENSITY,
          chamfer: { radius: 25 },
          slop: BODY_SLOP,
          sleepThreshold: 60,
          collisionFilter: { group: 0, category: 1, mask: 65535 },
        });

        Matter.Body.setAngle(body, angle);
        physicsObjects.push({ element: el, body, width: rect.width, height: rect.height });
        Matter.World.add(engine.world, body);
      });

      // Add top wall after delay
      setTimeout(() => {
        topWall = Matter.Bodies.rectangle(
          bounds.width / 2,
          -thickness / 2,
          bounds.width + 2 * thickness,
          thickness,
          { isStatic: true, restitution: 0.4, friction: 0.8 }
        );
        Matter.World.add(engine.world, topWall);
      }, 3000);

      // Setup mouse interaction
      const mouse = Matter.Mouse.create(container);
      mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
      mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
      mouse.element.removeEventListener("wheel", mouse.mousewheel);

      container.addEventListener("wheel", (e) => e.stopPropagation(), { passive: false });

      // Touch event handling
      let isTouching = false;
      container.addEventListener("touchstart", (e) => {
        const target = e.target;
        if (target.classList.contains("object") || target.closest(".object")) {
          isTouching = true;
          e.preventDefault();
          e.stopPropagation();
        }
      }, { passive: false });

      container.addEventListener("touchmove", (e) => {
        if (isTouching) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, { passive: false });

      container.addEventListener("touchend", () => { isTouching = false; }, { passive: false });
      container.addEventListener("touchcancel", () => { isTouching = false; }, { passive: false });

      // Create mouse constraint
      mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: MOUSE_STIFFNESS, render: { visible: false } },
      });
      mouseConstraint.mouse.element.oncontextmenu = () => false;

      let draggedBody = null;
      let originalInertia = null;

      function releaseDrag() {
        if (draggedBody) {
          if (originalInertia != null) {
            try {
              Matter.Body.setInertia(draggedBody, originalInertia);
            } catch (e) {}
          }
          draggedBody = null;
          originalInertia = null;
        }
        if (mouseConstraint?.constraint) {
          mouseConstraint.constraint.bodyB = null;
          mouseConstraint.constraint.pointB = null;
        }
        if (mouseConstraint?.mouse) {
          mouseConstraint.mouse.button = -1;
        }
      }

      Matter.Events.on(mouseConstraint, "startdrag", (e) => {
        draggedBody = e.body;
        if (draggedBody) {
          Matter.Sleeping.set(draggedBody, false);

          // Wake nearby bodies
          const wakeRadius = 200;
          physicsObjects.forEach(({ body }) => {
            if (body !== draggedBody) {
              const dx = body.position.x - draggedBody.position.x;
              const dy = body.position.y - draggedBody.position.y;
              if (Math.sqrt(dx * dx + dy * dy) < wakeRadius) {
                Matter.Sleeping.set(body, false);
              }
            }
          });

          originalInertia = draggedBody.inertia;
          Matter.Body.setInertia(draggedBody, Infinity);
          Matter.Body.setVelocity(draggedBody, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(draggedBody, 0);
        }
      });

      Matter.Events.on(mouseConstraint, "enddrag", () => {
        if (draggedBody) {
          Matter.Body.setInertia(draggedBody, originalInertia || 1);
          draggedBody = null;
          originalInertia = null;
        }
      });

      Matter.Events.on(engine, "beforeUpdate", () => {
        // Constrain bodies to container
        physicsObjects.forEach(({ body, width, height }) => {
          if (body === draggedBody) return;

          const minX = width / 2;
          const maxX = bounds.width - width / 2;
          const maxY = bounds.height - height / 2;

          let x = body.position.x;
          if (x < minX) x = minX;
          else if (x > maxX) x = maxX;

          let y = body.position.y;
          if (y > maxY) y = maxY;

          if (x !== body.position.x || y !== body.position.y) {
            Matter.Body.setPosition(body, { x, y });
          }
        });

        // Constrain dragged body
        if (draggedBody) {
          const obj = physicsObjects.find(o => o.body === draggedBody);
          if (obj) {
            const minX = obj.width / 2;
            const maxX = bounds.width - obj.width / 2;
            const minY = obj.height / 2;
            const maxY = bounds.height - obj.height / 2;

            Matter.Body.setPosition(draggedBody, {
              x: clamp(draggedBody.position.x, minX, maxX),
              y: clamp(draggedBody.position.y, minY, maxY),
            });

            Matter.Body.setVelocity(draggedBody, {
              x: clamp(draggedBody.velocity.x, -20, 20),
              y: clamp(draggedBody.velocity.y, -20, 20),
            });
          }
        }
      });

      // Release on mouse leave
      container.addEventListener("mouseleave", releaseDrag);
      container.addEventListener("mouseup", releaseDrag);
      document.addEventListener("mouseup", releaseDrag);
      window.addEventListener("mouseup", releaseDrag);
      document.addEventListener("pointerup", releaseDrag);
      window.addEventListener("pointerup", releaseDrag);
      window.addEventListener("blur", releaseDrag);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) releaseDrag();
      });

      Matter.World.add(engine.world, mouseConstraint);

      // Start physics loop
      runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);

      // Render loop
      (function render() {
        physicsObjects.forEach(({ body, element, width, height }) => {
          const x = clamp(body.position.x - width / 2, 0, bounds.width - width);
          const y = clamp(body.position.y - height / 2, -3 * height, bounds.height - height);

          element.style.left = x + "px";
          element.style.top = y + "px";
          element.style.transform = `rotate(${body.angle}rad)`;
        });
        requestAnimationFrame(render);
      })();
    }

    // Initialize on scroll
    document.querySelectorAll("section").forEach((section) => {
      const container = section.querySelector(".object-container");
      if (container) {
        ScrollTrigger.create({
          trigger: section,
          start: "top 85%",
          once: true,
          onEnter: () => {
            if (!engine) initPhysics(container);
          },
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();