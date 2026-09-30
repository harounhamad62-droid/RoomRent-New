/* =========================================================
   ROOMRENT - SCRIPT.JS
   SEHEMU YA 1
   FIREBASE + AUTHENTICATION + BASIC NAVIGATION
   ========================================================= */

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
   2. FIREBASE INITIALIZATION
   ========================================================= */

let auth = null;
let db = null;
let storage = null;

try {

    if (typeof firebase === "undefined") {
        throw new Error("Firebase SDK haijapakiwa.");
    }

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();

    console.log("RoomRent: Firebase imeanzishwa.");

} catch (error) {

    console.error(
        "RoomRent Firebase initialization error:",
        error
    );

}


/* =========================================================
   3. GLOBAL VARIABLES
   ========================================================= */

let currentUser = null;
let currentUserData = null;

const ADMIN_UID =
    "1kj3K591EHhHAOiSoxIp1xGve2x1";

/* =========================================================
   4. ROOM CONFIGURATION
   ========================================================= */

const ROOM_DURATION_DAYS = 90;

const ROOM_PROFIT_RATE_PER_DAY = 0.04;

const ROOM_DATA = [

    {
        roomNumber: "0023",
        price: 30000,
        maxBookingsPerUser: 2
    },

    {
        roomNumber: "0024",
        price: 70000,
        maxBookingsPerUser: 4
    },

    {
        roomNumber: "0025",
        price: 140000,
        maxBookingsPerUser: 4
    },

    {
        roomNumber: "0026",
        price: 210000,
        maxBookingsPerUser: 4
    },

    {
        roomNumber: "0027",
        price: 280000,
        maxBookingsPerUser: 4
    },

    {
        roomNumber: "0028",
        price: 350000,
        maxBookingsPerUser: 4
    },

    {
        roomNumber: "0029",
        price: 420000,
        maxBookingsPerUser: 4
    },

    {
        roomNumber: "0030",
        price: 490000,
        maxBookingsPerUser: 4
    },

    {
        roomNumber: "0031",
        price: 560000,
        maxBookingsPerUser: 4
    },

    {
        roomNumber: "0032",
        price: 630000,
        maxBookingsPerUser: 4
    }

];
/* =========================================================
   4. BASIC DOM HELPERS
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


function showElement(element) {

    if (!element) return;

    element.classList.remove("hidden");

    /*
     * Ondoa display:none iliyowekwa moja kwa moja
     * kwenye HTML.
     */
    element.style.removeProperty("display");

}


function hideElement(element) {

    if (!element) return;

    element.classList.add("hidden");

    element.style.display = "none";

}


function showById(id) {

    const element = getElement(id);

    if (element) {

        showElement(element);

    }

}


function hideById(id) {

    const element = getElement(id);

    if (element) {

        hideElement(element);

    }

}


function setMessage(id, message, type = "info") {

    const element = getElement(id);

    if (!element) return;

    element.textContent = message;

    element.className =
        "form-message " + type;

       }


/* =========================================================
   5. AUTH SCREEN
   ========================================================= */

function showAuthScreen() {

    const authScreen = getElement("authScreen");
    const appScreen = getElement("appScreen");

    showElement(authScreen);
    hideElement(appScreen);

}


function showAppScreen() {

    const authScreen = getElement("authScreen");
    const appScreen = getElement("appScreen");

    hideElement(authScreen);
    showElement(appScreen);

}


/* =========================================================
   6. AUTH PANELS
   ========================================================= */

function showLoginPanel() {

    showById("loginPanel");

    hideById("signUpPanel");
    hideById("forgotPasswordPanel");

}


function showRegisterPanel() {

    hideById("loginPanel");

    showById("signUpPanel");

    hideById("forgotPasswordPanel");

}


function showForgotPasswordPanel() {

    hideById("loginPanel");
    hideById("signUpPanel");

    showById("forgotPasswordPanel");

}


/* =========================================================
   7. APP SECTIONS
   ========================================================= */

function hideAllAppSections() {

    const sectionIds = [

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

    sectionIds.forEach(function (id) {

        hideById(id);

    });

}


function showSection(sectionId) {

    hideAllAppSections();

    showById(sectionId);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   8. LOGIN
   ========================================================= */

async function signInUser(event) {

    if (event) {
        event.preventDefault();
    }

    const emailElement =
        getElement("signInEmail");

    const passwordElement =
        getElement("signInPassword");

    const email =
        emailElement
            ? emailElement.value.trim()
            : "";

    const password =
        passwordElement
            ? passwordElement.value
            : "";


    if (!email || !password) {

        setMessage(
            "signInMessage",
            "Weka email na password.",
            "error"
        );

        return;
    }


    if (!auth) {

        setMessage(
            "signInMessage",
            "Firebase haijaandaliwa vizuri.",
            "error"
        );

        return;
    }


    const button =
        getElement("signInButton");


    try {

        if (button) {
            button.disabled = true;
            button.textContent = "Inaingia...";
        }


        setMessage(
            "signInMessage",
            "Tafadhali subiri...",
            "info"
        );


        await auth.signInWithEmailAndPassword(
            email,
            password
        );


        setMessage(
            "signInMessage",
            "Umeingia kwenye RoomRent.",
            "success"
        );


    } catch (error) {

        console.error(
            "RoomRent login error:",
            error
        );


        let message =
            "Imeshindikana kuingia.";


        if (
            error &&
            error.code ===
            "auth/invalid-credential"
        ) {

            message =
                "Email au password si sahihi.";

        } else if (
            error &&
            error.code ===
            "auth/user-not-found"
        ) {

            message =
                "Akaunti hiyo haipo.";

        } else if (
            error &&
            error.code ===
            "auth/wrong-password"
        ) {

            message =
                "Password si sahihi.";

        } else if (
            error &&
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "Email si sahihi.";

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
   9. REGISTER
   ========================================================= */

async function registerUser(event) {

    if (event) {
        event.preventDefault();
    }


    const nameElement =
        getElement("signUpName");

    const phoneElement =
        getElement("signUpPhone");

    const emailElement =
        getElement("signUpEmail");

    const passwordElement =
        getElement("signUpPassword");

    const referralElement =
        getElement("signUpReferral");


    const name =
        nameElement
            ? nameElement.value.trim()
            : "";

    const phone =
        phoneElement
            ? phoneElement.value.trim()
            : "";

    const email =
        emailElement
            ? emailElement.value.trim()
            : "";

    const password =
        passwordElement
            ? passwordElement.value
            : "";

    const referralCode =
        referralElement
            ? referralElement.value.trim()
            : "";


    if (!name) {

        setMessage(
            "signUpMessage",
            "Weka jina lako.",
            "error"
        );

        return;
    }


    if (!phone) {

        setMessage(
            "signUpMessage",
            "Weka namba yako ya simu.",
            "error"
        );

        return;
    }


    if (!email) {

        setMessage(
            "signUpMessage",
            "Weka email yako.",
            "error"
        );

        return;
    }


    if (!password) {

        setMessage(
            "signUpMessage",
            "Weka password.",
            "error"
        );

        return;
    }


    if (password.length < 6) {

        setMessage(
            "signUpMessage",
            "Password iwe na angalau herufi 6.",
            "error"
        );

        return;
    }


    if (!auth || !db) {

        setMessage(
            "signUpMessage",
            "Firebase haijaandaliwa vizuri.",
            "error"
        );

        return;
    }


    const button =
        getElement("signUpButton");


    try {

        if (button) {

            button.disabled = true;
            button.textContent =
                "Inatengeneza akaunti...";

        }


        setMessage(
            "signUpMessage",
            "Tafadhali subiri...",
            "info"
        );


        const userCredential =
            await auth.createUserWithEmailAndPassword(
                email,
                password
            );


        const user =
            userCredential.user;


        if (!user) {

            throw new Error(
                "Firebase haikurudisha user."
            );

        }


        const generatedReferralCode =
            createReferralCode(user.uid);


        let referredBy = null;


        if (referralCode) {

            try {

                const sponsorSnapshot =
                    await db
                        .collection("users")
                        .where(
                            "referralCode",
                            "==",
                            referralCode.toUpperCase()
                        )
                        .limit(1)
                        .get();


                if (!sponsorSnapshot.empty) {

                    referredBy =
                        sponsorSnapshot
                            .docs[0]
                            .id;

                }

            } catch (referralError) {

                console.warn(
                    "Referral lookup failed:",
                    referralError
                );

            }

        }


        const userData = {

            uid: user.uid,

            name: name,

            phone: phone,

            email: email,

            referralCode:
                generatedReferralCode,

            referralLink:
                createReferralLink(
                    generatedReferralCode
                ),

            referredBy:
                referredBy,

            role:
                user.uid === ADMIN_UID
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


        currentUser =
            user;

        currentUserData =
            userData;


        setMessage(
            "signUpMessage",
            "Akaunti imetengenezwa kwa mafanikio.",
            "success"
        );


    } catch (error) {

        console.error(
            "RoomRent registration error:",
            error
        );


        let message =
            "Imeshindikana kutengeneza akaunti.";


        if (
            error &&
            error.code ===
            "auth/email-already-in-use"
        ) {

            message =
                "Email hiyo tayari imesajiliwa.";

        } else if (
            error &&
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "Email si sahihi.";

        } else if (
            error &&
            error.code ===
            "auth/weak-password"
        ) {

            message =
                "Password ni dhaifu. Tumia angalau herufi 6.";

        }


        setMessage(
            "signUpMessage",
            message,
            "error"
        );


    } finally {

        if (button) {

            button.disabled = false;
            button.textContent =
                "Create Account";

        }

    }

}


/* =========================================================
   10. REFERRAL CODE
   ========================================================= */

function createReferralCode(uid) {

    if (!uid) {
        return "RRUSER";
    }


    const cleanUid =
        uid
            .replace(/[^a-zA-Z0-9]/g, "")
            .toUpperCase();


    return (
        "RR" +
        cleanUid.substring(0, 8)
    );

}


function createReferralLink(referralCode) {

    if (!referralCode) {
        return "";
    }


    const baseUrl =
        window.location.origin +
        window.location.pathname;


    return (
        baseUrl +
        "?ref=" +
        encodeURIComponent(
            referralCode
        )
    );

}


/* =========================================================
   11. LOAD CURRENT USER
   ========================================================= */

async function loadCurrentUserData(user) {

    if (!user || !db) {
        return null;
    }


    try {

        const snapshot =
            await db
                .collection("users")
                .doc(user.uid)
                .get();


        if (snapshot.exists) {

            currentUserData =
                snapshot.data();

        } else {

            currentUserData = {

                uid: user.uid,

                name:
                    user.displayName ||
                    "RoomRent User",

                email:
                    user.email || "",

                phone: "",

                role:
                    user.uid === ADMIN_UID
                        ? "admin"
                        : "customer",

                balance: 0,

                totalProfit: 0,

                totalWithdrawn: 0,

                totalDeposited: 0

            };

        }


        return currentUserData;


    } catch (error) {

        console.error(
            "Loading user data failed:",
            error
        );

        return null;

    }

}


/* =========================================================
   12. DASHBOARD
   ========================================================= */

function loadUserDashboard() {

    if (!currentUserData) {
        return;
    }


    const nameElement =
        getElement("dashboardUserName");


    if (nameElement) {

        nameElement.textContent =
            currentUserData.name ||
            "RoomRent User";

    }


    const balanceElement =
        getElement("walletBalance");


    if (balanceElement) {

        balanceElement.textContent =
            formatMoney(
                currentUserData.balance || 0
            );

    }


    const profitElement =
        getElement("walletProfit");


    if (profitElement) {

        profitElement.textContent =
            formatMoney(
                currentUserData.totalProfit || 0
            );

    }


    loadProfile();

    loadReferralInfo();


    const adminSection =
        getElement("adminSection");


    if (
        currentUserData.role === "admin" ||
        (currentUser &&
         currentUser.uid === ADMIN_UID)
    ) {

        showElement(adminSection);

    } else {

        hideElement(adminSection);

    }

}


/* =========================================================
   13. PROFILE
   ========================================================= */

function loadProfile() {

    if (!currentUserData) {
        return;
    }


    const fields = {

        profileName:
            currentUserData.name || "",

        profileEmail:
            currentUserData.email || "",

        profilePhone:
            currentUserData.phone || "",

        profileReferralCode:
            currentUserData.referralCode || ""

    };


    Object.keys(fields).forEach(function (id) {

        const element =
            getElement(id);


        if (element) {

            element.textContent =
                fields[id];

        }

    });

}


/* =========================================================
   14. REFERRAL INFORMATION
   ========================================================= */

function loadReferralInfo() {

    if (!currentUserData) {
        return;
    }


    const codeElement =
        getElement("userReferralCode");


    const linkElement =
        getElement("userReferralLink");


    if (codeElement) {

        codeElement.textContent =
            currentUserData.referralCode ||
            "";

    }


    if (linkElement) {

        linkElement.textContent =
            currentUserData.referralLink ||
            "";

    }

}


/* =========================================================
   15. FORMAT MONEY
   ========================================================= */

function formatMoney(amount) {

    const number =
        Number(amount) || 0;


    return (
        "TSh " +
        number.toLocaleString(
            "en-TZ",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        )
    );

}


/* =========================================================
   16. FORGOT PASSWORD
   ========================================================= */

async function resetPassword(event) {

    if (event) {
        event.preventDefault();
    }


    const emailElement =
        getElement("forgotPasswordEmail");


    const email =
        emailElement
            ? emailElement.value.trim()
            : "";


    if (!email) {

        setMessage(
            "forgotPasswordMessage",
            "Weka email yako.",
            "error"
        );

        return;
    }


    if (!auth) {

        setMessage(
            "forgotPasswordMessage",
            "Firebase haijaandaliwa vizuri.",
            "error"
        );

        return;
    }


    try {

        await auth.sendPasswordResetEmail(
            email
        );


        setMessage(
            "forgotPasswordMessage",
            "Link ya kubadilisha password imetumwa kwenye email yako.",
            "success"
        );


    } catch (error) {

        console.error(
            "Password reset error:",
            error
        );


        setMessage(
            "forgotPasswordMessage",
            "Imeshindikana kutuma reset email.",
            "error"
        );

    }

}


/* =========================================================
   17. LOGOUT
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
        showLoginPanel();

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

}


/* =========================================================
   18. COPY REFERRAL LINK
   ========================================================= */

async function copyReferralLink() {

    if (!currentUserData) {
        return;
    }


    const link =
        currentUserData.referralLink ||
        "";


    if (!link) {
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


            setTimeout(function () {

                button.textContent =
                    oldText;

            }, 1500);

        }


    } catch (error) {

        console.error(
            "Copy referral link failed:",
            error
        );

    }

}


/* =========================================================
   19. REFERRAL FROM URL
   ========================================================= */

function loadReferralFromURL() {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const referral =
            params.get("ref");


        if (!referral) {
            return;
        }


        const referralElement =
            getElement("signUpReferral");


        if (referralElement) {

            referralElement.value =
                referral.toUpperCase();

        }

    } catch (error) {

        console.warn(
            "Referral URL error:",
            error
        );

    }

}


/* =========================================================
   20. AUTH STATE LISTENER
   ========================================================= */
function initializeAuthListener() {

    if (!auth) {
        console.error(
            "RoomRent: Firebase Auth haipo."
        );

        showAuthScreen();
        showLoginPanel();

        return;
    }

    auth.onAuthStateChanged(async function (user) {

        console.log(
            "RoomRent Auth State:",
            user ? "LOGGED IN" : "LOGGED OUT"
        );

        if (user) {

            currentUser = user;

            try {

                await loadCurrentUserData(user);

                showAppScreen();

                showSection(
                    "dashboardSection"
                );

                loadUserDashboard();

            } catch (error) {

                console.error(
                    "RoomRent: User loading error:",
                    error
                );

                /*
                 * Hata kwenye Firestore isizime
                 * au kufanya ukurasa uwe mtupu.
                 */

                showAppScreen();

                showSection(
                    "dashboardSection"
                );

            }

        } else {

            currentUser = null;
            currentUserData = null;

            /*
             * User akiwa haja-login,
             * login screen lazima ibaki wazi.
             */

            showAuthScreen();
            showLoginPanel();

        }

    });

   }


/* =========================================================
   21. EVENT BINDING
   ========================================================= */

function bindEvents() {

    const signInForm =
        getElement("signInForm");


    const signUpForm =
        getElement("signUpForm");


    const forgotPasswordForm =
        getElement("forgotPasswordForm");


    if (signInForm) {

        signInForm.addEventListener(
            "submit",
            signInUser
        );

    }


    if (signUpForm) {

        signUpForm.addEventListener(
            "submit",
            registerUser
        );

    }


    if (forgotPasswordForm) {

        forgotPasswordForm.addEventListener(
            "submit",
            resetPassword
        );

    }


    const showRegisterButton =
        getElement("showRegisterButton");


    if (showRegisterButton) {

        showRegisterButton.addEventListener(
            "click",
            showRegisterPanel
        );

    }


    const showLoginButton =
        getElement("showLoginButton");


    if (showLoginButton) {

        showLoginButton.addEventListener(
            "click",
            showLoginPanel
        );

    }


    const showForgotPasswordButton =
        getElement(
            "showForgotPasswordButton"
        );


    if (showForgotPasswordButton) {

        showForgotPasswordButton.addEventListener(
            "click",
            showForgotPasswordPanel
        );

    }


    const backToLoginButton =
        getElement("backToLoginButton");


    if (backToLoginButton) {

        backToLoginButton.addEventListener(
            "click",
            showLoginPanel
        );

    }


    const signOutButton =
        getElement("signOutButton");


    if (signOutButton) {

        signOutButton.addEventListener(
            "click",
            signOutUser
        );

    }


    const copyReferralButton =
        getElement("copyReferralButton");


    if (copyReferralButton) {

        copyReferralButton.addEventListener(
            "click",
            copyReferralLink
        );

    }


    /* -----------------------------------------------------
       DASHBOARD BUTTONS
       ----------------------------------------------------- */

    const viewRoomsButton =
        getElement("viewRoomsButton");


    if (viewRoomsButton) {

        viewRoomsButton.addEventListener(
            "click",
            function () {

                showSection(
                    "roomsSection"
                );

            }
        );

    }


    const myBookingsButton =
        getElement("myBookingsButton");


    if (myBookingsButton) {

        myBookingsButton.addEventListener(
            "click",
            function () {

                showSection(
                    "myBookingsSection"
                );

            }
        );

    }


    const withdrawButton =
        getElement("withdrawButton");


    if (withdrawButton) {

        withdrawButton.addEventListener(
            "click",
            function () {

                showSection(
                    "withdrawalSection"
                );

            }
        );

    }


    const referralButton =
        getElement("referralButton");


    if (referralButton) {

        referralButton.addEventListener(
            "click",
            function () {

                showSection(
                    "referralSection"
                );

            }
        );

    }


    /* -----------------------------------------------------
       BOTTOM NAVIGATION
       ----------------------------------------------------- */

    const homeNavButton =
        getElement("homeNavButton");


    if (homeNavButton) {

        homeNavButton.addEventListener(
            "click",
            function () {

                showSection(
                    "dashboardSection"
                );

            }
        );

    }


    const roomsNavButton =
        getElement("roomsNavButton");


    if (roomsNavButton) {

        roomsNavButton.addEventListener(
            "click",
            function () {

                showSection(
                    "roomsSection"
                );

            }
        );

    }


    const bookingsNavButton =
        getElement("bookingsNavButton");


    if (bookingsNavButton) {

        bookingsNavButton.addEventListener(
            "click",
            function () {

                showSection(
                    "myBookingsSection"
                );

            }
        );

    }


    const accountNavButton =
        getElement("accountNavButton");


    if (accountNavButton) {

        accountNavButton.addEventListener(
            "click",
            function () {

                showSection(
                    "accountSection"
                );

            }
        );

    }


    /* -----------------------------------------------------
       BACK BUTTONS
       ----------------------------------------------------- */

    const backButtons = [

        "roomsBackButton",
        "bookingBackButton",
        "myBookingsBackButton",
        "withdrawalBackButton",
        "withdrawalHistoryBackButton",
        "referralBackButton",
        "notificationsBackButton",
        "transactionsBackButton",
        "accountBackButton"

    ];


    backButtons.forEach(function (id) {

        const button =
            getElement(id);


        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            function () {

                showSection(
                    "dashboardSection"
                );

            }
        );

    });

}

/* =========================================================
   22. INITIALIZATION
========================================================= */

function initializeRoomRent() {

    console.log(
        "RoomRent: initialization inaanza..."
    );

    bindEvents();

    console.log(
        "RoomRent: events zimeunganishwa."
    );

    initializeAuthListener();

    console.log(
        "RoomRent: Auth listener imewashwa."
    );

    console.log(
        "RoomRent: initialization imekamilika."
    );

}


/* =========================================================
   23. START AFTER DOM IS READY
   ========================================================= */

console.log(
    "ROOMRENT SCRIPT IMELOADED"
);


if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            console.log(
                "ROOMRENT DOM READY"
            );

            initializeRoomRent();

        },
        {
            once: true
        }
    );

} else {

    console.log(
        "ROOMRENT DOM ALREADY READY"
    );

    initializeRoomRent();

                        }


/* =========================================================
   SECTION 2B — ROOMS DISPLAY
========================================================= */

function loadRooms() {

    const roomsList = getElement("roomsList");

    if (!roomsList) {
        console.error("RoomRent: roomsList haipo.");
        return;
    }

    if (!Array.isArray(ROOM_DATA)) {
        console.error("RoomRent: ROOM_DATA haipo.");
        roomsList.innerHTML = `
            <div class="empty-state">
                <p>Vyumba havijapatikana.</p>
            </div>
        `;
        return;
    }

    roomsList.innerHTML = "";

    ROOM_DATA.forEach(function(room) {

        const dailyProfit =
            room.price * ROOM_PROFIT_RATE_PER_DAY;

        const roomCard =
            document.createElement("div");

        roomCard.className = "room-card";

        roomCard.innerHTML = `
            <div class="room-card-content">

                <div class="room-number">
                    Chumba ${room.roomNumber}
                </div>

                <div class="room-price">
                    ${formatMoney(room.price)}
                </div>

                <div class="room-info">

                    <div>
                        <span>Faida kwa siku</span>
                        <strong>
                            ${formatMoney(dailyProfit)}
                        </strong>
                    </div>

                    <div>
                        <span>Muda wa uwekezaji</span>
                        <strong>
                            ${ROOM_DURATION_DAYS} siku
                        </strong>
                    </div>

                </div>

                <button
                    type="button"
                    class="primary-button rent-room-button"
                    data-room-number="${room.roomNumber}">
                    Kodisha Chumba
                </button>

            </div>
        `;

        roomsList.appendChild(roomCard);

    });


    const rentButtons =
        document.querySelectorAll(
            ".rent-room-button"
        );


    rentButtons.forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                const roomNumber =
                    button.dataset.roomNumber;

                openBookingSection(roomNumber);

            }
        );

    });


    console.log(
        "RoomRent: Vyumba " +
        ROOM_DATA.length +
        " vimeonyeshwa."
    );

}


/* =========================================================
   OPEN BOOKING SECTION
========================================================= */

function openBookingSection(roomNumber) {

    console.log(
        "RoomRent: Chumba kilichochaguliwa:",
        roomNumber
    );


    const selectedRoom =
        ROOM_DATA.find(function(room) {

            return String(room.roomNumber) ===
                   String(roomNumber);

        });


    if (!selectedRoom) {

        console.error(
            "RoomRent: Chumba hakijapatikana:",
            roomNumber
        );

        return;

    }


    showSection("bookingSection");


    const bookingContent =
        getElement("bookingContent");


    if (!bookingContent) {

        console.error(
            "RoomRent: bookingContent haipo."
        );

        return;

    }


    const dailyProfit =
        selectedRoom.price *
        ROOM_PROFIT_RATE_PER_DAY;


    bookingContent.innerHTML = `

        <div class="booking-card">

            <h2>
                Chumba ${selectedRoom.roomNumber}
            </h2>


            <div class="booking-detail">

                <span>Bei ya chumba</span>

                <strong>
                    ${formatMoney(selectedRoom.price)}
                </strong>

            </div>


            <div class="booking-detail">

                <span>Faida kwa siku</span>

                <strong>
                    ${formatMoney(dailyProfit)}
                </strong>

            </div>


            <div class="booking-detail">

                <span>Muda wa uwekezaji</span>

                <strong>
                    ${ROOM_DURATION_DAYS} siku
                </strong>

            </div>


            <div class="booking-detail">

                <span>Idadi ya bookings zako</span>

                <strong>
                    Hadi ${selectedRoom.maxBookingsPerUser}
                </strong>

            </div>


            <button
                type="button"
                class="primary-button"
                id="continueBookingButton"
                data-room-number="${selectedRoom.roomNumber}">

                Endelea

            </button>

        </div>

    `;


    const continueButton =
        getElement("continueBookingButton");


    if (continueButton) {

        continueButton.addEventListener(
            "click",
            function() {

                console.log(
                    "RoomRent: Continue booking:",
                    selectedRoom.roomNumber
                );

                alert(
                    "Booking itaendelea kwenye hatua inayofuata."
                );

            }
        );

    }

}


/* =========================================================
   OPEN ROOMS SECTION
========================================================= */

function openRoomsSection() {

    showSection("roomsSection");

    loadRooms();

}


/* =========================================================
   INITIALIZE ROOMS SECTION
========================================================= */

function initializeRoomsSection() {

    console.log(
        "RoomRent: Rooms section imeandaliwa."
    );

}



