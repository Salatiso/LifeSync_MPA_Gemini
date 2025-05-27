// LifeSync Common JavaScript
// This file includes Firebase initialization, auth, i18next, modals, notifications,
// navigation highlighting, and other shared functionalities.

// Firebase SDK imports (Modular v11.x.x)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    updateProfile,
    signInAnonymously, // For environments where __initial_auth_token might not be present
    signInWithCustomToken // For environments where __initial_auth_token is present
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    collection, 
    query, 
    where, 
    getDocs,
    serverTimestamp,
    Timestamp, // Import Timestamp
    arrayUnion,
    arrayRemove 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// --- Global Variables & DOM Elements (Common to all pages) ---
const loadingOverlay = document.getElementById('loadingOverlay');
const loginBtnNavEl = document.getElementById('loginBtnNav');
const registerBtnNavEl = document.getElementById('registerBtnNav');
const logoutBtnNavEl = document.getElementById('logoutBtnNav');
const navProfileBtnEl = document.getElementById('navProfileBtn');
const languageSelector = document.getElementById('languageSelector');
const currentYearFooterEl = document.getElementById('currentYearFooter');
const notificationsAreaEl = document.getElementById('notificationsArea');

// Modal Elements (assuming these IDs are consistent across pages where modals are used)
const loginModalEl = document.getElementById('loginModal');
const registerModalEl = document.getElementById('registerModal');
const tempProfileModalEl = document.getElementById('tempProfileModal');
const tempProfileLoginModalEl = document.getElementById('tempProfileLoginModal');
const searchModalEl = document.getElementById('searchModal');
const benefitModalEl = document.getElementById('benefitModal'); // From index.html

// --- Firebase Configuration & Initialization ---
const firebaseConfigFromGlobal = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthTokenFromGlobal = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appIdFromGlobal = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

let app;
let auth;
let db;
let storage;
let firebaseInitialized = false;
let currentUserId = null; 
let isTempUser = false;

try {
    if (firebaseConfigFromGlobal) {
        app = initializeApp(firebaseConfigFromGlobal);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        firebaseInitialized = true;
        console.log("Firebase initialized successfully in main.js with dynamic config.");
        // import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
        // setLogLevel('debug'); 
    } else {
        console.warn("Firebase configuration not found in main.js. Firebase features will be limited.");
        const body = document.querySelector('body');
        const errorDiv = document.createElement('div');
        errorDiv.textContent = "Service configuration missing. Some features may not be available.";
        errorDiv.style.cssText = "background-color: var(--accent-pink-vibrant); color: var(--text-primary-light); padding: 10px; text-align: center; position: fixed; bottom: 0; width: 100%; z-index: 5000;";
        if(body) body.appendChild(errorDiv);
    }
} catch (error) {
    console.error("Firebase initialization error in main.js:", error);
    const body = document.querySelector('body');
    const errorDiv = document.createElement('div');
    errorDiv.textContent = "Error connecting to services. Some features may not be available.";
    errorDiv.style.cssText = "background-color: var(--accent-pink-vibrant); color: var(--text-primary-light); padding: 10px; text-align: center; position: fixed; bottom: 0; width: 100%; z-index: 5000;";
    if(body) body.appendChild(errorDiv);
}

// --- i18next Internationalization ---
// Translations should be loaded by each page or managed in a more complex way for MPA.
// For simplicity, we'll assume i18next is initialized on each page that needs it,
// but the core functions to update UI can be here.
const translations = { 
    en: { /* English translations from original HTML */
        translation: {
            title: "LifeSync - Deepen Your Connections",
            nav: { brand: "LifeSync", home: "Home", assessments: "Assessments", tools: "Tools", resources: "Resources", profile: "My Profile", login: "Login", register: "Register", logout: "Logout" },
            landing: {
                heroTitle: "Beyond the Swipe: Discover True Compatibility",
                heroSubtitle: "LifeSync empowers you to understand yourself and what you truly need in any significant relationship. Build your dynamic, lifelong profile, 'Sync Up' for profound connections, and always be ready for your best relationship journey.",
                heroCta: "Explore Assessments",
                takeAssessmentCta: "Take an Assessment",
                benefitsTitle: "Why LifeSync? The Path to Deeper Understanding.",
                benefitsSubtitle: "LifeSync is more than an app; it's your companion for relationship clarity and growth.",
                benefit1: { title: "Build Your Lifelong Profile", description: "Create a rich, evolving profile that captures your values, preferences, and experiences – your personal relationship blueprint." },
                benefit2: { title: "Understand Yourself Deeper", description: "Engage with 150+ culturally aware questions. Gain personalized insights into your needs and compatibility factors." },
                benefit3: { title: "Ready to 'Sync Up'?", description: "Connect with a partner on a new level. Securely share and compare what truly matters, with full, granular consent." },
                benefitImport: { title: "Seamless Profile Building", description: "Easily import data from existing social/dating profiles or use AI assistance to extract info from documents like your CV. Spend less time typing, more time connecting." },
                getStartedTitle: "Ready to Begin Your Journey?",
                getStartedSubtitle: "Create your free LifeSync profile today and take the first step towards more meaningful connections.",
                registerNow: "Register Your Profile",
                loginExisting: "Login",
                learnMoreClose: "Close"
            },
            assessments: { 
                title: "Discover Your Compatibility",
                subtitle: "Engage with our assessments to gain valuable insights into your relationship dynamics. Assign weights to what matters most to you!",
                quickCompat: { 
                    title: "Quick Compatibility Check",
                    description: "A fast way for you and a potential partner to get an initial feel for alignment. Choose your depth!",
                    basicBtn: "Quick Sync (5 Q's)",
                    intermediateBtn: "Deeper Dive (10 Q's)",
                    advancedBtn: "Full Spectrum (15 Q's)",
                    importanceLabel: "Importance (1-5):",
                    progressQuestion: "Question",
                    progressOf: "of",
                    nextBtn: "Next",
                    resultsTitle: "Quick Sync Results!",
                    retryBtn: "Try Another Level",
                    questions: { 
                        q_financial_stability: "How important is financial stability to you?",
                        q_indoors_outdoors: "Do you prefer spending time indoors or outdoors?",
                        // ... other quick compat questions
                    },
                    options: { 
                        opt_not_important: "Not important", opt_somewhat_important: "Somewhat important", 
                        // ... other quick compat options
                    },
                    results: { 
                        completed: "You completed the",
                        checkWith: "compatibility check with",
                        answers: "answers"
                    }
                },
                profileBuilder: { 
                    title: "My Relationship Profile Builder",
                    // ... other profile builder translations
                },
                note: "More in-depth assessments on finances, cultural values (e.g., lobola discussions, family roles), lifestyle, and long-term goals are available once you create your profile and connect with a partner."
            },
            tools: { /* ... tools translations ... */ },
            resources: { /* ... resources translations ... */ },
            profile: { /* ... profile translations ... */ 
                ugqTitle: "My Custom Questions", 
                ugqTitleLong: "My Questions",
            },
            ugq: { /* ... ugq translations ... */ },
            sync: { /* ... sync translations ... */ },
            notifications: { title: "Notifications", welcome: "Welcome to LifeSync! Complete your profile to get started." },
            footer: { privacy: "Privacy Policy", terms: "Terms of Service", built: "Built with <i class='fa-solid fa-heart' style='color: var(--accent-pink-vibrant)'></i> for LifeSync."},
            login: { /* ... login modal translations ... */ },
            register: { /* ... register modal translations ... */ },
            tempProfile: { /* ... temp profile modal translations ... */ },
            tempProfileLogin: { /* ... temp profile login modal translations ... */ },
            search: { /* ... search modal translations ... */ },
            alerts: { /* ... alert messages ... */ 
                selectionNeeded: "Please select an answer to proceed.",
                loginSuccess: "Logged in successfully! Welcome back.",
                // ... other alert messages
            }
        }
    },
    xh: { /* ... Xhosa translations ... */ },
    zu: { /* ... Zulu translations ... */ },
    af: { /* ... Afrikaans translations ... */ }
    // Add other languages as needed
};

// Expose i18next to global scope for page-specific scripts if needed
window.i18next = i18next; 

i18next
    .use(i18nextBrowserLanguageDetector)
    .init({
        resources: translations,
        fallbackLng: 'en',
        debug: true, 
        interpolation: { escapeValue: false } 
    }, (err, t) => {
        if (err) return console.error('i18next init error in main.js:', err);
        updateUIWithTranslations(); 
        initializeDynamicContent(); 
        setActiveNavLink(); // Highlight nav link after translations are applied
    });

function updateUIWithTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if (elem.hasAttribute('data-i18n-placeholder')) {
            const placeholderKey = elem.getAttribute('data-i18n-placeholder');
            elem.setAttribute('placeholder', i18next.t(placeholderKey));
        }
        if (key) {
            const translation = i18next.t(key);
            if (elem.tagName === 'INPUT' && (elem.type === 'submit' || elem.type === 'button')) {
                elem.value = translation; 
            } else {
                elem.innerHTML = translation; 
            }
        }
    });
    const pageTitleElement = document.querySelector('title[data-i18n]');
    if (pageTitleElement) {
        pageTitleElement.textContent = i18next.t(pageTitleElement.getAttribute('data-i18n'));
    }
}

if (languageSelector) {
    languageSelector.addEventListener('change', function() {
        i18next.changeLanguage(this.value, (err, t) => {
            if (err) return console.error('Error changing language in main.js:', err);
            updateUIWithTranslations(); 
            initializeDynamicContent(); 
            setActiveNavLink();
        });
    });
}

// --- Utility Functions ---
function showLoading(show) {
    if (loadingOverlay) loadingOverlay.style.display = show ? 'flex' : 'none';
}

function sanitizeInput(input) { 
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// --- Navigation Highlighting for MPA ---
function setActiveNavLink() {
    const currentPagePath = window.location.pathname.split("/").pop(); // Gets the current HTML file name
    const navLinks = document.querySelectorAll('nav .nav-links a.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active-nav');
        const linkPath = link.getAttribute('href').split("/").pop();
        if (linkPath === currentPagePath || (currentPagePath === '' && linkPath === 'index.html')) { // Handle root path for index.html
            link.classList.add('active-nav');
        }
    });
}

// --- Modal Management ---
// Expose showModal to global scope for page-specific scripts (like index.html benefit cards)
window.showModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => modal.classList.remove('active'));
}

document.querySelectorAll('.modal .close-button').forEach(button => {
    button.addEventListener('click', (e) => {
        // const modal = e.target.closest('.modal'); // Original
        const modalId = e.target.dataset.modalId; // Using data attribute
        if(modalId) closeModal(modalId);
    });
});

// Close modal if clicked outside content
window.addEventListener('click', (event) => {
    document.querySelectorAll('.modal.active').forEach(modal => {
        if (event.target == modal) {
            closeModal(modal.id);
        }
    });
});

// --- Notifications ---
// Expose showNotification to global scope
window.showNotification = function(message, type = 'info', duration = 5000) {
    if (!notificationsAreaEl) { console.warn("Notifications area not found"); return; }
    const notification = document.createElement('div');
    notification.className = `notification-item ${type}`;
    notification.textContent = message;
    notificationsAreaEl.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutNotification 0.5s forwards'; 
        setTimeout(() => notification.remove(), 500);
    }, duration);
}

// --- Authentication Logic ---
function updateUIForLoggedOutUser() {
    if (loginBtnNavEl) loginBtnNavEl.style.display = 'inline-block';
    if (registerBtnNavEl) registerBtnNavEl.style.display = 'inline-block';
    if (logoutBtnNavEl) logoutBtnNavEl.style.display = 'none';
    if (navProfileBtnEl) {
        navProfileBtnEl.style.display = 'none';
        navProfileBtnEl.innerHTML = `<i class="fa-solid fa-user-edit"></i> <span data-i18n="nav.profile">${i18next.t('nav.profile')}</span>`;
    }
    currentUserId = null;
    isTempUser = false;
    if (typeof updateProfileDisplay === "function") updateProfileDisplay(); // If profile page JS is loaded
}

function updateUIForTempUser(tempProfile) {
    if (loginBtnNavEl) loginBtnNavEl.style.display = 'none';
    if (registerBtnNavEl) registerBtnNavEl.style.display = 'none';
    if (logoutBtnNavEl) logoutBtnNavEl.style.display = 'inline-block'; 
    if (navProfileBtnEl) {
        navProfileBtnEl.style.display = 'inline-block';
        navProfileBtnEl.innerHTML = `<i class="fa-solid fa-user-clock"></i> ${tempProfile.username || i18next.t('nav.profile')}`;
    }
    currentUserId = tempProfile.id;
    isTempUser = true;
    if (typeof updateProfileDisplay === "function") updateProfileDisplay();
}

if (firebaseInitialized && auth) {
    (async () => {
        try {
            if (initialAuthTokenFromGlobal) {
                await signInWithCustomToken(auth, initialAuthTokenFromGlobal);
                console.log("Successfully signed in with custom token in main.js.");
            } else {
                await signInAnonymously(auth);
                console.log("Signed in anonymously in main.js as __initial_auth_token was not available.");
            }
        } catch (error) {
            console.error("Error during initial sign-in (custom token or anonymous) in main.js:", error);
        }
    })();

    onAuthStateChanged(auth, user => {
        showLoading(true);
        console.log("Auth state changed in main.js. Firebase User:", user ? user.uid : "null");
        const tempProfile = JSON.parse(localStorage.getItem('tempProfile')); 

        if (user) { 
            if (loginBtnNavEl) loginBtnNavEl.style.display = 'none';
            if (registerBtnNavEl) registerBtnNavEl.style.display = 'none';
            if (logoutBtnNavEl) logoutBtnNavEl.style.display = 'inline-block';
            if (navProfileBtnEl) {
                navProfileBtnEl.style.display = 'inline-block';
                navProfileBtnEl.innerHTML = `<i class="fa-solid fa-user-circle"></i> ${user.displayName || i18next.t('nav.profile')}`;
            }
            localStorage.removeItem('tempProfile'); 
            currentUserId = user.uid;
            isTempUser = false;
            closeAllModals();
        } else if (tempProfile && tempProfile.id && tempProfile.expiresAt && new Date(tempProfile.expiresAt) > new Date()) { 
            updateUIForTempUser(tempProfile);
        } else { 
            updateUIForLoggedOutUser();
            if (tempProfile) localStorage.removeItem('tempProfile'); 
        }
        if (typeof updateProfileDisplay === "function") updateProfileDisplay(); 
        initializeDynamicContent(); 
        showLoading(false);
    });
} else {
    console.warn("Firebase Auth not initialized in main.js. Auth features will be limited.");
    updateUIForLoggedOutUser(); 
    showLoading(false);
}

// Event Listeners for Auth Buttons (if they exist on the current page)
loginBtnNavEl?.addEventListener('click', () => showModal('loginModal'));
registerBtnNavEl?.addEventListener('click', () => showModal('registerModal'));

document.getElementById('loginForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!firebaseInitialized || !auth) { showNotification("Service not available.", "error"); return; }
    showLoading(true);
    const email = sanitizeInput(document.getElementById('loginEmail').value);
    const password = document.getElementById('loginPassword').value; 
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showNotification(i18next.t('alerts.loginSuccess'), 'success');
        closeModal('loginModal');
    } catch (err) {
        showNotification(i18next.t('alerts.loginFailed') + ` ${err.message}`, 'error');
    } finally {
        showLoading(false);
    }
});

async function handleGoogleAuth(isRegistering = false) {
    if (!firebaseInitialized || !auth || !db) { showNotification("Service not available.", "error"); return; }
    showLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const message = result.additionalUserInfo?.isNewUser || isRegistering ? i18next.t('alerts.registerSuccess') : i18next.t('alerts.loginSuccess');
        showNotification(message, 'success');
        
        if ((result.additionalUserInfo?.isNewUser || isRegistering)) {
            const userDocRef = doc(db, `artifacts/${appIdFromGlobal}/users/${user.uid}`);
            await setDoc(userDocRef, {
                name: user.displayName, 
                email: user.email, 
                username: user.email, 
                createdAt: serverTimestamp(),
                coreProfile: { name: user.displayName, email: user.email }, 
                assessments: [], 
                profileData: {}, 
                userGeneratedQuestions: [],
                isPublic: false 
            }, { merge: true });
        }
        closeAllModals();
    } catch (err) {
        showNotification(i18next.t('alerts.loginFailed') + ` ${err.code} - ${err.message}`, 'error');
    } finally {
        showLoading(false);
    }
}
document.getElementById('googleLoginBtn')?.addEventListener('click', () => handleGoogleAuth(false));
document.getElementById('googleRegisterBtn')?.addEventListener('click', () => handleGoogleAuth(true)); // If exists on page

document.getElementById('registerForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!firebaseInitialized || !auth || !db) { showNotification("Service not available.", "error"); return; }
    showLoading(true);
    const name = sanitizeInput(document.getElementById('registerName').value);
    const email = sanitizeInput(document.getElementById('registerEmail').value);
    const password = document.getElementById('registerPassword').value;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        const userDocRef = doc(db, `artifacts/${appIdFromGlobal}/users/${userCredential.user.uid}`);
        await setDoc(userDocRef, {
            name: name, 
            email: email, 
            username: email, 
            createdAt: serverTimestamp(),
            coreProfile: { name: name, email: email }, 
            assessments: [], 
            profileData: {}, 
            userGeneratedQuestions: [],
            isPublic: false
        });
        showNotification(i18next.t('alerts.registerSuccess'), 'success');
        closeModal('registerModal');
    } catch (err) {
        showNotification(i18next.t('alerts.registerFailed') + ` ${err.message}`, 'error');
    } finally {
        showLoading(false);
    }
});

logoutBtnNavEl?.addEventListener('click', async () => {
    if (!firebaseInitialized || !auth) { showNotification("Service not available.", "error"); return; }
    showLoading(true);
    try {
        if (auth.currentUser) {
            await signOut(auth);
            // onAuthStateChanged will handle UI updates
        } else if (localStorage.getItem('tempProfile')) { 
            localStorage.removeItem('tempProfile');
            updateUIForLoggedOutUser(); // Manually update UI
            showNotification(i18next.t('alerts.logoutSuccess'), 'info');
             window.location.href = 'index.html'; // Redirect to home after temp logout
        }
    } catch (error) {
        console.error("Sign out error in main.js", error);
        showNotification("Error signing out: " + error.message, "error");
    } finally {
        showLoading(false);
        if (!auth.currentUser && !localStorage.getItem('tempProfile')) {
            updateUIForLoggedOutUser();
             window.location.href = 'index.html';
        }
    }
});

// Temp Profile Modal Logic (if elements exist on current page)
document.getElementById('createTempProfileFromLoginModalBtn')?.addEventListener('click', () => { closeModal('loginModal'); showModal('tempProfileModal'); });
document.getElementById('loginWithTempProfileModalBtn')?.addEventListener('click', () => { closeModal('loginModal'); showModal('tempProfileLoginModal'); });
document.getElementById('tempProfileGotItBtn')?.addEventListener('click', () => closeModal('tempProfileModal'));

document.getElementById('tempProfileForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!firebaseInitialized || !db) { showNotification("Service not available.", "error"); return; }
    showLoading(true);
    const username = sanitizeInput(document.getElementById('tempUsername').value.trim());
    if (!username) { showNotification("Please enter a username.", 'error'); showLoading(false); return; }
    
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAtDate = new Date(); expiresAtDate.setDate(expiresAtDate.getDate() + 90);

    const tempProfilesCol = collection(db, `artifacts/${appIdFromGlobal}/public/data/tempProfiles`);
    const q = query(tempProfilesCol, where('username', '==', username));
    
    try {
        const snapshot = await getDocs(q);
        if (!snapshot.empty) { 
            showNotification("Username already taken. Please choose another one.", 'error'); 
            showLoading(false); 
            return; 
        }
        
        const docRef = await addDoc(tempProfilesCol, {
            username: username, 
            code: code, 
            createdAt: serverTimestamp(),
            expiresAt: Timestamp.fromDate(expiresAtDate),
            coreProfile: { name: username }, 
            assessments: [], 
            profileData: {}, 
            userGeneratedQuestions: []
        });

        const tempProfileDetails = { username: username, code: code, id: docRef.id, expiresAt: expiresAtDate.toISOString() };
        localStorage.setItem('tempProfile', JSON.stringify(tempProfileDetails));
        
        const tempProfileCodeDisplay = document.getElementById('tempProfileCodeDisplay');
        if (tempProfileCodeDisplay) tempProfileCodeDisplay.textContent = code;
        
        const tempProfileCodeSection = document.getElementById('tempProfileCodeSection');
        if (tempProfileCodeSection) tempProfileCodeSection.style.display = 'block';
        
        const tempProfileFormEl = document.getElementById('tempProfileForm');
        if (tempProfileFormEl) tempProfileFormEl.style.display = 'none';

        showNotification(i18next.t('alerts.tempProfileCreated'), 'success');
        updateUIForTempUser(tempProfileDetails);
        closeModal('tempProfileModal');
        // No automatic redirect, user stays on current page or can navigate via profile button
    } catch (err) {
        showNotification("Error creating temporary profile: " + err.message, 'error');
    } finally {
        showLoading(false);
    }
});

document.getElementById('tempProfileLoginForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!firebaseInitialized || !db) { showNotification("Service not available.", "error"); return; }
    showLoading(true);
    const username = sanitizeInput(document.getElementById('tempLoginUsername').value.trim());
    const code = sanitizeInput(document.getElementById('tempLoginCode').value.trim());

    const tempProfilesCol = collection(db, `artifacts/${appIdFromGlobal}/public/data/tempProfiles`);
    const q = query(tempProfilesCol, where('username', '==', username), where('code', '==', code));

    try {
        const snapshot = await getDocs(q);
        if (snapshot.empty) throw new Error(i18next.t('alerts.tempProfileLoginFailed'));
        
        let foundProfile = null, profileId = null;
        snapshot.forEach(docSnap => { 
            foundProfile = docSnap.data(); profileId = docSnap.id; 
        });

        if (!foundProfile) throw new Error(i18next.t('alerts.tempProfileLoginFailed'));
        
        if (foundProfile.expiresAt.toDate() < new Date()) {
            await deleteDoc(doc(db, `artifacts/${appIdFromGlobal}/public/data/tempProfiles`, profileId)); 
            localStorage.removeItem('tempProfile');
            throw new Error(i18next.t('alerts.tempProfileExpired'));
        }
        const tempProfileDetails = { username: username, code: code, id: profileId, expiresAt: foundProfile.expiresAt.toDate().toISOString() };
        localStorage.setItem('tempProfile', JSON.stringify(tempProfileDetails));
        showNotification(i18next.t('alerts.tempProfileLoginSuccess'), 'success');
        closeModal('tempProfileLoginModal');
        updateUIForTempUser(tempProfileDetails);
        // No automatic redirect
    } catch (err) {
        showNotification(err.message, 'error');
    } finally {
        showLoading(false);
    }
});


// --- Search Modal ---
document.getElementById('globalSearchTriggerBtn')?.addEventListener('click', () => showModal('searchModal'));
document.getElementById('searchSubmitBtn')?.addEventListener('click', () => {
    const searchTerm = sanitizeInput(document.getElementById('searchInput').value.trim());
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = `<p>Searching for: "${searchTerm}"... (Search functionality not fully implemented in this MPA example)</p>`;
        // Actual search logic would go here, potentially fetching from Firestore or client-side data
    }
});

// --- Footer Year ---
if (currentYearFooterEl) currentYearFooterEl.textContent = new Date().getFullYear();

// --- General Initialization for Dynamic Content ---
// This function can be expanded to re-initialize parts of the UI that depend on language or auth state
function initializeDynamicContent() {
    console.log("Initializing dynamic content in main.js (e.g., after lang change or auth change)");
    // Example: If some tooltips or dynamic text rely on i18next and are not covered by data-i18n
}

// --- Functions needed by profile.js (or other page-specific scripts) can be exposed or called ---
// Expose getProfileRef for use in page-specific scripts if needed
window.getProfileRef = function() {
    if (!firebaseInitialized || !db) return null;
    if (currentUserId) {
        const collectionPath = isTempUser ? 
            `artifacts/${appIdFromGlobal}/public/data/tempProfiles` : 
            `artifacts/${appIdFromGlobal}/users`;
        return doc(db, collectionPath, currentUserId);
    }
    return null;
}

// Expose currentUserId and isTempUser for page-specific logic
Object.defineProperty(window, 'currentUserId', { get: () => currentUserId });
Object.defineProperty(window, 'isTempUser', { get: () => isTempUser });
Object.defineProperty(window, 'firebaseInitialized', { get: () => firebaseInitialized });
Object.defineProperty(window, 'db', { get: () => db });
Object.defineProperty(window, 'auth', { get: () => auth });
Object.defineProperty(window, 'storage', { get: () => storage });
Object.defineProperty(window, 'appIdFromGlobal', { get: () => appIdFromGlobal });
Object.defineProperty(window, 'Timestamp', { get: () => Timestamp });
Object.defineProperty(window, 'serverTimestamp', { get: () => serverTimestamp });
Object.defineProperty(window, 'arrayUnion', { get: () => arrayUnion });
Object.defineProperty(window, 'arrayRemove', { get: () => arrayRemove });
Object.defineProperty(window, 'doc', { get: () => doc });
Object.defineProperty(window, 'setDoc', { get: () => setDoc });
Object.defineProperty(window, 'getDoc', { get: () => getDoc });
Object.defineProperty(window, 'updateDoc', { get: () => updateDoc });
Object.defineProperty(window, 'collection', { get: () => collection });
Object.defineProperty(window, 'query', { get: () => query });
Object.defineProperty(window, 'where', { get: () => where });
Object.defineProperty(window, 'getDocs', { get: () => getDocs });
Object.defineProperty(window, 'addDoc', { get: () => addDoc });
Object.defineProperty(window, 'deleteDoc', { get: () => deleteDoc });
Object.defineProperty(window, 'ref', { get: () => ref });
Object.defineProperty(window, 'uploadBytes', { get: () => uploadBytes });
Object.defineProperty(window, 'getDownloadURL', { get: () => getDownloadURL });
Object.defineProperty(window, 'updateProfile', { get: () => updateProfile }); // Firebase Auth updateProfile


// --- Initial Setup on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink(); // Set active nav link on initial page load
    // Other initializations that don't depend on i18next or auth can go here
});

// Landing page specific CTA button listeners (if they exist on the current page)
document.getElementById('registerBtnLanding')?.addEventListener('click', () => showModal('registerModal'));
document.getElementById('loginBtnLanding')?.addEventListener('click', () => showModal('loginModal'));

// Make sure to call initializeDynamicContent and setActiveNavLink after i18next is fully initialized.
// This is handled in the i18next.init callback.

