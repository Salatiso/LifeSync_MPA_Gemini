// js/assessments.js - Logic for the Assessments Page

document.addEventListener('DOMContentLoaded', () => {
    // Ensure main.js has loaded and initialized Firebase and i18next
    const ensureGlobalsInterval = setInterval(() => {
        if (window.firebaseInitialized && window.i18next && window.i18next.isInitialized) {
            clearInterval(ensureGlobalsInterval);
            initializeAssessmentsPage();
        }
    }, 100);
});

function initializeAssessmentsPage() {
    console.log("Initializing Assessments Page specific JavaScript");

    // --- Quick Compatibility Quiz Logic ---
    let currentQuickCompatQuizData = { questions: [], level: 'basic' };
    let currentQuickCompatIndex = 0;
    let quickCompatUserAnswers = [];

    const quickCompatLevelSelector = document.getElementById('quickCompatLevelSelector');
    const quickCompatQuizArea = document.getElementById('quickCompatQuizArea');
    const quickCompatResultArea = document.getElementById('quickCompatResultArea');
    const quickCompatQuestionTextEl = document.getElementById('quickCompatQuestionText');
    const quickCompatOptionsAreaEl = document.getElementById('quickCompatOptionsArea');
    const quickCompatWeightEl = document.getElementById('quickCompatWeight');
    const quickCompatWeightValueEl = document.getElementById('quickCompatWeightValue');
    const quickCompatCounterEl = document.getElementById('quickCompatCounter');
    const quickCompatTotalEl = document.getElementById('quickCompatTotal');
    const quickCompatProgressBarEl = document.getElementById('quickCompatProgressBar');
    const quickCompatNextBtnEl = document.getElementById('quickCompatNextBtn');
    const quickCompatFinalFeedbackEl = document.getElementById('quickCompatFinalFeedback');
    const resetQuickCompatBtnEl = document.getElementById('resetQuickCompatBtn');

    // Question sets (ensure i18next keys match those in main.js or are loaded here)
    const quickCompatQuestionSets = {
        basic: ['assessments.quickCompat.questions.q_financial_stability', 'assessments.quickCompat.questions.q_indoors_outdoors', 'assessments.quickCompat.questions.q_personal_space', 'assessments.quickCompat.questions.q_spontaneity_planning', 'assessments.quickCompat.questions.q_family_involvement'],
        intermediate: ['assessments.quickCompat.questions.q_financial_stability', 'assessments.quickCompat.questions.q_indoors_outdoors', 'assessments.quickCompat.questions.q_personal_space', 'assessments.quickCompat.questions.q_spontaneity_planning', 'assessments.quickCompat.questions.q_family_involvement', 'assessments.quickCompat.questions.q_comm_style', 'assessments.quickCompat.questions.q_conflict_resolution', 'assessments.quickCompat.questions.q_social_circle', 'assessments.quickCompat.questions.q_travel_preference', 'assessments.quickCompat.questions.q_dietary_habits'],
        advanced: ['assessments.quickCompat.questions.q_financial_stability', 'assessments.quickCompat.questions.q_indoors_outdoors', 'assessments.quickCompat.questions.q_personal_space', 'assessments.quickCompat.questions.q_spontaneity_planning', 'assessments.quickCompat.questions.q_family_involvement', 'assessments.quickCompat.questions.q_comm_style', 'assessments.quickCompat.questions.q_conflict_resolution', 'assessments.quickCompat.questions.q_social_circle', 'assessments.quickCompat.questions.q_travel_preference', 'assessments.quickCompat.questions.q_dietary_habits', 'assessments.quickCompat.questions.q_long_term_goals', 'assessments.quickCompat.questions.q_parenting_style', 'assessments.quickCompat.questions.q_spirituality', 'assessments.quickCompat.questions.q_political_views', 'assessments.quickCompat.questions.q_cultural_background_match'],
        options: {
            q_financial_stability: ['assessments.quickCompat.options.opt_not_important', 'assessments.quickCompat.options.opt_somewhat_important', 'assessments.quickCompat.options.opt_very_important'],
            q_indoors_outdoors: ['assessments.quickCompat.options.opt_indoors', 'assessments.quickCompat.options.opt_outdoors', 'assessments.quickCompat.options.opt_both'],
            q_personal_space: ['assessments.quickCompat.options.opt_rarely', 'assessments.quickCompat.options.opt_sometimes', 'assessments.quickCompat.options.opt_often'],
            q_spontaneity_planning: ['assessments.quickCompat.options.opt_spontaneity', 'assessments.quickCompat.options.opt_planning', 'assessments.quickCompat.options.opt_both'],
            q_family_involvement: ['assessments.quickCompat.options.opt_not_important', 'assessments.quickCompat.options.opt_somewhat_important', 'assessments.quickCompat.options.opt_very_important'],
            q_comm_style: ['assessments.quickCompat.options.opt_direct', 'assessments.quickCompat.options.opt_indirect'],
            q_conflict_resolution: ['assessments.quickCompat.options.opt_discuss_now', 'assessments.quickCompat.options.opt_cool_off'],
            q_social_circle: ['assessments.quickCompat.options.opt_small_circle', 'assessments.quickCompat.options.opt_large_network'],
            q_travel_preference: ['assessments.quickCompat.options.opt_relaxing', 'assessments.quickCompat.options.opt_adventure'],
            q_dietary_habits: ['assessments.quickCompat.options.opt_anything', 'assessments.quickCompat.options.opt_specific_diet'],
            q_long_term_goals: ['assessments.quickCompat.options.opt_career_focus', 'assessments.quickCompat.options.opt_family_focus', 'assessments.quickCompat.options.opt_balance_both'],
            q_parenting_style: ['assessments.quickCompat.options.opt_strict', 'assessments.quickCompat.options.opt_lenient', 'assessments.quickCompat.options.opt_authoritative'],
            q_spirituality: ['assessments.quickCompat.options.opt_very_spiritual', 'assessments.quickCompat.options.opt_somewhat_spiritual', 'assessments.quickCompat.options.opt_not_spiritual'],
            q_political_views: ['assessments.quickCompat.options.opt_similar_views', 'assessments.quickCompat.options.opt_differences_ok'],
            q_cultural_background_match: ['assessments.quickCompat.options.opt_important_match', 'assessments.quickCompat.options.opt_not_important_match']
        }
    };

    document.querySelectorAll('#quickCompatLevelSelector button[data-level]').forEach(button => {
        button.addEventListener('click', () => startQuickCompatQuiz(button.dataset.level));
    });

    if (resetQuickCompatBtnEl) {
        resetQuickCompatBtnEl.addEventListener('click', resetQuickCompatQuiz);
    }
    if (quickCompatWeightEl && quickCompatWeightValueEl) {
      quickCompatWeightEl.addEventListener('input', function() { quickCompatWeightValueEl.textContent = this.value; });
    }
    if (quickCompatNextBtnEl) {
        quickCompatNextBtnEl.addEventListener('click', () => { 
            if (quickCompatUserAnswers[currentQuickCompatIndex]) {
                currentQuickCompatIndex++; 
                loadQuickCompatQuestion(); 
            } else {
                window.showNotification(window.i18next.t('alerts.selectionNeeded'), 'error');
            }
        });
    }


    function startQuickCompatQuiz(level) {
        window.showLoading(true);
        currentQuickCompatIndex = 0;
        quickCompatUserAnswers = [];
        currentQuickCompatQuizData.level = level;
        currentQuickCompatQuizData.questions = quickCompatQuestionSets[level] || [];
        
        if(quickCompatLevelSelector) quickCompatLevelSelector.style.display = 'none';
        if(quickCompatResultArea) quickCompatResultArea.style.display = 'none';
        if(quickCompatQuizArea) quickCompatQuizArea.style.display = 'block';
        
        loadQuickCompatQuestion();
        window.showLoading(false);
    }

    function loadQuickCompatQuestion() {
        if (currentQuickCompatIndex < currentQuickCompatQuizData.questions.length) {
            const questionKey = currentQuickCompatQuizData.questions[currentQuickCompatIndex];
            if(quickCompatQuestionTextEl) quickCompatQuestionTextEl.textContent = window.i18next.t(questionKey);
            
            if(quickCompatOptionsAreaEl) quickCompatOptionsAreaEl.innerHTML = '';
            const questionShortKey = questionKey.substring(questionKey.lastIndexOf('.') + 1);
            const optionKeys = quickCompatQuestionSets.options[questionShortKey] || [];
            
            optionKeys.forEach(optKey => {
                const btn = document.createElement('button');
                btn.textContent = window.i18next.t(optKey);
                btn.onclick = () => selectQuickCompatOption(btn, optKey);
                if(quickCompatOptionsAreaEl) quickCompatOptionsAreaEl.appendChild(btn);
            });

            if(quickCompatCounterEl) quickCompatCounterEl.textContent = currentQuickCompatIndex + 1;
            if(quickCompatTotalEl) quickCompatTotalEl.textContent = currentQuickCompatQuizData.questions.length;
            if(quickCompatProgressBarEl) {
                const percentage = ((currentQuickCompatIndex + 1) / currentQuickCompatQuizData.questions.length) * 100;
                quickCompatProgressBarEl.style.width = `${percentage}%`;
                quickCompatProgressBarEl.textContent = `${Math.round(percentage)}%`;
            }
            if(quickCompatNextBtnEl) quickCompatNextBtnEl.disabled = true;
        } else {
            showQuickCompatResults();
        }
    }

    function selectQuickCompatOption(selectedButton, optionKey) {
        document.querySelectorAll('#quickCompatOptionsArea button').forEach(btn => btn.classList.remove('selected'));
        selectedButton.classList.add('selected');
        const weight = quickCompatWeightEl ? quickCompatWeightEl.value : 3;
        quickCompatUserAnswers[currentQuickCompatIndex] = { 
            question: currentQuickCompatQuizData.questions[currentQuickCompatIndex], 
            answer: optionKey, 
            weight: parseInt(weight) 
        };
        if(quickCompatNextBtnEl) quickCompatNextBtnEl.disabled = false;
    }

    async function showQuickCompatResults() {
        if(quickCompatQuizArea) quickCompatQuizArea.style.display = 'none';
        if(quickCompatResultArea) quickCompatResultArea.style.display = 'block';
        if(quickCompatFinalFeedbackEl) quickCompatFinalFeedbackEl.textContent = 
            `${window.i18next.t('assessments.quickCompat.results.completed')} ${currentQuickCompatQuizData.level} ${window.i18next.t('assessments.quickCompat.results.checkWith')} ${quickCompatUserAnswers.length} ${window.i18next.t('assessments.quickCompat.results.answers')}.`;

        const profileRef = window.getProfileRef(); // From main.js
        if (profileRef && window.firebaseInitialized && window.db) {
            window.showLoading(true);
            try {
                const assessmentRecord = {
                    name: `Quick Compatibility - ${currentQuickCompatQuizData.level}`,
                    completedAt: window.serverTimestamp(), // From main.js
                    level: currentQuickCompatQuizData.level,
                    answers: quickCompatUserAnswers
                };
                await window.updateDoc(profileRef, { // From main.js
                    assessments: window.arrayUnion(assessmentRecord), // From main.js
                    [`profileData.quickCompat_${currentQuickCompatQuizData.level}`]: quickCompatUserAnswers
                });
                window.showNotification("Quick compat results saved to your profile.", "success");
                if (typeof window.updateProfileDisplay === "function") window.updateProfileDisplay();
            } catch (error) {
                console.error("Error saving quick compat results:", error);
                window.showNotification("Error saving quick compat results: " + error.message, "error");
            } finally {
                window.showLoading(false);
            }
        }
    }

    function resetQuickCompatQuiz() {
        if(quickCompatLevelSelector) quickCompatLevelSelector.style.display = 'block';
        if(quickCompatQuizArea) quickCompatQuizArea.style.display = 'none';
        if(quickCompatResultArea) quickCompatResultArea.style.display = 'none';
        if(quickCompatProgressBarEl) {
             quickCompatProgressBarEl.style.width = `0%`;
             quickCompatProgressBarEl.textContent = `0%`;
        }
        if(quickCompatWeightEl) quickCompatWeightEl.value = 3;
        if(quickCompatWeightValueEl) quickCompatWeightValueEl.textContent = 3;

    }

    // --- Relationship Profile Builder Quiz Logic ---
    let currentDetailsIndex = 0;
    let detailsUserAnswers = [];
    // Ensure translations are loaded, or define question keys directly
    const detailsQuestionKeys = Object.keys(window.i18next.getResourceBundle('en', 'translation').assessments.profileBuilder.questions || {});
    
    const relationshipDetailsQuizAreaEl = document.getElementById('relationshipDetailsQuizArea');
    const detailsResultAreaEl = document.getElementById('detailsResultArea');
    const detailsQuestionTextEl = document.getElementById('detailsQuestionText');
    const detailsOptionsAreaEl = document.getElementById('detailsOptionsArea');
    const detailsWeightEl = document.getElementById('detailsWeight');
    const detailsWeightValueEl = document.getElementById('detailsWeightValue');
    const detailsCounterEl = document.getElementById('detailsCounter');
    const detailsTotalEl = document.getElementById('detailsTotal');
    const detailsProgressBarEl = document.getElementById('detailsProgressBar');
    const detailsNextBtnEl = document.getElementById('detailsNextBtn');
    const detailsFinalFeedbackEl = document.getElementById('detailsFinalFeedback');
    const resetDetailsQuizBtnEl = document.getElementById('resetDetailsQuizBtn');

    if (resetDetailsQuizBtnEl) {
        resetDetailsQuizBtnEl.addEventListener('click', resetDetailsQuiz);
    }
    if (detailsWeightEl && detailsWeightValueEl) {
      detailsWeightEl.addEventListener('input', function() { detailsWeightValueEl.textContent = this.value; });
    }
    if (detailsNextBtnEl) {
        detailsNextBtnEl.addEventListener('click', () => { 
            if (detailsUserAnswers[currentDetailsIndex]) {
                currentDetailsIndex++; 
                loadDetailsQuestion(); 
            } else {
                window.showNotification(window.i18next.t('alerts.selectionNeeded'), 'error');
            }
        });
    }


    function startDetailsQuiz() { // This might be triggered by a button or on page load
        if (detailsQuestionKeys.length === 0) {
            console.warn("Profile builder questions not loaded. Ensure i18next has them.");
            if(relationshipDetailsQuizAreaEl) relationshipDetailsQuizAreaEl.innerHTML = "<p>Assessment questions could not be loaded.</p>";
            return;
        }
        window.showLoading(true);
        currentDetailsIndex = 0;
        detailsUserAnswers = [];
        if(detailsResultAreaEl) detailsResultAreaEl.style.display = 'none';
        if(relationshipDetailsQuizAreaEl) relationshipDetailsQuizAreaEl.style.display = 'block';
        loadDetailsQuestion();
        window.showLoading(false);
    }

    function loadDetailsQuestion() {
        if (currentDetailsIndex < detailsQuestionKeys.length) {
            const questionKey = detailsQuestionKeys[currentDetailsIndex]; // This is already the full i18next key
            if(detailsQuestionTextEl) detailsQuestionTextEl.textContent = window.i18next.t(questionKey);
            
            if(detailsOptionsAreaEl) detailsOptionsAreaEl.innerHTML = ''; 
            
            const qShortKey = questionKey.substring(questionKey.lastIndexOf('.') + 1);
            let currentOptionsForQuestion = [];
            const allProfileBuilderOptions = window.i18next.getResourceBundle('en', 'translation').assessments.profileBuilder.options;

            // Logic to determine options based on question type (copied from original SPA)
            if (qShortKey === 'q_love_language_give' || qShortKey === 'q_love_language_receive') {
                currentOptionsForQuestion = ['words', 'acts', 'gifts', 'quality_time', 'touch'].map(o => `assessments.profileBuilder.options.${o}`);
            } else if (qShortKey === 'q_financial_transparency_scale') {
                currentOptionsForQuestion = ["1", "2", "3", "4", "5"].map(o => `assessments.profileBuilder.options.${o}`);
            } else if (qShortKey === 'q_stress_handling') {
                currentOptionsForQuestion = ['talk_it_out', 'alone_time', 'distract_myself', 'exercise'].map(o => `assessments.profileBuilder.options.${o}`);
            } else if (qShortKey === 'q_family_involvement_expectations') {
                currentOptionsForQuestion = ['very_involved', 'moderately_involved', 'minimal_involvement'].map(o => `assessments.profileBuilder.options.${o}`);
            } else if (qShortKey === 'q_spiritual_beliefs_match_importance') {
                currentOptionsForQuestion = ['very_important', 'somewhat_important', 'not_important'].map(o => `assessments.profileBuilder.options.${o}`);
            } else if (qShortKey === 'q_children_stance') {
                currentOptionsForQuestion = ['definitely_want', 'open_to_discussion', 'prefer_not', 'undecided'].map(o => `assessments.profileBuilder.options.${o}`);
            } else if (qShortKey === 'q_past_relationships_discussion') {
                currentOptionsForQuestion = ['open_book', 'some_details_ok', 'prefer_not_much'].map(o => `assessments.profileBuilder.options.${o}`);
            } else if (qShortKey === 'q_lobola_view') {
                currentOptionsForQuestion = ['essential_tradition', 'important_cultural', 'open_to_modern', 'not_applicable'].map(o => `assessments.profileBuilder.options.${o}`);
            } else if (qShortKey === 'q_household_responsibilities') {
                currentOptionsForQuestion = ['strictly_50_50', 'based_on_time_skill', 'flexible_circumstances', 'outsource_some'].map(o => `assessments.profileBuilder.options.${o}`);
            } else { 
                currentOptionsForQuestion = [
                    'assessments.profileBuilder.options.very_important',
                    'assessments.profileBuilder.options.somewhat_important',
                    'assessments.profileBuilder.options.not_important'
                ];
            }

            currentOptionsForQuestion.forEach(optKeyOrText => {
                const btn = document.createElement('button');
                const optionText = window.i18next.exists(optKeyOrText) ? window.i18next.t(optKeyOrText) : optKeyOrText;
                btn.textContent = optionText;
                btn.onclick = () => selectDetailsOption(btn, optKeyOrText);
                if(detailsOptionsAreaEl) detailsOptionsAreaEl.appendChild(btn);
            });

            if(detailsCounterEl) detailsCounterEl.textContent = currentDetailsIndex + 1;
            if(detailsTotalEl) detailsTotalEl.textContent = detailsQuestionKeys.length;
            if(detailsProgressBarEl) {
                const percentage = ((currentDetailsIndex + 1) / detailsQuestionKeys.length) * 100;
                detailsProgressBarEl.style.width = `${percentage}%`;
                detailsProgressBarEl.textContent = `${Math.round(percentage)}%`;
            }
            if(detailsNextBtnEl) detailsNextBtnEl.disabled = true;
        } else {
            showDetailsResults();
        }
    }

    function selectDetailsOption(selectedButton, optionKeyOrText) {
        document.querySelectorAll('#detailsOptionsArea button').forEach(btn => btn.classList.remove('selected'));
        selectedButton.classList.add('selected');
        const weight = detailsWeightEl ? detailsWeightEl.value : 3;
        detailsUserAnswers[currentDetailsIndex] = { 
            question: detailsQuestionKeys[currentDetailsIndex], 
            answer: optionKeyOrText, 
            weight: parseInt(weight) 
        };
        if(detailsNextBtnEl) detailsNextBtnEl.disabled = false;
    }

    async function showDetailsResults() {
        if(relationshipDetailsQuizAreaEl) relationshipDetailsQuizAreaEl.style.display = 'none';
        if(detailsResultAreaEl) detailsResultAreaEl.style.display = 'block';
        if(detailsFinalFeedbackEl) detailsFinalFeedbackEl.textContent = 
            `${window.i18next.t('assessments.profileBuilder.results.completedWith')} ${detailsUserAnswers.length} ${window.i18next.t('assessments.profileBuilder.results.answers')}.`;
        
        const profileRef = window.getProfileRef();
        if (profileRef && window.firebaseInitialized && window.db) {
            window.showLoading(true);
            try {
                const assessmentRecord = {
                    name: "Relationship Profile Builder",
                    completedAt: window.serverTimestamp(),
                    answers: detailsUserAnswers
                };
                const profileDataUpdates = {};
                detailsUserAnswers.forEach(ans => {
                    const qKey = ans.question.substring(ans.question.lastIndexOf('.') + 1);
                    profileDataUpdates[qKey] = { answer: ans.answer, weight: ans.weight };
                });

                await window.updateDoc(profileRef, {
                    assessments: window.arrayUnion(assessmentRecord),
                    profileData: { ...profileDataUpdates } 
                });
                window.showNotification("Profile builder results saved.", "success");
                if (typeof window.updateProfileDisplay === "function") window.updateProfileDisplay();
            } catch (error) {
                console.error("Error saving profile builder results:", error);
                window.showNotification("Error saving profile builder results: " + error.message, "error");
            } finally {
                window.showLoading(false);
            }
        }
    }

    function resetDetailsQuiz() {
        startDetailsQuiz(); // Simply restart the quiz
        if(detailsProgressBarEl) {
             detailsProgressBarEl.style.width = `0%`;
             detailsProgressBarEl.textContent = `0%`;
        }
        if(detailsWeightEl) detailsWeightEl.value = 3;
        if(detailsWeightValueEl) detailsWeightValueEl.textContent = 3;
    }

    // Initialize the Relationship Profile Builder Quiz on page load
    if (detailsQuestionKeys.length > 0) { // Only start if questions are available
        startDetailsQuiz();
    } else {
        console.warn("Details quiz questions not loaded, quiz not started automatically.");
        // Optionally display a message to the user in the quiz area
        if (relationshipDetailsQuizAreaEl) {
            relationshipDetailsQuizAreaEl.innerHTML = `<p class="text-center p-4">Could not load assessment questions. Please try refreshing the page or check your connection.</p>`;
        }
    }
}
