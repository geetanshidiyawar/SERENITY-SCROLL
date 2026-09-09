// ============================================
// SERENITY POPUP
// ============================================

console.log("SERENITY: Popup opened.");


// --------------------------------------------
// Convert seconds into readable time
// --------------------------------------------

function formatTime(seconds) {

    seconds = Math.floor(Number(seconds) || 0);

    if (seconds < 60) {
        return `${seconds} sec`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {

        if (remainingSeconds === 0) {
            return `${minutes} min`;
        }

        return `${minutes} min ${remainingSeconds} sec`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
}


// --------------------------------------------
// Get today's date
// --------------------------------------------

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


// --------------------------------------------
// Load tracking data
// --------------------------------------------

async function loadTrackingData() {

    try {

        const result =
            await chrome.storage.local.get([
                "serenityDate",
                "serenityTime",
                "serenityDomains"
            ]);

        const today = getTodayKey();

        let totalTime =
            Number(result.serenityTime || 0);

        let domains =
            result.serenityDomains || {};

        // ------------------------------------
        // Reset only when the actual date
        // changes
        // ------------------------------------

        if (result.serenityDate !== today) {

            totalTime = 0;
            domains = {};

            await chrome.storage.local.set({

                serenityDate:
                    today,

                serenityTime:
                    0,

                serenityDomains:
                    {}
            });

            console.log(
                "SERENITY: New day detected. Tracking reset."
            );
        }


        // ------------------------------------
        // Display total browsing time
        // ------------------------------------

        const totalElement =
            document.getElementById("totalTime");

        if (totalElement) {

            totalElement.textContent =
                formatTime(totalTime);
        }


        // ------------------------------------
        // Display websites
        // ------------------------------------

        const sitesContainer =
            document.getElementById("sites");

        if (!sitesContainer) {
            return;
        }

        sitesContainer.innerHTML = "";


        const sites =
            Object.entries(domains);


        // ------------------------------------
        // No websites
        // ------------------------------------

        if (sites.length === 0) {

            sitesContainer.innerHTML =
                "<p>No browsing activity recorded yet.</p>";

            return;
        }


        // ------------------------------------
        // Sort by most time spent
        // ------------------------------------

        sites.sort((a, b) => {

            return Number(b[1]) - Number(a[1]);

        });


        // ------------------------------------
        // Create website rows
        // ------------------------------------

        sites.forEach(([domain, seconds]) => {

            const siteElement =
                document.createElement("div");

            siteElement.className = "site";

            siteElement.innerHTML = `

                <span>${domain}</span>

                <strong>
                    ${formatTime(seconds)}
                </strong>

            `;

            sitesContainer.appendChild(
                siteElement
            );
        });


        console.log(
            "SERENITY: Total browsing time:",
            formatTime(totalTime)
        );

        console.log(
            "SERENITY: Domains:",
            domains
        );

    } catch (error) {

        console.error(
            "SERENITY: Could not load tracking data.",
            error
        );
    }
}


// --------------------------------------------
// Load data when popup opens
// --------------------------------------------

loadTrackingData();
