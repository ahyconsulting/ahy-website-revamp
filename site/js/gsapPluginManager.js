// gsapPluginManager.js - Lazy load GSAP plugins only when needed

class GSAPPluginManager {
    constructor() {
        this.loadedPlugins = new Set();
        this.loadingPromises = new Map();
    }

    async loadPlugin(pluginName, pluginPath) {
        // Return cached promise if already loading
        if (this.loadingPromises.has(pluginName)) {
            return this.loadingPromises.get(pluginName);
        }

        // Return immediately if already loaded
        if (this.loadedPlugins.has(pluginName)) {
            return Promise.resolve();
        }

        // Create loading promise
        const loadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = pluginPath;
            script.onload = () => {
                this.loadedPlugins.add(pluginName);
                this.loadingPromises.delete(pluginName);
                resolve();
            };
            script.onerror = () => {
                this.loadingPromises.delete(pluginName);
                reject(new Error(`Failed to load ${pluginName}`));
            };
            document.head.appendChild(script);
        });

        this.loadingPromises.set(pluginName, loadPromise);
        return loadPromise;
    }

    async loadScrollPlugins() {
        return Promise.all([
            this.loadPlugin('ScrollTrigger', '/js/ScrollTrigger.min.js?v=dev'),
            this.loadPlugin('ScrollSmoother', '/js/ScrollSmoother.min.js?v=dev'),
        ]);
    }

    async loadTextPlugins() {
        return Promise.all([
            this.loadPlugin('SplitText', '/js/SplitText.min.js?v=dev'),
            this.loadPlugin('CircleType', '/js/circletype.min.js?v=dev'),
            this.loadPlugin('ScrambleText', '/js/ScrambleTextPlugin.min.js?v=dev'),
        ]);
    }

    async loadMotionPlugins() {
        return Promise.all([
            this.loadPlugin('MotionPath', '/js/MotionPath.min.js?v=dev'),
            this.loadPlugin('ScrollToPlugin', '/js/ScrollToPlugin.min.js?v=dev'),
        ]);
    }

    // Helper to load plugins on demand with error handling
    async loadOnDemand(pluginType) {
        try {
            switch (pluginType) {
                case 'scroll':
                    await this.loadScrollPlugins();
                    break;
                case 'text':
                    await this.loadTextPlugins();
                    break;
                case 'motion':
                    await this.loadMotionPlugins();
                    break;
                default:
                    console.warn(`Unknown plugin type: ${pluginType}`);
            }
        } catch (error) {
            console.error(`Error loading ${pluginType} plugins:`, error);
        }
    }
}

// Export singleton instance
window.gsapPluginManager = new GSAPPluginManager();

// Usage example in your component JS files:
/*
// In your component JS file (e.g., hero.js):
async function initHeroAnimation() {
    // Load only the plugins you need
    await window.gsapPluginManager.loadOnDemand('scroll');
    
    // Now use ScrollTrigger
    gsap.to('.hero-element', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top center',
        },
        opacity: 1,
        duration: 1
    });
}

// Call when component is visible or on user interaction
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initHeroAnimation();
                observer.disconnect();
            }
        });
    });
    observer.observe(document.querySelector('.hero'));
} else {
    initHeroAnimation();
}
*/