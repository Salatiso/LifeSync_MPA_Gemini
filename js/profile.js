// js/profile.js - Logic for the User Profile Page

document.addEventListener('DOMContentLoaded', () => {
    const ensureGlobalsInterval = setInterval(() => {
        if (window.firebaseInitialized && 
            window.i18next && window.i18next.isInitialized &&
            typeof window.showNotification === 'function' &&
            typeof window.showLoading === 'function' &&
            typeof window.getProfileRef === 'function' && // Ensure getProfileRef is available
            typeof window.updateDoc === 'function' && // Ensure updateDoc is available
            typeof window.getDoc === 'function' && // Ensure getDoc is available
            typeof window.storage === 'object' // Ensure storage is available
            ) {
            clearInterval(ensureGlobalsInterval);
            initializeProfilePage();
        }
    }, 100);
});

// Make updateProfileDisplay globally available if it's called from main.js's onAuthStateChanged
window.updateProfileDisplay = async function() {
    const nameEl = document.getElementById('profileNameDisplay');
    const emailEl = document.getElementById('profileEmailDisplay');
    const typeEl = document.getElementById('profileTypeDisplay');
    const expiryEl = document.getElementById('profileExpiryDisplay');
    const assessmentsListEl = document.getElementById('completedAssessmentsList');
    const dataDisplayEl = document.getElementById('profileDataDisplay');
    // UGQ list is handled by ugq.js, but profile page might show a summary or link
    const profileImagePreview = document.getElementById('profileImagePreview');
    const coreProfileFormEl = document.getElementById('coreProfileForm'); // For filling form fields
    const publicProfileToggleEl = document.getElementById('publicProfileToggle');


    // Reset to guest state initially
    if(nameEl) nameEl.textContent = window.i18next.t('profile.guestName');
    if(emailEl) emailEl.textContent = window.i18next.t('profile.guestEmail');
    if(typeEl) typeEl.textContent = "";
    if(expiryEl) expiryEl.style.display = 'none';
    if(assessmentsListEl) assessmentsListEl.innerHTML = `<li>${window.i18next.t('profile.noAssessmentsLoggedIn')}</li>`;
    if(dataDisplayEl) dataDisplayEl.innerHTML = `<p>${window.i18next.t('profile.noDataLoggedIn')}</p>`;
    if(profileImagePreview) profileImagePreview.innerHTML = `<i class="fas fa-user-circle"></i>`;
    calculateProfileCompletion({}); 

    if (!window.firebaseInitialized) {
        window.showLoading(false);
        return;
    }
    window.showLoading(true);
    const profileRef = window.getProfileRef(); // Uses currentUserId and isTempUser from main.js

    if (!profileRef) { 
        window.showLoading(false); 
        // UI should already reflect logged-out state from onAuthStateChanged in main.js
        return; 
    }

    try {
        const docSnap = await window.getDoc(profileRef); // Use window.getDoc
        if (docSnap.exists()) {
            const userData = docSnap.data();
            const coreProfile = userData.coreProfile || {};
            
            if(nameEl) nameEl.textContent = coreProfile.name || (window.auth?.currentUser && !window.isTempUser ? window.auth.currentUser.displayName : userData.username || 'User');
            if(emailEl && window.auth?.currentUser && !window.isTempUser) emailEl.textContent = `Email: ${window.auth.currentUser.email}`;
            else if (emailEl && window.isTempUser) emailEl.textContent = window.i18next.t('profile.emailTemp');

            if(typeEl) typeEl.textContent = (window.auth?.currentUser && !window.isTempUser) ? window.i18next.t('profile.typePermanent') : window.i18next.t('profile.typeTemporary');
            if(expiryEl && window.isTempUser && userData.expiresAt) {
                expiryEl.textContent = `${window.i18next.t('profile.expiresOn')} ${userData.expiresAt.toDate().toLocaleDateString()}`;
                expiryEl.style.display = 'block';
            } else if(expiryEl) {
                expiryEl.style.display = 'none';
            }

            if(coreProfileFormEl) {
                document.getElementById('core-profile-dob').value = coreProfile.dob || '';
                document.getElementById('core-profile-gender').value = coreProfile.gender || '';
                document.getElementById('core-profile-location').value = coreProfile.location || '';
                document.getElementById('core-profile-hobbies').value = coreProfile.hobbies || '';
                document.getElementById('core-profile-education').value = coreProfile.education || '';
                document.getElementById('core-profile-occupation').value = coreProfile.occupation || '';
                document.getElementById('core-profile-about').value = coreProfile.about || '';
                if(publicProfileToggleEl && !window.isTempUser) publicProfileToggleEl.checked = userData.isPublic || false;
                else if (publicProfileToggleEl && window.isTempUser) publicProfileToggleEl.parentElement.style.display = 'none'; 
            }
            if (profileImagePreview && coreProfile.profileImageUrl) {
                profileImagePreview.innerHTML = `<img src="${coreProfile.profileImageUrl}" alt="Profile Preview" class="profileImagePreviewStyle">`;
            } else if (profileImagePreview) {
                profileImagePreview.innerHTML = `<i class="fas fa-user-circle"></i>`;
            }

            calculateProfileCompletion(coreProfile);
            
            renderAssessmentsList(userData.assessments || [], assessmentsListEl);
            renderProfileAssessmentData(userData.profileData || {}, dataDisplayEl); 
            // UGQ list rendering is in ugq.js, but you might call a summary function here if needed
        } else {
            // If doc doesn't exist but user is authenticated (e.g. new user via Google before doc creation)
            if (window.auth?.currentUser && !window.isTempUser && nameEl) nameEl.textContent = window.auth.currentUser.displayName || 'User';
            if (window.auth?.currentUser && !window.isTempUser && emailEl) emailEl.textContent = `Email: ${window.auth.currentUser.email}`;
        }
    } catch (error) {
        console.error("Error fetching profile data for display:", error);
        window.showNotification("Error loading profile information.", "error");
    }
    window.showLoading(false);
}


function initializeProfilePage() {
    console.log("Initializing Profile Page specific JavaScript");

    const profileImagePreviewEl = document.getElementById('profileImagePreview');
    const profileImageUploadEl = document.getElementById('profileImageUpload');
    const uploadProfilePicBtnEl = document.getElementById('uploadProfilePicBtn');
    const coreProfileFormEl = document.getElementById('coreProfileForm');
    const publicProfileToggleEl = document.getElementById('publicProfileToggle');
    const socialMediaFileInputEl = document.getElementById('socialMediaFileInput');
    const importSocialMediaBtnEl = document.getElementById('importSocialMediaBtn');
    const importFeedbackEl = document.getElementById('importFeedback');
    const aiDataFileInputEl = document.getElementById('aiDataFileInput');
    const importAIDataBtnEl = document.getElementById('importAIDataBtn');
    const aiImportFeedbackEl = document.getElementById('aiImportFeedback');


    if (uploadProfilePicBtnEl && profileImageUploadEl) {
        uploadProfilePicBtnEl.addEventListener('click', () => {
            profileImageUploadEl.click();
        });
    }
    
    if (profileImageUploadEl) {
        profileImageUploadEl.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file && window.firebaseInitialized && window.storage && window.currentUserId) {
                window.showLoading(true);
                const filePath = `artifacts/${window.appIdFromGlobal}/users/${window.currentUserId}/profileImages/${file.name}`;
                const storageRef = window.ref(window.storage, filePath); // Use window.ref
                try {
                    const snapshot = await window.uploadBytes(storageRef, file); // Use window.uploadBytes
                    const downloadURL = await window.getDownloadURL(snapshot.ref); // Use window.getDownloadURL
                    
                    if(profileImagePreviewEl) profileImagePreviewEl.innerHTML = `<img src="${downloadURL}" alt="Profile Preview" class="profileImagePreviewStyle">`;
                    
                    const profileRef = window.getProfileRef();
                    if (profileRef) {
                        await window.updateDoc(profileRef, { "coreProfile.profileImageUrl": downloadURL });
                    }
                    window.showNotification(window.i18next.t('alerts.imageUploadSuccess'), 'success');
                } catch (error) {
                    console.error("Error uploading image: ", error);
                    window.showNotification(window.i18next.t('alerts.imageUploadError') + ` ${error.message}`, 'error');
                } finally {
                    window.showLoading(false);
                }
            } else if (!window.currentUserId) {
                window.showNotification("Please log in or create a profile to upload an image.", "error");
            }
        });
    }
    
    if (coreProfileFormEl) {
        coreProfileFormEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!window.firebaseInitialized) { window.showNotification("Service not available.", "error"); return; }
            window.showLoading(true);
            const profileRef = window.getProfileRef();
            if (!profileRef) { window.showNotification("No active profile to save details to.", "error"); window.showLoading(false); return; }

            const coreProfileData = {
                dob: document.getElementById('core-profile-dob').value,
                gender: document.getElementById('core-profile-gender').value,
                location: window.sanitizeInput(document.getElementById('core-profile-location').value.trim()),
                hobbies: window.sanitizeInput(document.getElementById('core-profile-hobbies').value.trim()),
                education: window.sanitizeInput(document.getElementById('core-profile-education').value.trim()),
                occupation: window.sanitizeInput(document.getElementById('core-profile-occupation').value.trim()),
                about: window.sanitizeInput(document.getElementById('core-profile-about').value.trim()),
            };
            
            const firebaseUser = window.auth?.currentUser;
            if(firebaseUser && !window.isTempUser) {
                coreProfileData.name = firebaseUser.displayName || document.getElementById('registerName')?.value || 'User'; 
                coreProfileData.email = firebaseUser.email;
            } else if (window.isTempUser) {
                const tempProfileLocal = JSON.parse(localStorage.getItem('tempProfile'));
                coreProfileData.name = tempProfileLocal?.username || 'Guest';
            }
            
            const updateData = { 
                coreProfile: coreProfileData,
                updatedAt: window.serverTimestamp() 
            };
            if (!window.isTempUser && publicProfileToggleEl) { 
                updateData.isPublic = publicProfileToggleEl.checked;
                updateData.name = coreProfileData.name; 
            }

            try {
                await window.updateDoc(profileRef, updateData , { merge: true }); // Use window.updateDoc
                window.showNotification(window.i18next.t('alerts.profileDetailsSaved'), 'success');
                calculateProfileCompletion(coreProfileData);
                if (firebaseUser && !window.isTempUser && firebaseUser.displayName !== coreProfileData.name) { 
                    await window.updateProfile(firebaseUser, { displayName: coreProfileData.name }); // Use window.updateProfile (Firebase Auth)
                }
                window.updateProfileDisplay(); // Refresh display
            } catch (error) {
                console.error("Error saving profile details:", error);
                window.showNotification(window.i18next.t('alerts.profileDetailsError') + ` ${error.message}`, 'error');
            }
            window.showLoading(false);
        });
    }

    if (publicProfileToggleEl && !window.isTempUser) { // Only add listener if not a temp user
        publicProfileToggleEl.addEventListener('change', async (e) => {
            if (!window.currentUserId || window.isTempUser) return; // Should not happen for temp user due to above condition
            window.showLoading(true);
            const profileRef = window.getProfileRef();
            if (profileRef) {
                try {
                    await window.updateDoc(profileRef, { isPublic: e.target.checked });
                    window.showNotification(`Profile visibility updated.`, 'success');
                } catch (error) {
                    window.showNotification(`Error updating visibility: ${error.message}`, 'error');
                } finally {
                    window.showLoading(false);
                }
            }
        });
    } else if (publicProfileToggleEl && window.isTempUser) {
        publicProfileToggleEl.parentElement.style.display = 'none'; // Hide toggle for temp users
    }


    // Initial call to display profile data when page loads
    window.updateProfileDisplay();


    // --- Data Import Logic ---
    if (importSocialMediaBtnEl && socialMediaFileInputEl) {
        importSocialMediaBtnEl.addEventListener('click', async () => {
            if (!window.currentUserId) {
                window.showNotification(window.i18next.t('alerts.loginToImport'), 'error');
                return;
            }
            const file = socialMediaFileInputEl.files[0];
            if (!file) {
                window.showNotification(window.i18next.t('alerts.selectFileFirst'), 'error');
                return;
            }
            window.showLoading(true);
            if(importFeedbackEl) importFeedbackEl.textContent = window.i18next.t('alerts.processingFile');

            try {
                const fileContent = await file.text();
                let dataToImport = {};

                if (file.name.endsWith('.json')) {
                    dataToImport = JSON.parse(fileContent);
                    // Basic validation or transformation of common dating app JSON structures can be added here
                } else if (file.name.endsWith('.zip')) {
                    // ZIP processing is complex client-side, usually requires a library like JSZip.
                    // For this example, we'll just show a message.
                    window.showNotification(window.i18next.t('alerts.zipParsingNotImplemented'), 'info');
                    if(importFeedbackEl) importFeedbackEl.textContent = '';
                    window.showLoading(false);
                    return;
                } else {
                    throw new Error(window.i18next.t('alerts.unsupportedFileFormat'));
                }

                // Merge dataToImport into user's coreProfile or a dedicated 'importedData' field
                const profileRef = window.getProfileRef();
                if (profileRef) {
                    // Example: Merging into coreProfile, be careful with overwriting
                    // It's safer to merge into a specific sub-object like 'importedSocialData'
                    await window.updateDoc(profileRef, { 
                        "importedData.social": dataToImport, // Store under a specific key
                        "coreProfile.hobbies": dataToImport.hobbies || dataToImport.interests || document.getElementById('core-profile-hobbies').value, // Example merge
                        "coreProfile.about": dataToImport.bio || dataToImport.summary || document.getElementById('core-profile-about').value,
                         updatedAt: window.serverTimestamp()
                    }, { merge: true });
                    window.showNotification(window.i18next.t('alerts.importSuccess'), 'success');
                    if(importFeedbackEl) importFeedbackEl.textContent = 'Import successful!';
                    window.updateProfileDisplay(); // Refresh profile
                }
            } catch (error) {
                console.error("Error importing social media data:", error);
                window.showNotification(window.i18next.t('alerts.importFailed') + ` ${error.message}`, 'error');
                if(importFeedbackEl) importFeedbackEl.textContent = `Error: ${error.message}`;
            } finally {
                window.showLoading(false);
            }
        });
    }

    if (importAIDataBtnEl && aiDataFileInputEl) {
        importAIDataBtnEl.addEventListener('click', async () => {
             if (!window.currentUserId) {
                window.showNotification(window.i18next.t('alerts.loginToImport'), 'error');
                return;
            }
            const file = aiDataFileInputEl.files[0];
            if (!file) {
                window.showNotification(window.i18next.t('alerts.selectFileFirst'), 'error');
                return;
            }
            if (!file.name.endsWith('.json')) {
                 window.showNotification(window.i18next.t('alerts.unsupportedFileFormat'), 'error');
                return;
            }

            window.showLoading(true);
            if(aiImportFeedbackEl) aiImportFeedbackEl.textContent = window.i18next.t('alerts.processingFile');
            try {
                const fileContent = await file.text();
                const aiData = JSON.parse(fileContent);

                // Assume aiData is structured to match parts of coreProfile or profileData
                // Example: { "location": "Cape Town", "occupation": "Artist", "values": ["honesty", "creativity"] }
                const profileRef = window.getProfileRef();
                if (profileRef) {
                    const updatePayload = { updatedAt: window.serverTimestamp() };
                    if(aiData.coreProfile) { // If AI data has a coreProfile structure
                        for (const key in aiData.coreProfile) {
                            updatePayload[`coreProfile.${key}`] = aiData.coreProfile[key];
                        }
                    } else { // Fallback: merge top-level keys from AI data into coreProfile
                         for (const key in aiData) {
                            if (['dob', 'gender', 'location', 'hobbies', 'education', 'occupation', 'about'].includes(key)) {
                               updatePayload[`coreProfile.${key}`] = aiData[key];
                            }
                        }
                    }
                    // You might also want to merge into `profileData` for custom fields
                    if (aiData.profileData) {
                         updatePayload.profileData = { ... (await window.getDoc(profileRef)).data().profileData, ...aiData.profileData };
                    }


                    await window.updateDoc(profileRef, updatePayload, { merge: true });
                    window.showNotification(window.i18next.t('alerts.aiImportSuccess'), 'success');
                    if(aiImportFeedbackEl) aiImportFeedbackEl.textContent = 'AI Data Import successful!';
                    window.updateProfileDisplay();
                }

            } catch (error) {
                console.error("Error importing AI processed data:", error);
                window.showNotification(window.i18next.t('alerts.aiImportFailed') + ` ${error.message}`, 'error');
                if(aiImportFeedbackEl) aiImportFeedbackEl.textContent = `Error: ${error.message}`;
            } finally {
                window.showLoading(false);
            }
        });
    }
}

function calculateProfileCompletion(coreProfile = {}) {
    const bar = document.getElementById('profileCompletionBar');
    const textEl = document.getElementById('profileCompletionPercentageText');
    const hintEl = document.getElementById('profileCompletionHint');
    if (!bar || !textEl || !hintEl) return;

    const fields = ['dob', 'gender', 'location', 'hobbies', 'education', 'occupation', 'about'];
    let filledFields = 0;
    const totalFields = fields.length;

    fields.forEach(field => {
        if (coreProfile[field] && String(coreProfile[field]).trim() !== '') {
            filledFields++;
        }
    });
    // Consider profile image as a field
    const profileImagePreview = document.getElementById('profileImagePreview');
    let hasImage = false;
    if (profileImagePreview && profileImagePreview.querySelector('img')) {
        hasImage = true;
    }
    const totalPotentialFields = totalFields + (window.isTempUser ? 0 : 1); // Image upload not for temp users usually
    const currentFilledFields = filledFields + (hasImage && !window.isTempUser ? 1 : 0);


    const completionPercentage = totalPotentialFields > 0 ? Math.round((currentFilledFields / totalPotentialFields) * 100) : 0;
    bar.style.width = `${completionPercentage}%`;
    bar.textContent = `${completionPercentage}%`;
    textEl.textContent = `${completionPercentage}%`;
    hintEl.textContent = completionPercentage < 70 ? window.i18next.t('profile.completionHint') : "Your profile is looking great!";
}

function renderAssessmentsList(assessments = [], listEl) {
    if (!listEl) return;
    listEl.innerHTML = '';
    if (assessments.length === 0) {
        listEl.innerHTML = `<li>${window.i18next.t('profile.noAssessmentsYet')}</li>`;
        return;
    }
    assessments.forEach(asm => {
        const li = document.createElement('li');
        const completedDate = asm.completedAt?.toDate ? new Date(asm.completedAt.toDate()).toLocaleDateString() : (asm.completedAt ? new Date(asm.completedAt).toLocaleDateString() : 'N/A');
        li.textContent = `${asm.name || 'Assessment'} - ${window.i18next.t('profile.completedOn')} ${completedDate}`;
        listEl.appendChild(li);
    });
}

function renderProfileAssessmentData(profileData = {}, displayEl) {
    if (!displayEl) return;
    displayEl.innerHTML = ''; 
    if (Object.keys(profileData).length === 0) {
        displayEl.innerHTML = `<p>${window.i18next.t('profile.noProfileDataYet')}</p>`;
        return;
    }
    const ul = document.createElement('ul');
    ul.className = 'list-disc pl-5 space-y-1'; // Add some styling

    for (const key in profileData) {
        if (profileData.hasOwnProperty(key)) {
            const li = document.createElement('li');
            let displayValue = profileData[key];
            // Try to make the display more readable
            if (typeof displayValue === 'object' && displayValue !== null) {
                if (Array.isArray(displayValue)) { // If it's an array of answers from an assessment
                     displayValue = displayValue.map(item => 
                        `${window.i18next.t(item.question, { ns: 'translation', defaultValue: item.question.substring(item.question.lastIndexOf('.') + 1).replace(/_/g, ' ') })}: ${window.i18next.t(item.answer, { ns: 'translation', defaultValue: item.answer })} (Weight: ${item.weight})`
                     ).join('<br>');
                } else { // Generic object
                    displayValue = JSON.stringify(displayValue, null, 2); // Pretty print JSON
                }
            } else {
                displayValue = window.sanitizeInput(String(displayValue));
            }
            
            li.innerHTML = `<strong class="capitalize">${window.sanitizeInput(key.replace(/_/g, ' '))}:</strong><div class="pl-2 text-sm">${displayValue}</div>`;
            ul.appendChild(li);
        }
    }
    displayEl.appendChild(ul);
}
