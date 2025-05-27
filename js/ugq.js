// js/ugq.js - Logic for the User Generated Questions Page

document.addEventListener('DOMContentLoaded', () => {
    const ensureGlobalsInterval = setInterval(() => {
        if (window.firebaseInitialized && 
            window.i18next && window.i18next.isInitialized &&
            typeof window.showNotification === 'function' &&
            typeof window.showLoading === 'function' &&
            typeof window.getProfileRef === 'function' && // Ensure getProfileRef is available
            typeof window.updateDoc === 'function' && 
            typeof window.arrayUnion === 'function' &&
            typeof window.arrayRemove === 'function' && // For delete functionality
            typeof window.getDoc === 'function'
            ) {
            clearInterval(ensureGlobalsInterval);
            initializeUgqPage();
        }
    }, 100);
});

async function initializeUgqPage() {
    console.log("Initializing UGQ Page specific JavaScript");

    const ugqFormEl = document.getElementById('ugqForm');
    const ugqItemsContainerEl = document.getElementById('ugqItemsContainer');

    if (ugqFormEl) {
        ugqFormEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!window.currentUserId) { 
                window.showNotification(window.i18next.t('alerts.loginToUgq', "Please log in to add questions."), 'error'); 
                return; 
            }
            window.showLoading(true);
            const questionText = window.sanitizeInput(document.getElementById('ugqText').value.trim());
            const answerText = window.sanitizeInput(document.getElementById('ugqAnswer').value.trim());
            const category = window.sanitizeInput(document.getElementById('ugqCategory').value.trim());
            const isPrivate = document.getElementById('ugqIsPrivate').checked;

            if (!questionText || !answerText) {
                window.showNotification(window.i18next.t('alerts.ugqFieldsMissing'), 'error');
                window.showLoading(false);
                return;
            }
            const profileRef = window.getProfileRef();
            if (!profileRef) { 
                window.showNotification(window.i18next.t('alerts.loginToSaveUgq', "Please log in to save questions."), 'error'); 
                window.showLoading(false); 
                return; 
            }

            const newUgq = { 
                id: `ugq_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
                questionText, 
                answerText, 
                category, 
                isPrivate, 
                createdAt: window.serverTimestamp() 
            };
            try {
                await window.updateDoc(profileRef, { userGeneratedQuestions: window.arrayUnion(newUgq) });
                window.showNotification(window.i18next.t('alerts.ugqSaved'), 'success');
                ugqFormEl.reset();
                loadUserGeneratedQuestions(); // Refresh the list
            } catch (error) {
                console.error("Error saving UGQ:", error);
                window.showNotification(window.i18next.t('alerts.ugqError') + ` ${error.message}`, 'error');
            }
            window.showLoading(false);
        });
    }

    async function loadUserGeneratedQuestions() {
        if (!ugqItemsContainerEl) return;
        if (!window.currentUserId) {
            ugqItemsContainerEl.innerHTML = `<p class="text-center p-4">${window.i18next.t('profile.ugqNone', "Log in to see your questions.")}</p>`;
            return;
        }
        window.showLoading(true);
        const profileRef = window.getProfileRef();
        if (!profileRef) {
             ugqItemsContainerEl.innerHTML = `<p class="text-center p-4">${window.i18next.t('profile.ugqNone', "Profile not found.")}</p>`;
             window.showLoading(false);
             return;
        }

        try {
            const docSnap = await window.getDoc(profileRef);
            if (docSnap.exists()) {
                const userData = docSnap.data();
                renderUserGeneratedQuestionsList(userData.userGeneratedQuestions || [], ugqItemsContainerEl, false); // false for not profile view (implies UGQ page view with delete)
            } else {
                ugqItemsContainerEl.innerHTML = `<p class="text-center p-4">${window.i18next.t('profile.ugqNone')}</p>`;
            }
        } catch (error) {
            console.error("Error loading UGQs:", error);
            ugqItemsContainerEl.innerHTML = `<p class="text-center p-4">Error loading questions.</p>`;
        }
        window.showLoading(false);
    }
    
    // Initial load of UGQs
    loadUserGeneratedQuestions();
}


// This function might be shared or adapted from profile.js if it's identical
// For UGQ page, we add delete functionality
function renderUserGeneratedQuestionsList(ugqs = [], containerEl, isProfileView = false) {
    if (!containerEl) return;
    containerEl.innerHTML = '';
    if (ugqs.length === 0) {
        containerEl.innerHTML = `<p class="text-center p-4">${window.i18next.t('profile.ugqNone')}</p>`;
        return;
    }
    ugqs.forEach((ugq) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'value-prop-card mb-4 p-4'; // Re-use styling
        itemDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h5 class="font-semibold text-lg text-[var(--accent-teal-bright)]">${window.sanitizeInput(ugq.questionText)}</h5>
                    <p class="text-sm text-[var(--text-secondary-lavender)] mt-1"><strong>Your Answer:</strong> ${window.sanitizeInput(ugq.answerText)}</p>
                    ${ugq.category ? `<p class="text-xs mt-1 text-[var(--accent-purple-medium)]"><em>Category: ${window.sanitizeInput(ugq.category)}</em></p>` : ''}
                    <p class="text-xs mt-1">${ugq.isPrivate ? '<i class="fas fa-lock text-xs"></i> Private' : '<i class="fas fa-globe-americas text-xs"></i> Public (if profile is public)'}</p>
                </div>
                ${!isProfileView ? `<button class="btn btn-sm btn-danger ugq-delete-btn" data-ugq-id="${ugq.id}"><i class="fas fa-trash"></i></button>` : ''}
            </div>
        `;
        containerEl.appendChild(itemDiv);
    });

    if (!isProfileView) {
        document.querySelectorAll('.ugq-delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const ugqIdToDelete = e.currentTarget.dataset.ugqId;
                // Basic confirmation before deleting (replace with custom modal later)
                if (confirm(`Are you sure you want to delete this question? This action cannot be undone.`)) {
                    await deleteUgqItem(ugqIdToDelete);
                }
            });
        });
    }
}

async function deleteUgqItem(ugqId) {
    if (!window.currentUserId) {
        window.showNotification("You must be logged in to delete questions.", "error");
        return;
    }
    window.showLoading(true);
    const profileRef = window.getProfileRef();
    if (!profileRef) {
        window.showNotification("Profile not found.", "error");
        window.showLoading(false);
        return;
    }

    try {
        const docSnap = await window.getDoc(profileRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            const updatedUgqs = (userData.userGeneratedQuestions || []).filter(q => q.id !== ugqId);
            await window.updateDoc(profileRef, { userGeneratedQuestions: updatedUgqs });
            window.showNotification("Question deleted successfully.", "success");
            // Re-render the list
            const ugqItemsContainerEl = document.getElementById('ugqItemsContainer');
            if(ugqItemsContainerEl) renderUserGeneratedQuestionsList(updatedUgqs, ugqItemsContainerEl, false);
        }
    } catch (error) {
        console.error("Error deleting UGQ:", error);
        window.showNotification(`Error deleting question: ${error.message}`, "error");
    } finally {
        window.showLoading(false);
    }
}
