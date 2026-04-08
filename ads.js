/**
 * Prime Device High-Revenue Monetization (Triveni Style)
 * Advanced User Tracking & Ad Injection
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialise Floating "Deal Pill"
    initFloatingPill();

    // 2. Initialise Universal Sticky Footer
    initStickyFooter();

    // 3. Setup Link Capturing for Vignette Ads
    setupVignetteCapturing();

    // 4. Inject Text-Link Ads into content
    injectTextLinkAds();
});

function initFloatingPill() {
    const pill = document.createElement('div');
    pill.className = 'tc-floating-pill';
    pill.innerHTML = `
        <a href="#" onclick="openSmartlink(event)">
            <i class="fas fa-bolt"></i> âš¡ Hot Deals
        </a>
        <button onclick="this.parentElement.remove()" class="pill-close">&times;</button>
    `;
    document.body.appendChild(pill);
}

function initStickyFooter() {
    if (document.getElementById('tc-sticky-footer')) return;
    const footerBar = document.createElement('div');
    footerBar.id = 'tc-sticky-footer';
    footerBar.className = 'tc-sticky-bar';
    footerBar.innerHTML = `
        <div class="sticky-bar-content">
            <span class="ad-label">AD</span>
            <div id="adsterra_leaderboard">
                <!-- PASTE 728x90 SCRIPT HERE -->
                <div class="ad-placeholder">Leaderboard Ad Widget</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="sticky-close">&times;</button>
        </div>
    `;
    document.body.appendChild(footerBar);
}

/** Validate URL to prevent javascript: and data: protocol injection */
function isValidNavUrl(url) {
    try {
        const parsed = new URL(url, window.location.origin);
        return ['http:', 'https:'].includes(parsed.protocol) || url.startsWith('/');
    } catch { return false; }
}

function setupVignetteCapturing() {
    document.body.addEventListener('click', (e) => {
        const productLink = e.target.closest('.product-card a, .btn-primary, .nav-links a');
        if (productLink && !productLink.href.includes('#') && !productLink.target) {
            const targetUrl = productLink.href;
            if (!isValidNavUrl(targetUrl)) return; // Block invalid URLs
            e.preventDefault();
            showVignette(targetUrl);
        }
    });
}

function showVignette(url) {
    if (!isValidNavUrl(url)) return; // Double-check
    const safeUrl = encodeURI(url);

    const overlay = document.createElement('div');
    overlay.className = 'tc-vignette-overlay';

    const card = document.createElement('div');
    card.className = 'vignette-card';
    card.innerHTML = `
        <div class="vignette-header">
            <h3>Prime Device Exclusive Offer</h3>
            <span class="vignette-timer">Navigating in <b id="v-countdown">2</b>s...</span>
        </div>
        <div class="vignette-ad-slot">
            <div class="ad-placeholder-large">Premium Interstitial Ad (High Revenue)</div>
        </div>
    `;

    const skipBtn = document.createElement('button');
    skipBtn.className = 'vignette-skip';
    skipBtn.innerHTML = 'Skip & Continue <i class="fas fa-arrow-right"></i>';
    skipBtn.addEventListener('click', (e) => { 
        e.stopPropagation();
        clearInterval(timer); 
        overlay.remove(); // Cleanly remove overlay
        window.location.href = safeUrl; 
    });
    card.appendChild(skipBtn);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    let countdown = 1; // Reduced from 2s to 1s for better UX
    const timer = setInterval(() => {
        countdown--;
        const cdEl = document.getElementById('v-countdown');
        if (cdEl) cdEl.textContent = countdown;
        if (countdown <= 0) {
            clearInterval(timer);
            // Check if we are still on the overlay (user hasn't clicked skip)
            if (document.body.contains(overlay)) {
                window.location.href = safeUrl;
            }
        }
    }, 1000);
}

function injectTextLinkAds() {
    // Underline and monetize keywords like "Refurbished" or "Warranty"
    const keywords = ['Refurbished', 'Pre-owned', 'Warranty', 'Deals', 'Discount'];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    
    let node;
    const nodesToReplace = [];
    while (node = walker.nextNode()) {
        if (node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE' && node.parentElement.tagName !== 'A') {
            keywords.forEach(keyword => {
                if (node.nodeValue.includes(keyword)) {
                    nodesToReplace.push({node, keyword});
                }
            });
        }
    }

    nodesToReplace.forEach(({node, keyword}) => {
        const replacement = node.nodeValue.split(keyword).join(`<a href="#" onclick="openSmartlink(event)" class="tc-text-ad">${keyword}</a>`);
        const span = document.createElement('span');
        span.innerHTML = replacement;
        node.replaceWith(span);
    });
}

function openSmartlink(event) {
    event.preventDefault();
    // Your High-CPM Smartlink (noopener prevents reverse tabnabbing)
    window.open('https://your-smartlink-here.com', '_blank', 'noopener,noreferrer');
}

