// Electron preload script
// Exposes safe APIs to the renderer process for window controls and webview automation

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Window Controls
    minimize: () => ipcRenderer.invoke('window-min'),
    maximize: () => ipcRenderer.invoke('window-max'),
    close: () => ipcRenderer.invoke('window-close'),

    // Webview Automation APIs
    automation: {
        // Execute JavaScript in webview and return result
        executeScript: (script) => ipcRenderer.invoke('webview-execute', script),

        // Get all form fields on the page
        getFormFields: () => ipcRenderer.invoke('webview-get-forms'),

        // Fill a form field by selector
        fillField: (selector, value) => ipcRenderer.invoke('webview-fill-field', { selector, value }),

        // Click an element by selector
        clickElement: (selector) => ipcRenderer.invoke('webview-click', selector),

        // Get page content (DOM)
        getPageContent: () => ipcRenderer.invoke('webview-get-content'),

        // Get current URL
        getCurrentUrl: () => ipcRenderer.invoke('webview-get-url'),

        // Wait for element to appear
        waitForElement: (selector, timeout) => ipcRenderer.invoke('webview-wait-element', { selector, timeout }),

        // Type text with delay (simulates human typing)
        typeText: (selector, text, delay) => ipcRenderer.invoke('webview-type-text', { selector, text, delay }),
    }
});

console.log('Preload script loaded successfully with automation APIs');
