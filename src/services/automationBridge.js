// Webview Automation Bridge Service
// Provides methods to automate interactions with webview content

class AutomationBridge {
    constructor() {
        this.webviewRef = null;
        this.isReady = false;
    }

    // Set the webview reference (called from BrowserArea)
    setWebview(webviewElement) {
        this.webviewRef = webviewElement;
        if (webviewElement) {
            webviewElement.addEventListener('dom-ready', () => {
                this.isReady = true;
                console.log('[AutomationBridge] Webview ready');
            });
        }
    }

    // Check if webview is available
    isAvailable() {
        return this.webviewRef && this.isReady;
    }

    // Execute JavaScript in the webview
    async executeScript(script) {
        if (!this.isAvailable()) {
            throw new Error('Webview not available');
        }
        try {
            return await this.webviewRef.executeJavaScript(script);
        } catch (error) {
            console.error('[AutomationBridge] Execute error:', error);
            throw error;
        }
    }

    // Get current URL
    getCurrentUrl() {
        if (!this.isAvailable()) return null;
        return this.webviewRef.getURL();
    }

    // Get page title
    getTitle() {
        if (!this.isAvailable()) return null;
        return this.webviewRef.getTitle();
    }

    // Navigate to URL
    navigate(url) {
        if (!this.webviewRef) return;
        this.webviewRef.loadURL(url);
    }

    // Get all form fields on the page
    async getFormFields() {
        const script = `
            (function() {
                const fields = [];
                const inputs = document.querySelectorAll('input, textarea, select');
                inputs.forEach((el, idx) => {
                    const label = el.labels?.[0]?.textContent || 
                                  el.placeholder || 
                                  el.name || 
                                  el.id || 
                                  'field_' + idx;
                    fields.push({
                        type: el.type || el.tagName.toLowerCase(),
                        name: el.name,
                        id: el.id,
                        placeholder: el.placeholder,
                        label: label.trim(),
                        value: el.value,
                        selector: el.id ? '#' + el.id : (el.name ? '[name="' + el.name + '"]' : null),
                        required: el.required,
                        visible: el.offsetParent !== null
                    });
                });
                return fields.filter(f => f.visible);
            })();
        `;
        return await this.executeScript(script);
    }

    // Fill a form field
    async fillField(selector, value) {
        const script = `
            (function() {
                const el = document.querySelector('${selector}');
                if (!el) return { success: false, error: 'Element not found' };
                el.focus();
                el.value = '${value.replace(/'/g, "\\'")}';
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                return { success: true };
            })();
        `;
        return await this.executeScript(script);
    }

    // Click an element
    async clickElement(selector) {
        const script = `
            (function() {
                const el = document.querySelector('${selector}');
                if (!el) return { success: false, error: 'Element not found' };
                el.click();
                return { success: true };
            })();
        `;
        return await this.executeScript(script);
    }

    // Type text character by character (more human-like)
    async typeText(selector, text, delayMs = 50) {
        const script = `
            (async function() {
                const el = document.querySelector('${selector}');
                if (!el) return { success: false, error: 'Element not found' };
                el.focus();
                el.value = '';
                const text = '${text.replace(/'/g, "\\'")}';
                for (let char of text) {
                    el.value += char;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    await new Promise(r => setTimeout(r, ${delayMs}));
                }
                el.dispatchEvent(new Event('change', { bubbles: true }));
                return { success: true };
            })();
        `;
        return await this.executeScript(script);
    }

    // Wait for an element to appear
    async waitForElement(selector, timeoutMs = 5000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutMs) {
            const exists = await this.executeScript(`
                !!document.querySelector('${selector}')
            `);
            if (exists) return { success: true };
            await new Promise(r => setTimeout(r, 200));
        }
        return { success: false, error: 'Timeout waiting for element' };
    }

    // Get page content (simplified text)
    async getPageText() {
        const script = `
            document.body.innerText;
        `;
        return await this.executeScript(script);
    }

    // Check if logged into LinkedIn
    async isLinkedInLoggedIn() {
        const url = this.getCurrentUrl();
        if (!url?.includes('linkedin.com')) return false;

        const script = `
            (function() {
                // Check for profile nav or feed presence
                const hasProfile = !!document.querySelector('.global-nav__primary-link--active');
                const hasFeed = !!document.querySelector('.feed-shared-update-v2');
                const hasLogin = !!document.querySelector('[data-id="sign-in-form__submit-btn"]');
                return !hasLogin && (hasProfile || hasFeed);
            })();
        `;
        return await this.executeScript(script);
    }

    // Get LinkedIn job listings from search results
    async getLinkedInJobListings() {
        const script = `
            (function() {
                const jobs = [];
                const cards = document.querySelectorAll('.job-card-container, .jobs-search-results__list-item');
                cards.forEach(card => {
                    const titleEl = card.querySelector('.job-card-list__title, .job-card-container__link');
                    const companyEl = card.querySelector('.job-card-container__primary-description, .job-card-container__company-name');
                    const locationEl = card.querySelector('.job-card-container__metadata-item');
                    const easyApply = !!card.querySelector('.job-card-container__apply-method');
                    
                    if (titleEl) {
                        jobs.push({
                            title: titleEl.textContent.trim(),
                            company: companyEl?.textContent.trim() || '',
                            location: locationEl?.textContent.trim() || '',
                            url: titleEl.href || '',
                            easyApply: easyApply
                        });
                    }
                });
                return jobs;
            })();
        `;
        return await this.executeScript(script);
    }

    // Click Easy Apply button
    async clickEasyApply() {
        const script = `
            (function() {
                const btn = document.querySelector('.jobs-apply-button, [data-control-name="jobdetails_topcard_inapply"]');
                if (btn) {
                    btn.click();
                    return { success: true };
                }
                return { success: false, error: 'Easy Apply button not found' };
            })();
        `;
        return await this.executeScript(script);
    }
}

// Singleton instance
const automationBridge = new AutomationBridge();

export default automationBridge;
