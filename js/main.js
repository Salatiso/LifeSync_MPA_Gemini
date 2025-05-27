// js/main.js - LifeSync Common JavaScript
// Includes Firebase initialization, auth, i18next, modals, notifications,
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
    updateProfile as updateAuthProfile, // Renamed to avoid conflict with our updateProfileDisplay
    signInAnonymously,
    signInWithCustomToken 
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
    Timestamp,
    arrayUnion,
    arrayRemove 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { 
    getStorage, 
    ref as storageRef, // Renamed to avoid conflict with other 'ref' variables
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
// Optional: Firebase Analytics (uncomment if you set it up in your Firebase console)
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";


// --- Firebase Configuration (User Provided) ---
const firebaseConfig = {
    apiKey: "AIzaSyAW0SakPbUUfpK-gD4SHMIQzlEhpMLzUbI", // Replace with your actual API key if this is a placeholder
    authDomain: "lifesyncapp-391ab.firebaseapp.com",
    projectId: "lifesyncapp-391ab",
    storageBucket: "lifesyncapp-391ab.appspot.com", // Standard format, ensure this is correct in your Firebase console
    messagingSenderId: "617714109567",
    appId: "1:617714109567:web:b7f3cf016d6f7348b1434a",
    measurementId: "G-7XKHR48S14" // Optional
};

// --- Firebase Initialization ---
let app;
let auth;
let db;
let storage;
// let analytics; // Uncomment if using Analytics
let firebaseInitialized = false;
let currentUserId = null; 
let isTempUser = false;
const appIdFromGlobal = 'lifesync-mpa'; // A default or app-specific ID for Firestore paths if needed, not from __app_id anymore

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    // analytics = getAnalytics(app); // Uncomment if using Analytics
    firebaseInitialized = true;
    console.log("Firebase initialized successfully in main.js with direct config.");
    // import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
    // setLogLevel('debug'); // For Firestore debugging
} catch (error) {
    console.error("Firebase initialization error in main.js:", error);
    const body = document.querySelector('body');
    if (body) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = "Service configuration error. Key features may be unavailable.";
        errorDiv.style.cssText = "background-color: var(--accent-pink-vibrant); color: var(--text-primary-light); padding: 10px; text-align: center; position: fixed; bottom: 0; width: 100%; z-index: 5000;";
        body.appendChild(errorDiv);
    }
}

// --- i18next Internationalization ---
const translations = { 
    en: { 
        translation: { /* Your full English translations object */
            title: "LifeSync - Deepen Your Connections",
            nav: { brand: "LifeSync", home: "Home", assessments: "Assessments", tools: "Tools", resources: "Resources", profile: "My Profile", login: "Login", register: "Register", logout: "Logout" },
            landing: { /* ... all landing translations ... */ 
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
            assessments: { /* ... all assessment translations ... */ 
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
                        q_personal_space: "How often do you need personal space?",
                        q_spontaneity_planning: "Do you value spontaneity or planning more?",
                        q_family_involvement: "How important is family involvement in your relationship?",
                        q_comm_style: "What's your preferred communication style in disagreements?",
                        q_conflict_resolution: "How do you typically approach conflict resolution?",
                        q_social_circle: "Do you prefer a small, close-knit social circle or a large network?",
                        q_travel_preference: "What's your ideal type of vacation?",
                        q_dietary_habits: "Are you adventurous with food or prefer familiar options?",
                        q_long_term_goals: "What are your primary long-term life goals?",
                        q_parenting_style: "If applicable, what's your general view on parenting styles?",
                        q_spirituality: "How important is spirituality or religion in your life?",
                        q_political_views: "How do you approach differing political views in a partner?",
                        q_cultural_background_match: "How important is a similar cultural background in a partner?"
                    },
                    options: { 
                        opt_not_important: "Not important", opt_somewhat_important: "Somewhat important", opt_very_important: "Very important",
                        opt_indoors: "Indoors", opt_outdoors: "Outdoors", opt_both: "Both equally",
                        opt_rarely: "Rarely", opt_sometimes: "Sometimes", opt_often: "Often",
                        opt_spontaneity: "Spontaneity", opt_planning: "Planning",
                        opt_direct: "Direct & Open", opt_indirect: "Indirect & Cautious",
                        opt_discuss_now: "Discuss immediately", opt_cool_off: "Cool off first",
                        opt_small_circle: "Small circle", opt_large_network: "Large network",
                        opt_relaxing: "Relaxing (beach, spa)", opt_adventure: "Adventure (hiking, exploring)",
                        opt_anything: "Eat anything", opt_specific_diet: "Specific diet/preferences",
                        opt_career_focus: "Career focused", opt_family_focus: "Family focused", opt_balance_both: "Balance both",
                        opt_strict: "Strict", opt_lenient: "Lenient", opt_authoritative: "Authoritative (balanced)",
                        opt_very_spiritual: "Very spiritual/religious", opt_somewhat_spiritual: "Somewhat spiritual/religious", opt_not_spiritual: "Not spiritual/religious",
                        opt_similar_views: "Prefer similar views", opt_differences_ok: "Differences are okay/enriching",
                        opt_important_match: "Important match", opt_not_important_match: "Not an important match"
                    },
                    results: { 
                        completed: "You completed the",
                        checkWith: "compatibility check with",
                        answers: "answers"
                    }
                },
                profileBuilder: { 
                    title: "My Relationship Profile Builder",
                    description: "Build your detailed LifeSync profile by answering these questions about your views, preferences, lifestyle, and more. This forms the basis for future syncs and deeper insights.",
                    questions: { 
                        "profileBuilder.q_love_language_give": "What is your primary love language for GIVING affection?",
                        "profileBuilder.q_love_language_receive": "What is your primary love language for RECEIVING affection?",
                        "profileBuilder.q_financial_transparency_scale": "On a scale of 1 (not at all) to 5 (very), how important is financial transparency to you in a serious relationship?",
                        "profileBuilder.q_stress_handling": "How do you typically handle stress or difficult emotions?",
                        "profileBuilder.q_family_involvement_expectations": "What are your expectations regarding family involvement (e.g., holidays, major decisions)?",
                        "profileBuilder.q_spiritual_beliefs_match_importance": "How important is it for your partner to share your spiritual or religious beliefs?",
                        "profileBuilder.q_children_stance": "What is your stance on having children?",
                        "profileBuilder.q_past_relationships_discussion": "How do you feel about discussing past relationships with a new partner?",
                        "profileBuilder.q_lobola_view": "What role does 'Lobola' (or similar cultural marriage customs) play in your view of marriage, if any?",
                        "profileBuilder.q_household_responsibilities": "How do you envision division of household responsibilities in a cohabiting relationship?"
                    },
                    options: { 
                        words: "Words of Affirmation", acts: "Acts of Service", gifts: "Receiving Gifts", quality_time: "Quality Time", touch: "Physical Touch",
                        "1": "1 (Not at all)", "2": "2", "3": "3 (Moderately)", "4": "4", "5": "5 (Very)",
                        talk_it_out: "Talk it out", alone_time: "Need alone time", distract_myself: "Distract myself", exercise: "Exercise/Activity",
                        very_involved: "Very involved", moderately_involved: "Moderately involved", minimal_involvement: "Minimal involvement",
                        very_important: "Very important", somewhat_important: "Somewhat important", not_important: "Not important",
                        definitely_want: "Definitely want them", open_to_discussion: "Open to discussion", prefer_not: "Prefer not to have children", undecided: "Undecided",
                        open_book: "Open book, happy to share", some_details_ok: "Some details are okay, if relevant", prefer_not_much: "Prefer not to discuss much",
                        essential_tradition: "Essential tradition", important_cultural: "Important cultural aspect", open_to_modern: "Open to modern interpretations/discussion", not_applicable: "Not applicable/relevant to me",
                        strictly_50_50: "Strictly 50/50", based_on_time_skill: "Based on who has more time/skill", flexible_circumstances: "Flexible, depends on circumstances", outsource_some: "Prefer to outsource some tasks"
                    },
                    importanceLabel: "How crucial is this for you? (1-5):",
                    progressQuestion: "Question", progressOf: "of", nextBtn: "Next Question",
                    resultsTitle: "Profile Section Complete!", results: { 
                        completedWith: "You completed your profile builder with",
                        answers: "answers"
                    },
                    reviewBtn: "Review Answers", viewProfileBtn: "View My Profile"
                },
                note: "More in-depth assessments on finances, cultural values (e.g., lobola discussions, family roles), lifestyle, and long-term goals are available once you create your profile and connect with a partner."
            },
            tools: { /* ... tools translations ... */ 
                title: "Relationship Enhancement Tools", 
                subtitle: "Access a suite of tools designed to foster communication, track progress, and navigate challenges together.",
                explore: "Explore Resources",
                communication: {title: "Communication Guides", description: "Structured prompts and guides for discussing sensitive topics like finances, family expectations, and future plans."},
                milestone: { title: "Milestone & Date Tracker", description: "Log important dates, anniversaries, and relationship milestones. Get reminders and celebrate together." },
                monitoring: { title: "Parameter Monitoring", description: "Track changes in key relationship aspects (e.g., frequency of affirming words, shared activities) and get gentle nudges." },
                conflict: { title: "Conflict Resolution Aids", description: "Tools to help navigate disagreements constructively, including structured feedback exchange." },
                goals: { title: "Shared Goals & Dreams", description: "Define and track progress towards shared aspirations as a couple." },
                closure: { title: "Relationship Closure (If Needed)", description: "Tools to facilitate a respectful and clear process if a relationship ends." },
                comingSoon: "Coming Soon" 
            },
            resources: { /* ... resources translations ... */ 
                pageTitle: "Relationship Resources Hub",
                pageSubtitle: "Explore a curated list of tools, services, and information to support your relationship journey.",
                wizard: {
                    title: "Resource Discovery Wizard",
                    introTitle: "How to Use This Section",
                    introText: "Use the search bar below to find specific resources, or browse through the categories. Click on a category to see available items. Automated suggestions based on your profile will be available soon!",
                    automatedIntro: "Based on your profile, we might have some suggestions for you (Feature Coming Soon!).",
                    customizeBtn: "Customize Suggestions (Coming Soon)",
                    searchLabel: "Search All Resources:",
                    searchPlaceholder: "e.g., counseling, dating apps...",
                    searchBtn: "Search",
                    browseCategories: "Or Browse Categories:",
                    searchResults: "Search Results" // Added for search results title
                },
                backToCategories: "Back to Categories",
                visitSite: "Visit Site",
                noItemsInCategory: "No items listed in this category yet.",
                category: { 
                    dating: "Dating & Meeting Platforms",
                    personalityAssessments: "Personality & Compatibility Assessments", 
                    christian: "Christian Relationship Resources", 
                    astrology: "Astrology & Spiritual Compatibility", 
                    counseling: "Relationship Counseling & Therapy", 
                    legal: "Legal Services & Marriage Laws", 
                    preMarriage: "Pre-Marriage Services", 
                    marriageEnhancement: "Marriage Enhancement", 
                    familyPlanning: "Family Planning & Parenting", 
                    crisisSupport: "Crisis & Support Services", 
                    separationDivorce: "Separation & Divorce Services", 
                    postDivorce: "Post-Divorce Support", 
                    lgbtq: "LGBTQ+ Specific Services", 
                    culturalTraditional: "Cultural & Traditional Services", 
                    additionalGov: "Government & Educational Resources", 
                    emergency: "Emergency Contacts Summary" 
                },
                datingDesc: { /* ... all datingDesc ... */ 
                    tinder: "Popular swipe-based dating app for meeting new people.",
                    bumble: "Dating app where women make the first move."
                },
                counselingDesc: { /* ... all counselingDesc ... */ 
                    famsa: "Family and Marriage Society of SA - Offers counseling and support."
                },
                emergencyDesc: { /* ... all emergencyDesc ... */ 
                    lifeLineSAEmergency: "LifeLine SA: 0861 322 322 (24/7 emotional support and crisis intervention)."
                }
            },
            profile: { /* ... profile translations ... */ 
                title: "My LifeSync Profile", 
                subtitle: "This is your personal space. Manage your details, track your progress, and control your sharing preferences.",
                completionTitle: "Profile Completion",
                completionHint: "Complete your profile to unlock more insights and features!",
                uploadPicture: "Upload Picture",
                avatarComingSoon: "(Avatars coming soon)",
                makePublic: "Make Profile Public (to registered users)",
                basicInfoTitle: "Basic Information",
                dobLabel: "Date of Birth:",
                genderLabel: "Gender:",
                selectOption: "Select...",
                genderMale: "Male", genderFemale: "Female", genderNonBinary: "Non-binary", genderOther: "Other", genderPreferNot: "Prefer not to say",
                locationLabel: "Location (City, Country):",
                locationPlaceholder: "e.g., Johannesburg, South Africa",
                lifestyleTitle: "Lifestyle & Interests",
                hobbiesLabel: "Hobbies & Interests (comma-separated):",
                hobbiesPlaceholder: "e.g., hiking, reading, coding",
                educationLabel: "Education Level:",
                educationPlaceholder: "e.g., Bachelor's Degree in CS",
                occupationLabel: "Occupation/Profession:",
                occupationPlaceholder: "e.g., Software Developer",
                aboutMeLabel: "About Me (Short Bio):",
                aboutMePlaceholder: "Tell us a bit about yourself...",
                saveProfileBtn: "Save Profile Details",
                assessmentsTitle: "Completed Assessments:", 
                partnersTitle: "Synced Partners:", 
                noPartners: "No partner synced yet.", 
                connectBtn: "Connect with Partner", 
                dataTitle: "Assessment Profile Data & Preferences:", 
                dataNote: "This section shows data from your completed assessments.",
                importTitle: "Import Your Data:", 
                importInstructionsSocial: "Upload your data file (e.g., LinkedIn ZIP, Facebook JSON) to enhance your profile.", 
                importBtnSocial: "Import Social/Dating Data",
                importInstructionsAI: "Use AI to extract info from documents (e.g., CV). Process externally, then upload the generated JSON.",
                aiUploadLabel: "Upload AI-Processed JSON:",
                importBtnAI: "Import AI Processed Data",
                aiToolNote: "Note: Use tools like Gemini, Grok, etc., to process your documents into a structured JSON first.",
                loadingAssessments: "Loading assessments...", 
                loadingData: "Loading data...",
                typePermanent: "Permanent Account", 
                typeTemporary: "Temporary Profile",
                emailTemp: "Email: (Temporary Profile - Not Set)",
                expiresOn: "Expires on:",
                guestName: "Guest User",
                guestEmail: "Email: Not logged in",
                noAssessmentsLoggedIn: "Log in or create a profile to see completed assessments.",
                noDataLoggedIn: "Log in or create a profile to see your data.",
                noAssessmentsYet: "No assessments completed yet. Explore the Assessments tab!",
                noProfileDataYet: "No profile data added yet. Complete assessments or import data.",
                completedOn: "Completed on",
                ugqTitle: "My Custom Questions", 
                ugqTitleLong: "My Questions", 
                ugqCreateTitle: "Create a New Question",
                ugqQuestionLabel: "Your Question:",
                ugqQuestionPlaceholder: "e.g., What's your ideal Sunday?",
                ugqAnswerLabel: "Your Answer:",
                ugqAnswerPlaceholder: "e.g., A mix of adventure and relaxation.",
                ugqCategoryLabel: "Category (Optional):",
                ugqCategoryPlaceholder: "e.g., Lifestyle, Values",
                ugqSaveBtn: "Save Question",
                ugqNone: "You haven't added any custom questions yet."
            },
            ugq: { 
                subtitle: "Create your own questions to explore specific areas of compatibility that matter most to you and your partner.",
                privateLabel: "Keep this question private (only visible to you and synced partners you share with)",
                yourQuestionsTitle: "Your Created Questions"
            },
            sync: { 
                title: "Couple Sync",
                subtitle: "Connect with your partner to share insights and grow together. All sharing requires mutual consent.",
                connectTitle: "Connect with Partner",
                partnerUsernameLabel: "Partner's Username:",
                partnerUsernamePlaceholder: "Enter your partner's LifeSync username",
                sendRequest: "Send Sync Request",
                pendingTitle: "Pending Requests",
                noPending: "No pending requests.",
                syncedTitle: "Synced Partners",
                noSynced: "You are not synced with any partners yet."
            },
            notifications: { title: "Notifications", welcome: "Welcome to LifeSync! Complete your profile to get started." },
            footer: { privacy: "Privacy Policy", terms: "Terms of Service", built: "Built with <i class='fa-solid fa-heart' style='color: var(--accent-pink-vibrant)'></i> for LifeSync."},
            login: { /* ... login modal translations ... */ 
                title: "Login to LifeSync", 
                subtitle: "Access your profile, assessments, and synced data.",
                emailLabel: "Email:", emailPlaceholder: "your@email.com",
                passwordLabel: "Password:", passwordPlaceholder: "Your password",
                submit: "Login", google: "Login with Google",
                tempProfilePrompt: "Don't want to sign in? Try LifeSync with a temporary profile:",
                tempProfileBtn: "Create Temporary Profile", loginTempProfileBtn: "Login with Temporary Code"
            },
            register: { /* ... register modal translations ... */ 
                title: "Create Your LifeSync Account",
                subtitle: "Start building your insightful relationship profile.",
                nameLabel: "Name:", namePlaceholder: "Your Name",
                emailLabel: "Email:", emailPlaceholder: "your@email.com",
                passwordLabel: "Password:", passwordPlaceholder: "Create a password (min. 6 characters)",
                submit: "Register", google: "Register with Google"
            },
            tempProfile: { /* ... temp profile modal translations ... */ 
                title: "Create Temporary Profile",
                subtitle: "Create a temporary profile to explore LifeSync for 90 days.",
                usernameLabel: "Username:", usernamePlaceholder: "Choose a username",
                createBtn: "Create Profile & Get Code",
                codeInstructions: "Your temporary profile has been created! Use this code to log in:",
                expiryNote: "This profile will expire in 90 days. Save your username and code securely!",
                gotItBtn: "I've Saved It!"
            },
            tempProfileLogin: { /* ... temp profile login modal translations ... */ 
                title: "Login with Temporary Profile",
                usernameLabel: "Username:", usernamePlaceholder: "Your username",
                codeLabel: "Code:", codePlaceholder: "Your access code",
                submit: "Login"
            },
            search: { /* ... search modal translations ... */ 
                title: "Search LifeSync",
                placeholder: "Search profiles, assessments, resources...",
                submit: "Search",
                button: "Search" 
            },
            alerts: { /* ... alert messages ... */ 
                selectionNeeded: "Please select an answer to proceed.",
                loginSuccess: "Logged in successfully! Welcome back.",
                loginFailed: "Login failed. Please check your email and password.",
                registerSuccess: "Registered successfully! Please log in to continue.",
                registerFailed: "Registration failed. The email might already be in use or an error occurred.",
                tempProfileCreated: "Temporary profile created! Your access code is displayed below. Please save it securely.",
                tempProfileLoginSuccess: "Logged in with temporary profile successfully!",
                tempProfileLoginFailed: "Invalid username or code. Please check and try again.",
                tempProfileExpired: "This temporary profile has expired. Please register for a permanent account.",
                importSuccess: "Social media data imported successfully! Check your profile.",
                importFailed: "Failed to import data. Please ensure the file format is correct or try again.",
                aiImportSuccess: "AI processed data imported successfully!",
                aiImportFailed: "Failed to import AI processed data. Ensure it's valid JSON from LifeSync AI processing.",
                logoutSuccess: "Logged out successfully!",
                selectFileFirst: "Please select a file first before importing.",
                processingFile: "Processing file...",
                zipParsingNotImplemented: "ZIP file processing is not fully implemented in this example. Please try a JSON file if available.",
                unsupportedFileFormat: "Unsupported file format. Please upload a JSON file.",
                fileReadError: "Error reading the selected file.",
                noActiveProfileForImport: "No active profile to import data to. Please log in or create a temporary profile first.",
                loginToImport: "Please log in or create a temporary profile to import data.",
                ugqSaved: "Your custom question has been saved!",
                ugqError: "Error saving custom question. Please try again.",
                ugqFieldsMissing: "Please fill in both the question and your answer.",
                profileDetailsSaved: "Profile details saved successfully!",
                profileDetailsError: "Error saving profile details.",
                imageUploadSuccess: "Profile image uploaded successfully!",
                imageUploadError: "Error uploading profile image.",
                loginToUgq: "Please log in to add questions.", // Added
                loginToSaveUgq: "Please log in to save questions." // Added
            }
        }
    },
    xh: { translation: { /* ... Xhosa translations ... */ } },
    zu: { translation: { /* ... Zulu translations ... */ } },
    af: { translation: { /* ... Afrikaans translations ... */ } }
    // Add other languages as needed
};

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
        setActiveNavLink(); 
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

const languageSelector = document.getElementById('languageSelector');
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
const loadingOverlay = document.getElementById('loadingOverlay');
window.showLoading = function(show) {
    if (loadingOverlay) loadingOverlay.style.display = show ? 'flex' : 'none';
}

window.sanitizeInput = function(input) { 
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// --- Navigation Highlighting for MPA ---
function setActiveNavLink() {
    const currentPagePath = window.location.pathname.split("/").pop() || "index.html"; // Default to index.html if path is empty
    const navLinks = document.querySelectorAll('nav .nav-links a.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active-nav');
        const linkPath = (link.getAttribute('href') || "").split("/").pop();
        if (linkPath === currentPagePath) {
            link.classList.add('active-nav');
        }
    });
}

// --- Modal Management ---
window.showModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('active');
}

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.remove('active');
}

window.closeAllModals = function() {
    document.querySelectorAll('.modal.active').forEach(modal => modal.classList.remove('active'));
}

document.querySelectorAll('.modal .close-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const modalId = e.target.dataset.modalId; 
        if(modalId) closeModal(modalId);
    });
});

window.addEventListener('click', (event) => {
    document.querySelectorAll('.modal.active').forEach(modal => {
        if (event.target == modal) {
            closeModal(modal.id);
        }
    });
});

// --- Notifications ---
const notificationsAreaEl = document.getElementById('notificationsArea');
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

// --- Authentication Logic & UI Updates ---
const loginBtnNavEl = document.getElementById('loginBtnNav');
const registerBtnNavEl = document.getElementById('registerBtnNav');
const logoutBtnNavEl = document.getElementById('logoutBtnNav');
const navProfileBtnEl = document.getElementById('navProfileBtn');

function updateUIForLoggedOutUser() {
    if (loginBtnNavEl) loginBtnNavEl.style.display = 'inline-block';
    if (registerBtnNavEl) registerBtnNavEl.style.display = 'inline-block';
    if (logoutBtnNavEl) logoutBtnNavEl.style.display = 'none';
    if (navProfileBtnEl) {
        navProfileBtnEl.style.display = 'none';
        navProfileBtnEl.innerHTML = `<i class="fa-solid fa-user-circle"></i> <span data-i18n="nav.profile">${i18next.t('nav.profile')}</span>`;
    }
    currentUserId = null;
    isTempUser = false;
    if (typeof window.updateProfileDisplay === "function") window.updateProfileDisplay(); 
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
    if (typeof window.updateProfileDisplay === "function") window.updateProfileDisplay();
}

if (firebaseInitialized && auth) {
    // No automatic anonymous or custom token sign-in here for public deployment.
    // User will need to explicitly log in.
    // onAuthStateChanged will handle existing sessions.
    console.log("Firebase Auth initialized. Waiting for user interaction or existing session.");

    onAuthStateChanged(auth, user => {
        window.showLoading(true);
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
        if (typeof window.updateProfileDisplay === "function") window.updateProfileDisplay(); 
        initializeDynamicContent(); 
        window.showLoading(false);
    });
} else {
    console.warn("Firebase Auth not initialized in main.js. Auth features will be limited.");
    updateUIForLoggedOutUser(); 
    window.showLoading(false);
}

// Event Listeners for Auth Buttons (if they exist on the current page)
loginBtnNavEl?.addEventListener('click', () => showModal('loginModal'));
registerBtnNavEl?.addEventListener('click', () => showModal('registerModal'));

document.getElementById('loginForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!firebaseInitialized || !auth) { showNotification("Service not available.", "error"); return; }
    window.showLoading(true);
    const email = window.sanitizeInput(document.getElementById('loginEmail').value);
    const password = document.getElementById('loginPassword').value; 
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showNotification(i18next.t('alerts.loginSuccess'), 'success');
        closeModal('loginModal');
    } catch (err) {
        showNotification(i18next.t('alerts.loginFailed') + ` ${err.message}`, 'error');
    } finally {
        window.showLoading(false);
    }
});

async function handleGoogleAuth(isRegistering = false) {
    if (!firebaseInitialized || !auth || !db) { showNotification("Service not available.", "error"); return; }
    window.showLoading(true);
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
                username: user.email, // Using email as username for Google Sign-In
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
        window.showLoading(false);
    }
}
document.getElementById('googleLoginBtn')?.addEventListener('click', () => handleGoogleAuth(false));
document.getElementById('googleRegisterBtn')?.addEventListener('click', () => handleGoogleAuth(true));

document.getElementById('registerForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!firebaseInitialized || !auth || !db) { showNotification("Service not available.", "error"); return; }
    window.showLoading(true);
    const name = window.sanitizeInput(document.getElementById('registerName').value);
    const email = window.sanitizeInput(document.getElementById('registerEmail').value);
    const password = document.getElementById('registerPassword').value;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateAuthProfile(userCredential.user, { displayName: name }); // Firebase Auth updateProfile
        
        const userDocRef = doc(db, `artifacts/${appIdFromGlobal}/users/${userCredential.user.uid}`);
        await setDoc(userDocRef, {
            name: name, 
            email: email, 
            username: email, // Using email as username for email/password registration
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
        window.showLoading(false);
    }
});

logoutBtnNavEl?.addEventListener('click', async () => {
    if (!firebaseInitialized || !auth) { showNotification("Service not available.", "error"); return; }
    window.showLoading(true);
    try {
        if (auth.currentUser) {
            await signOut(auth);
            // onAuthStateChanged will handle UI updates for Firebase users
        } else if (localStorage.getItem('tempProfile')) { 
            localStorage.removeItem('tempProfile');
            updateUIForLoggedOutUser(); 
            showNotification(i18next.t('alerts.logoutSuccess'), 'info');
            if (window.location.pathname.split("/").pop() !== "index.html" && window.location.pathname !== "/") {
                 window.location.href = 'index.html'; 
            }
        }
    } catch (error) {
        console.error("Sign out error in main.js", error);
        showNotification("Error signing out: " + error.message, "error");
    } finally {
        window.showLoading(false);
        if (!auth.currentUser && !localStorage.getItem('tempProfile')) {
            updateUIForLoggedOutUser();
            if (window.location.pathname.split("/").pop() !== "index.html" && window.location.pathname !== "/") {
                 window.location.href = 'index.html';
            }
        }
    }
});

// Temp Profile Modal Logic
document.getElementById('createTempProfileFromLoginModalBtn')?.addEventListener('click', () => { closeModal('loginModal'); showModal('tempProfileModal'); });
document.getElementById('loginWithTempProfileModalBtn')?.addEventListener('click', () => { closeModal('loginModal'); showModal('tempProfileLoginModal'); });
document.getElementById('tempProfileGotItBtn')?.addEventListener('click', () => closeModal('tempProfileModal'));

document.getElementById('tempProfileForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!firebaseInitialized || !db) { showNotification("Service not available.", "error"); return; }
    window.showLoading(true);
    const username = window.sanitizeInput(document.getElementById('tempUsername').value.trim());
    if (!username) { showNotification("Please enter a username.", 'error'); window.showLoading(false); return; }
    
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAtDate = new Date(); expiresAtDate.setDate(expiresAtDate.getDate() + 90);

    const tempProfilesCol = collection(db, `artifacts/${appIdFromGlobal}/public/data/tempProfiles`);
    const q = query(tempProfilesCol, where('username', '==', username));
    
    try {
        const snapshot = await getDocs(q);
        if (!snapshot.empty) { 
            showNotification("Username already taken. Please choose another one.", 'error'); 
            window.showLoading(false); 
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
        // Navigate to profile page after creating temp profile if desired
        // if (window.location.pathname.split("/").pop() !== "profile.html") {
        // window.location.href = 'profile.html';
        // }
    } catch (err) {
        showNotification("Error creating temporary profile: " + err.message, 'error');
    } finally {
        window.showLoading(false);
    }
});

document.getElementById('tempProfileLoginForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!firebaseInitialized || !db) { showNotification("Service not available.", "error"); return; }
    window.showLoading(true);
    const username = window.sanitizeInput(document.getElementById('tempLoginUsername').value.trim());
    const code = window.sanitizeInput(document.getElementById('tempLoginCode').value.trim());

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
        // Navigate to profile page after temp login if desired
        // if (window.location.pathname.split("/").pop() !== "profile.html") {
        // window.location.href = 'profile.html';
        // }
    } catch (err) {
        showNotification(err.message, 'error');
    } finally {
        window.showLoading(false);
    }
});


// --- Search Modal ---
document.getElementById('globalSearchTriggerBtn')?.addEventListener('click', () => showModal('searchModal'));
document.getElementById('searchSubmitBtn')?.addEventListener('click', () => {
    const searchInputEl = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    if (!searchInputEl || !resultsContainer) return;

    const searchTerm = window.sanitizeInput(searchInputEl.value.trim());
    if (resultsContainer) {
        resultsContainer.innerHTML = `<p>Searching for: "${searchTerm}"... (Search functionality to be fully implemented)</p>`;
        // Actual search logic would go here
    }
});

// --- Footer Year ---
const currentYearFooterEl = document.getElementById('currentYearFooter');
if (currentYearFooterEl) currentYearFooterEl.textContent = new Date().getFullYear();

// --- General Initialization for Dynamic Content ---
function initializeDynamicContent() {
    console.log("Initializing/Re-initializing dynamic content based on language/auth state.");
    // This function is called after i18next init and auth state changes.
    // It can be used to re-render or update parts of the UI that depend on these states
    // and are not automatically handled by data-i18n or the auth UI updaters.
    // For example, if specific page content needs to be re-fetched or re-rendered.
}

// --- Global Exports for Page-Specific Scripts ---
// Exposing Firebase services and utility functions to the window object
// This allows page-specific JS files to access them.
Object.assign(window, {
    firebaseInitialized,
    auth,
    db,
    storage,
    appIdFromGlobal, // Using the hardcoded one for now
    Timestamp,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    storageRef, // Renamed from 'ref'
    uploadBytes,
    getDownloadURL,
    updateAuthProfile // Renamed from 'updateProfile'
});

// --- Initial Setup on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink(); 
    // Call other initializations that should run once the DOM is ready
    // but might not depend on i18next or Firebase being fully ready yet.
    // For example, attaching listeners to static elements that don't change with language.
    
    // Landing page specific CTA button listeners (if they exist on the current page)
    const registerBtnLanding = document.getElementById('registerBtnLanding');
    const loginBtnLanding = document.getElementById('loginBtnLanding');

    if(registerBtnLanding) {
        registerBtnLanding.addEventListener('click', () => window.showModal('registerModal'));
    }
    if(loginBtnLanding) {
        loginBtnLanding.addEventListener('click', () => window.showModal('loginModal'));
    }
});

// Ensure i18next dependent functions are called after i18next is initialized (handled in i18next.init callback)
