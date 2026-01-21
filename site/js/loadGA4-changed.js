    function loadGA4() {
                // Prevent multiple loads
                if (window.gaLoaded) return;
                window.gaLoaded = true;

                // Create and inject GA4 script
                const script = document.createElement("script");
                script.async = true;
                script.src = "https://www.googletagmanager.com/gtag/js?id=G-8Q53P5QHZ5";
                document.head.appendChild(script);

                // Initialize GA4
                window.dataLayer = window.dataLayer || [];
                function gtag() {
                    dataLayer.push(arguments);
                }
                gtag("js", new Date());
                gtag("config", "G-8Q53P5QHZ5");

                console.log("GA4 loaded"); // Optional: for debugging
            }

            // Load after page is fully loaded (1 second delay)
            window.addEventListener("load", () => {
                setTimeout(loadGA4, 2000);
            });

            // OR load on first user interaction (whichever comes first)
            const events = ["scroll", "mousemove", "touchstart", "click"];
            events.forEach((event) => {
                window.addEventListener(event, loadGA4, { once: true, passive: true });
            });