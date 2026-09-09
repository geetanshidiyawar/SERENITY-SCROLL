// ============================================================
// SERENITY CONTENT SCRIPT
// ============================================================
//
// Extracts readable webpage text and sends it to background.js.
//
// Designed to handle:
// - Normal webpages
// - Dynamically rendered webpages
// - React/Vue/Next.js pages
// - Pages where body text appears after a delay
// - SPA navigation
// - Pages that initially have an empty body
// ============================================================


const MAX_TEXT_LENGTH = 5000;


// Retry schedule in milliseconds.
//
// Some websites render their actual article content several
// seconds after the initial page load.

const RETRY_DELAYS = [
    1000,
    3000,
    5000,
    8000,
    12000,
    20000,
    30000
];


let lastSentText = "";

let extractionTimer = null;

let observer = null;


// ============================================================
// CHECK EXTENSION CONTEXT
// ============================================================

function isExtensionContextValid() {

    try {

        return (
            typeof chrome !== "undefined" &&
            chrome.runtime &&
            chrome.runtime.id
        );

    } catch (error) {

        return false;
    }
}


// ============================================================
// CLEAN TEXT
// ============================================================

function cleanText(text) {

    if (!text) {

        return "";
    }


    return String(text)

        // Convert unusual whitespace to normal spaces.
        .replace(/\u00A0/g, " ")

        // Collapse repeated whitespace.
        .replace(/\s+/g, " ")

        // Trim.
        .trim();
}


// ============================================================
// EXTRACT PAGE TEXT
// ============================================================

function extractPageData() {

    try {

        if (
            !isExtensionContextValid()
        ) {

            return null;
        }


        // --------------------------------------------------------
        // TITLE
        // --------------------------------------------------------

        const title =
            document.title ||
            "";


        // --------------------------------------------------------
        // URL
        // --------------------------------------------------------

        const url =
            window.location.href ||
            "";


        // --------------------------------------------------------
        // TEXT EXTRACTION
        // --------------------------------------------------------
        //
        // Try several sources because websites behave differently.
        //

        let text = "";


        // First choice: visible body text.

        if (
            document.body
        ) {

            text =
                document.body.innerText ||
                "";
        }


        text =
            cleanText(text);


        // --------------------------------------------------------
        // FALLBACK 1: BODY TEXT CONTENT
        // --------------------------------------------------------

        if (
            text.length < 50 &&
            document.body
        ) {

            text =
                cleanText(
                    document.body.textContent || ""
                );
        }


        // --------------------------------------------------------
        // FALLBACK 2: DOCUMENT ELEMENT
        // --------------------------------------------------------

        if (
            text.length < 50 &&
            document.documentElement
        ) {

            text =
                cleanText(
                    document.documentElement.innerText ||
                    ""
                );
        }


        // --------------------------------------------------------
        // FALLBACK 3: DOCUMENT ELEMENT TEXT CONTENT
        // --------------------------------------------------------

        if (
            text.length < 50 &&
            document.documentElement
        ) {

            text =
                cleanText(
                    document.documentElement.textContent ||
                    ""
                );
        }


        // --------------------------------------------------------
        // LIMIT TEXT SIZE
        // --------------------------------------------------------

        if (
            text.length >
            MAX_TEXT_LENGTH
        ) {

            text =
                text.substring(
                    0,
                    MAX_TEXT_LENGTH
                );
        }


        console.log(
            "SERENITY: Page extraction:",
            {
                url: url,
                title: title,
                textLength: text.length
            }
        );


        return {

            url:
                url,

            title:
                title,

            text:
                text
        };


    } catch (error) {

        console.error(
            "SERENITY: Page extraction failed:",
            error
        );

        return null;
    }
}


// ============================================================
// SEND PAGE DATA
// ============================================================

function sendPageData(
    pageData
) {

    try {

        if (
            !pageData ||
            !isExtensionContextValid()
        ) {

            return;
        }


        // --------------------------------------------------------
        // DO NOT SEND EMPTY TEXT
        // --------------------------------------------------------

        if (
            !pageData.text ||
            pageData.text.length < 20
        ) {

            console.log(
                "SERENITY: Page text not ready yet. Waiting..."
            );

            return;
        }


        // --------------------------------------------------------
        // AVOID SENDING IDENTICAL TEXT AGAIN
        // --------------------------------------------------------

        if (
            pageData.text ===
            lastSentText
        ) {

            return;
        }


        lastSentText =
            pageData.text;


        console.log(
            "SERENITY: Sending extracted page data:",
            {
                url:
                    pageData.url,

                title:
                    pageData.title,

                textLength:
                    pageData.text.length
            }
        );


        chrome.runtime.sendMessage(

            {
                type:
                    "PAGE_DATA",

                data:
                    pageData
            },

            () => {

                if (
                    chrome.runtime.lastError
                ) {

                    console.log(
                        "SERENITY: Background connection:",
                        chrome.runtime.lastError.message
                    );
                }
            }
        );


    } catch (error) {

        console.log(
            "SERENITY: Could not send page data:",
            error
        );
    }
}


// ============================================================
// EXTRACT + SEND
// ============================================================

function extractAndSend() {

    const pageData =
        extractPageData();


    if (!pageData) {

        return;
    }


    sendPageData(
        pageData
    );
}


// ============================================================
// RETRY EXTRACTION
// ============================================================

function startRetries() {

    RETRY_DELAYS.forEach(
        (delay) => {

            setTimeout(
                () => {

                    extractAndSend();

                },
                delay
            );
        }
    );
}


// ============================================================
// PERIODIC EXTRACTION
// ============================================================
//
// Some websites continuously change their DOM.
//
// Check every 5 seconds.
//

function startPeriodicExtraction() {

    setInterval(
        () => {

            extractAndSend();

        },
        5000
    );
}


// ============================================================
// MUTATION OBSERVER
// ============================================================
//
// Detect when websites dynamically add article content.
//

function startMutationObserver() {

    try {

        if (
            !document.body
        ) {

            return;
        }


        observer =
            new MutationObserver(
                () => {

                    clearTimeout(
                        extractionTimer
                    );


                    extractionTimer =
                        setTimeout(
                            () => {

                                extractAndSend();

                            },
                            1000
                        );
                }
            );


        observer.observe(
            document.body,
            {
                childList:
                    true,

                subtree:
                    true
            }
        );


    } catch (error) {

        console.log(
            "SERENITY: Mutation observer failed:",
            error
        );
    }
}


// ============================================================
// SPA NAVIGATION DETECTION
// ============================================================

function monitorNavigation() {

    let lastUrl =
        window.location.href;


    setInterval(
        () => {

            try {

                const currentUrl =
                    window.location.href;


                if (
                    currentUrl !==
                    lastUrl
                ) {

                    lastUrl =
                        currentUrl;


                    console.log(
                        "SERENITY: Navigation detected:",
                        currentUrl
                    );


                    // Allow the new page to render.

                    setTimeout(
                        () => {

                            // Reset the duplicate guard.

                            lastSentText =
                                "";


                            extractAndSend();

                            startRetries();

                        },
                        1000
                    );
                }

            } catch (error) {

                console.log(
                    "SERENITY: Navigation monitor error:",
                    error
                );
            }

        },
        1000
    );
}


// ============================================================
// INITIALIZATION
// ============================================================

function initializeSerenityContentScript() {

    console.log(
        "SERENITY: Content script loaded."
    );


    // Try immediately.

    extractAndSend();


    // Try repeatedly as the page renders.

    startRetries();


    // Continue checking dynamic pages.

    startPeriodicExtraction();


    // Watch DOM changes.

    startMutationObserver();


    // Watch SPA navigation.

    monitorNavigation();
}


// ============================================================
// START
// ============================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            initializeSerenityContentScript();

        }
    );

} else {

    initializeSerenityContentScript();
}

