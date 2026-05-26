
const TRIPBOOK_THEME_KEY = "tripbook-theme";

function getSavedTheme() {
    return localStorage.getItem(TRIPBOOK_THEME_KEY) || "light";
}

function applyTheme(theme) {
    const isDark = theme === "dark";

    document.documentElement.classList.toggle("dark-mode", isDark);

    if (document.body) {
        document.body.classList.toggle("dark-mode", isDark);
    }

    updateThemeButtons(theme);
}

function saveTheme(theme) {
    localStorage.setItem(TRIPBOOK_THEME_KEY, theme);
    applyTheme(theme);
}

function updateThemeButtons(theme) {
    const buttons = document.querySelectorAll("[data-theme-toggle]");
    const isDark = theme === "dark";

    const icon = isDark
        ? '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>'
        : '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 7 7 0 1 0 20 15.5Z"/></svg>';

    buttons.forEach(function (button) {
        button.innerHTML = icon;
        button.setAttribute("aria-label", isDark ? "تغییر به لایت مود" : "تغییر به دارک مود");
        button.setAttribute("title", isDark ? "لایت مود" : "دارک مود");
    });
}

function setupThemeToggle() {
    applyTheme(getSavedTheme());

    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
        if (button.dataset.themeReady === "true") {
            return;
        }

        button.dataset.themeReady = "true";

        button.addEventListener("click", function () {
            const currentTheme = getSavedTheme();
            const nextTheme = currentTheme === "dark" ? "light" : "dark";
            saveTheme(nextTheme);
        });
    });
}

window.addEventListener("storage", function (event) {
    if (event.key === TRIPBOOK_THEME_KEY) {
        applyTheme(event.newValue || "light");
    }
});

const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

const jalaliMonths = [
    { name: "فروردین", days: 31 },
    { name: "اردیبهشت", days: 31 },
    { name: "خرداد", days: 31 },
    { name: "تیر", days: 31 },
    { name: "مرداد", days: 31 },
    { name: "شهریور", days: 31 },
    { name: "مهر", days: 30 },
    { name: "آبان", days: 30 },
    { name: "آذر", days: 30 },
    { name: "دی", days: 30 },
    { name: "بهمن", days: 30 },
    { name: "اسفند", days: 29 }
];

function toFaNumber(value) {
    return String(value).replace(/[0-9]/g, function (digit) {
        return persianDigits[digit];
    });
}

function pad2(value) {
    return String(value).padStart(2, "0");
}

function setupLogin() {
    const loginForm = document.querySelector("#loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        window.location.href = "index.html";
    });
}

function setupCalendar() {
    const inputs = document.querySelectorAll(".persian-date-input");
    let activePopup = null;
    let activeInput = null;

    function positionPopup(input, popup) {
        const rect = input.getBoundingClientRect();
        const popupWidth = popup.offsetWidth || 312;
        const popupHeight = popup.offsetHeight || 350;
        const gap = 10;
        const safeMargin = 16;

        let left = rect.left;
        let top = rect.bottom + gap;

        if (left + popupWidth > window.innerWidth - safeMargin) {
            left = window.innerWidth - popupWidth - safeMargin;
        }

        if (left < safeMargin) {
            left = safeMargin;
        }

        if (top + popupHeight > window.innerHeight - safeMargin) {
            top = rect.top - popupHeight - gap;
        }

        if (top < safeMargin) {
            top = safeMargin;
        }

        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
    }

    inputs.forEach(function (input) {
        let currentYear = 1405;
        let currentMonthIndex = 2;

        const popup = document.createElement("div");
        popup.className = "calendar-popup";
        document.body.appendChild(popup);

        function renderCalendar() {
            const month = jalaliMonths[currentMonthIndex];
            const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

            let calendarHtml = `
                <div class="calendar-head">
                    <button type="button" class="btn-small btn-secondary calendar-prev">ماه قبل</button>
                    <strong>${month.name} ${toFaNumber(currentYear)}</strong>
                    <button type="button" class="btn-small btn-secondary calendar-next">ماه بعد</button>
                </div>

                <div class="calendar-grid">
            `;

            weekDays.forEach(function (dayName) {
                calendarHtml += `<div class="calendar-day-name">${dayName}</div>`;
            });

            const emptyCells = (currentMonthIndex + 2) % 7;

            for (let i = 0; i < emptyCells; i++) {
                calendarHtml += `<div class="calendar-empty"></div>`;
            }

            for (let day = 1; day <= month.days; day++) {
                const value = `${toFaNumber(currentYear)}/${toFaNumber(pad2(currentMonthIndex + 1))}/${toFaNumber(pad2(day))}`;

                calendarHtml += `
                    <div class="calendar-day" data-value="${value}">
                        ${toFaNumber(day)}
                    </div>
                `;
            }

            calendarHtml += "</div>";
            popup.innerHTML = calendarHtml;
        }

        renderCalendar();

        input.addEventListener("click", function (event) {
            event.stopPropagation();

            document.querySelectorAll(".calendar-popup").forEach(function (item) {
                if (item !== popup) {
                    item.classList.remove("show");
                }
            });

            popup.classList.toggle("show");
            activePopup = popup.classList.contains("show") ? popup : null;
            activeInput = activePopup ? input : null;

            if (activePopup) {
                positionPopup(input, popup);
            }
        });

        popup.addEventListener("click", function (event) {
            event.stopPropagation();

            if (event.target.classList.contains("calendar-prev")) {
                currentMonthIndex--;

                if (currentMonthIndex < 0) {
                    currentMonthIndex = 11;
                    currentYear--;
                }

                renderCalendar();
                positionPopup(input, popup);
                return;
            }

            if (event.target.classList.contains("calendar-next")) {
                currentMonthIndex++;

                if (currentMonthIndex > 11) {
                    currentMonthIndex = 0;
                    currentYear++;
                }

                renderCalendar();
                positionPopup(input, popup);
                return;
            }

            const selectedDay = event.target.closest(".calendar-day");

            if (selectedDay) {
                input.value = selectedDay.dataset.value;
                popup.classList.remove("show");
                activePopup = null;
                activeInput = null;
            }
        });
    });

    window.addEventListener("scroll", function () {
        if (activePopup && activeInput) {
            positionPopup(activeInput, activePopup);
        }
    }, true);

    window.addEventListener("resize", function () {
        if (activePopup && activeInput) {
            positionPopup(activeInput, activePopup);
        }
    });

    document.addEventListener("click", function () {
        document.querySelectorAll(".calendar-popup").forEach(function (popup) {
            popup.classList.remove("show");
        });

        activePopup = null;
        activeInput = null;
    });
}

const trips = [
    {
        route: "تهران ← مشهد",
        origin: "تهران",
        destination: "مشهد",
        company: "ماهان",
        vehicle: "AIR-737",
        type: "هواپیما",
        departure: "۱۴۰۵/۰۳/۲۲ - ۰۸:۳۰",
        arrival: "۱۴۰۵/۰۳/۲۲ - ۱۰:۰۰",
        price: "۲,۵۰۰,۰۰۰ تومان"
    },
    {
        route: "تهران ← اصفهان",
        origin: "تهران",
        destination: "اصفهان",
        company: "سیر و سفر",
        vehicle: "BUS-204",
        type: "اتوبوس",
        departure: "۱۴۰۵/۰۳/۲۵ - ۲۱:۰۰",
        arrival: "۱۴۰۵/۰۳/۲۶ - ۰۲:۳۰",
        price: "۸۵۰,۰۰۰ تومان"
    },
    {
        route: "شیراز ← تهران",
        origin: "شیراز",
        destination: "تهران",
        company: "رجا",
        vehicle: "TRAIN-91",
        type: "قطار",
        departure: "۱۴۰۵/۰۳/۲۸ - ۱۸:۴۵",
        arrival: "۱۴۰۵/۰۳/۲۹ - ۰۶:۳۰",
        price: "۱,۲۰۰,۰۰۰ تومان"
    },
    {
        route: "مشهد ← شیراز",
        origin: "مشهد",
        destination: "شیراز",
        company: "ایران ایر",
        vehicle: "AIR-320",
        type: "هواپیما",
        departure: "۱۴۰۵/۰۴/۰۵ - ۱۳:۱۵",
        arrival: "۱۴۰۵/۰۴/۰۵ - ۱۵:۰۵",
        price: "۲,۸۰۰,۰۰۰ تومان"
    }
];

function renderTrips(list, titleText, shouldScroll = true, shouldSave = true) {
    const resultSection = document.querySelector("#searchResults");
    const resultTitle = document.querySelector("#resultTitle");
    const resultList = document.querySelector("#resultList");

    if (!resultSection || !resultTitle || !resultList) {
        return;
    }

    resultTitle.textContent = titleText;
    resultSection.style.display = "block";

    if (shouldSave) {
        sessionStorage.setItem("tripbookSearchResults", JSON.stringify({
            title: titleText,
            list: list
        }));
    }

    if (!list.length) {
        resultList.innerHTML = `
            <div class="empty-result">
                سفری با این مشخصات پیدا نشد.
            </div>
        `;
        return;
    }

    resultList.innerHTML = list.map(function (trip) {
        return `
            <div class="trip-card">
                <div>
                    <h3>${trip.route}</h3>
                    <p>شرکت: ${trip.company} | وسیله: ${trip.vehicle} | نوع: ${trip.type}</p>
                    <p>حرکت: ${trip.departure}</p>
                    <p>رسیدن: ${trip.arrival}</p>
                </div>

                <div class="trip-action">
                    <strong>${trip.price}</strong>
                    <button type="button" class="reserve-button">رزرو</button>
                </div>
            </div>
        `;
    }).join("");

    if (shouldScroll) {
        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

function restoreTripSearchResults() {
    const resultSection = document.querySelector("#searchResults");

    if (!resultSection) {
        return;
    }

    const savedResults = sessionStorage.getItem("tripbookSearchResults");

    if (!savedResults) {
        return;
    }

    try {
        const parsedResults = JSON.parse(savedResults);
        renderTrips(parsedResults.list || [], parsedResults.title || "نتایج جستجو", false, false);
    } catch (error) {
        sessionStorage.removeItem("tripbookSearchResults");
    }
}

function setupTripSearch() {
    const searchButton = document.querySelector("#searchBtn");
    const showAllButton = document.querySelector("#showAllTripsBtn");

    if (!searchButton || !showAllButton) {
        return;
    }

    searchButton.addEventListener("click", function () {
        const origin = document.querySelector("#originInput").value.trim();
        const destination = document.querySelector("#destinationInput").value.trim();
        const type = document.querySelector("#vehicleTypeInput").value;

        const filteredTrips = trips.filter(function (trip) {
            const originMatches = !origin || trip.origin.includes(origin);
            const destinationMatches = !destination || trip.destination.includes(destination);
            const typeMatches = type === "همه" || trip.type === type;

            return originMatches && destinationMatches && typeMatches;
        });

        renderTrips(filteredTrips, "نتایج جستجو");
    });

    showAllButton.addEventListener("click", function () {
        renderTrips(trips, "همه سفرها");
    });
}

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

setupThemeToggle();
setupLogin();
setupCalendar();
setupTripSearch();
restoreTripSearchResults();
