/* LifeSync Common Stylesheet */

/* Root Variables */
:root {
    --bg-dark-purple: #301934;
    --bg-content-purple: rgba(45, 25, 55, 0.97);
    --bg-content-purple-opaque: rgb(45, 25, 55);
    --bg-card-purple: rgba(60, 30, 70, 0.92);
    --bg-card-purple-solid: rgb(60, 30, 70);
    --text-primary-light: #FDE7F3;
    --text-secondary-lavender: #E9D5FF;
    --accent-pink-vibrant: #DB2777;
    --accent-purple-medium: #A855F7;
    --accent-teal-bright: #2DD4BF;
    --border-color-lavender: rgba(168, 85, 247, 0.35);
    --border-color-strong: rgba(168, 85, 247, 0.65);
    --font-main: 'Poppins', sans-serif;
    --font-heading: 'Ubuntu', sans-serif;
    --nav-height: 60px; /* Adjusted for potential MPA usage */
}

/* Basic Body Styling */
body {
    background-color: var(--bg-dark-purple);
    color: var(--text-primary-light);
    font-family: var(--font-main);
    margin: 0;
    /* For MPA, overflow will be handled by individual pages or sections if needed.
       Consider setting overflow-x: hidden; if horizontal scroll is globally undesirable. */
}

/* Video Background */
#video-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -10;
    filter: brightness(0.25) contrast(1.1) blur(4px);
}

/* Navigation Styling */
nav {
    position: fixed; /* Or 'sticky' if preferred for MPA */
    top: 0;
    left: 0;
    width: 100%;
    height: var(--nav-height);
    padding: 0 20px; 
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(30, 10, 40, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-color-lavender);
    box-sizing: border-box; 
}

nav a.nav-brand {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--accent-teal-bright); 
    font-family: var(--font-heading);
    text-shadow: 0 0 8px var(--accent-teal-bright);
    text-decoration: none;
    white-space: nowrap; 
}
nav a.nav-brand i { margin-right: 6px; } 

nav .nav-links {
    display: flex;
    align-items: center;
    flex-wrap: nowrap; /* Prevent wrapping on smaller screens if space is tight */
    overflow-x: auto; /* Allow horizontal scrolling for nav links if they overflow */
} 

/* Common style for nav links (<a>) and auth buttons (<button>) */
nav .nav-links a.nav-link,
nav .nav-links button,
nav .nav-links .auth-button,
nav .nav-links select {
    background: none;
    border: none;
    padding: 6px 10px; 
    margin-left: 4px; 
    cursor: pointer;
    font-size: 0.85rem; 
    transition: color 0.3s ease, text-shadow 0.3s ease, transform 0.2s ease, border-bottom-color 0.3s ease;
    color: var(--text-secondary-lavender);
    font-family: var(--font-main);
    border-bottom: 2px solid transparent;
    white-space: nowrap; 
    text-decoration: none; /* For <a> tags */
}

nav .nav-links a.nav-link .fa-solid, /* For icons inside <a> tags */
nav .nav-links button .fa-solid { /* For icons inside <button> tags */
    margin-right: 5px;
    width: 16px;
    text-align: center;
} 

nav .nav-links a.nav-link:hover,
nav .nav-links button:hover,
nav .nav-links .auth-button:hover {
    color: var(--text-primary-light);
    text-shadow: 0 0 10px var(--accent-pink-vibrant);
    transform: translateY(-1px);
}

nav .nav-links a.nav-link.active-nav, /* Class for active navigation link */
nav .nav-links button.active-nav { /* Kept for SPA compatibility if any buttons remain */
    color: var(--accent-teal-bright);
    font-weight: 600;
    text-shadow: 0 0 8px rgba(72, 209, 204, 0.7);
    border-bottom-color: var(--accent-teal-bright);
}

nav .nav-links .auth-button {
    padding: 4px 8px;
    border: 1px solid var(--accent-pink-vibrant); 
    color: var(--accent-pink-vibrant);
    border-radius: 16px;
    font-size: 0.75rem; 
}
nav .nav-links .auth-button:hover {
    background-color: var(--accent-pink-vibrant);
    color: var(--bg-dark-purple);
    text-shadow: none;
}
nav .nav-links .auth-button.login-btn {
    border-color: var(--accent-purple-medium);
    color: var(--accent-purple-medium);
}
nav .nav-links .auth-button.login-btn:hover {
    background-color: var(--accent-purple-medium);
    color: var(--bg-dark-purple);
}

nav .nav-links select {
    background: var(--bg-card-purple);
    color: var(--text-primary-light);
    border: 1px solid var(--border-color-lavender);
    border-radius: 5px;
    padding: 4px 6px;
    font-size: 0.75rem; 
}

/* Page Container & Content Section (MPA specific adjustments) */
.page-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh; /* Ensure footer stays at bottom if content is short */
    padding-top: var(--nav-height); 
    padding-bottom: 40px; /* Space for the fixed footer */
    box-sizing: border-box;
}

/* General content section styling for each page */
.content-section {
    width: 100%; 
    flex-grow: 1; /* Allow content to take available space */
    padding: 1.5rem 2rem; 
    overflow-y: auto; /* Allow vertical scroll within the content section if needed */
    background-color: var(--bg-content-purple); /* Default background for content areas */
    box-sizing: border-box; 
    color: var(--text-primary-light);
}

/* Custom scrollbar for content sections (optional, but kept from original) */
.content-section::-webkit-scrollbar { width: 8px; }
.content-section::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px;}
.content-section::-webkit-scrollbar-thumb { background-color: var(--accent-purple-medium); border-radius: 10px; border: 2px solid var(--bg-content-purple); }
.content-section::-webkit-scrollbar-thumb:hover { background-color: var(--accent-teal-bright); }
.content-section { scrollbar-width: thin; scrollbar-color: var(--accent-purple-medium) var(--bg-content-purple); }

/* Typography */
h1, h2, h3, h4 { font-family: var(--font-heading); color: var(--text-primary-light); margin-bottom: 1rem; }
h1 { font-size: 2.2rem; text-shadow: 1px 1px 3px rgba(0,0,0,0.25); } 
h2 { font-size: 1.6rem; color: var(--accent-teal-bright); margin-top: 1.5rem; } 
h3 { font-size: 1.25rem; color: var(--accent-pink-vibrant); margin-top: 1rem; } 
h4 { font-size: 1.1rem; color: var(--accent-teal-bright); margin-bottom: 0.75rem; } 
p { line-height: 1.65; color: var(--text-secondary-lavender); margin-bottom: 0.8rem; font-size: 0.9rem;} 
ul { list-style: inside; margin-left: 1rem; margin-bottom: 0.8rem; padding-left: 0.5rem;} 
li { margin-bottom: 0.4rem; } 

/* Buttons */
.btn {
    display: inline-block;
    padding: 0.7rem 1.5rem;
    background-color: var(--accent-pink-vibrant);
    color: var(--text-primary-light);
    border: none;
    border-radius: 25px;
    cursor: pointer;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
.btn:hover {
    background-color: #c5306c; /* Darker pink */
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}
.btn-primary { background-color: var(--accent-teal-bright); color: var(--bg-dark-purple); }
.btn-primary:hover { background-color: #26a69a; /* Darker teal */ }
.btn-secondary { background-color: var(--accent-purple-medium); }
.btn-secondary:hover { background-color: #8e44ad; /* Darker medium purple */ }
.btn-purple { background-color: var(--accent-purple-medium); } 
.btn-purple:hover { background-color: #8e44ad; }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.75rem; }

/* Specific section styling (e.g., #about from index.html) */
/* These styles were specific to the #about section in the SPA */
/* For MPA, they apply to the <main id="about"> element in index.html */
main#about { /* Target the main element with id="about" */
    display: flex;
    flex-direction: column;
    /* height: 100%; Removed, as page-container handles height */
    /* overflow-y: auto; Already handled by .content-section if needed */
}
main#about .hero-section {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem 1rem; 
    background-size: cover;
    background-position: center;
}
main#about .hero-section h1 {
    font-size: clamp(2rem, 5vw, 3rem);
    margin-bottom: 0.5rem;
    color: var(--text-primary-light);
    text-shadow: 0 0 15px var(--accent-teal-bright), 0 0 25px var(--accent-teal-bright);
}
main#about .hero-section .subtitle {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    margin-bottom: 1.5rem;
    max-width: 700px;
    color: var(--text-secondary-lavender);
}
main#about .benefits-title-section {
    padding: 1rem 0;
    flex-shrink: 0;
    text-align: center;
    flex-grow: 0;
} 
main#about .benefits-title-section h2 {
    font-size: clamp(1.4rem, 3vw, 1.8rem);
    margin-bottom: 0.2rem;
}
main#about .benefits-title-section p {
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    margin-bottom: 0.5rem;
    color: var(--accent-teal-bright);
}
.benefits-background-container {
    position: relative;
    background-color: transparent;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 0.5rem;
    flex-grow: 1; /* Allow it to take space if content is short */
    display: flex;
    align-items: flex-start; /* Align grid to top */
    justify-content: center;
    overflow-y: auto; /* If content within this container overflows */
    min-height: 300px; /* Example min-height */
} 
.benefits-background-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    opacity: 0.15;
}
main#about .benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 900px;
}
main#about .benefit-card { 
    padding: 1rem; 
    min-height: 170px; 
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    text-align: center;
    background-color: var(--bg-card-purple-solid);
    border-radius: 10px;
    border: 1px solid var(--border-color-strong);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    transition: transform 0.3s ease, box-shadow 0.3s ease; 
    cursor: pointer; 
}
main#about .benefit-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 20px rgba(168, 85, 247, 0.35);
}
main#about .benefit-card i {
    font-size: 2rem;
    margin-bottom: 0.75rem;
    color: var(--accent-teal-bright);
}
main#about .benefit-card h3 {
    font-size: 1rem;
    margin-bottom: 0.4rem;
    color: var(--accent-pink-vibrant);
}
main#about .benefit-card p {
    font-size: 0.78rem;
    line-height: 1.45;
    color: var(--text-secondary-lavender);
} 
main#about .landing-cta-section {
    padding: 1.5rem 0;
    margin-top: 1rem;
    flex-shrink: 0;
    text-align: center;
}
main#about .landing-cta-section h2 { font-size: 1.3rem; margin-bottom: 0.5rem; }
main#about .landing-cta-section p { font-size: 1rem; margin-bottom: 1.2rem; }
main#about .landing-cta-section .btn { margin: 0.5rem; padding: 0.8rem 1.8rem; }

/* Value Proposition Grid (Used in Tools, Resources) */
.value-prop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}
.value-prop-card {
    background-color: var(--bg-card-purple);
    padding: 1.5rem;
    border-radius: 10px;
    border: 1px solid var(--border-color-strong);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.value-prop-card i.card-icon {
    font-size: 2.2rem;
    color: var(--accent-teal-bright);
    margin-bottom: 1rem;
    display: block;
    text-align: center;
}
.value-prop-card h4 {
    color: var(--accent-pink-vibrant);
    font-size: 1.2rem;
    margin-bottom: 0.6rem;
    text-align: center;
}

/* Assessment & Quiz Containers (Used in assessments.html) */
.assessment-container, .quiz-container {
    background-color: var(--bg-card-purple);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.45);
    width: 100%;
    max-width: 700px;
    margin: 1.5rem auto; /* Center it on the page */
}
.assessment-question, .quiz-question { margin-bottom: 1.5rem; }
.assessment-question p, .quiz-question p, .quiz-question h4 {
    font-size: 1.05rem;
    color: var(--text-primary-light);
    font-weight: 600;
    margin-bottom: 0.5rem;
}
.assessment-options button, .quiz-options button {
    padding: 0.8rem 1.2rem;
    margin: 0.5rem 0;
    font-size: 0.95rem;
    display: block;
    width: 100%;
    background-color: var(--bg-content-purple-opaque);
    border: 1px solid var(--border-color-lavender);
    color: var(--text-primary-light);
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
}
.assessment-options button:hover, .quiz-options button:hover {
    background-color: var(--accent-purple-medium);
    border-color: var(--accent-purple-medium);
    color: var(--text-primary-light);
    transform: translateX(5px);
}
.assessment-options button.selected, .quiz-options button.selected {
    background-color: var(--accent-teal-bright);
    border-color: var(--accent-teal-bright);
    color: var(--bg-dark-purple);
    font-weight: 600;
}
.assessment-feedback, .quiz-feedback {
    margin-top: 1.5rem;
    font-size: 0.9rem;
    font-style: italic;
    color: var(--accent-pink-vibrant);
    min-height: 22px;
    text-align: center;
}
.progress-bar-container {
    margin-top: 1rem;
    width: 100%;
    background-color: var(--border-color-lavender);
    border-radius: 8px;
    overflow: hidden;
    padding: 3px;
}
.progress-bar-fill {
    height: 12px;
    display:block;
    width: 0%;
    background-color: var(--accent-teal-bright);
    border-radius: 5px;
    transition: width 0.5s ease-in-out;
    text-align: center;
    font-size:0.7rem;
    line-height:12px;
    color: var(--bg-dark-purple);
}
.weight-slider { margin-top: 0.75rem; }
.weight-slider label {
    font-size: 0.85rem;
    color: var(--text-secondary-lavender);
    margin-right: 0.5rem;
}
.weight-slider input[type="range"] {
    width: calc(60% - 30px); /* Adjust as needed */
    accent-color: var(--accent-pink-vibrant);
    vertical-align: middle;
}
.weight-slider span {
    font-size: 0.85rem;
    color: var(--text-primary-light);
    margin-left: 5px;
    display: inline-block;
    width: 20px;
    text-align: center;
}
#quickCompatLevelSelector button { margin: 0.25rem; }

/* Resources Page Styling (resources.html) */
.resource-category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}
.resource-category-card {
    padding: 1.5rem;
    background-color: var(--bg-card-purple);
    border-radius: 10px;
    border: 1px solid var(--border-color-strong);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    text-align: center;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.resource-category-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(168, 85, 247, 0.4);
}
.resource-category-card i.fa-2x { /* Or use a more specific class if FontAwesome icons vary */
    font-size: 2.8rem;
    color: var(--accent-teal-bright);
    margin-bottom: 1rem;
}
.resource-category-card h4 {
    font-size: 1.3rem;
    color: var(--accent-pink-vibrant);
    margin-bottom: 0.6rem;
}
#resourceItemList .value-prop-card { /* Reusing value-prop-card for consistency */
    padding: 1.2rem;
    text-align: left;
    margin-bottom: 1.2rem;
}
#resourceItemList .value-prop-card h5 { /* More specific heading for resource items */
    color: var(--accent-teal-bright);
    font-size: 1.15rem;
    margin-bottom: 0.5rem;
}
#resourceItemList .value-prop-card p {
    font-size: 0.9rem;
    color: var(--text-secondary-lavender);
    margin-bottom: 0.8rem;
}
#resourceItemList .value-prop-card a.btn {
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
}
#resourceWizardArea {
    background-color: var(--bg-card-purple-solid);
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
}
#resourceWizardArea h3 {
    color: var(--accent-teal-bright);
    margin-bottom: 1rem;
}
.wizard-section { margin-bottom: 1rem; }
.wizard-section label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}
.wizard-section select, .wizard-section input.input-field { 
    width: 100%;
    padding: 0.7rem;
    background-color: var(--bg-content-purple-opaque);
    border: 1px solid var(--border-color-lavender);
    color: var(--text-primary-light);
    border-radius: 5px;
    margin-bottom: 0.5rem;
    box-sizing: border-box;
}
#resourceCategoriesGrid details summary {
    cursor: pointer;
    font-weight: 600;
    color: var(--accent-teal-bright);
    padding: 0.5rem;
    background-color: var(--bg-card-purple-solid);
    border-radius: 5px;
    margin-bottom: 0.5rem;
}
#resourceCategoriesGrid details ul {
    list-style: none;
    padding-left: 1rem;
}
#resourceCategoriesGrid details li {
    padding: 0.25rem 0;
    cursor: pointer;
}
#resourceCategoriesGrid details li:hover { color: var(--accent-pink-vibrant); }

/* Form Styling (Used in Profile, UGQ, Modals) */
.form-section { /* Generic container for forms like UGQ creation, parts of profile */
    background-color: var(--bg-card-purple);
    padding: 2rem;
    border-radius: 12px;
    margin: 1.5rem auto;
    max-width: 700px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.45);
}
.form-field-group { margin-bottom: 1.25rem; }
.form-field-group label {
    display: block;
    font-size: 0.95rem;
    color: var(--text-secondary-lavender);
    margin-bottom: 0.5rem;
    font-weight: 600;
}
.input-field, /* Generic class for standalone inputs */
.form-field-group input[type="text"],
.form-field-group input[type="email"],
.form-field-group input[type="date"],
.form-field-group input[type="url"],
.form-field-group input[type="password"],
.form-field-group select,
.form-field-group textarea {
    width: 100%;
    background-color: var(--bg-content-purple-opaque);
    border: 1px solid var(--border-color-lavender);
    color: var(--text-primary-light);
    padding: 0.8rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    box-sizing: border-box;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.input-field:focus,
.form-field-group input:focus,
.form-field-group select:focus,
.form-field-group textarea:focus {
    border-color: var(--accent-teal-bright);
    box-shadow: 0 0 8px rgba(45, 212, 191, 0.5);
    outline: none;
}
.form-field-group textarea {
    min-height: 80px;
    resize: vertical;
}
#ugqCreationFormArea h3, #profile h3.form-title { /* Specific form titles */
    margin-bottom: 1.5rem;
    text-align: center;
} 

/* Profile Page Specifics (profile.html) */
.profileImagePreviewStyle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background-color: var(--bg-card-purple-solid);
    margin: 0 auto 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary-lavender);
    border: 3px dashed var(--border-color-lavender);
    cursor: pointer;
    transition: border-color 0.3s ease, background-color 0.3s ease;
    font-size: 3rem; 
    object-fit: cover; 
}
.profileImagePreviewStyle:hover {
    border-color: var(--accent-teal-bright);
    background-color: var(--bg-content-purple-opaque);
}
.profileImagePreviewStyle img { /* Style for the actual <img> tag when loaded */
    width:100%; height:100%; border-radius:50%; object-fit:cover;
}
#profileImageUpload { display: none; } /* Hidden file input */

#profileCompletionContainer {
    margin: 1rem auto;
    padding: 0.75rem;
    background-color: var(--bg-card-purple-solid);
    border-radius: 8px;
    max-width: 700px; /* Match form-section or assessment-container */
}
#profileCompletionBarContainer { /* The outer container for the bar itself */
    width: 100%;
    background-color: var(--border-color-lavender);
    border-radius: 8px;
    overflow: hidden;
    margin: 0.25rem 0;
    padding:3px;
}
#profileCompletionBar { /* The inner fill bar */
    height: 12px;
    background-color: var(--accent-teal-bright);
    width: 0%;
    border-radius: 5px;
    transition: width 0.5s ease-in-out;
    text-align: right;
    padding-right: 5px; /* For text inside bar */
    font-size: 0.7rem;
    color: var(--bg-dark-purple);
    line-height: 12px;
}
#profileCompletionPercentageText {
    font-size: 0.85rem;
    text-align: right;
    color: var(--text-secondary-lavender);
} 
#profileCompletionHint {
    font-size: 0.75rem;
    text-align: center;
    margin-top: 0.25rem;
    color: var(--text-secondary-lavender);
}

/* Modals */
.modal {
    display: none; /* Hidden by default */
    position: fixed;
    z-index: 2000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto; /* Enable scroll if content is too long */
    background-color: rgba(0,0,0,0.7); 
    align-items: center; /* Vertically center */
    justify-content: center; /* Horizontally center */
    padding: 1rem; /* Padding for smaller screens */
    animation: modalFadeIn 0.3s ease-out;
}
.modal.active { display: flex; } /* Class to show modal */
@keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}
.modal-content {
    background-color: var(--bg-card-purple-solid);
    margin: auto; /* Handles centering for older browsers too */
    padding: 25px;
    border: 1px solid var(--border-color-strong);
    width: 90%;
    max-width: 500px; /* Max width of modal */
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    color: var(--text-primary-light);
    position: relative; /* For absolute positioning of close button */
}
.modal-content h2 {
    color: var(--accent-teal-bright);
    margin-top: 0;
    font-size: 1.5rem;
}
.close-button {
    color: var(--text-secondary-lavender);
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    transition: color 0.2s ease;
}
.close-button:hover,
.close-button:focus {
    color: var(--accent-pink-vibrant);
    text-decoration: none;
}

/* Notifications Area */
.notifications-area {
    position: fixed;
    bottom: 60px; /* Above footer */
    right: 20px;
    width: 300px; /* Adjust as needed */
    z-index: 3000;
}
.notification-item {
    background-color: var(--bg-card-purple-solid);
    color: var(--text-primary-light);
    padding: 10px 15px;
    margin-bottom: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    border-left: 4px solid var(--accent-teal-bright); /* Default to success type */
    font-size: 0.85rem;
    opacity: 0;
    transform: translateX(100%);
    animation: slideInNotification 0.5s forwards;
}
.notification-item.error { border-left-color: var(--accent-pink-vibrant); }
.notification-item.success { border-left-color: var(--accent-teal-bright); } /* Already default */
.notification-item.info { border-left-color: var(--accent-purple-medium); }

@keyframes slideInNotification {
    to { opacity: 1; transform: translateX(0); }
}
@keyframes slideOutNotification { 
    from { opacity: 1; transform: translateX(0); } 
    to { opacity: 0; transform: translateX(100%); } 
}

/* Global Search Trigger Button */
#globalSearchTriggerBtn { 
    position: fixed;
    bottom: 60px; /* Above footer */
    left: 20px;
    z-index: 1000;
    background-color: var(--accent-purple-medium);
    color: var(--text-primary-light);
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
}
#globalSearchTriggerBtn:hover {
    background-color: #8e44ad; /* Darker purple */
    transform: scale(1.1);
}

/* Footer Styling */
footer {
    text-align: center;
    padding: 1rem;
    color: var(--text-secondary-lavender);
    font-size: 0.8rem;
    background-color: rgba(30,10,40,0.7);
    border-top: 1px solid var(--border-color-lavender);
    width: 100%;
    box-sizing: border-box;
    position: fixed; /* Fixed at the bottom */
    bottom: 0;
    left: 0;
    z-index: 500; 
    height: 40px; 
    display:flex; align-items:center; justify-content:center;
}
footer a {
    color: var(--accent-teal-bright);
    text-decoration: none;
}
footer a:hover {
    text-decoration: underline;
}


/* Loading Overlay */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.65);
    z-index: 4000;
    display: none; /* Hidden by default */
    align-items: center;
    justify-content: center;
}
.loading-spinner {
    border: 5px solid var(--text-secondary-lavender);
    border-top: 5px solid var(--accent-teal-bright);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Responsive Adjustments */
@media (max-width: 1024px) { 
    .nav-text-long { display: none; }
    .nav-text-short { display: inline; } /* Show short text on nav buttons */
    nav a.nav-brand { font-size: 1.3rem; }
    nav .nav-links a.nav-link,
    nav .nav-links button,
    nav .nav-links .auth-button,
    nav .nav-links select { font-size: 0.8rem; padding: 5px 8px; }
    
    main#about .hero-section h1 { font-size: clamp(1.8rem, 4vw, 2.5rem); }
    main#about .hero-section .subtitle { font-size: clamp(0.9rem, 2vw, 1.1rem); }
    main#about .benefits-grid { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .benefits-background-container { padding: 0.5rem; min-height: 250px; } 
    
    .assessment-container, .form-section { padding: 1.5rem; } /* Reduce padding on smaller screens */
    .modal-content { width: 95%; max-width: 400px; padding: 20px; }
}

@media (min-width: 1025px) {
    .nav-text-short { display: none; }
    .nav-text-long { display: inline; } /* Show long text on nav buttons */
}

@media (max-width: 768px) {
    nav { padding: 0 15px; }
    nav a.nav-brand { font-size: 1.2rem; }
    nav .nav-links a.nav-link,
    nav .nav-links button,
    nav .nav-links .auth-button,
    nav .nav-links select { font-size: 0.75rem; padding: 4px 6px; }
    
    .content-section { padding: 1rem 1.5rem; } /* Further reduce padding */
    
    main#about .hero-section h1 { font-size: clamp(1.5rem, 3.5vw, 2rem); }
    main#about .hero-section .subtitle { font-size: clamp(0.85rem, 1.8vw, 1rem); }
    main#about .benefits-title-section h2 { font-size: clamp(1.2rem, 2.5vw, 1.5rem); }
    main#about .benefits-grid { grid-template-columns: 1fr; } /* Stack benefit cards */
    .benefits-background-container { min-height: auto; } 
    
    .value-prop-grid { grid-template-columns: 1fr; } /* Stack value prop cards */
    .resource-category-grid { grid-template-columns: 1fr; } /* Stack resource cards */
    
    .modal-content { width: 90%; max-width: 350px; padding: 15px; }
    .notifications-area { width: 250px; right: 10px; }
    #globalSearchTriggerBtn { width: 40px; height: 40px; font-size: 1rem; }
    footer { font-size: 0.7rem; padding: 0.5rem; }
}

@media (max-width: 480px) {
    nav { padding: 0 10px; }
    nav a.nav-brand { font-size: 1.1rem; }
    nav .nav-links a.nav-link,
    nav .nav-links button,
    nav .nav-links .auth-button,
    nav .nav-links select { font-size: 0.7rem; padding: 3px 5px; margin-left: 2px;}
    
    .content-section { padding: 1rem; }
    
    main#about .hero-section h1 { font-size: clamp(1.3rem, 3vw, 1.8rem); }
    main#about .hero-section .subtitle { font-size: clamp(0.8rem, 1.5vw, 0.9rem); }
    main#about .benefits-title-section h2 { font-size: clamp(1rem, 2vw, 1.3rem); }
    main#about .benefits-title-section p { font-size: clamp(0.8rem, 1.5vw, 0.9rem); }
    main#about .benefit-card { padding: 1rem; min-height: 120px; }
    main#about .benefit-card i { font-size: 1.5rem; }
    main#about .benefit-card h3 { font-size: 0.9rem; }
    main#about .benefit-card p { font-size: 0.75rem; }
    
    .btn { padding: 0.5rem 1rem; font-size: 0.8rem; }
    .btn-sm { padding: 0.3rem 0.6rem; font-size: 0.65rem; }
    
    .assessment-container { padding: 1rem; }
    .form-field-group input, .form-field-group textarea, .form-field-group select {
        padding: 0.6rem 0.8rem; font-size: 0.85rem;
    }
    
    .modal-content { width: 85%; max-width: 300px; padding: 10px; }
    .modal-content h2 { font-size: 1.2rem; }
    
    .notifications-area { width: 200px; }
    .notification-item { font-size: 0.75rem; padding: 8px 12px; }
    #globalSearchTriggerBtn { bottom: 50px; left: 10px; }
    footer { font-size: 0.65rem; }
}

/* Utility classes (copied from original) */
.text-center { text-align: center; }
.mb-6 { margin-bottom: 1.5rem; } 
.mt-3 { margin-top: 0.75rem; } 
.mt-4 { margin-top: 1rem; } 
.mt-6 { margin-top: 1.5rem; }
.mt-8 { margin-top: 2rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
.my-4 { margin-top: 1rem; margin-bottom: 1rem; }
.grid { display: grid; } /* Basic grid, use with grid-template-columns */
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.w-full { width: 100%; }
.max-w-4xl { max-width: 56rem; } 
.mx-auto { margin-left: auto; margin-right: auto; }
.items-start { align-items: flex-start; }
.form-checkbox { 
    appearance: none;
    background-color: var(--bg-content-purple-opaque);
    border: 1px solid var(--border-color-lavender);
    padding: 0.35em; /* Adjust size */
    border-radius: 3px;
    display: inline-block;
    position: relative;
    vertical-align: middle;
    margin-right: 0.25rem;
}
.form-checkbox:checked {
    background-color: var(--accent-teal-bright);
    border-color: var(--accent-teal-bright);
}
.form-checkbox:checked::after {
    content: '✔';
    font-size: 0.8em; /* Adjust checkmark size */
    color: var(--bg-dark-purple);
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.mr-2 { margin-right: 0.5rem; }
.text-lg { font-size: 1.125rem; } 
.text-xl { font-size: 1.25rem; } 
.text-2xl { font-size: 1.5rem; } 
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }
.italic { font-style: italic; }
.rounded-lg { border-radius: 0.5rem; }
.rounded { border-radius: 0.25rem; }
.p-3 { padding: 0.75rem; }
.max-h-60 { max-height: 15rem; } 
.overflow-y-auto { overflow-y: auto; }

