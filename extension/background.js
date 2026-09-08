// ============================================
// SERENITY - TIME TRACKER
// ============================================

console.log("SERENITY background service worker started.");


// --------------------------------------------
// Get the currently active tab
// --------------------------------------------

async function getActiveTab() {
    const tabs = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    });

    if (tabs.length === 0) {
        return null;
    }

    return tabs[0];
}


// --------------------------------------------
// Check whether a URL can be tracked
// --------------------------------------------

function isTrackableUrl(url) {
    if (!url) {
        return false;
    }

    return url.startsWith("http://") || url.startsWith("https://");
}


// --------------------------------------------
// Start tracking a website
// --------------------------------------------

async function startTracking(tab) {

    if (!tab || !tab.id || !isTrackableUrl(tab.url)) {
        return;
    }

    const domain = new URL(tab.url).hostname;

    const trackingData = {
        tabId: tab.id,
        url: tab.url,
        domain: domain,
        startTime: Date.now()
    };

    await chrome.storage.local.set({
        serenityActive: trackingData
    });

    console.log("SERENITY: Started tracking");
    console.log("Website:", domain);
}


// --------------------------------------------
// Stop tracking the current website
// --------------------------------------------

async function stopTracking() {

    const result = await chrome.storage.local.get([
        "serenityActive",
        "serenityTime"
    ]);

    const active = result.serenityActive;

    if (!active || !active.startTime || !active.domain) {
        return;
    }

    const elapsedSeconds = Math.floor(
        (Date.now() - active.startTime) / 1000
    );

    if (elapsedSeconds <= 0) {
        await chrome.storage.local.remove("serenityActive");
        return;
    }

    const serenityTime = result.serenityTime || {
        totalSeconds: 0,
        sites: {}
    };

    // Add to total time
    serenityTime.totalSeconds += elapsedSeconds;

    // Add to website-specific time
    if (!serenityTime.sites[active.domain]) {
        serenityTime.sites[active.domain] = 0;
    }

    serenityTime.sites[active.domain] += elapsedSeconds;

    await chrome.storage.local.set({
        serenityTime: serenityTime
    });

    await chrome.storage.local.remove("serenityActive");

    console.log(
        `SERENITY: ${elapsedSeconds} seconds spent on ${active.domain}`
    );
}


// --------------------------------------------
// Initialize tracking when service worker starts
// --------------------------------------------

async function initializeTracking() {

    const result = await chrome.storage.local.get("serenityActive");

    // If we're already tracking something, don't restart it
    if (result.serenityActive) {
        console.log(
            "SERENITY: Existing tracking session found."
        );
        return;
    }

    const tab = await getActiveTab();

    if (tab) {
        await startTracking(tab);
    }
}

initializeTracking();


// --------------------------------------------
// User switches to another tab
// --------------------------------------------

chrome.tabs.onActivated.addListener(async (activeInfo) => {

    console.log("SERENITY: Tab changed.");

    await stopTracking();

    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);

        await startTracking(tab);

    } catch (error) {

        console.error(
            "SERENITY: Could not get active tab.",
            error
        );
    }
});

// --------------------------------------------
// User navigates to another webpage
// --------------------------------------------

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    if (changeInfo.status !== "complete") {
        return;
    }

    if (!isTrackableUrl(tab.url)) {
        return;
    }

    const result = await chrome.storage.local.get(
        "serenityActive"
    );

    const active = result.serenityActive;


    // ----------------------------------------
    // No active tracking session
    // Start tracking this webpage
    // ----------------------------------------

    if (!active) {

        console.log(
            "SERENITY: No active session. Starting tracking."
        );

        await startTracking(tab);

        return;
    }


    // ----------------------------------------
    // Different tab
    // Don't interfere with it
    // ----------------------------------------

    if (active.tabId !== tabId) {
        return;
    }


    // ----------------------------------------
    // Same tab navigated to a new page
    // ----------------------------------------

    console.log(
        "SERENITY: Page changed."
    );

    await stopTracking();

    await startTracking(tab);
});


// --------------------------------------------
// --------------------------------------------
// Chrome window loses or regains focus
// --------------------------------------------

chrome.windows.onFocusChanged.addListener(async (windowId) => {

    // ----------------------------------------
    // Chrome lost focus
    // ----------------------------------------

    if (windowId === chrome.windows.WINDOW_ID_NONE) {

        console.log("SERENITY: Chrome lost focus.");

        await stopTracking();

        return;
    }


    // ----------------------------------------
    // Chrome regained focus
    // ----------------------------------------

    console.log("SERENITY: Chrome regained focus.");

    try {

        const tabs = await chrome.tabs.query({
            active: true,
            windowId: windowId
        });

        if (tabs.length === 0) {
            console.log(
                "SERENITY: No active tab found."
            );
            return;
        }

        const activeTab = tabs[0];

        // Make sure this is a normal webpage
        if (!isTrackableUrl(activeTab.url)) {
            console.log(
                "SERENITY: Active tab is not trackable."
            );
            return;
        }

        // Start a fresh tracking session
        await startTracking(activeTab);

        console.log(
            "SERENITY: Resumed tracking:",
            activeTab.url
        );

    } catch (error) {

        console.error(
            "SERENITY: Error resuming tracking:",
            error
        );
    }
});