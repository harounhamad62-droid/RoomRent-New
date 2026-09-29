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

