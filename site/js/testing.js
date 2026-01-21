class ComponentLoader {
    constructor() {
        this.componentsPath = './components/';
        this.cssPath = './css/components/';
        this.jsPath = './js/components/';
        this.loadedComponents = new Set();
        this.loadingQueue = [];
        this.isProcessingQueue = false;
        
        // Preload critical CSS immediately
        this.preloadCriticalCSS();
        
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
            rootMargin: '50px'
        });
    }

    // Preload CSS for critical components before any HTML loads
    preloadCriticalCSS() {
        const criticalComponents = ['heroSection', 'header', 'rotatingBadge'];
        criticalComponents.forEach(name => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = `${this.cssPath}${name}.css`;
            link.onload = () => {
                link.rel = 'stylesheet';
            };
            document.head.appendChild(link);
        });
    }

    async yieldToMain() {
        return new Promise(resolve => {
            if ('scheduler' in window && 'yield' in scheduler) {
                scheduler.yield().then(resolve);
            } else {
                setTimeout(resolve, 0);
            }
        });
    }

    shouldYield() {
        return navigator.scheduling?.isInputPending?.() || false;
    }

    async loadComponent(name, isCritical = false) {
        if (this.loadedComponents.has(name)) return;

        try {
            // Load everything in parallel
            const [htmlResponse, cssLoaded, jsLoaded] = await Promise.all([
                fetch(`${this.componentsPath}${name}.html`),
                this.loadCSS(name),
                isCritical ? Promise.resolve() : this.loadJS(name) // Load JS later for critical components
            ]);

            const html = await htmlResponse.text();

            // Use requestAnimationFrame to batch DOM updates
            await new Promise(resolve => requestAnimationFrame(resolve));

            // Insert HTML in a single operation
            const placeholders = document.querySelectorAll(`[data-component="${name}"]`);
            const fragment = document.createDocumentFragment();
            
            placeholders.forEach(placeholder => {
                const temp = document.createElement('div');
                temp.innerHTML = html;
                
                // Transfer all children at once
                while (temp.firstChild) {
                    fragment.appendChild(temp.firstChild);
                }
                
                // Replace placeholder content in one operation
                placeholder.innerHTML = '';
                placeholder.appendChild(fragment.cloneNode(true));
                placeholder.removeAttribute('data-component');
            });

            // Load JS after HTML is visible (for critical components)
            if (isCritical) {
                await this.loadJS(name);
            }

            this.loadedComponents.add(name);
        } catch (error) {
            console.error(`Error loading component ${name}:`, error);
        }
    }

    loadCSS(name) {
        return new Promise((resolve) => {
            const existing = document.querySelector(`link[href*="${name}.css"]`);
            if (existing) {
                // If already loaded as stylesheet, resolve immediately
                if (existing.rel === 'stylesheet') {
                    resolve();
                    return;
                }
                // If preloaded, wait for it to convert
                existing.onload = resolve;
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `${this.cssPath}${name}.css`;
            link.onload = resolve;
            link.onerror = () => resolve(); // Don't block on CSS errors
            document.head.appendChild(link);
        });
    }

    loadJS(name) {
        return new Promise((resolve) => {
            const existing = document.querySelector(`script[src*="${name}.js"]`);
            if (existing) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `${this.jsPath}${name}.js`;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => resolve();
            document.body.appendChild(script);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const name = entry.target.getAttribute('data-component');
                if (name) {
                    this.loadComponent(name, false);
                    this.observer.unobserve(entry.target);
                }
            }
        });
    }

    async processQueue() {
        if (this.isProcessingQueue || this.loadingQueue.length === 0) return;
        
        this.isProcessingQueue = true;

        while (this.loadingQueue.length > 0) {
            const name = this.loadingQueue.shift();
            await this.loadComponent(name, false);
            
            if (this.shouldYield()) {
                await this.yieldToMain();
            }
        }

        this.isProcessingQueue = false;
    }

    async queueRemainingComponents() {
        // Wait for critical content to be visible
        await new Promise(resolve => requestAnimationFrame(resolve));

        const remaining = document.querySelectorAll('[data-component]');
        const componentNames = new Set();
        
        remaining.forEach(el => {
            const name = el.getAttribute('data-component');
            if (name && !this.loadedComponents.has(name)) {
                componentNames.add(name);
            }
        });

        this.loadingQueue.push(...componentNames);

        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => this.processQueue(), { timeout: 2000 });
        } else {
            setTimeout(() => this.processQueue(), 100);
        }
    }

    async loadAll() {
        // Load critical components together to minimize reflows
        const criticalComponents = ['heroSection', 'header', 'rotatingBadge'];
        
        // Load all critical components in parallel
        await Promise.all(
            criticalComponents.map(name => this.loadComponent(name, true))
        );
        
        // Dispatch event after critical content is loaded
        document.dispatchEvent(new CustomEvent('componentsLoaded'));

        // Observe remaining components for lazy loading
        requestAnimationFrame(() => {
            const allComponents = document.querySelectorAll('[data-component]');
            allComponents.forEach(el => {
                this.observer.observe(el);
            });
            
            // Queue and load remaining in background
            this.queueRemainingComponents();
        });
    }

    destroy() {
        this.observer.disconnect();
        this.loadingQueue = [];
    }
}

// Initialize immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const loader = new ComponentLoader();
        loader.loadAll();
        window.componentLoader = loader;
    });
} else {
    const loader = new ComponentLoader();
    loader.loadAll();
    window.componentLoader = loader;
}