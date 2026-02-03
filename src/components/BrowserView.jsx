import React, { useRef, useEffect, useState } from 'react';
import { X, RefreshCw, ArrowLeft, ArrowRight, Globe } from 'lucide-react';

const BrowserView = ({ url, onClose, onContextUpdate }) => {
    const webviewRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUrl, setCurrentUrl] = useState(url);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [title, setTitle] = useState("Loading...");

    useEffect(() => {
        // Only works in Electron
        const webview = webviewRef.current;
        if (!webview) return;

        const handleLoadStart = () => setIsLoading(true);
        const handleLoadStop = async () => {
            setIsLoading(false);
            try {
                if (webview.getTitle) setTitle(webview.getTitle());
                if (webview.getURL) setCurrentUrl(webview.getURL());
                if (webview.canGoBack) setCanGoBack(webview.canGoBack());
                if (webview.canGoForward) setCanGoForward(webview.canGoForward());

                // THE MIND: Extract text content
                if (webview.executeJavaScript) {
                    const text = await webview.executeJavaScript(`
                        document.body.innerText.substring(0, 15000) // Limit to 15k chars for context
                    `);
                    if (onContextUpdate) onContextUpdate(text);
                }
            } catch (e) { }
        };

        // Electron's webview emits these DOM events
        webview.addEventListener('did-start-loading', handleLoadStart);
        webview.addEventListener('did-stop-loading', handleLoadStop);

        return () => {
            webview.removeEventListener('did-start-loading', handleLoadStart);
            webview.removeEventListener('did-stop-loading', handleLoadStop);
        };
    }, []);

    const goBack = () => webviewRef.current?.goBack();
    const goForward = () => webviewRef.current?.goForward();
    const reload = () => webviewRef.current?.reload();

    return (
        <div className="browser-pane">
            <div className="browser-header">
                <div className="browser-controls">
                    <button onClick={goBack} disabled={!canGoBack}><ArrowLeft size={16} /></button>
                    <button onClick={goForward} disabled={!canGoForward}><ArrowRight size={16} /></button>
                    <button onClick={reload}><RefreshCw size={14} /></button>
                </div>

                <div className="url-bar">
                    <Globe size={14} className="lock-icon" />
                    <input
                        type="text"
                        value={currentUrl}
                        readOnly // For now
                    />
                </div>

                <button className="close-browser" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            <webview
                ref={webviewRef}
                src={url}
                className="webview-frame"
                allowpopups="true"
            />

            <style>{`
            .browser-pane {
                flex: 1;
                display: flex;
                flex-direction: column;
                background: #fff; /* Browser content is usually light */
                position: relative;
                border-left: 1px solid var(--glass-border);
            }
            .browser-header {
                height: 40px;
                background: var(--space-gray);
                display: flex;
                align-items: center;
                padding: 0 10px;
                gap: 10px;
                border-bottom: 1px solid rgba(0,0,0,0.2);
            }
            .browser-controls {
                display: flex;
                gap: 5px;
            }
            .browser-controls button {
                background: transparent;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
            }
            .browser-controls button:hover:not(:disabled) {
                background: rgba(255,255,255,0.1);
                color: #fff;
            }
            .browser-controls button:disabled {
                opacity: 0.3;
                cursor: default;
            }
            .url-bar {
                flex: 1;
                background: #000;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 0.8rem;
                color: var(--text-secondary);
            }
            .url-bar input {
                background: transparent;
                border: none;
                color: var(--text-primary);
                width: 100%;
                outline: none;
            }
            .close-browser {
                background: transparent;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
            }
            .close-browser:hover { color: #fff; }

            .webview-frame {
                flex: 1;
                width: 100%;
                height: 100%;
                border: none;
            }
        `}</style>
        </div>
    );
};

export default BrowserView;
