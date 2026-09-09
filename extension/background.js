// ============================================
// SERENITY - TIME TRACKER + PAGE DATA
// ============================================

console.log(
    "SERENITY background service worker started."
);


// ============================================
// FASTAPI CONFIGURATION
// ============================================

const API_URL =
    "http://localhost:8000/page-data";


// ============================================
// Reset tracking data when a new day starts
// ============================================

async function ensureToday() {

    const today = new Date().toISOString().slice(0, 10);

    const result =
        await chrome.storage.local.get("serenityTime");

    const data = result.serenityTime;

    // No previous tracking data
    if (!data) {
        return;
    }

    // First time using the new date
    if (data.date !== today) {

        console.log(
            "SERENITY: New day detected. Resetting today's activity."
        );

        await chrome.storage.local.set({
            serenityTime: {
                date: today,
                totalSeconds: 0,
                sites: {}
            }
        });
    }
}
// ============================================
// Get the currently active tab
// ============================================

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


// ============================================
// Check whether URL can be tracked
// ============================================

function isTrackableUrl(url) {

    if (!url) {

        return false;

    }


    return (
        url.startsWith("http://") ||
        url.startsWith("https://")
    );

}


// ============================================
// Start tracking a website
// ============================================

async function startTracking(tab) {
    await ensureToday();

    if (
        !tab ||
        !tab.id ||
        !isTrackableUrl(tab.url)
    ) {

        return;

    }


    const domain =
        new URL(tab.url).hostname;

    const pendingResult =
       await chrome.storage.local.get(
        "serenityPendingPageData"
       );

    const pending =
       pendingResult.serenityPendingPageData || {};

    const pageData =
        pending[tab.id] || null;

    delete pending[tab.id];

    await chrome.storage.local.set({
       serenityPendingPageData: pending
});


    const trackingData = {

        tabId: tab.id,

        url: tab.url,

        domain: domain,

        startTime: Date.now(),

        pageData: pageData

    };


    await chrome.storage.local.set({

        serenityActive: trackingData

    });


    console.log(
        "SERENITY: Started tracking"
    );

    console.log(
        "Website:",
        domain
    );
    // Tell us whether page data was successfully attached
    if (pageData) {
        console.log(
            "SERENITY: Page data attached to tracking session."
        );
    }
}


// ============================================
// Send page data + time to FastAPI
// ============================================

async function sendToFastAPI(
    pageData,
    elapsedSeconds
) {

    if (!pageData) {

        console.log(
            "SERENITY: No page data available."
        );

        return;

    }


    const payload = {

        url: pageData.url,

        title: pageData.title,

        text: pageData.text,

        time_spent_seconds:
            elapsedSeconds

    };


    console.log(
        "SERENITY: Sending data to FastAPI..."
    );

    console.log(payload);


    try {

        const response = await fetch(
            API_URL,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify(payload)

            }
        );


        if (!response.ok) {

            throw new Error(
                `FastAPI returned ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "SERENITY: FastAPI response:"
        );

        console.log(result);


    } catch (error) {

        console.error(
            "SERENITY: Could not send data to FastAPI.",
            error
        );

    }

}


// ============================================
// Stop tracking current website
// ============================================

async function stopTracking() {

    await ensureToday();

    const result =
        await chrome.storage.local.get([

            "serenityActive",

            "serenityTime"

        ]);


    const active =
        result.serenityActive;


    if (
        !active ||
        !active.startTime ||
        !active.domain
    ) {

        return;

    }


    const elapsedSeconds = Math.floor(

        (
            Date.now() -
            active.startTime

        ) / 1000

    );


    if (elapsedSeconds <= 0) {

        await chrome.storage.local.remove(
            "serenityActive"
        );

        return;

    }


    // ----------------------------------------
    // Existing time tracking
    // ----------------------------------------

    const serenityTime =
        result.serenityTime || {

            date: new Date().toISOString().slice(0, 10),

            totalSeconds: 0,

            sites: {}

    };

    serenityTime.totalSeconds +=
        elapsedSeconds;


    if (!serenityTime.sites[active.domain]) {

        serenityTime.sites[active.domain] = 0;

    }


    serenityTime.sites[active.domain] +=
        elapsedSeconds;


    await chrome.storage.local.set({

        serenityTime: serenityTime

    });


    // ----------------------------------------
    // Send page information to FastAPI
    // ----------------------------------------

    await sendToFastAPI(

        active.pageData,

        elapsedSeconds

    );


    // ----------------------------------------
    // Remove active session
    // ----------------------------------------

    await chrome.storage.local.remove(
        "serenityActive"
    );


    console.log(

        `SERENITY: ${elapsedSeconds} seconds spent on ${active.domain}`

    );

}


// ============================================
// Receive messages from content.js
// ============================================
chrome.runtime.onMessage.addListener(
    async (message, sender) => {

        if (message.type !== "PAGE_DATA") {
            return;
        }

        if (!sender.tab || sender.tab.id === undefined) {
            return;
        }

        const tabId = sender.tab.id;

        const result = await chrome.storage.local.get([
            "serenityActive",
            "serenityPendingPageData"
        ]);

        const active = result.serenityActive;

        // If this tab is currently being tracked,
        // attach the page data directly.
        if (active && active.tabId === tabId) {

            active.pageData = message.data;

            await chrome.storage.local.set({
                serenityActive: active
            });

            console.log(
                "SERENITY: Page data stored."
            );

            return;
        }

        // If tracking has not started yet,
        // temporarily save the page data.
        const pending =
            result.serenityPendingPageData || {};

        pending[tabId] = message.data;

        await chrome.storage.local.set({
            serenityPendingPageData: pending
        });

        console.log(
            "SERENITY: Page data temporarily stored for tab:",
            tabId
        );
    }
);

// ============================================
// Initialize tracking
// ============================================

async function initializeTracking() {

    const result =
        await chrome.storage.local.get(
            "serenityActive"
        );


    if (result.serenityActive) {

        console.log(
            "SERENITY: Existing tracking session found."
        );

        return;

    }


    const tab =
        await getActiveTab();


    if (tab) {

        await startTracking(tab);

    }

}


initializeTracking();


// ============================================
// User switches tabs
// ============================================

chrome.tabs.onActivated.addListener(
    async (activeInfo) => {

        console.log(
            "SERENITY: Tab changed."
        );


        await stopTracking();


        try {

            const tab =
                await chrome.tabs.get(
                    activeInfo.tabId
                );


            await startTracking(tab);


        } catch (error) {

            console.error(

                "SERENITY: Could not get active tab.",

                error

            );

        }

    }
);
chrome.tabs.onRemoved.addListener(
    async (tabId) => {

        const result =
            await chrome.storage.local.get(
                "serenityActive"
            );

        const active =
            result.serenityActive;

        if (!active) {
            return;
        }

        if (active.tabId !== tabId) {
            return;
        }

        console.log(
            "SERENITY: Tracked tab closed."
        );

        await stopTracking();
    }
);


// ============================================
// User navigates to another webpage
// ============================================

chrome.tabs.onUpdated.addListener(

    async (tabId, changeInfo, tab) => {

        if (
            changeInfo.status !== "complete"
        ) {

            return;

        }


        if (
            !isTrackableUrl(tab.url)
        ) {

            return;

        }


        const result =
            await chrome.storage.local.get(
                "serenityActive"
            );


        const active =
            result.serenityActive;


        // ------------------------------------
        // No active tracking session
        // ------------------------------------

        if (!active) {

            console.log(
                "SERENITY: No active session. Starting tracking."
            );


            await startTracking(tab);

            return;

        }


        // ------------------------------------
        // Different tab
        // ------------------------------------

        if (
            active.tabId !== tabId
        ) {

            return;

        }


        // ------------------------------------
        // Same tab navigated to a new page
        // ------------------------------------

        console.log(
            "SERENITY: Page changed."
        );


        await stopTracking();


        await startTracking(tab);

    }

);


// ============================================
// Chrome loses or regains focus
// ============================================

chrome.windows.onFocusChanged.addListener(

    async (windowId) => {


        // ------------------------------------
        // Chrome lost focus
        // ------------------------------------

        if (
            windowId ===
            chrome.windows.WINDOW_ID_NONE
        ) {

            console.log(
                "SERENITY: Chrome lost focus."
            );


            await stopTracking();


            return;

        }


        // ------------------------------------
        // Chrome regained focus
        // ------------------------------------

        console.log(
            "SERENITY: Chrome regained focus."
        );


        try {

            const tabs =
                await chrome.tabs.query({

                    active: true,

                    windowId: windowId

                });


            if (tabs.length === 0) {

                console.log(
                    "SERENITY: No active tab found."
                );

                return;

            }


            const activeTab =
                tabs[0];


            if (
                !isTrackableUrl(
                    activeTab.url
                )
            ) {

                console.log(
                    "SERENITY: Active tab is not trackable."
                );

                return;

            }


            await startTracking(
                activeTab
            );


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

    }

);