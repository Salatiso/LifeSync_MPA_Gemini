// js/sync.js - Logic for the Couple Sync Page

document.addEventListener('DOMContentLoaded', () => {
    const ensureGlobalsInterval = setInterval(() => {
        if (window.firebaseInitialized && 
            window.i18next && window.i18next.isInitialized &&
            typeof window.showNotification === 'function' &&
            typeof window.showLoading === 'function' &&
            typeof window.getProfileRef === 'function' 
            ) {
            clearInterval(ensureGlobalsInterval);
            initializeSyncPage();
        }
    }, 100);
});

async function initializeSyncPage() {
    console.log("Initializing Sync Page specific JavaScript");

    const sendSyncRequestBtnEl = document.getElementById('sendSyncRequestBtn');
    const partnerUsernameSyncEl = document.getElementById('partnerUsernameSync');
    const pendingRequestsListEl = document.getElementById('pendingRequestsList');
    const syncedPartnersListEl = document.getElementById('syncedPartnersList');

    if (sendSyncRequestBtnEl && partnerUsernameSyncEl) {
        sendSyncRequestBtnEl.addEventListener('click', async () => {
            if (!window.currentUserId) {
                window.showNotification("Please log in to send a sync request.", "error");
                return;
            }
            const partnerUsername = window.sanitizeInput(partnerUsernameSyncEl.value.trim());
            if (!partnerUsername) {
                window.showNotification("Please enter your partner's username.", "error");
                return;
            }

            window.showLoading(true);
            try {
                // 1. Find partner's UID by username (email in this setup)
                // This requires querying the 'users' collection where 'username' (or 'email') matches.
                // This is a public data query if usernames are public, or requires a Cloud Function for privacy.
                // For simplicity, assuming 'username' is stored and queryable.
                // IMPORTANT: Firestore queries are case-sensitive. Ensure usernames are stored consistently.
                
                const usersRef = window.collection(window.db, `artifacts/${window.appIdFromGlobal}/users`);
                const qPartner = window.query(usersRef, window.where("username", "==", partnerUsername));
                const partnerSnapshot = await window.getDocs(qPartner);

                if (partnerSnapshot.empty) {
                    window.showNotification(`User "${partnerUsername}" not found. Please check the username.`, "error");
                    window.showLoading(false);
                    return;
                }

                let partnerUid = null;
                partnerSnapshot.forEach(doc => { // Should be only one if usernames are unique
                    partnerUid = doc.id;
                });

                if (!partnerUid) { // Should not happen if snapshot is not empty
                    window.showNotification("Could not find partner's profile.", "error");
                    window.showLoading(false);
                    return;
                }
                
                if (partnerUid === window.currentUserId) {
                    window.showNotification("You cannot send a sync request to yourself.", "info");
                    window.showLoading(false);
                    return;
                }


                // 2. Create a sync request document in a 'syncRequests' collection (publicly writable or via Cloud Function)
                // Path: artifacts/{appId}/public/data/syncRequests/{requestId}
                // Structure: { requesterId: currentUserId, requesterName: myName, recipientId: partnerUid, recipientName: partnerUsername, status: 'pending', createdAt: serverTimestamp() }
                const myProfileRef = window.getProfileRef();
                const myProfileSnap = await window.getDoc(myProfileRef);
                const myName = myProfileSnap.exists() ? (myProfileSnap.data().coreProfile?.name || myProfileSnap.data().username || "A User") : "A User";

                const syncRequestsCol = window.collection(window.db, `artifacts/${window.appIdFromGlobal}/public/data/syncRequests`);
                
                // Check if a pending request already exists between these users
                const qExistingOutgoing = window.query(syncRequestsCol, 
                    window.where("requesterId", "==", window.currentUserId), 
                    window.where("recipientId", "==", partnerUid),
                    window.where("status", "==", "pending")
                );
                const existingOutgoingSnap = await window.getDocs(qExistingOutgoing);
                if (!existingOutgoingSnap.empty) {
                     window.showNotification("You already have a pending request to this user.", "info");
                     window.showLoading(false);
                     return;
                }
                // Check if there's an incoming pending request from this partner
                 const qExistingIncoming = window.query(syncRequestsCol, 
                    window.where("requesterId", "==", partnerUid), 
                    window.where("recipientId", "==", window.currentUserId),
                    window.where("status", "==", "pending")
                );
                const existingIncomingSnap = await window.getDocs(qExistingIncoming);
                 if (!existingIncomingSnap.empty) {
                     window.showNotification("This user has already sent you a sync request. Check your pending requests to accept.", "info");
                     window.showLoading(false);
                     return;
                }


                await window.addDoc(syncRequestsCol, {
                    requesterId: window.currentUserId,
                    requesterName: myName, // Get current user's display name
                    recipientId: partnerUid,
                    recipientName: partnerUsername, // This is the username they entered
                    status: "pending", // pending, accepted, declined, unlinked
                    createdAt: window.serverTimestamp()
                });

                window.showNotification(`Sync request sent to ${partnerUsername}!`, "success");
                partnerUsernameSyncEl.value = '';
                loadSyncData(); // Refresh lists
            } catch (error) {
                console.error("Error sending sync request:", error);
                window.showNotification(`Error sending request: ${error.message}`, "error");
            } finally {
                window.showLoading(false);
            }
        });
    }

    async function loadSyncData() {
        if (!window.currentUserId) {
            if(pendingRequestsListEl) pendingRequestsListEl.innerHTML = `<p>${window.i18next.t('sync.noPending', "Log in to see requests.")}</p>`;
            if(syncedPartnersListEl) syncedPartnersListEl.innerHTML = `<p>${window.i18next.t('sync.noSynced', "Log in to see synced partners.")}</p>`;
            return;
        }
        window.showLoading(true);

        const syncRequestsCol = window.collection(window.db, `artifacts/${window.appIdFromGlobal}/public/data/syncRequests`);
        
        // --- Load Pending Requests (Incoming to me) ---
        if (pendingRequestsListEl) {
            pendingRequestsListEl.innerHTML = ''; // Clear old
            const qPending = window.query(syncRequestsCol, 
                window.where("recipientId", "==", window.currentUserId), 
                window.where("status", "==", "pending")
            );
            try {
                const pendingSnap = await window.getDocs(qPending);
                if (pendingSnap.empty) {
                    pendingRequestsListEl.innerHTML = `<p>${window.i18next.t('sync.noPending')}</p>`;
                } else {
                    pendingSnap.forEach(docSnap => {
                        const req = docSnap.data();
                        const reqDiv = document.createElement('div');
                        reqDiv.className = 'sync-item p-3 mb-2 border border-[var(--border-color-lavender)] rounded-lg flex justify-between items-center';
                        reqDiv.innerHTML = `
                            <span>Request from: <strong>${window.sanitizeInput(req.requesterName || req.requesterId)}</strong></span>
                            <div>
                                <button class="btn btn-primary btn-sm mr-2 accept-sync-btn" data-request-id="${docSnap.id}" data-requester-id="${req.requesterId}" data-requester-name="${window.sanitizeInput(req.requesterName || req.requesterId)}">Accept</button>
                                <button class="btn btn-secondary btn-sm decline-sync-btn" data-request-id="${docSnap.id}">Decline</button>
                            </div>
                        `;
                        pendingRequestsListEl.appendChild(reqDiv);
                    });
                    addRequestActionListeners();
                }
            } catch (error) {
                console.error("Error loading pending requests:", error);
                pendingRequestsListEl.innerHTML = `<p>Error loading requests.</p>`;
            }
        }

        // --- Load Synced Partners ---
        // Synced partners are stored in the user's own profile document
        if (syncedPartnersListEl) {
            syncedPartnersListEl.innerHTML = ''; // Clear old
            const myProfileRef = window.getProfileRef();
            try {
                const myProfileSnap = await window.getDoc(myProfileRef);
                if (myProfileSnap.exists()) {
                    const myData = myProfileSnap.data();
                    const partners = myData.syncedPartners || []; // Array of { partnerId: "...", partnerName: "...", syncedAt: Timestamp }
                    if (partners.length === 0) {
                        syncedPartnersListEl.innerHTML = `<p>${window.i18next.t('sync.noSynced')}</p>`;
                    } else {
                        partners.forEach(partner => {
                            const partnerDiv = document.createElement('div');
                            partnerDiv.className = 'sync-item p-3 mb-2 border border-[var(--border-color-lavender)] rounded-lg flex justify-between items-center';
                            partnerDiv.innerHTML = `
                                <span>Synced with: <strong>${window.sanitizeInput(partner.partnerName || partner.partnerId)}</strong></span>
                                <button class="btn btn-danger btn-sm unlink-partner-btn" data-partner-id="${partner.partnerId}">Unlink</button>
                            `;
                            syncedPartnersListEl.appendChild(partnerDiv);
                        });
                        addUnlinkListeners();
                    }
                } else {
                     syncedPartnersListEl.innerHTML = `<p>${window.i18next.t('sync.noSynced')}</p>`;
                }
            } catch (error) {
                console.error("Error loading synced partners:", error);
                syncedPartnersListEl.innerHTML = `<p>Error loading synced partners.</p>`;
            }
        }
        window.showLoading(false);
    }

    function addRequestActionListeners() {
        document.querySelectorAll('.accept-sync-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const requestId = e.currentTarget.dataset.requestId;
                const requesterId = e.currentTarget.dataset.requesterId;
                const requesterName = e.currentTarget.dataset.requesterName;
                await handleSyncRequest(requestId, requesterId, requesterName, true);
            });
        });
        document.querySelectorAll('.decline-sync-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const requestId = e.currentTarget.dataset.requestId;
                await handleSyncRequest(requestId, null, null, false);
            });
        });
    }
    
    async function handleSyncRequest(requestId, requesterId, requesterName, accept) {
        window.showLoading(true);
        const requestRef = window.doc(window.db, `artifacts/${window.appIdFromGlobal}/public/data/syncRequests`, requestId);
        try {
            if (accept) {
                // 1. Update request status to 'accepted'
                await window.updateDoc(requestRef, { status: "accepted", acceptedAt: window.serverTimestamp() });

                // 2. Add partner to current user's profile
                const myProfileRef = window.getProfileRef();
                const myProfileSnap = await window.getDoc(myProfileRef);
                const myName = myProfileSnap.exists() ? (myProfileSnap.data().coreProfile?.name || myProfileSnap.data().username || "A User") : "A User";

                await window.updateDoc(myProfileRef, {
                    syncedPartners: window.arrayUnion({
                        partnerId: requesterId,
                        partnerName: requesterName,
                        syncedAt: window.serverTimestamp()
                    })
                });

                // 3. Add current user to requester's profile
                const requesterProfileRef = window.doc(window.db, `artifacts/${window.appIdFromGlobal}/users`, requesterId);
                await window.updateDoc(requesterProfileRef, {
                    syncedPartners: window.arrayUnion({
                        partnerId: window.currentUserId,
                        partnerName: myName, 
                        syncedAt: window.serverTimestamp()
                    })
                });
                window.showNotification(`Sync request accepted with ${requesterName}!`, "success");
            } else {
                // Update request status to 'declined'
                await window.updateDoc(requestRef, { status: "declined" });
                window.showNotification("Sync request declined.", "info");
            }
            loadSyncData(); // Refresh lists
        } catch (error) {
            console.error("Error handling sync request:", error);
            window.showNotification(`Error: ${error.message}`, "error");
        } finally {
            window.showLoading(false);
        }
    }

    function addUnlinkListeners() {
        document.querySelectorAll('.unlink-partner-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const partnerIdToUnlink = e.currentTarget.dataset.partnerId;
                 if (confirm(`Are you sure you want to unlink with this partner?`)) {
                    await unlinkPartner(partnerIdToUnlink);
                }
            });
        });
    }

    async function unlinkPartner(partnerId) {
        if (!window.currentUserId) return;
        window.showLoading(true);
        const myProfileRef = window.getProfileRef();
        const partnerProfileRef = window.doc(window.db, `artifacts/${window.appIdFromGlobal}/users`, partnerId);

        try {
            // 1. Remove partner from my syncedPartners array
            const myProfileSnap = await window.getDoc(myProfileRef);
            if (myProfileSnap.exists()) {
                const myData = myProfileSnap.data();
                const updatedMyPartners = (myData.syncedPartners || []).filter(p => p.partnerId !== partnerId);
                await window.updateDoc(myProfileRef, { syncedPartners: updatedMyPartners });
            }

            // 2. Remove me from partner's syncedPartners array
            const partnerProfileSnap = await window.getDoc(partnerProfileRef);
             if (partnerProfileSnap.exists()) {
                const partnerData = partnerProfileSnap.data();
                const updatedPartnerPartners = (partnerData.syncedPartners || []).filter(p => p.partnerId !== window.currentUserId);
                await window.updateDoc(partnerProfileRef, { syncedPartners: updatedPartnerPartners });
            }
            
            // 3. Optionally, update any related syncRequest documents to 'unlinked'
            const syncRequestsCol = window.collection(window.db, `artifacts/${window.appIdFromGlobal}/public/data/syncRequests`);
            const q1 = window.query(syncRequestsCol, 
                window.where("requesterId", "==", window.currentUserId), 
                window.where("recipientId", "==", partnerId),
                window.where("status", "==", "accepted")
            );
            const q2 = window.query(syncRequestsCol, 
                window.where("requesterId", "==", partnerId), 
                window.where("recipientId", "==", window.currentUserId),
                window.where("status", "==", "accepted")
            );
            const [snap1, snap2] = await Promise.all([window.getDocs(q1), window.getDocs(q2)]);
            const updates = [];
            snap1.forEach(doc => updates.push(window.updateDoc(doc.ref, {status: "unlinked"})));
            snap2.forEach(doc => updates.push(window.updateDoc(doc.ref, {status: "unlinked"})));
            await Promise.all(updates);


            window.showNotification("Successfully unlinked with partner.", "success");
            loadSyncData(); // Refresh lists
        } catch (error) {
            console.error("Error unlinking partner:", error);
            window.showNotification(`Error unlinking: ${error.message}`, "error");
        } finally {
            window.showLoading(false);
        }
    }

    // Initial load of sync data
    loadSyncData();
}
