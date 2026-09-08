// ============================================
// SERENITY - PAGE DATA EXTRACTION
// ============================================

console.log("SERENITY: Content script loaded.");


// --------------------------------------------
// Collect information from the current page
// --------------------------------------------

function collectPageData() {

    const pageData = {

        title: document.title || "",

        url: window.location.href,

        text: document.body
            ? document.body.innerText.slice(0, 5000)
            : ""

    };

    return pageData;
}


// --------------------------------------------
// Send page information to background.js
// --------------------------------------------

function sendPageData() {

    const pageData = collectPageData();

    console.log("SERENITY PAGE DATA:");
    console.log(pageData);


    chrome.runtime.sendMessage({

        type: "PAGE_DATA",

        data: pageData

    });

}


// --------------------------------------------
// Wait until page is ready
// --------------------------------------------

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        sendPageData
    );

} else {

    sendPageData();

}