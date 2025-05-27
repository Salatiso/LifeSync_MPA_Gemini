// js/tools.js - Logic for the Tools Page

document.addEventListener('DOMContentLoaded', () => {
    // Ensure main.js has loaded and initialized Firebase and i18next
     const ensureGlobalsInterval = setInterval(() => {
        if (window.firebaseInitialized && window.i18next && window.i18next.isInitialized) {
            clearInterval(ensureGlobalsInterval);
            initializeToolsPage();
        }
    }, 100);
});

function initializeToolsPage() {
    console.log("Initializing Tools Page specific JavaScript");

    // Event listeners for tool buttons that redirect to resources or other pages
    const toolCommGuidesBtn = document.getElementById('toolCommGuidesBtn');
    const toolConflictAidsBtn = document.getElementById('toolConflictAidsBtn');
    const toolClosureAidsBtn = document.getElementById('toolClosureAidsBtn');

    if (toolCommGuidesBtn) {
        toolCommGuidesBtn.addEventListener('click', () => {
            // Redirect to resources page, potentially with a query parameter for the category
            window.location.href = 'resources.html?category=communication_guides';
        });
    }

    if (toolConflictAidsBtn) {
        toolConflictAidsBtn.addEventListener('click', () => {
            window.location.href = 'resources.html?category=conflict_resolution_aids';
        });
    }

    if (toolClosureAidsBtn) {
        toolClosureAidsBtn.addEventListener('click', () => {
            window.location.href = 'resources.html?category=relationship_closure_tools';
        });
    }

    // Placeholder for other tool functionalities if they are developed
    // For "Coming Soon" tools, the buttons are already disabled in HTML.
}
