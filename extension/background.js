const API_URL = "http://localhost:8000/page-data";

const ANALYSIS_ALARM = "serenity-analysis";
const HEARTBEAT_ALARM = "serenity-heartbeat";

const ANALYSIS_PERIOD_MINUTES = 0.5;
const HEARTBEAT_PERIOD_MINUTES = 0.5;

const INTERVENTION_COOLDOWN_MS = 10 * 60 * 1000;
const SERENITY_OPEN_DELAY_MS = 10000;


// ============================================================
// BASIC HELPERS
// ============================================================

function getTodayKey() {

    const now = new Date();

    return (
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0")
    );
}


function isTrackableUrl(url) {

    return (
        typeof url === "string" &&
        (
            url.startsWith("http://") ||
            url.startsWith("https://")
        )
    );
}


async function getActiveTab() {

    try {

        const tabs =
            await chrome.tabs.query({
                active: true,
                lastFocusedWindow: true
            });

        return tabs[0] || null;

    } catch (error) {

        console.error(
            "SERENITY: Could not get active tab:",
            error
        );

        return null;
    }
}


// ============================================================
// DAILY RESET
// ============================================================

async function ensureToday() {

    const today =
        getTodayKey();

    const data =
        await chrome.storage.local.get([
            "serenityDate",
            "serenityTime",
            "serenityDomains"
        ]);


    if (data.serenityDate !== today) {

        await chrome.storage.local.set({

            serenityDate:
                today,

            serenityTime:
                0,

            serenityDomains:
                {},

            serenityCurrentElapsed:
                0
        });


        console.log(
            "SERENITY: New day detected. Tracking reset."
        );
    }
}


// ============================================================
// START TRACKING
// ============================================================

async function startTracking(tab) {

    if (
        !tab ||
        !isTrackableUrl(tab.url)
    ) {

        return;
    }


    let domain =
        "unknown";


    try {

        domain =
            new URL(tab.url).hostname;

    } catch (error) {

        console.error(
            "SERENITY: Could not read domain:",
            error
        );
    }


    const current =
        await chrome.storage.local.get(
            "serenityActive"
        );


    // Already tracking this exact tab.
    if (
        current.serenityActive &&
        current.serenityActive.tabId === tab.id
    ) {

        return;
    }


    const session = {

        tabId:
            tab.id,

        url:
            tab.url || "",

        domain:
            domain,

        startTime:
            Date.now(),

        pageData: {

            url:
                tab.url || "",

            title:
                tab.title || "",

            text:
                ""
        }
    };


    await chrome.storage.local.set({

        serenityActive:
            session
    });


    console.log(
        "SERENITY: Started tracking:",
        domain
    );
}


// ============================================================
// STOP TRACKING
// ============================================================

async function stopTracking(
    sendToAI = true
) {

    const data =
        await chrome.storage.local.get(
            "serenityActive"
        );


    const active =
        data.serenityActive;


    if (!active) {

        return;
    }


    const elapsedSeconds =
        Math.max(
            0,
            Math.floor(
                (Date.now() -
                    active.startTime) /
                1000
            )
        );


    if (elapsedSeconds > 0) {

        const totals =
            await chrome.storage.local.get([
                "serenityTime",
                "serenityDomains"
            ]);


        const today =
            getTodayKey();


        let totalTime =
            Number(
                totals.serenityTime || 0
            );


        let domains =
            totals.serenityDomains || {};


        // ----------------------------------------
        // Update total time
        // ----------------------------------------

        totalTime +=
            elapsedSeconds;


        // ----------------------------------------
        // Update domain time
        // ----------------------------------------

        domains[active.domain] =
            Number(
                domains[active.domain] || 0
            ) +
            elapsedSeconds;


        // ----------------------------------------
        // Save tracking data
        // ----------------------------------------

        await chrome.storage.local.set({

            serenityDate:
                today,

            serenityTime:
                totalTime,

            serenityDomains:
                domains,

            serenityCurrentElapsed:
                0
        });


        console.log(
            "SERENITY: Tracking updated."
        );


        console.log(
            "SERENITY: Total browsing time:",
            totalTime,
            "seconds"
        );


        console.log(
            "SERENITY: Domain:",
            active.domain,
            elapsedSeconds,
            "seconds"
        );
    }


    console.log(
        "SERENITY: Stopped tracking:",
        active.domain,
        elapsedSeconds,
        "seconds"
    );


    // ----------------------------------------
    // Send page data to FastAPI
    // ----------------------------------------

    if (
        sendToAI &&
        active.pageData
    ) {

        await sendToFastAPI(
            active.pageData,
            elapsedSeconds
        );
    }


    // ----------------------------------------
    // Remove active session
    // ----------------------------------------

    await chrome.storage.local.remove(
        "serenityActive"
    );
}


// ============================================================
// FASTAPI
// ============================================================

async function sendToFastAPI(
    pageData,
    elapsedSeconds
) {

    if (
        !pageData ||
        !pageData.url
    ) {

        console.log(
            "SERENITY: No valid page data to send."
        );

        return null;
    }


    const payload = {

        url:
            pageData.url,

        title:
            pageData.title || "",

        text:
            pageData.text || "",

        time_spent_seconds:
            Math.max(
                0,
                Math.floor(
                    elapsedSeconds || 0
                )
            )
    };


    console.log(
        "SERENITY: Sending page data to FastAPI..."
    );


    console.log(
        "SERENITY: Text length being sent:",
        payload.text.length
    );


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        if (!response.ok) {

            throw new Error(
                "FastAPI returned status " +
                response.status
            );
        }


        const result =
            await response.json();


        console.log(
            "SERENITY: AIML response:",
            result
        );


        return result;

    } catch (error) {

        console.error(
            "SERENITY: FastAPI request failed:",
            error
        );

        return null;
    }
}


// ============================================================
// HEARTBEAT
// ============================================================

async function heartbeat() {

    try {

        await ensureToday();


        const data =
            await chrome.storage.local.get(
                "serenityActive"
            );


        const active =
            data.serenityActive;


        if (!active) {

            return;
        }


        const elapsedSeconds =
            Math.max(
                0,
                Math.floor(
                    (Date.now() -
                        active.startTime) /
                    1000
                )
            );


        await chrome.storage.local.set({

            serenityCurrentElapsed:
                elapsedSeconds
        });


        console.log(
            "SERENITY: Heartbeat:",
            elapsedSeconds,
            "seconds"
        );

    } catch (error) {

        console.error(
            "SERENITY: Heartbeat error:",
            error
        );
    }
}


// ============================================================
// AIML ANALYSIS
// ============================================================

async function analyzeActivePage() {

    try {

        await ensureToday();


        const data =
            await chrome.storage.local.get([
                "serenityActive",
                "serenityLastIntervention"
            ]);


        const active =
            data.serenityActive;


        if (!active) {

            return;
        }


        if (
            !active.pageData ||
            !active.pageData.text
        ) {

            console.log(
                "SERENITY: Waiting for page text..."
            );

            return;
        }


        const elapsedSeconds =
            Math.max(
                0,
                Math.floor(
                    (Date.now() -
                        active.startTime) /
                    1000
                )
            );


        console.log(
            "SERENITY: AIML analysis after",
            elapsedSeconds,
            "seconds"
        );


        console.log(
            "SERENITY: Text length for AIML:",
            active.pageData.text.length
        );


        const result =
            await sendToFastAPI(
                active.pageData,
                elapsedSeconds
            );


        if (!result) {

            return;
        }


        // --------------------------------------------------------
        // NO TRIGGER
        // --------------------------------------------------------

        if (!result.trigger) {

            console.log(
                "SERENITY: AIML says NO intervention."
            );

            return;
        }


        // --------------------------------------------------------
        // COOLDOWN
        // --------------------------------------------------------

        const lastIntervention =
            Number(
                data.serenityLastIntervention || 0
            );


        if (
            lastIntervention &&
            Date.now() -
                lastIntervention <
                INTERVENTION_COOLDOWN_MS
        ) {

            console.log(
                "SERENITY: Intervention cooldown active."
            );

            return;
        }


        // --------------------------------------------------------
        // REAL AIML CONTEXT
        // --------------------------------------------------------

        const context = {

            trigger:
                true,

            emotion:
                result.emotion?.dominant_emotion ||
                result.aiml?.dominant_emotion ||
                "unknown",

            negative_score:
                Number(
                    result.emotion?.negative_score ??
                    result.aiml?.negative_score ??
                    0
                ),

            content_type:
                result.emotion?.content_type ||
                result.aiml?.content_type ||
                "unknown",

            content_text:
                result.emotion?.content_text ||
                active.pageData.text ||
                "",

            page_url:
                active.pageData.url || "",

            page_title:
                active.pageData.title || "",

            time_spent_seconds:
                elapsedSeconds
        };


        await chrome.storage.local.set({

            serenityInterventionContext:
                context,

            serenityLastIntervention:
                Date.now()
        });


        console.log(
            "SERENITY: =================================="
        );


        console.log(
            "SERENITY: GENUINE AIML TRIGGER"
        );


        console.log(
            "SERENITY: Emotion:",
            context.emotion
        );


        console.log(
            "SERENITY: Negative score:",
            context.negative_score
        );


        console.log(
            "SERENITY: =================================="
        );


        // --------------------------------------------------------
        // NOTIFICATION
        // --------------------------------------------------------

        showSerenityNotification();


        // --------------------------------------------------------
        // OPEN SERENITY AFTER 10 SECONDS
        // --------------------------------------------------------

        await scheduleSerenityOpen();

    } catch (error) {

        console.error(
            "SERENITY: AIML analysis error:",
            error
        );
    }
}


// ============================================================
// NOTIFICATION
// ============================================================

function showSerenityNotification() {

    chrome.notifications.create(
        "serenity-intervention",
        {
            type:
                "basic",

            iconUrl:
                "icon128.png",

            title:
                "Serenity",

            message:
                "You've been taking in a lot. Let's have a little pause.",

            priority:
                2
        },

        (notificationId) => {

            if (
                chrome.runtime.lastError
            ) {

                console.error(
                    "SERENITY: Notification error:",
                    chrome.runtime.lastError.message
                );

                return;
            }


            console.log(
                "SERENITY: Notification shown:",
                notificationId
            );
        }
    );
}


// ============================================================
// OPEN SERENITY
// ============================================================

let serenityOpenTimer =
    null;


async function scheduleSerenityOpen() {

    if (serenityOpenTimer) {

        clearTimeout(
            serenityOpenTimer
        );
    }


    serenityOpenTimer =
        setTimeout(
            openSerenityPage,
            SERENITY_OPEN_DELAY_MS
        );
}


async function openSerenityPage() {

    try {

        const data =
            await chrome.storage.local.get(
                "serenityInterventionContext"
            );


        const context =
            data.serenityInterventionContext;


        if (
            !context ||
            !context.trigger
        ) {

            console.log(
                "SERENITY: No valid intervention context."
            );

            return;
        }


        const params =
            new URLSearchParams();


        params.set(
            "trigger",
            "true"
        );


        params.set(
            "emotion",
            context.emotion || "unknown"
        );


        params.set(
            "negative_score",
            String(
                context.negative_score || 0
            )
        );


        params.set(
            "content_type",
            context.content_type || "unknown"
        );


        params.set(
            "content_text",
            context.content_text || ""
        );


        params.set(
            "page_url",
            context.page_url || ""
        );


        params.set(
            "page_title",
            context.page_title || ""
        );


        params.set(
            "time_spent_seconds",
            String(
                context.time_spent_seconds || 0
            )
        );


        const serenityUrl =
            "http://localhost:3000/?" +
            params.toString();


        console.log(
            "SERENITY: Opening Serenity."
        );


        await chrome.tabs.create({

            url:
                serenityUrl
        });

    } catch (error) {

        console.error(
            "SERENITY: Could not open Serenity:",
            error
        );
    }
}


// ============================================================
// PAGE DATA FROM CONTENT SCRIPT
// ============================================================

chrome.runtime.onMessage.addListener(
    (message, sender) => {

        if (!message) {

            return;
        }


        if (
            message.type !==
            "PAGE_DATA"
        ) {

            return;
        }


        handlePageData(
            message,
            sender
        );
    }
);


async function handlePageData(
    message,
    sender
) {

    try {

        const data =
            await chrome.storage.local.get(
                "serenityActive"
            );


        const active =
            data.serenityActive;


        const pageData = {

            url:
                message.data?.url ||
                message.url ||
                sender.tab?.url ||
                "",

            title:
                message.data?.title ||
                message.title ||
                sender.tab?.title ||
                "",

            text:
                message.data?.text ||
                message.text ||
                ""
        };


        console.log(
            "SERENITY: Received PAGE_DATA.",
            {
                url:
                    pageData.url,

                title:
                    pageData.title,

                textLength:
                    pageData.text.length
            }
        );


        if (
            active &&
            sender.tab &&
            active.tabId ===
                sender.tab.id
        ) {

            // ----------------------------------------
            // IMPORTANT:
            // Update the existing session WITHOUT
            // destroying the extracted text.
            // ----------------------------------------

            active.pageData = {

                url:
                    pageData.url ||
                    active.pageData?.url ||
                    active.url,

                title:
                    pageData.title ||
                    active.pageData?.title ||
                    "",

                text:
                    pageData.text ||
                    active.pageData?.text ||
                    ""
            };


            await chrome.storage.local.set({

                serenityActive:
                    active
            });


            console.log(
                "SERENITY: Page data updated."
            );


            console.log(
                "SERENITY: Stored text length:",
                active.pageData.text.length
            );

        } else {

            await chrome.storage.local.set({

                serenityPendingPageData:
                    pageData
            });


            console.log(
                "SERENITY: Page data stored as pending."
            );
        }

    } catch (error) {

        console.error(
            "SERENITY: PAGE_DATA error:",
            error
        );
    }
}


// ============================================================
// TAB ACTIVATION
// ============================================================

chrome.tabs.onActivated.addListener(
    async (activeInfo) => {

        try {

            await stopTracking(true);


            const tab =
                await chrome.tabs.get(
                    activeInfo.tabId
                );


            if (
                tab &&
                isTrackableUrl(tab.url)
            ) {

                await startTracking(tab);
            }

        } catch (error) {

            console.error(
                "SERENITY: Tab activation error:",
                error
            );
        }
    }
);


// ============================================================
// TAB UPDATE
// ============================================================

chrome.tabs.onUpdated.addListener(
    async (
        tabId,
        changeInfo,
        tab
    ) => {

        if (
            changeInfo.status !==
            "complete"
        ) {

            return;
        }


        try {

            const data =
                await chrome.storage.local.get(
                    "serenityActive"
                );


            const active =
                data.serenityActive;


            if (
                !active ||
                active.tabId !== tabId
            ) {

                return;
            }


            // ----------------------------------------
            // IMPORTANT:
            // Update URL/title only.
            //
            // NEVER replace pageData.text with "".
            // content.js supplies the actual text.
            // ----------------------------------------

            active.url =
                tab.url ||
                active.url;


            if (!active.pageData) {

                active.pageData = {

                    url:
                        tab.url ||
                        active.url,

                    title:
                        tab.title ||
                        "",

                    text:
                        ""
                };

            } else {

                active.pageData.url =
                    tab.url ||
                    active.pageData.url ||
                    active.url;

                active.pageData.title =
                    tab.title ||
                    active.pageData.title ||
                    "";
            }


            await chrome.storage.local.set({

                serenityActive:
                    active
            });


            console.log(
                "SERENITY: Tab updated."
            );


            console.log(
                "SERENITY: Preserved text length:",
                (active.pageData.text || "").length
            );

        } catch (error) {

            console.error(
                "SERENITY: Tab update error:",
                error
            );
        }
    }
);


// ============================================================
// TAB CLOSED
// ============================================================

chrome.tabs.onRemoved.addListener(
    async (tabId) => {

        try {

            const data =
                await chrome.storage.local.get(
                    "serenityActive"
                );


            const active =
                data.serenityActive;


            if (
                active &&
                active.tabId === tabId
            ) {

                await stopTracking(true);
            }

        } catch (error) {

            console.error(
                "SERENITY: Tab removal error:",
                error
            );
        }
    }
);


// ============================================================
// WINDOW FOCUS
// ============================================================
//
// Losing window focus does NOT stop tracking.
// This prevents DevTools from killing the session.
//

chrome.windows.onFocusChanged.addListener(
    async (windowId) => {

        if (
            windowId ===
            chrome.windows.WINDOW_ID_NONE
        ) {

            console.log(
                "SERENITY: Window lost focus. Keeping session alive."
            );

            return;
        }


        const tab =
            await getActiveTab();


        if (
            tab &&
            isTrackableUrl(tab.url)
        ) {

            const data =
                await chrome.storage.local.get(
                    "serenityActive"
                );


            if (
                !data.serenityActive ||
                data.serenityActive.tabId !==
                    tab.id
            ) {

                await startTracking(tab);
            }
        }
    }
);


// ============================================================
// ALARMS
// ============================================================

chrome.alarms.onAlarm.addListener(
    async (alarm) => {

        if (
            alarm.name ===
            HEARTBEAT_ALARM
        ) {

            await heartbeat();
        }


        if (
            alarm.name ===
            ANALYSIS_ALARM
        ) {

            await analyzeActivePage();
        }
    }
);


// ============================================================
// CREATE ALARMS
// ============================================================

async function createAlarms() {

    await chrome.alarms.clear(
        HEARTBEAT_ALARM
    );


    await chrome.alarms.clear(
        ANALYSIS_ALARM
    );


    chrome.alarms.create(
        HEARTBEAT_ALARM,
        {
            periodInMinutes:
                HEARTBEAT_PERIOD_MINUTES
        }
    );


    chrome.alarms.create(
        ANALYSIS_ALARM,
        {
            periodInMinutes:
                ANALYSIS_PERIOD_MINUTES
        }
    );


    console.log(
        "SERENITY: Tracking alarms created."
    );
}


// ============================================================
// INITIALIZATION
// ============================================================

async function initialize() {

    try {

        await ensureToday();


        await createAlarms();


        const tab =
            await getActiveTab();


        if (
            tab &&
            isTrackableUrl(tab.url)
        ) {

            await startTracking(tab);


            const pending =
                await chrome.storage.local.get(
                    "serenityPendingPageData"
                );


            if (
                pending.serenityPendingPageData
            ) {

                const data =
                    await chrome.storage.local.get(
                        "serenityActive"
                    );


                if (
                    data.serenityActive
                ) {

                    data.serenityActive.pageData =
                        pending.serenityPendingPageData;


                    await chrome.storage.local.set({

                        serenityActive:
                            data.serenityActive
                    });


                    await chrome.storage.local.remove(
                        "serenityPendingPageData"
                    );


                    console.log(
                        "SERENITY: Pending page data attached."
                    );
                }
            }
        }


        await heartbeat();


        console.log(
            "SERENITY: Background service worker loaded successfully."
        );

    } catch (error) {

        console.error(
            "SERENITY: Initialization error:",
            error
        );
    }
}


initialize();
