// ============================================
// SERENITY POPUP
// ============================================

console.log("SERENITY: Popup opened.");


// --------------------------------------------
// Convert seconds into readable time
// --------------------------------------------

function formatTime(seconds) {

    seconds = Math.floor(seconds || 0);


    // Less than one minute
    if (seconds < 60) {

        return `${seconds} sec`;

    }


    // Minutes
    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;


    if (minutes < 60) {

        if (remainingSeconds === 0) {

            return `${minutes} min`;

        }

        return `${minutes} min ${remainingSeconds} sec`;

    }


    // Hours
    const hours = Math.floor(minutes / 60);

    const remainingMinutes = minutes % 60;


    return `${hours} hr ${remainingMinutes} min`;
}



// --------------------------------------------
// Load tracking data
// --------------------------------------------

async function loadTrackingData() {

    try {

        const result =
           await chrome.storage.local.get("serenityTime");

       const today =
           new Date().toISOString().slice(0, 10);

    let data = result.serenityTime;

    if (!data || data.date !== today) {

       data = {
          date: today,
          totalSeconds: 0,
          sites: {}
        };

       await chrome.storage.local.set({
        serenityTime: data
       });
    }



        // ------------------------------------
        // Display total browsing time
        // ------------------------------------

        const totalElement =
            document.getElementById("totalTime");


        totalElement.textContent =
            formatTime(data.totalSeconds);



        // ------------------------------------
        // Display websites
        // ------------------------------------

        const sitesContainer =
            document.getElementById("sites");


        sitesContainer.innerHTML = "";


        const sites =
            Object.entries(data.sites || {});


        // No websites
        if (sites.length === 0) {

            sitesContainer.innerHTML =
                "<p>No browsing activity recorded yet.</p>";

            return;

        }


        // ------------------------------------
        // Sort by most time spent
        // ------------------------------------

        sites.sort((a, b) => {

            return b[1] - a[1];

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


            sitesContainer.appendChild(siteElement);

        });


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