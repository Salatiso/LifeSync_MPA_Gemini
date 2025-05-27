// js/resources.js - Logic for the Resources Page

document.addEventListener('DOMContentLoaded', () => {
    const ensureGlobalsInterval = setInterval(() => {
        if (window.firebaseInitialized && window.i18next && window.i18next.isInitialized && typeof window.showNotification === 'function') {
            clearInterval(ensureGlobalsInterval);
            initializeResourcesPage();
        }
    }, 100);
});

function initializeResourcesPage() {
    console.log("Initializing Resources Page specific JavaScript");

    const resourceCategoriesGridEl = document.getElementById('resourceCategoriesGrid');
    const resourceDetailViewEl = document.getElementById('resourceDetailView');
    const backToCategoriesBtnEl = document.getElementById('backToCategoriesBtn');
    const resourceDetailTitleEl = document.getElementById('resourceDetailTitle');
    const resourceItemListEl = document.getElementById('resourceItemList');
    const resourceSearchInputEl = document.getElementById('resourceSearchInput');
    const resourceSearchBtnEl = document.getElementById('resourceSearchBtn');
    const suggestedResourcesContainerEl = document.getElementById('suggestedResourcesContainer');

    // --- Sample Resource Data (Should ideally come from Firestore or a config file) ---
    // Using i18next keys for titles and descriptions
    const allResources = {
        dating: {
            titleKey: "resources.category.dating",
            icon: "fas fa-heart",
            items: [
                { name: "Tinder", descriptionKey: "resources.datingDesc.tinder", url: "https://tinder.com", tags: ["dating", "app", "social"] },
                { name: "Bumble", descriptionKey: "resources.datingDesc.bumble", url: "https://bumble.com", tags: ["dating", "app", "social", "women first"] }
            ]
        },
        counseling: {
            titleKey: "resources.category.counseling",
            icon: "fas fa-users",
            items: [
                { name: "FAMSA", descriptionKey: "resources.counselingDesc.famsa", url: "https://famsa.org.za", tags: ["counseling", "therapy", "family", "marriage", "south africa"] },
                // Add more local or general counseling resources
            ]
        },
        communication_guides: {
            titleKey: "resources.category.communication_guides",
            icon: "fas fa-comments",
            items: [
                { name: "Gottman Institute Blog", description: "Articles on communication and relationship health.", url: "https://www.gottman.com/blog/", tags: ["communication", "articles", "research"] },
                { name: "Nonviolent Communication Basics", description: "Introduction to NVC principles.", url: "https://www.cnvc.org/learn-nvc/what-is-nvc", tags: ["communication", "nvc", "conflict"] }
            ]
        },
        conflict_resolution_aids: {
            titleKey: "resources.category.conflict_resolution_aids",
            icon: "fas fa-hands-helping",
            items: [
                { name: "Conflict Resolution Network", description: "Resources and training for conflict resolution.", url: "http://www.crnhq.org/", tags: ["conflict", "resolution", "skills"] }
            ]
        },
        relationship_closure_tools: {
            titleKey: "resources.category.relationship_closure_tools",
            icon: "fas fa-user-minus",
            items: [
                 { name: "Breakup Support Guide", description: "Tips for navigating a breakup.", url: "https://www.helpguide.org/articles/grief/coping-with-a-breakup-or-divorce.htm", tags: ["breakup", "closure", "support"] }
            ]
        },
        emergency: {
            titleKey: "resources.category.emergency",
            icon: "fas fa-phone-volume",
            items: [
                { name: "LifeLine South Africa", descriptionKey: "resources.emergencyDesc.lifeLineSAEmergency", url: "tel:0861322322", tags: ["emergency", "crisis", "support", "south africa", "helpline"] },
                // Add SAPS, GBV helplines etc.
            ]
        }
    };

    function renderResourceCategories() {
        if (!resourceCategoriesGridEl) return;
        resourceCategoriesGridEl.innerHTML = ''; // Clear existing
        for (const categoryKey in allResources) {
            const category = allResources[categoryKey];
            const card = document.createElement('div');
            card.className = 'resource-category-card';
            card.dataset.categoryKey = categoryKey;
            card.innerHTML = `
                <i class="${category.icon || 'fas fa-book'} fa-2x"></i>
                <h4 data-i18n="${category.titleKey}">${window.i18next.t(category.titleKey)}</h4>
            `;
            card.addEventListener('click', () => showResourceItems(categoryKey));
            resourceCategoriesGridEl.appendChild(card);
        }
    }

    function showResourceItems(categoryKey, itemsToShow = null) {
        const category = allResources[categoryKey];
        let currentItems = itemsToShow || (category ? category.items : []);

        if (!resourceDetailViewEl || !resourceDetailTitleEl || !resourceItemListEl || !resourceCategoriesGridEl) return;

        resourceCategoriesGridEl.style.display = 'none'; // Hide category grid
        if (document.getElementById('resourceWizardArea')) { // Hide wizard if showing details
             document.getElementById('resourceWizardArea').style.display = 'none';
        }


        resourceDetailTitleEl.textContent = itemsToShow ? window.i18next.t('resources.wizard.searchResults') : window.i18next.t(category.titleKey);
        resourceItemListEl.innerHTML = '';

        if (currentItems.length === 0) {
            resourceItemListEl.innerHTML = `<p class="text-center col-span-full" data-i18n="resources.noItemsInCategory">${window.i18next.t('resources.noItemsInCategory')}</p>`;
        } else {
            currentItems.forEach(item => {
                const itemCard = document.createElement('div');
                itemCard.className = 'value-prop-card'; // Re-using style
                const description = item.descriptionKey ? window.i18next.t(item.descriptionKey) : item.description;
                itemCard.innerHTML = `
                    <h5 class="font-semibold">${item.name}</h5>
                    <p class="text-sm">${description || 'No description available.'}</p>
                    ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" data-i18n="resources.visitSite">${window.i18next.t('resources.visitSite')}</a>` : ''}
                `;
                resourceItemListEl.appendChild(itemCard);
            });
        }
        resourceDetailViewEl.style.display = 'block';
    }

    function hideResourceItems() {
        if (!resourceDetailViewEl || !resourceCategoriesGridEl) return;
        resourceDetailViewEl.style.display = 'none';
        resourceCategoriesGridEl.style.display = 'grid'; // Show category grid again
         if (document.getElementById('resourceWizardArea')) {
             document.getElementById('resourceWizardArea').style.display = 'block';
        }
    }
    
    if (backToCategoriesBtnEl) {
        backToCategoriesBtnEl.addEventListener('click', hideResourceItems);
    }

    function handleResourceSearch() {
        if (!resourceSearchInputEl) return;
        const searchTerm = resourceSearchInputEl.value.toLowerCase().trim();
        if (!searchTerm) {
            window.showNotification("Please enter a search term.", "info");
            return;
        }

        const matchedItems = [];
        for (const categoryKey in allResources) {
            allResources[categoryKey].items.forEach(item => {
                const nameMatch = item.name.toLowerCase().includes(searchTerm);
                const descKey = item.descriptionKey;
                const descText = descKey ? window.i18next.t(descKey, {lng: 'en'}).toLowerCase() : (item.description || "").toLowerCase(); // Search in English for broader match
                const descMatch = descText.includes(searchTerm);
                const tagsMatch = item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm));

                if (nameMatch || descMatch || tagsMatch) {
                    // Avoid duplicates if an item matches multiple criteria and is already added
                    if (!matchedItems.some(mi => mi.name === item.name && mi.url === item.url)) {
                         matchedItems.push({...item, categoryTitleKey: allResources[categoryKey].titleKey }); // Add category info for context
                    }
                }
            });
        }
        showResourceItems('search_results', matchedItems); // Pass a special key for search results
        if (resourceDetailTitleEl) resourceDetailTitleEl.textContent = `Search Results for "${searchTerm}"`;
    }

    if (resourceSearchBtnEl) {
        resourceSearchBtnEl.addEventListener('click', handleResourceSearch);
    }
    if (resourceSearchInputEl) {
        resourceSearchInputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleResourceSearch();
            }
        });
    }
    
    // Check for category query parameter from tools.js
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromQuery = urlParams.get('category');
    if (categoryFromQuery && allResources[categoryFromQuery]) {
        showResourceItems(categoryFromQuery);
    } else {
        renderResourceCategories(); // Initial render of categories
    }
    
    // Placeholder for suggested resources
    if (suggestedResourcesContainerEl) {
        suggestedResourcesContainerEl.innerHTML = `<p class="text-sm italic">Personalized suggestions coming soon based on your profile!</p>`;
    }
}
