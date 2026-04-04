/**
 * TrueCycle Admin Authentication Guard
 * Client-side access control for the Admin Panel.
 * ---
 * Default PIN: truecycle2026
 * Change via Admin Panel → Settings → Security
 */

const AdminAuth = {
    SESSION_KEY: 'tc_admin_session',
    HASH_KEY: 'tc_admin_hash',
    ATTEMPTS_KEY: 'tc_admin_attempts',
    LOCKOUT_KEY: 'tc_admin_lockout',
    SESSION_DURATION: 30 * 60 * 1000, // 30 minutes
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION: 5 * 60 * 1000, // 5 minutes

    /** SHA-256 hash using Web Crypto API */
    async hash(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text + '_tc_salt_x9k2');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    /** Check if a password hash has been set; if not, fetch from Cloud or use default */
    async ensureDefaultPassword() {
        const defaultPIN = 'truecycle2026';
        const defaultHash = await this.hash(defaultPIN);

        if (typeof tcCloud !== 'undefined' && tcCloud) {
            try {
                const { data, error } = await tcCloud.from('site_config').select('value').eq('key', 'admin_hash').single();
                if (data && data.value) {
                    localStorage.setItem(this.HASH_KEY, data.value);
                    console.log("AdminAuth: Cloud security hash synced.");
                    return;
                } else if (error) {
                    // If table exists but empty or error, insert default
                    await tcCloud.from('site_config').insert([{ key: 'admin_hash', value: defaultHash }]);
                }
            } catch (e) { console.warn("Cloud Auth Sync Failed:", e); }
        }

        // Fallback or Local-Only
        const stored = localStorage.getItem(this.HASH_KEY);
        if (!stored || !/^[a-f0-9]{64}$/.test(stored)) {
            localStorage.setItem(this.HASH_KEY, defaultHash);
        }
    },

    /** Check if the admin is currently authenticated */
    isAuthenticated() {
        const session = localStorage.getItem(this.SESSION_KEY);
        if (!session) return false;
        try {
            const data = JSON.parse(session);
            if (Date.now() > data.expires) {
                localStorage.removeItem(this.SESSION_KEY);
                return false;
            }
            return true;
        } catch {
            return false;
        }
    },

    /** Refresh the session timer (extends on activity) */
    refreshSession() {
        const session = localStorage.getItem(this.SESSION_KEY);
        if (session) {
            try {
                const data = JSON.parse(session);
                data.expires = Date.now() + this.SESSION_DURATION;
                localStorage.setItem(this.SESSION_KEY, JSON.stringify(data));
            } catch { /* ignore */ }
        }
    },

    /** Check if the account is currently locked out */
    isLockedOut() {
        const lockout = localStorage.getItem(this.LOCKOUT_KEY);
        if (!lockout) return false;
        const until = parseInt(lockout);
        if (Date.now() < until) return true;
        // Lockout expired, clear it
        localStorage.removeItem(this.LOCKOUT_KEY);
        localStorage.removeItem(this.ATTEMPTS_KEY);
        return false;
    },

    getRemainingLockout() {
        const until = parseInt(localStorage.getItem(this.LOCKOUT_KEY) || '0');
        const remaining = Math.max(0, until - Date.now());
        return Math.ceil(remaining / 1000);
    },

    getAttempts() {
        return parseInt(localStorage.getItem(this.ATTEMPTS_KEY) || '0');
    },

    /** Attempt login with a password */
    async login(password) {
        if (this.isLockedOut()) {
            return { success: false, message: `Account locked. Try again in ${this.getRemainingLockout()}s.`, locked: true };
        }

        const inputHash = await this.hash(password);
        const storedHash = localStorage.getItem(this.HASH_KEY);

        if (inputHash === storedHash) {
            // Success — create session, clear attempts
            const session = {
                loggedIn: true,
                timestamp: Date.now(),
                expires: Date.now() + this.SESSION_DURATION
            };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            localStorage.removeItem(this.ATTEMPTS_KEY);
            localStorage.removeItem(this.LOCKOUT_KEY);
            return { success: true };
        } else {
            // Failed — increment attempts
            let attempts = this.getAttempts() + 1;
            localStorage.setItem(this.ATTEMPTS_KEY, attempts.toString());

            if (attempts >= this.MAX_ATTEMPTS) {
                localStorage.setItem(this.LOCKOUT_KEY, (Date.now() + this.LOCKOUT_DURATION).toString());
                return { success: false, message: `Too many failed attempts. Locked for 5 minutes.`, locked: true };
            }

            return { success: false, message: `Incorrect password. ${this.MAX_ATTEMPTS - attempts} attempt(s) remaining.`, locked: false };
        }
    },

    /** Change the admin password */
    async changePassword(currentPassword, newPassword) {
        const currentHash = await this.hash(currentPassword);
        const storedHash = localStorage.getItem(this.HASH_KEY);

        if (currentHash !== storedHash) {
            return { success: false, message: 'Current password is incorrect.' };
        }

        if (newPassword.length < 6) {
            return { success: false, message: 'New password must be at least 6 characters.' };
        }

        const newHash = await this.hash(newPassword);
        
        // Update Cloud first
        if (typeof tcCloud !== 'undefined' && tcCloud) {
            const { error } = await tcCloud.from('site_config').upsert({ key: 'admin_hash', value: newHash });
            if (error) return { success: false, message: 'Cloud sync failed: ' + error.message };
        }

        localStorage.setItem(this.HASH_KEY, newHash);
        return { success: true, message: 'Password changed successfully in Cloud!' };
    },

    /** Logout — destroy session */
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'admin-dashboard.html';
    },

    /** Render the full-screen login overlay */
    renderLoginScreen() {
        // Block the entire page
        document.body.style.overflow = 'hidden';

        const overlay = document.createElement('div');
        overlay.id = 'adminAuthOverlay';
        overlay.innerHTML = `
            <style>
                #adminAuthOverlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: #0f172a;
                    z-index: 99999;
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Inter', -apple-system, sans-serif;
                }
                .auth-card {
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 24px;
                    padding: 48px 40px;
                    width: 100%; max-width: 420px;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                    text-align: center;
                }
                .auth-icon {
                    width: 72px; height: 72px;
                    background: linear-gradient(135deg, #006778, #00a3b5);
                    border-radius: 20px;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 24px;
                    font-size: 1.8rem; color: white;
                    box-shadow: 0 8px 24px rgba(0,103,120,0.4);
                }
                .auth-card h1 {
                    color: #f1f5f9; font-size: 1.5rem; font-weight: 800; margin-bottom: 6px;
                }
                .auth-card p {
                    color: #64748b; font-size: 0.85rem; margin-bottom: 32px;
                }
                .auth-input-group {
                    position: relative; margin-bottom: 20px;
                }
                .auth-input-group i.field-icon {
                    position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
                    color: #475569; font-size: 0.9rem;
                }
                .auth-input-group input {
                    width: 100%; padding: 16px 48px 16px 44px;
                    background: #0f172a; border: 2px solid #334155; border-radius: 14px;
                    color: #f1f5f9; font-size: 1rem; outline: none;
                    transition: border-color 0.3s;
                    box-sizing: border-box;
                }
                .auth-input-group input:focus {
                    border-color: #006778;
                }
                .auth-input-group input::placeholder { color: #475569; }
                .auth-toggle-vis {
                    position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
                    background: none; border: none; color: #475569; cursor: pointer;
                    font-size: 0.9rem; padding: 4px;
                }
                .auth-toggle-vis:hover { color: #94a3b8; }
                .auth-btn {
                    width: 100%; padding: 16px;
                    background: linear-gradient(135deg, #006778, #00a3b5);
                    border: none; border-radius: 14px;
                    color: white; font-size: 1rem; font-weight: 700;
                    cursor: pointer; transition: all 0.3s;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                }
                .auth-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,103,120,0.4); }
                .auth-btn:active { transform: translateY(0); }
                .auth-btn:disabled {
                    opacity: 0.5; cursor: not-allowed; transform: none !important;
                    box-shadow: none !important;
                }
                .auth-error {
                    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
                    color: #fca5a5; padding: 12px 16px; border-radius: 10px;
                    font-size: 0.8rem; margin-bottom: 20px;
                    display: none; align-items: center; gap: 8px;
                }
                .auth-error.show { display: flex; }
                .auth-footer {
                    margin-top: 28px; padding-top: 20px; border-top: 1px solid #334155;
                    color: #475569; font-size: 0.7rem;
                }
                .auth-lockout-timer {
                    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
                    color: #fca5a5; padding: 16px; border-radius: 12px;
                    font-size: 0.9rem; font-weight: 600;
                    margin-bottom: 20px;
                }
                @keyframes authShake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-8px); }
                    40%, 80% { transform: translateX(8px); }
                }
                .auth-shake { animation: authShake 0.4s ease; }
            </style>

            <div class="auth-card">
                <div class="auth-icon"><i class="fas fa-shield-alt"></i></div>
                <h1>Admin Access</h1>
                <p>Enter your admin password to continue</p>

                <div class="auth-error" id="authError">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span id="authErrorMsg"></span>
                </div>

                <div id="authLockoutDisplay" style="display:none" class="auth-lockout-timer">
                    <i class="fas fa-lock"></i> Locked — <span id="authLockoutSeconds">0</span>s remaining
                </div>

                <form id="adminLoginForm" onsubmit="return false;">
                    <div class="auth-input-group">
                        <i class="fas fa-key field-icon"></i>
                        <input type="password" id="adminPasswordInput" placeholder="Admin Password" autocomplete="off" />
                        <button type="button" class="auth-toggle-vis" onclick="toggleAuthVis()">
                            <i class="fas fa-eye" id="authVisIcon"></i>
                        </button>
                    </div>
                    <button type="submit" class="auth-btn" id="authSubmitBtn">
                        <i class="fas fa-lock-open"></i> Unlock Panel
                    </button>
                </form>

                <div class="auth-footer">
                    <i class="fas fa-recycle" style="color:#006778;"></i> TrueCycle Admin · Secured Access
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Bind events
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            handleAdminLogin();
        });

        // Auto-focus
        setTimeout(() => document.getElementById('adminPasswordInput').focus(), 100);

        // Start lockout timer if needed
        if (this.isLockedOut()) {
            updateLockoutUI();
        }
    },

    /** Initialize the guard on page load */
    async init() {
        await this.ensureDefaultPassword();

        if (this.isAuthenticated()) {
            // Refresh session on every page load (activity-based expiry)
            this.refreshSession();
            this.injectLogoutButton();
            return; // Allow access
        }

        // Not authenticated — block the page
        this.renderLoginScreen();
    },

    /** Add a logout button to the admin sidebar */
    injectLogoutButton() {
        const sidebar = document.querySelector('.sidebar .nav-menu');
        if (!sidebar || document.getElementById('adminLogoutBtn')) return;

        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.id = 'adminLogoutBtn';
        logoutLink.className = 'nav-link';
        logoutLink.style.cssText = 'margin-top: auto; color: #ef4444; border-top: 1px solid #334155; padding-top: 20px; margin-top: 30px;';
        logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            AdminAuth.logout();
        });
        sidebar.appendChild(logoutLink);
    }
};

// --- UI Helper Functions (global scope for onclick) ---

function toggleAuthVis() {
    const input = document.getElementById('adminPasswordInput');
    const icon = document.getElementById('authVisIcon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

async function handleAdminLogin() {
    const input = document.getElementById('adminPasswordInput');
    const btn = document.getElementById('authSubmitBtn');
    const errorBox = document.getElementById('authError');
    const errorMsg = document.getElementById('authErrorMsg');
    const password = input.value.trim();

    if (!password) {
        input.focus();
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

    const result = await AdminAuth.login(password);

    if (result.success) {
        btn.innerHTML = '<i class="fas fa-check"></i> Access Granted!';
        btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        setTimeout(() => {
            document.getElementById('adminAuthOverlay').remove();
            document.body.style.overflow = '';
            AdminAuth.injectLogoutButton();
        }, 600);
    } else {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-lock-open"></i> Unlock Panel';

        errorBox.classList.add('show');
        errorMsg.textContent = result.message;
        input.value = '';
        input.focus();

        // Shake animation
        const card = document.querySelector('.auth-card');
        card.classList.add('auth-shake');
        setTimeout(() => card.classList.remove('auth-shake'), 400);

        if (result.locked) {
            updateLockoutUI();
        }
    }
}

function updateLockoutUI() {
    const lockoutDisplay = document.getElementById('authLockoutDisplay');
    const lockoutSeconds = document.getElementById('authLockoutSeconds');
    const btn = document.getElementById('authSubmitBtn');
    const input = document.getElementById('adminPasswordInput');

    if (!lockoutDisplay) return;

    lockoutDisplay.style.display = 'block';
    btn.disabled = true;
    input.disabled = true;

    const interval = setInterval(() => {
        const remaining = AdminAuth.getRemainingLockout();
        if (remaining <= 0) {
            clearInterval(interval);
            lockoutDisplay.style.display = 'none';
            btn.disabled = false;
            input.disabled = false;
            btn.innerHTML = '<i class="fas fa-lock-open"></i> Unlock Panel';
            document.getElementById('authError').classList.remove('show');
        } else {
            lockoutSeconds.textContent = remaining;
        }
    }, 1000);
}

// --- Boot the guard ---
document.addEventListener('DOMContentLoaded', () => {
    AdminAuth.init();
});
