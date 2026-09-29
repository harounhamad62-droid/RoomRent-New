/* =========================================================
   ROOMRENT - NEW SCRIPT.JS
   Firebase Auth + Firestore
   ========================================================= */

"use strict";

/* =========================================================
   1. FIREBASE CONFIGURATION
   ========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyBlLpRr_zx1ru9acHQ_qHNnZp9f6kv12yA",
    authDomain: "roomrent-4b63b.firebaseapp.com",
    projectId: "roomrent-4b63b",
    storageBucket: "roomrent-4b63b.firebasestorage.app",
    messagingSenderId: "585995201987",
    appId: "1:585995201987:web:04d246393e90deac6ed2b6",
    measurementId: "G-7NVWKMJJ17"
};


/* =========================================================
   2. INITIALIZE FIREBASE
   ========================================================= */

let auth = null;
let db = null;
let storage = null;

try {

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();

    console.log("RoomRent Firebase initialized successfully.");

} catch (error) {

    console.error("Firebase initialization error:", error);

    alert(
        "Kuna tatizo la kuunganisha Firebase. " +
        "Tafadhali hakikisha Firebase SDK na config ziko sahihi."
    );
}


/* =========================================================
   3. GLOBAL VARIABLES
   ========================================================= */

let currentUser = null;
let currentUserData = null;

const ADMIN_UID = "1kj3K591EHhHAOiSoxIp1xGve2x1";


/* =========================================================
   4. HELPER - GET ELEMENT
   ========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


/* =========================================================
   5. HELPER - SHOW / HIDE
   ========================================================= */

function showElement(id) {

    const element = getElement(id);

    if (element) {
        element.classList.remove("hidden");
    }
}


function hideElement(id) {

    const element = getElement(id);

    if (element) {
        element.classList.add("hidden");
    }
}


/* =========================================================
   6. HELPER - SET MESSAGE
   ========================================================= */

function setMessage(id, message, type = "info") {

    const element = getElement(id);

    if (!element) {
        return;
    }

    element.textContent = message;

    element.className = "form-message";

    if (type === "success") {
        element.classList.add("success");
    }

    if (type === "error") {
        element.classList.add("error");
    }

    if (type === "warning") {
        element.classList.add("warning");
    }
}


/* =========================================================
   7. AUTH PANEL MANAGEMENT
   ========================================================= */

function showLoginPanel() {

    showElement("loginPanel");

    hideElement("forgotPasswordPanel");
    hideElement("signUpPanel");
}


function showRegisterPanel() {

    hideElement("loginPanel");
    hideElement("forgotPasswordPanel");

    showElement("signUpPanel");
}


function showForgotPasswordPanel() {

    hideElement("loginPanel");
    hideElement("signUpPanel");

    showElement("forgotPasswordPanel");
}


/* =========================================================
   8. SHOW LOGIN / HIDE APP
   ========================================================= */

function showAuthScreen() {

    showElement("authScreen");
    hideElement("appScreen");

    showLoginPanel();
}


/* =========================================================
   9. SHOW APP / HIDE LOGIN
   ========================================================= */

function showAppScreen() {

    hideElement("authScreen");
    showElement("appScreen");

    showSection("dashboardSection");
}


/* =========================================================
   10. SHOW APPLICATION SECTION
   ========================================================= */

function hideAllAppSections() {

    const sections = [
        "dashboardSection",
        "roomsSection",
        "bookingSection",
        "myBookingsSection",
        "withdrawalSection",
        "withdrawalHistorySection",
        "referralSection",
        "notificationsSection",
        "transactionsSection",
        "accountSection",
        "adminSection"
    ];

    sections.forEach(id => {
        hideElement(id);
    });
}


function showSection(sectionId) {

    hideAllAppSections();

    showElement(sectionId);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   11. FORMAT MONEY
   ========================================================= */

function formatMoney(amount) {

    const number = Number(amount) || 0;

    return new Intl.NumberFormat("en-TZ", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(number);
}


/* =========================================================
   12. GENERATE REFERRAL CODE
   ========================================================= */

function generateReferralCode() {

    const randomPart = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    return "RR" + randomPart;
}


/* =========================================================
   13. GENERATE REFERRAL LINK
   ========================================================= */

function generateReferralLink(code) {

    const baseUrl =
        window.location.origin +
        window.location.pathname;

    return `${baseUrl}?ref=${encodeURIComponent(code)}`;
}


/* =========================================================
   14. GET REFERRAL CODE FROM URL
   ========================================================= */

function getReferralCodeFromURL() {

    const params = new URLSearchParams(
        window.location.search
    );

    return params.get("ref") || "";
}


/* =========================================================
   15. AUTO-FILL REFERRAL CODE
   ========================================================= */

function loadReferralFromURL() {

    const referralInput = getElement("signUpReferral");

    if (!referralInput) {
        return;
    }

    const referralCode = getReferralCodeFromURL();

    if (referralCode) {
        referralInput.value = referralCode.toUpperCase();
    }
}


/* =========================================================
   16. REGISTER USER
   ========================================================= */

async function registerUser(event) {

    event.preventDefault();

    if (!auth || !db) {
        setMessage(
            "signUpMessage",
            "Firebase haijaunganishwa.",
            "error"
        );
        return;
    }

    const name = getElement("signUpName")?.value.trim();
    const phone = getElement("signUpPhone")?.value.trim();
    const email = getElement("signUpEmail")?.value.trim();
    const password = getElement("signUpPassword")?.value;
    const referralInput =
        getElement("signUpReferral")?.value.trim().toUpperCase();

    if (!name || !phone || !email || !password) {

        setMessage(
            "signUpMessage",
            "Tafadhali jaza taarifa zote zinazohitajika.",
            "error"
        );

        return;
    }

    if (password.length < 6) {

        setMessage(
            "signUpMessage",
            "Password lazima iwe na angalau characters 6.",
            "error"
        );

        return;
    }

    const button = getElement("signUpButton");

    if (button) {
        button.disabled = true;
        button.textContent = "Creating account...";
    }

    try {

        /*
         * Create Firebase Authentication account
         */

        const credential =
            await auth.createUserWithEmailAndPassword(
                email,
                password
            );

        const user = credential.user;

        /*
         * Generate customer's referral code
         */

        const referralCode =
            generateReferralCode();

        /*
         * Find referral sponsor if supplied
         */

        let referredBy = null;

        if (referralInput) {

            const referralQuery =
                await db
                    .collection("users")
                    .where(
                        "referralCode",
                        "==",
                        referralInput
                    )
                    .limit(1)
                    .get();

            if (!referralQuery.empty) {

                const sponsor =
                    referralQuery.docs[0];

                referredBy = sponsor.id;
            }
        }

        /*
         * Create Firestore user document
         */

        const userData = {

            uid: user.uid,

            name: name,

            phone: phone,

            email: email,

            referralCode: referralCode,

            referralLink:
                generateReferralLink(referralCode),

            referredBy: referredBy,

            role: user.uid === ADMIN_UID
                ? "admin"
                : "customer",

            balance: 0,

            totalProfit: 0,

            totalWithdrawn: 0,

            totalDeposited: 0,

            status: "active",

            createdAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()
        };

        await db
            .collection("users")
            .doc(user.uid)
            .set(userData);

        /*
         * Update local session data
         */

        currentUser = user;
        currentUserData = userData;

        /*
         * Show success
         */

        setMessage(
            "signUpMessage",
            "Account imeundwa kikamilifu. Karibu RoomRent!",
            "success"
        );

        /*
         * Wait briefly then open dashboard
         */

        setTimeout(() => {

            showAppScreen();

            loadUserDashboard();

        }, 800);

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        let message =
            "Imeshindikana kutengeneza account.";

        switch (error.code) {

            case "auth/email-already-in-use":
                message =
                    "Email hii tayari imesajiliwa.";
                break;

            case "auth/invalid-email":
                message =
                    "Email uliyoingiza si sahihi.";
                break;

            case "auth/weak-password":
                message =
                    "Password ni dhaifu. Tumia angalau characters 6.";
                break;

            case "auth/network-request-failed":
                message =
                    "Tatizo la internet. Jaribu tena.";
                break;

            default:
                message =
                    error.message || message;
        }

        setMessage(
            "signUpMessage",
            message,
            "error"
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent = "Create Account";
        }
    }
}


/* =========================================================
   17. LOGIN USER
   ========================================================= */

async function signInUser(event) {

    event.preventDefault();

    if (!auth) {

        setMessage(
            "signInMessage",
            "Firebase haijaunganishwa.",
            "error"
        );

        return;
    }

    const email =
        getElement("signInEmail")?.value.trim();

    const password =
        getElement("signInPassword")?.value;

    if (!email || !password) {

        setMessage(
            "signInMessage",
            "Weka email na password.",
            "error"
        );

        return;
    }

    const button =
        getElement("signInButton");

    if (button) {
        button.disabled = true;
        button.textContent = "Signing in...";
    }

    try {

        const credential =
            await auth.signInWithEmailAndPassword(
                email,
                password
            );

        currentUser =
            credential.user;

        await loadCurrentUserData();

        setMessage(
            "signInMessage",
            "Login successful.",
            "success"
        );

        setTimeout(() => {

            showAppScreen();

            loadUserDashboard();

        }, 500);

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        let message =
            "Login imeshindikana.";

        switch (error.code) {

            case "auth/invalid-email":
                message =
                    "Email uliyoingiza si sahihi.";
                break;

            case "auth/user-not-found":
                message =
                    "Hakuna account yenye email hii.";
                break;

            case "auth/wrong-password":
            case "auth/invalid-credential":
                message =
                    "Email au password si sahihi.";
                break;

            case "auth/user-disabled":
                message =
                    "Account hii imezuiwa.";
                break;

            case "auth/network-request-failed":
                message =
                    "Tatizo la internet. Jaribu tena.";
                break;

            default:
                message =
                    error.message || message;
        }

        setMessage(
            "signInMessage",
            message,
            "error"
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent = "Login";
        }
    }
}


/* =========================================================
   18. LOAD CURRENT USER DATA
   ========================================================= */

async function loadCurrentUserData() {

    if (!currentUser || !db) {
        return null;
    }

    try {

        const doc =
            await db
                .collection("users")
                .doc(currentUser.uid)
                .get();

        if (doc.exists) {

            currentUserData = {
                id: doc.id,
                ...doc.data()
            };

        } else {

            /*
             * Fallback if Auth exists but
             * Firestore document does not.
             */

            currentUserData = {

                uid: currentUser.uid,

                email:
                    currentUser.email || "",

                name:
                    currentUser.displayName || "Customer",

                phone: "",

                role:
                    currentUser.uid === ADMIN_UID
                        ? "admin"
                        : "customer",

                balance: 0,

                totalProfit: 0,

                totalWithdrawn: 0
            };
        }

        return currentUserData;

    } catch (error) {

        console.error(
            "Could not load user data:",
            error
        );

        return null;
    }
}


/* =========================================================
   19. LOAD DASHBOARD
   ========================================================= */

async function loadUserDashboard() {

    if (!currentUser) {
        return;
    }

    await loadCurrentUserData();

    if (!currentUserData) {
        return;
    }

    const nameElement =
        getElement("dashboardUserName");

    if (nameElement) {

        nameElement.textContent =
            currentUserData.name ||
            currentUser.email ||
            "Customer";
    }

    const balanceElement =
        getElement("walletBalance");

    if (balanceElement) {

        balanceElement.textContent =
            `TSh ${formatMoney(
                currentUserData.balance || 0
            )}`;
    }

    const profitElement =
        getElement("walletProfit");

    if (profitElement) {

        profitElement.textContent =
            `TSh ${formatMoney(
                currentUserData.totalProfit || 0
            )}`;
    }

    updateProfileDisplay();

    updateReferralDisplay();

    updateAdminVisibility();
}


/* =========================================================
   20. UPDATE PROFILE DISPLAY
   ========================================================= */

function updateProfileDisplay() {

    if (!currentUserData) {
        return;
    }

    const name =
        getElement("profileName");

    const email =
        getElement("profileEmail");

    const phone =
        getElement("profilePhone");

    const referral =
        getElement("profileReferralCode");

    if (name) {
        name.textContent =
            currentUserData.name || "-";
    }

    if (email) {
        email.textContent =
            currentUserData.email ||
            currentUser?.email ||
            "-";
    }

    if (phone) {
        phone.textContent =
            currentUserData.phone || "-";
    }

    if (referral) {
        referral.textContent =
            currentUserData.referralCode || "-";
    }
}


/* =========================================================
   21. UPDATE REFERRAL DISPLAY
   ========================================================= */

function updateReferralDisplay() {

    if (!currentUserData) {
        return;
    }

    const code =
        currentUserData.referralCode || "";

    const link =
        currentUserData.referralLink ||
        generateReferralLink(code);

    const codeElement =
        getElement("userReferralCode");

    const linkElement =
        getElement("userReferralLink");

    if (codeElement) {
        codeElement.textContent =
            code || "-";
    }

    if (linkElement) {
        linkElement.textContent =
            link || "-";
        linkElement.value =
            link;
    }
}


/* =========================================================
   22. ADMIN VISIBILITY
   ========================================================= */

function updateAdminVisibility() {

    const adminSection =
        getElement("adminSection");

    if (!adminSection) {
        return;
    }

    if (
        currentUser &&
        currentUser.uid === ADMIN_UID
    ) {

        showElement("adminSection");

    } else {

        hideElement("adminSection");
    }
}


/* =========================================================
   23. FORGOT PASSWORD
   ========================================================= */

async function resetPassword(event) {

    event.preventDefault();

    if (!auth) {
        return;
    }

    const email =
        getElement("forgotPasswordEmail")
            ?.value.trim();

    if (!email) {

        setMessage(
            "forgotPasswordMessage",
            "Weka email yako.",
            "error"
        );

        return;
    }

    const button =
        getElement("forgotPasswordButton");

    if (button) {
        button.disabled = true;
        button.textContent = "Sending...";
    }

    try {

        await auth.sendPasswordResetEmail(
            email
        );

        setMessage(
            "forgotPasswordMessage",
            "Email ya kubadilisha password imetumwa. Angalia inbox yako.",
            "success"
        );

    } catch (error) {

        console.error(
            "Password reset error:",
            error
        );

        let message =
            "Imeshindikana kutuma reset email.";

        if (
            error.code ===
            "auth/user-not-found"
        ) {

            message =
                "Hakuna account yenye email hii.";
        }

        setMessage(
            "forgotPasswordMessage",
            message,
            "error"
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent = "Send Reset Email";
        }
    }
}


/* =========================================================
   24. LOGOUT
   ========================================================= */

async function signOutUser() {

    if (!auth) {
        return;
    }

    try {

        await auth.signOut();

        currentUser = null;
        currentUserData = null;

        showAuthScreen();

        console.log(
            "User signed out successfully."
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );
    }
}


/* =========================================================
   25. COPY REFERRAL LINK
   ========================================================= */

async function copyReferralLink() {

    const linkElement =
        getElement("userReferralLink");

    if (!linkElement) {
        return;
    }

    const link =
        linkElement.value ||
        linkElement.textContent;

    if (!link || link === "-") {
        return;
    }

    try {

        await navigator.clipboard.writeText(
            link
        );

        const button =
            getElement("copyReferralButton");

        if (button) {

            const oldText =
                button.textContent;

            button.textContent =
                "Copied!";

            setTimeout(() => {

                button.textContent =
                    oldText;

            }, 1500);
        }

    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );
    }
}


/* =========================================================
   26. AUTH STATE LISTENER
   ========================================================= */

function initializeAuthListener() {

    if (!auth) {
        return;
    }

    auth.onAuthStateChanged(
        async user => {

            if (user) {

                currentUser = user;

                await loadCurrentUserData();

                showAppScreen();

                await loadUserDashboard();

            } else {

                currentUser = null;
                currentUserData = null;

                showAuthScreen();
            }
        }
    );
}


/* =========================================================
   27. BUTTON EVENTS
   ========================================================= */

function bindEvents() {

    /* Login form */

    const signInForm =
        getElement("signInForm");

    if (signInForm) {

        signInForm.addEventListener(
            "submit",
            signInUser
        );
    }


    /* Register form */

    const signUpForm =
        getElement("signUpForm");

    if (signUpForm) {

        signUpForm.addEventListener(
            "submit",
            registerUser
        );
    }


    /* Forgot password */

    const forgotPasswordForm =
        getElement("forgotPasswordForm");

    if (forgotPasswordForm) {

        forgotPasswordForm.addEventListener(
            "submit",
            resetPassword
        );
    }


    /* Show register */

    const showRegisterButton =
        getElement("showRegisterButton");

    if (showRegisterButton) {

        showRegisterButton.addEventListener(
            "click",
            showRegisterPanel
        );
    }


    /* Show login */

    const showLoginButton =
        getElement("showLoginButton");

    if (showLoginButton) {

        showLoginButton.addEventListener(
            "click",
            showLoginPanel
        );
    }


    /* Forgot password */

    const showForgotPasswordButton =
        getElement("showForgotPasswordButton");

    if (showForgotPasswordButton) {

        showForgotPasswordButton.addEventListener(
            "click",
            showForgotPasswordPanel
        );
    }


    /* Back to login */

    const backToLoginButton =
        getElement("backToLoginButton");

    if (backToLoginButton) {

        backToLoginButton.addEventListener(
            "click",
            showLoginPanel
        );
    }


    /* Logout */

    const signOutButton =
        getElement("signOutButton");

    if (signOutButton) {

        signOutButton.addEventListener(
            "click",
            signOutUser
        );
    }


    /* Dashboard buttons */

    const viewRoomsButton =
        getElement("viewRoomsButton");

    if (viewRoomsButton) {

        viewRoomsButton.addEventListener(
            "click",
            () => showSection("roomsSection")
        );
    }


    const myBookingsButton =
        getElement("myBookingsButton");

    if (myBookingsButton) {

        myBookingsButton.addEventListener(
            "click",
            () => showSection("myBookingsSection")
        );
    }


    const withdrawButton =
        getElement("withdrawButton");

    if (withdrawButton) {

        withdrawButton.addEventListener(
            "click",
            () => showSection("withdrawalSection")
        );
    }


    const referralButton =
        getElement("referralButton");

    if (referralButton) {

        referralButton.addEventListener(
            "click",
            () => showSection("referralSection")
        );
    }


    /* Copy referral */

    const copyReferralButton =
        getElement("copyReferralButton");

    if (copyReferralButton) {

        copyReferralButton.addEventListener(
            "click",
            copyReferralLink
        );
    }


    /* Bottom navigation */

    const homeNavButton =
        getElement("homeNavButton");

    if (homeNavButton) {

        homeNavButton.addEventListener(
            "click",
            () => showSection("dashboardSection")
        );
    }


    const roomsNavButton =
        getElement("roomsNavButton");

    if (roomsNavButton) {

        roomsNavButton.addEventListener(
            "click",
            () => showSection("roomsSection")
        );
    }


    const bookingsNavButton =
        getElement("bookingsNavButton");

    if (bookingsNavButton) {

        bookingsNavButton.addEventListener(
            "click",
            () => showSection("myBookingsSection")
        );
    }


    const accountNavButton =
        getElement("accountNavButton");

    if (accountNavButton) {

        accountNavButton.addEventListener(
            "click",
            () => showSection("accountSection")
        );
    }


    const moreNavButton =
        getElement("moreNavButton");

    if (moreNavButton) {

        moreNavButton.addEventListener(
            "click",
            () => showSection("notificationsSection")
        );
    }


    /* Back buttons */

    const backButtons = [
        ["roomsBackButton", "dashboardSection"],
        ["bookingBackButton", "roomsSection"],
        ["myBookingsBackButton", "dashboardSection"],
        ["withdrawalBackButton", "dashboardSection"],
        ["withdrawalHistoryBackButton", "withdrawalSection"],
        ["referralBackButton", "dashboardSection"],
        ["notificationsBackButton", "dashboardSection"],
        ["transactionsBackButton", "dashboardSection"],
        ["accountBackButton", "dashboardSection"]
    ];

    backButtons.forEach(
        ([buttonId, sectionId]) => {

            const button =
                getElement(buttonId);

            if (button) {

                button.addEventListener(
                    "click",
                    () => showSection(sectionId)
                );
            }
        }
    );
}


/* =========================================================
   28. INITIALIZE ROOMRENT
   ========================================================= */

function initializeRoomRent() {

    console.log(
        "Initializing RoomRent..."
    );

    loadReferralFromURL();

    bindEvents();

    initializeAuthListener();

    console.log(
        "RoomRent initialization complete."
    );
}


/* =========================================================
   29. START WHEN DOM IS READY
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeRoomRent
    );

} else {

    initializeRoomRent();
}

/* =========================================================
   ROOMRENT - SCRIPT.JS
   SEHEMU YA 2
   ROOMS + FIRESTORE + BOOKING LIMITS
   ========================================================= */


/* =========================================================
   30. ROOM SETTINGS
   ========================================================= */

const ROOM_DURATION_DAYS = 90;

const ROOM_PROFIT_RATE_PER_DAY = 0.04;


/* =========================================================
   31. ROOM DATA
   ========================================================= */

const ROOM_DATA = [

    {
        roomNumber: "0023",
        price: 30000,
        profitPerDay: 1200,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 2
    },

    {
        roomNumber: "0024",
        price: 70000,
        profitPerDay: 2800,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0025",
        price: 140000,
        profitPerDay: 5600,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0026",
        price: 210000,
        profitPerDay: 8400,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0027",
        price: 280000,
        profitPerDay: 11200,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0028",
        price: 350000,
        profitPerDay: 14000,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0029",
        price: 420000,
        profitPerDay: 16800,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0030",
        price: 490000,
        profitPerDay: 19600,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0031",
        price: 560000,
        profitPerDay: 22400,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0032",
        price: 630000,
        profitPerDay: 25200,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    }

];


/* =========================================================
   32. GET ROOM BY NUMBER
   ========================================================= */

function getRoomByNumber(roomNumber) {

    return ROOM_DATA.find(
        room =>
            room.roomNumber === String(roomNumber)
    );
}


/* =========================================================
   33. CALCULATE TOTAL EXPECTED PROFIT
   ========================================================= */

function calculateRoomTotalProfit(room) {

    if (!room) {
        return 0;
    }

    return (
        Number(room.profitPerDay || 0) *
        Number(room.durationDays || ROOM_DURATION_DAYS)
    );
}


/* =========================================================
   34. CALCULATE TOTAL RETURN
   ========================================================= */

function calculateRoomTotalReturn(room) {

    if (!room) {
        return 0;
    }

    return (
        Number(room.price || 0) +
        calculateRoomTotalProfit(room)
    );
}


/* =========================================================
   35. LOAD ROOMS
   ========================================================= */

async function loadRooms() {

    const roomsList =
        getElement("roomsList");

    if (!roomsList) {
        return;
    }

    roomsList.innerHTML = `
        <div class="loading-state">
            Loading rooms...
        </div>
    `;

    try {

        /*
         * First use Firestore room documents
         * if the admin has created them.
         */

        let firestoreRooms = [];

        if (db) {

            const snapshot =
                await db
                    .collection("rooms")
                    .orderBy("roomNumber")
                    .get();

            firestoreRooms =
                snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
        }


        /*
         * If Firestore has rooms, use them.
         * Otherwise use the official RoomRent
         * default room configuration.
         */

        let rooms = [];

        if (firestoreRooms.length > 0) {

            rooms = firestoreRooms.map(
                firestoreRoom => {

                    const defaultRoom =
                        getRoomByNumber(
                            firestoreRoom.roomNumber
                        );

                    return {
                        ...(defaultRoom || {}),
                        ...firestoreRoom
                    };
                }
            );

        } else {

            rooms = ROOM_DATA;
        }


        if (!rooms.length) {

            roomsList.innerHTML = `
                <div class="empty-state">
                    Hakuna rooms zilizopatikana.
                </div>
            `;

            return;
        }


        /*
         * Render all rooms
         */

        roomsList.innerHTML = "";

        for (const room of rooms) {

            const card =
                await createRoomCard(room);

            roomsList.appendChild(card);
        }

    } catch (error) {

        console.error(
            "Loading rooms error:",
            error
        );

        /*
         * If Firestore query fails,
         * still show the default rooms.
         */

        roomsList.innerHTML = "";

        for (const room of ROOM_DATA) {

            const card =
                await createRoomCard(room);

            roomsList.appendChild(card);
        }
    }
}


/* =========================================================
   36. CREATE ROOM CARD
   ========================================================= */

async function createRoomCard(room) {

    const card =
        document.createElement("div");

    card.className = "room-card";


    const price =
        Number(room.price || 0);

    const profitPerDay =
        Number(room.profitPerDay || 0);

    const duration =
        Number(
            room.durationDays ||
            ROOM_DURATION_DAYS
        );

    const totalProfit =
        calculateRoomTotalProfit(room);

    const totalReturn =
        calculateRoomTotalReturn(room);

    const imageUrl =
        room.imageUrl ||
        room.image ||
        "";


    /*
     * Check how many times the current
     * customer has booked this room.
     */

    let bookingCount = 0;

    if (currentUser) {

        bookingCount =
            await getUserRoomBookingCount(
                currentUser.uid,
                room.roomNumber
            );
    }


    const maxPerUser =
        Number(
            room.maxPerUser ||
            (
                room.roomNumber === "0023"
                    ? 2
                    : 4
            )
        );


    const remaining =
        Math.max(
            maxPerUser - bookingCount,
            0
        );


    let imageHTML = "";

    if (imageUrl) {

        imageHTML = `
            <div class="room-image">
                <img
                    src="${escapeHTML(imageUrl)}"
                    alt="Room ${escapeHTML(room.roomNumber)}"
                    loading="lazy"
                >
            </div>
        `;
    }


    let limitHTML = `
        <div class="room-limit">
            Your bookings:
            <strong>${bookingCount}/${maxPerUser}</strong>
        </div>
    `;


    let buttonHTML = "";


    if (!currentUser) {

        buttonHTML = `
            <button
                type="button"
                class="primary-button"
                data-room-login="true"
            >
                Login to Rent
            </button>
        `;

    } else if (remaining <= 0) {

        buttonHTML = `
            <button
                type="button"
                class="secondary-button"
                disabled
            >
                Limit Reached
            </button>
        `;

    } else {

        buttonHTML = `
            <button
                type="button"
                class="primary-button"
                data-book-room="${escapeHTML(room.roomNumber)}"
            >
                Rent This Room
            </button>
        `;
    }


    card.innerHTML = `

        ${imageHTML}

        <div class="room-card-body">

            <div class="room-card-header">

                <h3>
                    Room ${escapeHTML(room.roomNumber)}
                </h3>

                <span class="status-badge active">
                    Active
                </span>

            </div>


            <div class="room-price">

                <span>Investment</span>

                <strong>
                    TSh ${formatMoney(price)}
                </strong>

            </div>


            <div class="room-details">

                <div>
                    <span>Daily Profit</span>
                    <strong>
                        TSh ${formatMoney(profitPerDay)}
                    </strong>
                </div>


                <div>
                    <span>Duration</span>
                    <strong>
                        ${duration} days
                    </strong>
                </div>


                <div>
                    <span>Total Profit</span>
                    <strong>
                        TSh ${formatMoney(totalProfit)}
                    </strong>
                </div>


                <div>
                    <span>Total Return</span>
                    <strong>
                        TSh ${formatMoney(totalReturn)}
                    </strong>
                </div>

            </div>


            ${limitHTML}


            <div class="room-card-action">

                ${buttonHTML}

            </div>

        </div>
    `;


    /*
     * Rent button
     */

    const rentButton =
        card.querySelector(
            "[data-book-room]"
        );

    if (rentButton) {

        rentButton.addEventListener(
            "click",
            () => {

                const roomNumber =
                    rentButton.getAttribute(
                        "data-book-room"
                    );

                openBookingPage(roomNumber);
            }
        );
    }


    /*
     * Login button
     */

    const loginButton =
        card.querySelector(
            "[data-room-login]"
        );

    if (loginButton) {

        loginButton.addEventListener(
            "click",
            () => {

                showAuthScreen();
                showLoginPanel();
            }
        );
    }


    return card;
}


/* =========================================================
   37. ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   38. GET USER ROOM BOOKING COUNT
   ========================================================= */

async function getUserRoomBookingCount(
    uid,
    roomNumber
) {

    if (!uid || !db) {
        return 0;
    }

    try {

        const snapshot =
            await db
                .collection("bookings")
                .where(
                    "userId",
                    "==",
                    uid
                )
                .where(
                    "roomNumber",
                    "==",
                    String(roomNumber)
                )
                .get();

        return snapshot.size;

    } catch (error) {

        console.error(
            "Booking count error:",
            error
        );

        return 0;
    }
}


/* =========================================================
   39. GET USER TOTAL ROOM BOOKINGS
   ========================================================= */

async function getUserBookings(uid) {

    if (!uid || !db) {
        return [];
    }

    try {

        const snapshot =
            await db
                .collection("bookings")
                .where(
                    "userId",
                    "==",
                    uid
                )
                .get();

        return snapshot.docs.map(
            doc => ({
                id: doc.id,
                ...doc.data()
            })
        );

    } catch (error) {

        console.error(
            "Getting bookings error:",
            error
        );

        return [];
    }
}


/* =========================================================
   40. OPEN BOOKING PAGE
   ========================================================= */

async function openBookingPage(roomNumber) {

    if (!currentUser) {

        showAuthScreen();
        showLoginPanel();

        return;
    }


    const room =
        getRoomByNumber(roomNumber);


    if (!room) {

        alert(
            "Room hii haijapatikana."
        );

        return;
    }


    /*
     * IMPORTANT:
     * Check Firestore again before opening
     * the booking screen.
     */

    const bookingCount =
        await getUserRoomBookingCount(
            currentUser.uid,
            room.roomNumber
        );


    const maxPerUser =
        room.roomNumber === "0023"
            ? 2
            : 4;


    if (bookingCount >= maxPerUser) {

        alert(
            `Umefikia limit ya Room ${room.roomNumber}.`
        );

        await loadRooms();

        return;
    }


    showSection("bookingSection");

    renderBookingPage(
        room,
        bookingCount,
        maxPerUser
    );
}


/* =========================================================
   41. RENDER BOOKING PAGE
   ========================================================= */

function renderBookingPage(
    room,
    bookingCount,
    maxPerUser
) {

    const bookingContent =
        getElement("bookingContent");

    if (!bookingContent) {
        return;
    }


    const totalProfit =
        calculateRoomTotalProfit(room);

    const totalReturn =
        calculateRoomTotalReturn(room);


    bookingContent.innerHTML = `

        <div class="booking-card">

            <div class="booking-header">

                <h2>
                    Room ${escapeHTML(
                        room.roomNumber
                    )}
                </h2>

                <p>
                    Confirm your rental
                </p>

            </div>


            <div class="booking-summary">

                <div>
                    <span>Investment</span>

                    <strong>
                        TSh ${formatMoney(
                            room.price
                        )}
                    </strong>
                </div>


                <div>
                    <span>Daily Profit</span>

                    <strong>
                        TSh ${formatMoney(
                            room.profitPerDay
                        )}
                    </strong>
                </div>


                <div>
                    <span>Duration</span>

                    <strong>
                        ${room.durationDays} days
                    </strong>
                </div>


                <div>
                    <span>Total Expected Profit</span>

                    <strong>
                        TSh ${formatMoney(
                            totalProfit
                        )}
                    </strong>
                </div>


                <div>
                    <span>Total Expected Return</span>

                    <strong>
                        TSh ${formatMoney(
                            totalReturn
                        )}
                    </strong>
                </div>


                <div>
                    <span>Your Room Limit</span>

                    <strong>
                        ${bookingCount}/${maxPerUser}
                    </strong>
                </div>

            </div>


            <div class="info-card">

                <strong>
                    Important
                </strong>

                <p>
                    Baada ya booking kutengenezwa,
                    malipo yatahitaji kuthibitishwa
                    na admin kabla ya rental kuanza.
                </p>

            </div>


            <div class="booking-actions">

                <button
                    type="button"
                    class="primary-button"
                    id="confirmRoomBookingButton"
                >
                    Confirm Rental
                </button>


                <button
                    type="button"
                    class="secondary-button"
                    id="cancelRoomBookingButton"
                >
                    Cancel
                </button>

            </div>

        </div>
    `;


    const confirmButton =
        getElement(
            "confirmRoomBookingButton"
        );

    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            () => {

                createRoomBooking(room);
            }
        );
    }


    const cancelButton =
        getElement(
            "cancelRoomBookingButton"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            () => {

                showSection("roomsSection");
                loadRooms();
            }
        );
    }
}


/* =========================================================
   42. GENERATE BOOKING NUMBER
   ========================================================= */

function generateBookingNumber() {

    const timestamp =
        Date.now().toString(36)
            .toUpperCase();

    const random =
        Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase();

    return `RR-${timestamp}-${random}`;
}


/* =========================================================
   43. CREATE ROOM BOOKING
   ========================================================= */

async function createRoomBooking(room) {

    if (!currentUser || !db) {

        alert(
            "Tafadhali login kwanza."
        );

        return;
    }


    const confirmButton =
        getElement(
            "confirmRoomBookingButton"
        );


    if (confirmButton) {

        confirmButton.disabled = true;

        confirmButton.textContent =
            "Creating booking...";
    }


    try {

        /*
         * Re-check booking count immediately
         * before creating the document.
         */

        const existingBookings =
            await getUserRoomBookingCount(
                currentUser.uid,
                room.roomNumber
            );


        const maxPerUser =
            room.roomNumber === "0023"
                ? 2
                : 4;


        if (existingBookings >= maxPerUser) {

            throw new Error(
                "Umefikia booking limit ya room hii."
            );
        }


        /*
         * Get latest customer information.
         */

        await loadCurrentUserData();


        /*
         * Generate unique booking number.
         */

        const bookingNumber =
            generateBookingNumber();


        /*
         * Create Firestore booking.
         */

        const bookingData = {

            bookingNumber:
                bookingNumber,

            userId:
                currentUser.uid,

            userEmail:
                currentUser.email || "",

            userName:
                currentUserData?.name || "",

            userPhone:
                currentUserData?.phone || "",

            roomNumber:
                room.roomNumber,

            roomPrice:
                Number(room.price || 0),

            profitPerDay:
                Number(room.profitPerDay || 0),

            durationDays:
                Number(
                    room.durationDays ||
                    ROOM_DURATION_DAYS
                ),

            expectedTotalProfit:
                calculateRoomTotalProfit(room),

            expectedTotalReturn:
                calculateRoomTotalReturn(room),

            bookingCountForRoom:
                existingBookings + 1,

            status:
                "pending_payment",

            paymentStatus:
                "pending",

            rentalStatus:
                "not_started",

            profitStarted:
                false,

            totalProfitPaid:
                0,

            amountPaid:
                0,

            createdAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()
        };


        /*
         * Create booking document.
         */

        const bookingRef =
            await db
                .collection("bookings")
                .add(bookingData);


        /*
         * Create customer transaction.
         */

        await db
            .collection("users")
            .doc(currentUser.uid)
            .collection("transactions")
            .add({

                type:
                    "booking_created",

                bookingId:
                    bookingRef.id,

                bookingNumber:
                    bookingNumber,

                roomNumber:
                    room.roomNumber,

                amount:
                    Number(room.price || 0),

                status:
                    "pending_payment",

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()
            });


        alert(
            `Booking imeundwa!\n\nBooking Number: ${bookingNumber}\n\nTafadhali fuata maelekezo ya malipo na subiri uthibitisho wa admin.`
        );


        showSection(
            "myBookingsSection"
        );


        await loadMyBookings();


    } catch (error) {

        console.error(
            "Create booking error:",
            error
        );

        alert(
            error.message ||
            "Imeshindikana kutengeneza booking."
        );

    } finally {

        if (confirmButton) {

            confirmButton.disabled = false;

            confirmButton.textContent =
                "Confirm Rental";
        }
    }
}


/* =========================================================
   44. LOAD MY BOOKINGS
   ========================================================= */

async function loadMyBookings() {

    const list =
        getElement("myBookingsList");

    if (!list || !currentUser) {
        return;
    }


    list.innerHTML = `
        <div class="loading-state">
            Loading your bookings...
        </div>
    `;


    try {

        const bookings =
            await getUserBookings(
                currentUser.uid
            );


        if (!bookings.length) {

            list.innerHTML = `
                <div class="empty-state">
                    <h3>No bookings yet</h3>

                    <p>
                        Bado hujakodisha room yoyote.
                    </p>
                </div>
            `;

            return;
        }


        /*
         * Sort newest first.
         */

        bookings.sort(
            (a, b) => {

                const aTime =
                    a.createdAt?.toMillis?.() || 0;

                const bTime =
                    b.createdAt?.toMillis?.() || 0;

                return bTime - aTime;
            }
        );


        list.innerHTML = "";


        bookings.forEach(
            booking => {

                const card =
                    createBookingCard(
                        booking
                    );

                list.appendChild(card);
            }
        );

    } catch (error) {

        console.error(
            "Load my bookings error:",
            error
        );

        list.innerHTML = `
            <div class="empty-state">
                Imeshindikana kupakia bookings.
            </div>
        `;
    }
}


/* =========================================================
   45. CREATE BOOKING CARD
   ========================================================= */

function createBookingCard(booking) {

    const card =
        document.createElement("div");

    card.className =
        "booking-history-card";


    const createdAt =
        formatFirestoreDate(
            booking.createdAt
        );


    const status =
        booking.status ||
        "pending_payment";


    const statusLabel =
        formatBookingStatus(status);


    card.innerHTML = `

        <div class="booking-card-header">

            <div>

                <h3>
                    Room ${escapeHTML(
                        booking.roomNumber
                    )}
                </h3>

                <small>
                    ${escapeHTML(
                        booking.bookingNumber || ""
                    )}
                </small>

            </div>


            <span class="status-badge">

                ${escapeHTML(
                    statusLabel
                )}

            </span>

        </div>


        <div class="booking-card-details">

            <div>

                <span>Investment</span>

                <strong>
                    TSh ${formatMoney(
                        booking.roomPrice || 0
                    )}
                </strong>

            </div>


            <div>

                <span>Daily Profit</span>

                <strong>
                    TSh ${formatMoney(
                        booking.profitPerDay || 0
                    )}
                </strong>

            </div>


            <div>

                <span>Duration</span>

                <strong>
                    ${booking.durationDays || 90}
                    days
                </strong>

            </div>


            <div>

                <span>Payment</span>

                <strong>
                    ${escapeHTML(
                        formatBookingStatus(
                            booking.paymentStatus ||
                            "pending"
                        )
                    )}
                </strong>

            </div>

        </div>


        <div class="booking-card-footer">

            <span>
                ${createdAt}
            </span>

        </div>
    `;


    return card;
}


/* =========================================================
   46. FORMAT BOOKING STATUS
   ========================================================= */

function formatBookingStatus(status) {

    const statuses = {

        pending_payment:
            "Pending Payment",

        payment_submitted:
            "Payment Submitted",

        payment_confirmed:
            "Payment Confirmed",

        active:
            "Active",

        completed:
            "Completed",

        cancelled:
            "Cancelled",

        rejected:
            "Rejected",

        pending:
            "Pending"
    };


    return statuses[status] ||
        String(status)
            .replace(/_/g, " ");
}


/* =========================================================
   47. FORMAT FIRESTORE DATE
   ========================================================= */

function formatFirestoreDate(timestamp) {

    if (!timestamp) {
        return "-";
    }


    try {

        const date =
            timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);


        return new Intl.DateTimeFormat(
            "en-TZ",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        ).format(date);

    } catch (error) {

        return "-";
    }
}


/* =========================================================
   48. CONNECT ROOM BUTTON
   ========================================================= */

function bindRoomSectionEvents() {

    const roomsNavButton =
        getElement("roomsNavButton");

    if (roomsNavButton) {

        roomsNavButton.addEventListener(
            "click",
            async () => {

                showSection(
                    "roomsSection"
                );

                await loadRooms();
            }
        );
    }


    const viewRoomsButton =
        getElement("viewRoomsButton");

    if (viewRoomsButton) {

        viewRoomsButton.addEventListener(
            "click",
            async () => {

                showSection(
                    "roomsSection"
                );

                await loadRooms();
            }
        );
    }


    const bookingsNavButton =
        getElement("bookingsNavButton");

    if (bookingsNavButton) {

        bookingsNavButton.addEventListener(
            "click",
            async () => {

                showSection(
                    "myBookingsSection"
                );

                await loadMyBookings();
            }
        );
    }


    const myBookingsButton =
        getElement("myBookingsButton");

    if (myBookingsButton) {

        myBookingsButton.addEventListener(
            "click",
            async () => {

                showSection(
                    "myBookingsSection"
                );

                await loadMyBookings();
            }
        );
    }
}


/* =========================================================
   49. EXTEND INITIALIZATION
   ========================================================= */

const originalInitializeRoomRent =
    initializeRoomRent;


initializeRoomRent = function () {

    originalInitializeRoomRent();

    bindRoomSectionEvents();

};/* =========================================================
   ROOMRENT - SCRIPT.JS
   SEHEMU YA 2
   ROOMS + FIRESTORE + BOOKING LIMITS
   ========================================================= */


/* =========================================================
   30. ROOM SETTINGS
   ========================================================= */

const ROOM_DURATION_DAYS = 90;

const ROOM_PROFIT_RATE_PER_DAY = 0.04;


/* =========================================================
   31. ROOM DATA
   ========================================================= */

const ROOM_DATA = [

    {
        roomNumber: "0023",
        price: 30000,
        profitPerDay: 1200,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 2
    },

    {
        roomNumber: "0024",
        price: 70000,
        profitPerDay: 2800,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0025",
        price: 140000,
        profitPerDay: 5600,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0026",
        price: 210000,
        profitPerDay: 8400,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0027",
        price: 280000,
        profitPerDay: 11200,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0028",
        price: 350000,
        profitPerDay: 14000,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0029",
        price: 420000,
        profitPerDay: 16800,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0030",
        price: 490000,
        profitPerDay: 19600,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0031",
        price: 560000,
        profitPerDay: 22400,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    },

    {
        roomNumber: "0032",
        price: 630000,
        profitPerDay: 25200,
        durationDays: ROOM_DURATION_DAYS,
        maxPerUser: 4
    }

];


/* =========================================================
   32. GET ROOM BY NUMBER
   ========================================================= */

function getRoomByNumber(roomNumber) {

    return ROOM_DATA.find(
        room =>
            room.roomNumber === String(roomNumber)
    );
}


/* =========================================================
   33. CALCULATE TOTAL EXPECTED PROFIT
   ========================================================= */

function calculateRoomTotalProfit(room) {

    if (!room) {
        return 0;
    }

    return (
        Number(room.profitPerDay || 0) *
        Number(room.durationDays || ROOM_DURATION_DAYS)
    );
}


/* =========================================================
   34. CALCULATE TOTAL RETURN
   ========================================================= */

function calculateRoomTotalReturn(room) {

    if (!room) {
        return 0;
    }

    return (
        Number(room.price || 0) +
        calculateRoomTotalProfit(room)
    );
}


/* =========================================================
   35. LOAD ROOMS
   ========================================================= */

async function loadRooms() {

    const roomsList =
        getElement("roomsList");

    if (!roomsList) {
        return;
    }

    roomsList.innerHTML = `
        <div class="loading-state">
            Loading rooms...
        </div>
    `;

    try {

        /*
         * First use Firestore room documents
         * if the admin has created them.
         */

        let firestoreRooms = [];

        if (db) {

            const snapshot =
                await db
                    .collection("rooms")
                    .orderBy("roomNumber")
                    .get();

            firestoreRooms =
                snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
        }


        /*
         * If Firestore has rooms, use them.
         * Otherwise use the official RoomRent
         * default room configuration.
         */

        let rooms = [];

        if (firestoreRooms.length > 0) {

            rooms = firestoreRooms.map(
                firestoreRoom => {

                    const defaultRoom =
                        getRoomByNumber(
                            firestoreRoom.roomNumber
                        );

                    return {
                        ...(defaultRoom || {}),
                        ...firestoreRoom
                    };
                }
            );

        } else {

            rooms = ROOM_DATA;
        }


        if (!rooms.length) {

            roomsList.innerHTML = `
                <div class="empty-state">
                    Hakuna rooms zilizopatikana.
                </div>
            `;

            return;
        }


        /*
         * Render all rooms
         */

        roomsList.innerHTML = "";

        for (const room of rooms) {

            const card =
                await createRoomCard(room);

            roomsList.appendChild(card);
        }

    } catch (error) {

        console.error(
            "Loading rooms error:",
            error
        );

        /*
         * If Firestore query fails,
         * still show the default rooms.
         */

        roomsList.innerHTML = "";

        for (const room of ROOM_DATA) {

            const card =
                await createRoomCard(room);

            roomsList.appendChild(card);
        }
    }
}


/* =========================================================
   36. CREATE ROOM CARD
   ========================================================= */

async function createRoomCard(room) {

    const card =
        document.createElement("div");

    card.className = "room-card";


    const price =
        Number(room.price || 0);

    const profitPerDay =
        Number(room.profitPerDay || 0);

    const duration =
        Number(
            room.durationDays ||
            ROOM_DURATION_DAYS
        );

    const totalProfit =
        calculateRoomTotalProfit(room);

    const totalReturn =
        calculateRoomTotalReturn(room);

    const imageUrl =
        room.imageUrl ||
        room.image ||
        "";


    /*
     * Check how many times the current
     * customer has booked this room.
     */

    let bookingCount = 0;

    if (currentUser) {

        bookingCount =
            await getUserRoomBookingCount(
                currentUser.uid,
                room.roomNumber
            );
    }


    const maxPerUser =
        Number(
            room.maxPerUser ||
            (
                room.roomNumber === "0023"
                    ? 2
                    : 4
            )
        );


    const remaining =
        Math.max(
            maxPerUser - bookingCount,
            0
        );


    let imageHTML = "";

    if (imageUrl) {

        imageHTML = `
            <div class="room-image">
                <img
                    src="${escapeHTML(imageUrl)}"
                    alt="Room ${escapeHTML(room.roomNumber)}"
                    loading="lazy"
                >
            </div>
        `;
    }


    let limitHTML = `
        <div class="room-limit">
            Your bookings:
            <strong>${bookingCount}/${maxPerUser}</strong>
        </div>
    `;


    let buttonHTML = "";


    if (!currentUser) {

        buttonHTML = `
            <button
                type="button"
                class="primary-button"
                data-room-login="true"
            >
                Login to Rent
            </button>
        `;

    } else if (remaining <= 0) {

        buttonHTML = `
            <button
                type="button"
                class="secondary-button"
                disabled
            >
                Limit Reached
            </button>
        `;

    } else {

        buttonHTML = `
            <button
                type="button"
                class="primary-button"
                data-book-room="${escapeHTML(room.roomNumber)}"
            >
                Rent This Room
            </button>
        `;
    }


    card.innerHTML = `

        ${imageHTML}

        <div class="room-card-body">

            <div class="room-card-header">

                <h3>
                    Room ${escapeHTML(room.roomNumber)}
                </h3>

                <span class="status-badge active">
                    Active
                </span>

            </div>


            <div class="room-price">

                <span>Investment</span>

                <strong>
                    TSh ${formatMoney(price)}
                </strong>

            </div>


            <div class="room-details">

                <div>
                    <span>Daily Profit</span>
                    <strong>
                        TSh ${formatMoney(profitPerDay)}
                    </strong>
                </div>


                <div>
                    <span>Duration</span>
                    <strong>
                        ${duration} days
                    </strong>
                </div>


                <div>
                    <span>Total Profit</span>
                    <strong>
                        TSh ${formatMoney(totalProfit)}
                    </strong>
                </div>


                <div>
                    <span>Total Return</span>
                    <strong>
                        TSh ${formatMoney(totalReturn)}
                    </strong>
                </div>

            </div>


            ${limitHTML}


            <div class="room-card-action">

                ${buttonHTML}

            </div>

        </div>
    `;


    /*
     * Rent button
     */

    const rentButton =
        card.querySelector(
            "[data-book-room]"
        );

    if (rentButton) {

        rentButton.addEventListener(
            "click",
            () => {

                const roomNumber =
                    rentButton.getAttribute(
                        "data-book-room"
                    );

                openBookingPage(roomNumber);
            }
        );
    }


    /*
     * Login button
     */

    const loginButton =
        card.querySelector(
            "[data-room-login]"
        );

    if (loginButton) {

        loginButton.addEventListener(
            "click",
            () => {

                showAuthScreen();
                showLoginPanel();
            }
        );
    }


    return card;
}


/* =========================================================
   37. ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   38. GET USER ROOM BOOKING COUNT
   ========================================================= */

async function getUserRoomBookingCount(
    uid,
    roomNumber
) {

    if (!uid || !db) {
        return 0;
    }

    try {

        const snapshot =
            await db
                .collection("bookings")
                .where(
                    "userId",
                    "==",
                    uid
                )
                .where(
                    "roomNumber",
                    "==",
                    String(roomNumber)
                )
                .get();

        return snapshot.size;

    } catch (error) {

        console.error(
            "Booking count error:",
            error
        );

        return 0;
    }
}


/* =========================================================
   39. GET USER TOTAL ROOM BOOKINGS
   ========================================================= */

async function getUserBookings(uid) {

    if (!uid || !db) {
        return [];
    }

    try {

        const snapshot =
            await db
                .collection("bookings")
                .where(
                    "userId",
                    "==",
                    uid
                )
                .get();

        return snapshot.docs.map(
            doc => ({
                id: doc.id,
                ...doc.data()
            })
        );

    } catch (error) {

        console.error(
            "Getting bookings error:",
            error
        );

        return [];
    }
}


/* =========================================================
   40. OPEN BOOKING PAGE
   ========================================================= */

async function openBookingPage(roomNumber) {

    if (!currentUser) {

        showAuthScreen();
        showLoginPanel();

        return;
    }


    const room =
        getRoomByNumber(roomNumber);


    if (!room) {

        alert(
            "Room hii haijapatikana."
        );

        return;
    }


    /*
     * IMPORTANT:
     * Check Firestore again before opening
     * the booking screen.
     */

    const bookingCount =
        await getUserRoomBookingCount(
            currentUser.uid,
            room.roomNumber
        );


    const maxPerUser =
        room.roomNumber === "0023"
            ? 2
            : 4;


    if (bookingCount >= maxPerUser) {

        alert(
            `Umefikia limit ya Room ${room.roomNumber}.`
        );

        await loadRooms();

        return;
    }


    showSection("bookingSection");

    renderBookingPage(
        room,
        bookingCount,
        maxPerUser
    );
}


/* =========================================================
   41. RENDER BOOKING PAGE
   ========================================================= */

function renderBookingPage(
    room,
    bookingCount,
    maxPerUser
) {

    const bookingContent =
        getElement("bookingContent");

    if (!bookingContent) {
        return;
    }


    const totalProfit =
        calculateRoomTotalProfit(room);

    const totalReturn =
        calculateRoomTotalReturn(room);


    bookingContent.innerHTML = `

        <div class="booking-card">

            <div class="booking-header">

                <h2>
                    Room ${escapeHTML(
                        room.roomNumber
                    )}
                </h2>

                <p>
                    Confirm your rental
                </p>

            </div>


            <div class="booking-summary">

                <div>
                    <span>Investment</span>

                    <strong>
                        TSh ${formatMoney(
                            room.price
                        )}
                    </strong>
                </div>


                <div>
                    <span>Daily Profit</span>

                    <strong>
                        TSh ${formatMoney(
                            room.profitPerDay
                        )}
                    </strong>
                </div>


                <div>
                    <span>Duration</span>

                    <strong>
                        ${room.durationDays} days
                    </strong>
                </div>


                <div>
                    <span>Total Expected Profit</span>

                    <strong>
                        TSh ${formatMoney(
                            totalProfit
                        )}
                    </strong>
                </div>


                <div>
                    <span>Total Expected Return</span>

                    <strong>
                        TSh ${formatMoney(
                            totalReturn
                        )}
                    </strong>
                </div>


                <div>
                    <span>Your Room Limit</span>

                    <strong>
                        ${bookingCount}/${maxPerUser}
                    </strong>
                </div>

            </div>


            <div class="info-card">

                <strong>
                    Important
                </strong>

                <p>
                    Baada ya booking kutengenezwa,
                    malipo yatahitaji kuthibitishwa
                    na admin kabla ya rental kuanza.
                </p>

            </div>


            <div class="booking-actions">

                <button
                    type="button"
                    class="primary-button"
                    id="confirmRoomBookingButton"
                >
                    Confirm Rental
                </button>


                <button
                    type="button"
                    class="secondary-button"
                    id="cancelRoomBookingButton"
                >
                    Cancel
                </button>

            </div>

        </div>
    `;


    const confirmButton =
        getElement(
            "confirmRoomBookingButton"
        );

    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            () => {

                createRoomBooking(room);
            }
        );
    }


    const cancelButton =
        getElement(
            "cancelRoomBookingButton"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            () => {

                showSection("roomsSection");
                loadRooms();
            }
        );
    }
}


/* =========================================================
   42. GENERATE BOOKING NUMBER
   ========================================================= */

function generateBookingNumber() {

    const timestamp =
        Date.now().toString(36)
            .toUpperCase();

    const random =
        Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase();

    return `RR-${timestamp}-${random}`;
}


/* =========================================================
   43. CREATE ROOM BOOKING
   ========================================================= */

async function createRoomBooking(room) {

    if (!currentUser || !db) {

        alert(
            "Tafadhali login kwanza."
        );

        return;
    }


    const confirmButton =
        getElement(
            "confirmRoomBookingButton"
        );


    if (confirmButton) {

        confirmButton.disabled = true;

        confirmButton.textContent =
            "Creating booking...";
    }


    try {

        /*
         * Re-check booking count immediately
         * before creating the document.
         */

        const existingBookings =
            await getUserRoomBookingCount(
                currentUser.uid,
                room.roomNumber
            );


        const maxPerUser =
            room.roomNumber === "0023"
                ? 2
                : 4;


        if (existingBookings >= maxPerUser) {

            throw new Error(
                "Umefikia booking limit ya room hii."
            );
        }


        /*
         * Get latest customer information.
         */

        await loadCurrentUserData();


        /*
         * Generate unique booking number.
         */

        const bookingNumber =
            generateBookingNumber();


        /*
         * Create Firestore booking.
         */

        const bookingData = {

            bookingNumber:
                bookingNumber,

            userId:
                currentUser.uid,

            userEmail:
                currentUser.email || "",

            userName:
                currentUserData?.name || "",

            userPhone:
                currentUserData?.phone || "",

            roomNumber:
                room.roomNumber,

            roomPrice:
                Number(room.price || 0),

            profitPerDay:
                Number(room.profitPerDay || 0),

            durationDays:
                Number(
                    room.durationDays ||
                    ROOM_DURATION_DAYS
                ),

            expectedTotalProfit:
                calculateRoomTotalProfit(room),

            expectedTotalReturn:
                calculateRoomTotalReturn(room),

            bookingCountForRoom:
                existingBookings + 1,

            status:
                "pending_payment",

            paymentStatus:
                "pending",

            rentalStatus:
                "not_started",

            profitStarted:
                false,

            totalProfitPaid:
                0,

            amountPaid:
                0,

            createdAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()
        };


        /*
         * Create booking document.
         */

        const bookingRef =
            await db
                .collection("bookings")
                .add(bookingData);


        /*
         * Create customer transaction.
         */

        await db
            .collection("users")
            .doc(currentUser.uid)
            .collection("transactions")
            .add({

                type:
                    "booking_created",

                bookingId:
                    bookingRef.id,

                bookingNumber:
                    bookingNumber,

                roomNumber:
                    room.roomNumber,

                amount:
                    Number(room.price || 0),

                status:
                    "pending_payment",

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()
            });


        alert(
            `Booking imeundwa!\n\nBooking Number: ${bookingNumber}\n\nTafadhali fuata maelekezo ya malipo na subiri uthibitisho wa admin.`
        );


        showSection(
            "myBookingsSection"
        );


        await loadMyBookings();


    } catch (error) {

        console.error(
            "Create booking error:",
            error
        );

        alert(
            error.message ||
            "Imeshindikana kutengeneza booking."
        );

    } finally {

        if (confirmButton) {

            confirmButton.disabled = false;

            confirmButton.textContent =
                "Confirm Rental";
        }
    }
}


/* =========================================================
   44. LOAD MY BOOKINGS
   ========================================================= */

async function loadMyBookings() {

    const list =
        getElement("myBookingsList");

    if (!list || !currentUser) {
        return;
    }


    list.innerHTML = `
        <div class="loading-state">
            Loading your bookings...
        </div>
    `;


    try {

        const bookings =
            await getUserBookings(
                currentUser.uid
            );


        if (!bookings.length) {

            list.innerHTML = `
                <div class="empty-state">
                    <h3>No bookings yet</h3>

                    <p>
                        Bado hujakodisha room yoyote.
                    </p>
                </div>
            `;

            return;
        }


        /*
         * Sort newest first.
         */

        bookings.sort(
            (a, b) => {

                const aTime =
                    a.createdAt?.toMillis?.() || 0;

                const bTime =
                    b.createdAt?.toMillis?.() || 0;

                return bTime - aTime;
            }
        );


        list.innerHTML = "";


        bookings.forEach(
            booking => {

                const card =
                    createBookingCard(
                        booking
                    );

                list.appendChild(card);
            }
        );

    } catch (error) {

        console.error(
            "Load my bookings error:",
            error
        );

        list.innerHTML = `
            <div class="empty-state">
                Imeshindikana kupakia bookings.
            </div>
        `;
    }
}


/* =========================================================
   45. CREATE BOOKING CARD
   ========================================================= */

function createBookingCard(booking) {

    const card =
        document.createElement("div");

    card.className =
        "booking-history-card";


    const createdAt =
        formatFirestoreDate(
            booking.createdAt
        );


    const status =
        booking.status ||
        "pending_payment";


    const statusLabel =
        formatBookingStatus(status);


    card.innerHTML = `

        <div class="booking-card-header">

            <div>

                <h3>
                    Room ${escapeHTML(
                        booking.roomNumber
                    )}
                </h3>

                <small>
                    ${escapeHTML(
                        booking.bookingNumber || ""
                    )}
                </small>

            </div>


            <span class="status-badge">

                ${escapeHTML(
                    statusLabel
                )}

            </span>

        </div>


        <div class="booking-card-details">

            <div>

                <span>Investment</span>

                <strong>
                    TSh ${formatMoney(
                        booking.roomPrice || 0
                    )}
                </strong>

            </div>


            <div>

                <span>Daily Profit</span>

                <strong>
                    TSh ${formatMoney(
                        booking.profitPerDay || 0
                    )}
                </strong>

            </div>


            <div>

                <span>Duration</span>

                <strong>
                    ${booking.durationDays || 90}
                    days
                </strong>

            </div>


            <div>

                <span>Payment</span>

                <strong>
                    ${escapeHTML(
                        formatBookingStatus(
                            booking.paymentStatus ||
                            "pending"
                        )
                    )}
                </strong>

            </div>

        </div>


        <div class="booking-card-footer">

            <span>
                ${createdAt}
            </span>

        </div>
    `;


    return card;
}


/* =========================================================
   46. FORMAT BOOKING STATUS
   ========================================================= */

function formatBookingStatus(status) {

    const statuses = {

        pending_payment:
            "Pending Payment",

        payment_submitted:
            "Payment Submitted",

        payment_confirmed:
            "Payment Confirmed",

        active:
            "Active",

        completed:
            "Completed",

        cancelled:
            "Cancelled",

        rejected:
            "Rejected",

        pending:
            "Pending"
    };


    return statuses[status] ||
        String(status)
            .replace(/_/g, " ");
}


/* =========================================================
   47. FORMAT FIRESTORE DATE
   ========================================================= */

function formatFirestoreDate(timestamp) {

    if (!timestamp) {
        return "-";
    }


    try {

        const date =
            timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);


        return new Intl.DateTimeFormat(
            "en-TZ",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        ).format(date);

    } catch (error) {

        return "-";
    }
}


/* =========================================================
   48. CONNECT ROOM BUTTON
   ========================================================= */

function bindRoomSectionEvents() {

    const roomsNavButton =
        getElement("roomsNavButton");

    if (roomsNavButton) {

        roomsNavButton.addEventListener(
            "click",
            async () => {

                showSection(
                    "roomsSection"
                );

                await loadRooms();
            }
        );
    }


    const viewRoomsButton =
        getElement("viewRoomsButton");

    if (viewRoomsButton) {

        viewRoomsButton.addEventListener(
            "click",
            async () => {

                showSection(
                    "roomsSection"
                );

                await loadRooms();
            }
        );
    }


    const bookingsNavButton =
        getElement("bookingsNavButton");

    if (bookingsNavButton) {

        bookingsNavButton.addEventListener(
            "click",
            async () => {

                showSection(
                    "myBookingsSection"
                );

                await loadMyBookings();
            }
        );
    }


    const myBookingsButton =
        getElement("myBookingsButton");

    if (myBookingsButton) {

        myBookingsButton.addEventListener(
            "click",
            async () => {

                showSection(
                    "myBookingsSection"
                );

                await loadMyBookings();
            }
        );
    }
}


/* =========================================================
   49. EXTEND INITIALIZATION
   ========================================================= */

const originalInitializeRoomRent =
    initializeRoomRent;


initializeRoomRent = function () {

    originalInitializeRoomRent();

    bindRoomSectionEvents();

};

