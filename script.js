/* =========================================================
   ROOMRENT - SCRIPT.JS
   FIREBASE + AUTHENTICATION + DASHBOARD + ROOMS + PAYMENT
   ========================================================= */


/* =========================================================
   1. FIREBASE CONFIGURATION
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyBlLpRr_zx1ru9acHQ_qHNnZp9f6kv12yA",

    authDomain:
        "roomrent-4b63b.firebaseapp.com",

    projectId:
        "roomrent-4b63b",

    storageBucket:
        "roomrent-4b63b.firebasestorage.app",

    messagingSenderId:
        "585995201987",

    appId:
        "1:585995201987:web:04d246393e90deac6ed2b6",

    measurementId:
        "G-7NVWKMJJ17"

};


/* =========================================================
   2. FIREBASE INITIALIZATION
========================================================= */

let auth = null;
let db = null;
let storage = null;

try {

    if (typeof firebase === "undefined") {

        throw new Error(
            "Firebase SDK haijapakiwa."
        );

    }

    if (!firebase.apps.length) {

        firebase.initializeApp(
            firebaseConfig
        );

    }

    auth =
        firebase.auth();

    db =
        firebase.firestore();

    storage =
        firebase.storage();

    console.log(
        "RoomRent: Firebase imeanzishwa."
    );

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

let selectedRoom = null;

let selectedPaymentMethod = null;


/* =========================================================
   ADMIN UID
========================================================= */

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
   5. BASIC DOM HELPERS
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


function showElement(element) {

    if (!element) return;

    element.classList.remove(
        "hidden"
    );

    element.style.removeProperty(
        "display"
    );

}


function hideElement(element) {

    if (!element) return;

    element.classList.add(
        "hidden"
    );

    element.style.display =
        "none";

}


function showById(id) {

    const element =
        getElement(id);

    if (element) {

        showElement(element);

    }

}


function hideById(id) {

    const element =
        getElement(id);

    if (element) {

        hideElement(element);

    }

}


function setMessage(
    id,
    message,
    type = "info"
) {

    const element =
        getElement(id);

    if (!element) return;

    element.textContent =
        message;

    element.className =
        "form-message " + type;

}


/* =========================================================
   6. AUTH SCREEN
========================================================= */

function showAuthScreen() {

    const authScreen =
        getElement("authScreen");

    const appScreen =
        getElement("appScreen");

    showElement(
        authScreen
    );

    hideElement(
        appScreen
    );

}


/* =========================================================
   7. APP SCREEN
========================================================= */

function showAppScreen() {

    const authScreen =
        getElement("authScreen");

    const appScreen =
        getElement("appScreen");

    hideElement(
        authScreen
    );

    showElement(
        appScreen
    );

}


/* =========================================================
   8. AUTH PANELS
========================================================= */

function showLoginPanel() {

    showById(
        "loginPanel"
    );

    hideById(
        "signUpPanel"
    );

    hideById(
        "forgotPasswordPanel"
    );

}


function showRegisterPanel() {

    hideById(
        "loginPanel"
    );

    showById(
        "signUpPanel"
    );

    hideById(
        "forgotPasswordPanel"
    );

}


function showForgotPasswordPanel() {

    hideById(
        "loginPanel"
    );

    hideById(
        "signUpPanel"
    );

    showById(
        "forgotPasswordPanel"
    );

}


/* =========================================================
   9. APP SECTIONS
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

    sectionIds.forEach(
        function(id) {

            hideById(id);

        }
    );

}


function showSection(sectionId) {

    hideAllAppSections();

    showById(
        sectionId
    );

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   10. LOGIN
========================================================= */

async function signInUser(event) {

    if (event) {

        event.preventDefault();

    }

    const emailElement =
        getElement(
            "signInEmail"
        );

    const passwordElement =
        getElement(
            "signInPassword"
        );

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
        getElement(
            "signInButton"
        );

    try {

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Inaingia...";

        }

        setMessage(

            "signInMessage",

            "Tafadhali subiri...",

            "info"

        );

        await auth
            .signInWithEmailAndPassword(
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

        }

        else if (
            error &&
            error.code ===
            "auth/user-not-found"
        ) {

            message =
                "Akaunti hiyo haipo.";

        }

        else if (
            error &&
            error.code ===
            "auth/wrong-password"
        ) {

            message =
                "Password si sahihi.";

        }

        else if (
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

            button.disabled =
                false;

            button.textContent =
                "Login";

        }

    }

}


/* =========================================================
   11. REGISTER
========================================================= */

async function registerUser(event) {

    if (event) {

        event.preventDefault();

    }

    const nameElement =
        getElement(
            "signUpName"
        );

    const phoneElement =
        getElement(
            "signUpPhone"
        );

    const emailElement =
        getElement(
            "signUpEmail"
        );

    const passwordElement =
        getElement(
            "signUpPassword"
        );

    const referralElement =
        getElement(
            "signUpReferral"
        );

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
        getElement(
            "signUpButton"
        );

    try {

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Inatengeneza akaunti...";

        }

        setMessage(
            "signUpMessage",
            "Tafadhali subiri...",
            "info"
        );

        const userCredential =
            await auth
                .createUserWithEmailAndPassword(
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
            createReferralCode(
                user.uid
            );

        let referredBy =
            null;

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

                if (
                    !sponsorSnapshot.empty
                ) {

                    referredBy =
                        sponsorSnapshot
                            .docs[0]
                            .id;

                }

            } catch (
                referralError
            ) {

                console.warn(
                    "Referral lookup failed:",
                    referralError
                );

            }

        }

        const userData = {

            uid:
                user.uid,

            name:
                name,

            phone:
                phone,

            email:
                email,

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

            balance:
                0,

            totalProfit:
                0,

            totalWithdrawn:
                0,

            totalDeposited:
                0,

            status:
                "active",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };

        await db
            .collection("users")
            .doc(user.uid)
            .set(
                userData
            );

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

        }

        else if (
            error &&
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "Email si sahihi.";

        }

        else if (
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

            button.disabled =
                false;

            button.textContent =
                "Create Account";

        }

    }

}


/* =========================================================
   12. REFERRAL CODE
========================================================= */

function createReferralCode(uid) {

    if (!uid) {

        return "RRUSER";

    }

    const cleanUid =
        uid
            .replace(
                /[^a-zA-Z0-9]/g,
                ""
            )
            .toUpperCase();

    return (
        "RR" +
        cleanUid.substring(
            0,
            8
        )
    );

}


function createReferralLink(
    referralCode
) {

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
   13. LOAD CURRENT USER
========================================================= */

async function loadCurrentUserData(
    user
) {

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

        }

        else {

            currentUserData = {

                uid:
                    user.uid,

                name:
                    user.displayName ||
                    "RoomRent User",

                email:
                    user.email ||
                    "",

                phone:
                    "",

                role:
                    user.uid === ADMIN_UID
                        ? "admin"
                        : "customer",

                balance:
                    0,

                totalProfit:
                    0,

                totalWithdrawn:
                    0,

                totalDeposited:
                    0

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
   14. DASHBOARD
========================================================= */

function loadUserDashboard() {

    if (!currentUserData) {

        return;

    }

    const nameElement =
        getElement(
            "dashboardUserName"
        );

    if (nameElement) {

        nameElement.textContent =
            currentUserData.name ||
            "RoomRent User";

    }

    const balanceElement =
        getElement(
            "walletBalance"
        );

    if (balanceElement) {

        balanceElement.textContent =
            formatMoney(
                currentUserData.balance ||
                0
            );

    }

    const profitElement =
        getElement(
            "walletProfit"
        );

    if (profitElement) {

        profitElement.textContent =
            formatMoney(
                currentUserData.totalProfit ||
                0
            );

    }

    loadProfile();

    loadReferralInfo();

    const adminSection =
        getElement(
            "adminSection"
        );

    if (

        currentUserData.role ===
            "admin"

        ||

        (
            currentUser &&
            currentUser.uid ===
                ADMIN_UID
        )

    ) {

        showElement(
            adminSection
        );

    }

    else {

        hideElement(
            adminSection
        );

    }

}


/* =========================================================
   15. PROFILE
========================================================= */

function loadProfile() {

    if (!currentUserData) {

        return;

    }

    const fields = {

        profileName:
            currentUserData.name ||
            "",

        profileEmail:
            currentUserData.email ||
            "",

        profilePhone:
            currentUserData.phone ||
            "",

        profileReferralCode:
            currentUserData.referralCode ||
            ""

    };

    Object.keys(fields)
        .forEach(
            function(id) {

                const element =
                    getElement(id);

                if (element) {

                    element.textContent =
                        fields[id];

                }

            }
        );

}


/* =========================================================
   16. REFERRAL INFORMATION
========================================================= */

function loadReferralInfo() {

    if (!currentUserData) {

        return;

    }

    const codeElement =
        getElement(
            "userReferralCode"
        );

    const linkElement =
        getElement(
            "userReferralLink"
        );

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
   17. FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    const number =
        Number(amount) || 0;

    return (

        "TSh " +

        number.toLocaleString(
            "en-TZ",
            {
                minimumFractionDigits:
                    0,

                maximumFractionDigits:
                    2
            }
        )

    );

}


/* =========================================================
   18. FORGOT PASSWORD
========================================================= */

async function resetPassword(event) {

    if (event) {

        event.preventDefault();

    }

    const emailElement =
        getElement(
            "forgotPasswordEmail"
        );

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

        await auth
            .sendPasswordResetEmail(
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
   19. LOGOUT
========================================================= */

async function signOutUser() {

    if (!auth) {

        return;

    }

    try {

        await auth.signOut();

        currentUser =
            null;

        currentUserData =
            null;

        selectedRoom =
            null;

        selectedPaymentMethod =
            null;

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
   20. COPY REFERRAL LINK
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

        await navigator.clipboard
            .writeText(
                link
            );

        const button =
            getElement(
                "copyReferralButton"
            );

        if (button) {

            const oldText =
                button.textContent;

            button.textContent =
                "Copied!";

            setTimeout(
                function() {

                    button.textContent =
                        oldText;

                },
                1500
            );

        }

    } catch (error) {

        console.error(
            "Copy referral link failed:",
            error
        );

    }

}


/* =========================================================
   21. REFERRAL FROM URL
========================================================= */

function loadReferralFromURL() {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const referral =
            params.get(
                "ref"
            );

        if (!referral) {

            return;

        }

        const referralElement =
            getElement(
                "signUpReferral"
            );

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
   22. AUTH STATE LISTENER
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


    auth.onAuthStateChanged(
        async function(user) {

            console.log(
                "RoomRent Auth State:",
                user
                    ? "LOGGED IN"
                    : "LOGGED OUT"
            );


            if (user) {

                currentUser =
                    user;


                try {

                    await loadCurrentUserData(
                        user
                    );


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


                    showAppScreen();


                    showSection(
                        "dashboardSection"
                    );

                }

            }


            else {

                currentUser =
                    null;


                currentUserData =
                    null;


                selectedRoom =
                    null;


                selectedPaymentMethod =
                    null;


                showAuthScreen();


                showLoginPanel();

            }

        }
    );

}


/* =========================================================
   23. ROOMS DISPLAY
========================================================= */

function loadRooms() {

    console.log(
        "RoomRent: loadRooms inaanza..."
    );


    const roomsList =
        getElement(
            "roomsList"
        );


    if (!roomsList) {

        console.error(

            "RoomRent: roomsList HAIPO kwenye HTML."

        );

        return;

    }


    if (!Array.isArray(ROOM_DATA)) {

        console.error(

            "RoomRent: ROOM_DATA HAIPO."

        );


        roomsList.innerHTML = `

            <div class="empty-state">

                <p>
                    Vyumba havijapatikana.
                </p>

            </div>

        `;

        return;

    }


    roomsList.innerHTML =
        "";


    ROOM_DATA.forEach(
        function(room) {

            const dailyProfit =
                room.price *
                ROOM_PROFIT_RATE_PER_DAY;


            const roomCard =
                document.createElement(
                    "div"
                );


            roomCard.className =
                "room-card";


            roomCard.innerHTML = `

                <div class="room-card-content">

                    <div class="room-number">

                        🏠 Chumba
                        ${room.roomNumber}

                    </div>


                    <div class="room-price">

                        ${formatMoney(
                            room.price
                        )}

                    </div>


                    <div class="room-info">

                        <div>

                            <span>
                                Faida kwa siku
                            </span>

                            <strong>

                                ${formatMoney(
                                    dailyProfit
                                )}

                            </strong>

                        </div>


                        <div>

                            <span>
                                Muda wa uwekezaji
                            </span>

                            <strong>

                                ${ROOM_DURATION_DAYS}
                                siku

                            </strong>

                        </div>


                        <div>

                            <span>
                                Booking zako
                            </span>

                            <strong>

                                Hadi
                                ${room.maxBookingsPerUser}

                            </strong>

                        </div>

                    </div>


                    <button

                        type="button"

                        class="primary-button rent-room-button"

                        data-room-number="${room.roomNumber}"

                    >

                        Kodisha Chumba

                    </button>

                </div>

            `;


            roomsList.appendChild(
                roomCard
            );

        }
    );


    const rentButtons =
        document.querySelectorAll(
            ".rent-room-button"
        );


    rentButtons.forEach(
        function(button) {

            button.addEventListener(

                "click",

                function() {

                    const roomNumber =
                        button.dataset.roomNumber;


                    openBookingSection(
                        roomNumber
                    );

                }

            );

        }
    );


    console.log(

        "RoomRent: Vyumba " +
        ROOM_DATA.length +
        " vimeonyeshwa."

    );

}


/* =========================================================
   24. OPEN ROOMS SECTION
========================================================= */

function openRoomsSection() {

    console.log(
        "RoomRent: Nafungua Rooms Section..."
    );


    showSection(
        "roomsSection"
    );


    loadRooms();


    console.log(
        "RoomRent: Rooms Section imefunguliwa."
    );

}


/* =========================================================
   25. OPEN BOOKING SECTION
========================================================= */

function openBookingSection(roomNumber) {

    console.log(
        "RoomRent: Chumba kilichochaguliwa:",
        roomNumber
    );


    const foundRoom =
        ROOM_DATA.find(
            function(room) {

                return String(
                    room.roomNumber
                ) === String(
                    roomNumber
                );

            }
        );


    if (!foundRoom) {

        console.error(

            "RoomRent: Chumba hakijapatikana:",

            roomNumber

        );

        return;

    }


    selectedRoom =
        foundRoom;


    showSection(
        "bookingSection"
    );


    const bookingContent =
        getElement(
            "bookingContent"
        );


    if (!bookingContent) {

        console.error(

            "RoomRent: bookingContent haipo."

        );

        return;

    }


    const dailyProfit =
        selectedRoom.price *
        ROOM_PROFIT_RATE_PER_DAY;


    const totalEstimatedProfit =
        dailyProfit *
        ROOM_DURATION_DAYS;


    bookingContent.innerHTML = `

        <div class="booking-card">

            <h2>
                🏠 Chumba
                ${selectedRoom.roomNumber}
            </h2>


            <div class="booking-detail">

                <span>
                    Bei ya chumba
                </span>

                <strong>
                    ${formatMoney(
                        selectedRoom.price
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida inayokadiriwa kwa siku
                </span>

                <strong>
                    ${formatMoney(
                        dailyProfit
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Muda wa uwekezaji
                </span>

                <strong>
                    ${ROOM_DURATION_DAYS}
                    siku
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida inayokadiriwa kwa kipindi
                </span>

                <strong>
                    ${formatMoney(
                        totalEstimatedProfit
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Kikomo cha bookings zako
                </span>

                <strong>
                    Hadi
                    ${selectedRoom.maxBookingsPerUser}
                </strong>

            </div>


            <div class="booking-notice">

                <p>
                    ℹ️ Faida itaendelea kuhesabiwa
                    kulingana na mfumo wa RoomRent
                    baada ya booking kuthibitishwa.
                </p>


                <p>
                    Makadirio haya hayamaanishi kuwa
                    faida yote inalipwa mara moja.
                </p>

            </div>


            <button

                type="button"

                class="primary-button"

                id="continueBookingButton"

                data-room-number="${selectedRoom.roomNumber}"

            >

                Endelea

            </button>

        </div>

    `;


    const continueButton =
        getElement(
            "continueBookingButton"
        );


    if (continueButton) {

        continueButton.addEventListener(

            "click",

            function() {

                openBookingConfirmation(
                    selectedRoom
                );

            }

        );

    }

}


/* =========================================================
   25B. BOOKING CONFIRMATION
========================================================= */

function openBookingConfirmation(
    room
) {

    if (!room) {

        return;

    }


    selectedRoom =
        room;


    const bookingContent =
        getElement(
            "bookingContent"
        );


    if (!bookingContent) {

        console.error(

            "RoomRent: bookingContent haipo."

        );

        return;

    }


    const dailyProfit =
        room.price *
        ROOM_PROFIT_RATE_PER_DAY;


    const totalEstimatedProfit =
        dailyProfit *
        ROOM_DURATION_DAYS;


    bookingContent.innerHTML = `

        <div class="booking-card">

            <h2>
                🔐 Thibitisha Booking
            </h2>


            <div class="booking-detail">

                <span>
                    Chumba
                </span>

                <strong>
                    ${room.roomNumber}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Bei
                </span>

                <strong>
                    ${formatMoney(
                        room.price
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Muda
                </span>

                <strong>
                    ${ROOM_DURATION_DAYS}
                    siku
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida inayokadiriwa kwa siku
                </span>

                <strong>
                    ${formatMoney(
                        dailyProfit
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida inayokadiriwa kwa kipindi
                </span>

                <strong>
                    ${formatMoney(
                        totalEstimatedProfit
                    )}
                </strong>

            </div>


            <div class="booking-notice">

                <p>
                    Tafadhali hakikisha taarifa za
                    chumba na bei kabla ya kuendelea.
                </p>

            </div>


            <button

                type="button"

                class="primary-button"

                id="confirmBookingButton"

                data-room-number="${room.roomNumber}"

            >

                Thibitisha Booking

            </button>


            <button

                type="button"

                class="secondary-button"

                id="cancelBookingButton"

            >

                Rudi

            </button>

        </div>

    `;


    const cancelButton =
        getElement(
            "cancelBookingButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(

            "click",

            function() {

                openBookingSection(
                    room.roomNumber
                );

            }

        );

    }


    const confirmButton =
        getElement(
            "confirmBookingButton"
        );


    if (confirmButton) {

        confirmButton.addEventListener(

            "click",

            function() {

                handleBookingConfirmation(
                    room
                );

            }

        );

    }

}


/* =========================================================
   25C. PAYMENT METHOD SELECTION
========================================================= */

function handleBookingConfirmation(
    room
) {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye akaunti yako kwanza."
        );

        return;

    }


    if (!room) {

        return;

    }


    selectedRoom =
        room;


    console.log(

        "RoomRent: Payment method selection:",

        room.roomNumber

    );


    const bookingContent =
        getElement(
            "bookingContent"
        );


    if (!bookingContent) {

        console.error(

            "RoomRent: bookingContent haipo."

        );

        return;

    }


    const dailyProfit =
        room.price *
        ROOM_PROFIT_RATE_PER_DAY;


    const totalEstimatedProfit =
        dailyProfit *
        ROOM_DURATION_DAYS;


    bookingContent.innerHTML = `

        <div class="booking-card">

            <h2>
                💳 Chagua Njia ya Malipo
            </h2>


            <div class="booking-detail">

                <span>
                    Chumba
                </span>

                <strong>
                    ${room.roomNumber}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Kiasi cha kulipa
                </span>

                <strong>
                    ${formatMoney(
                        room.price
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Muda wa uwekezaji
                </span>

                <strong>
                    ${ROOM_DURATION_DAYS}
                    siku
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida inayokadiriwa kwa siku
                </span>

                <strong>
                    ${formatMoney(
                        dailyProfit
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida inayokadiriwa kwa kipindi
                </span>

                <strong>
                    ${formatMoney(
                        totalEstimatedProfit
                    )}
                </strong>

            </div>


            <div class="payment-methods">

                <h3>
                    Chagua njia ya malipo
                </h3>


                <button

                    type="button"

                    class="primary-button payment-method-button"

                    id="mixxPaymentButton"

                >

                    💳 MIXX BY YAS

                </button>


                <button

                    type="button"

                    class="primary-button payment-method-button"

                    id="airtelPaymentButton"

                >

                    📱 Airtel Money

                </button>

            </div>


            <button

                type="button"

                class="secondary-button"

                id="backToBookingConfirmationButton"

            >

                Rudi

            </button>

        </div>

    `;


    const mixxButton =
        getElement(
            "mixxPaymentButton"
        );


    if (mixxButton) {

        mixxButton.addEventListener(

            "click",

            function() {

                showPaymentDetails(
                    room,
                    "MIXX BY YAS"
                );

            }

        );

    }


    const airtelButton =
        getElement(
            "airtelPaymentButton"
        );


    if (airtelButton) {

        airtelButton.addEventListener(

            "click",

            function() {

                showPaymentDetails(
                    room,
                    "Airtel Money"
                );

            }

        );

    }


    const backButton =
        getElement(
            "backToBookingConfirmationButton"
        );


    if (backButton) {

        backButton.addEventListener(

            "click",

            function() {

                openBookingConfirmation(
                    room
                );

            }

        );

    }

           }/* =========================================================
   22. AUTH STATE LISTENER
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


    auth.onAuthStateChanged(
        async function(user) {

            console.log(
                "RoomRent Auth State:",
                user
                    ? "LOGGED IN"
                    : "LOGGED OUT"
            );


            if (user) {

                currentUser =
                    user;


                try {

                    await loadCurrentUserData(
                        user
                    );


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


                    showAppScreen();


                    showSection(
                        "dashboardSection"
                    );

                }

            }


            else {

                currentUser =
                    null;


                currentUserData =
                    null;


                selectedRoom =
                    null;


                selectedPaymentMethod =
                    null;


                showAuthScreen();


                showLoginPanel();

            }

        }
    );

}


/* =========================================================
   23. ROOMS DISPLAY
========================================================= */

function loadRooms() {

    console.log(
        "RoomRent: loadRooms inaanza..."
    );


    const roomsList =
        getElement(
            "roomsList"
        );


    if (!roomsList) {

        console.error(

            "RoomRent: roomsList HAIPO kwenye HTML."

        );

        return;

    }


    if (!Array.isArray(ROOM_DATA)) {

        console.error(

            "RoomRent: ROOM_DATA HAIPO."

        );


        roomsList.innerHTML = `

            <div class="empty-state">

                <p>
                    Vyumba havijapatikana.
                </p>

            </div>

        `;

        return;

    }


    roomsList.innerHTML =
        "";


    ROOM_DATA.forEach(
        function(room) {

            const dailyProfit =
                room.price *
                ROOM_PROFIT_RATE_PER_DAY;


            const roomCard =
                document.createElement(
                    "div"
                );


            roomCard.className =
                "room-card";


            roomCard.innerHTML = `

                <div class="room-card-content">

                    <div class="room-number">

                        🏠 Chumba
                        ${room.roomNumber}

                    </div>


                    <div class="room-price">

                        ${formatMoney(
                            room.price
                        )}

                    </div>


                    <div class="room-info">

                        <div>

                            <span>
                                Faida kwa siku
                            </span>

                            <strong>

                                ${formatMoney(
                                    dailyProfit
                                )}

                            </strong>

                        </div>


                        <div>

                            <span>
                                Muda wa uwekezaji
                            </span>

                            <strong>

                                ${ROOM_DURATION_DAYS}
                                siku

                            </strong>

                        </div>


                        <div>

                            <span>
                                Booking zako
                            </span>

                            <strong>

                                Hadi
                                ${room.maxBookingsPerUser}

                            </strong>

                        </div>

                    </div>


                    <button

                        type="button"

                        class="primary-button rent-room-button"

                        data-room-number="${room.roomNumber}"

                    >

                        Kodisha Chumba

                    </button>

                </div>

            `;


            roomsList.appendChild(
                roomCard
            );

        }
    );


    const rentButtons =
        document.querySelectorAll(
            ".rent-room-button"
        );


    rentButtons.forEach(
        function(button) {

            button.addEventListener(

                "click",

                function() {

                    const roomNumber =
                        button.dataset.roomNumber;


                    openBookingSection(
                        roomNumber
                    );

                }

            );

        }
    );


    console.log(

        "RoomRent: Vyumba " +
        ROOM_DATA.length +
        " vimeonyeshwa."

    );

}


/* =========================================================
   24. OPEN ROOMS SECTION
========================================================= */

function openRoomsSection() {

    console.log(
        "RoomRent: Nafungua Rooms Section..."
    );


    showSection(
        "roomsSection"
    );


    loadRooms();


    console.log(
        "RoomRent: Rooms Section imefunguliwa."
    );

}


/* =========================================================
   25. OPEN BOOKING SECTION
========================================================= */

function openBookingSection(roomNumber) {

    console.log(
        "RoomRent: Chumba kilichochaguliwa:",
        roomNumber
    );


    const foundRoom =
        ROOM_DATA.find(
            function(room) {

                return String(
                    room.roomNumber
                ) === String(
                    roomNumber
                );

            }
        );


    if (!foundRoom) {

        console.error(

            "RoomRent: Chumba hakijapatikana:",

            roomNumber

        );

        return;

    }


    selectedRoom =
        foundRoom;


    showSection(
        "bookingSection"
    );


    const bookingContent =
        getElement(
            "bookingContent"
        );


    if (!bookingContent) {

        console.error(

            "RoomRent: bookingContent haipo."

        );

        return;

    }


    const dailyProfit =
        selectedRoom.price *
        ROOM_PROFIT_RATE_PER_DAY;


    const totalEstimatedProfit =
        dailyProfit *
        ROOM_DURATION_DAYS;


    bookingContent.innerHTML = `

        <div class="booking-card">

            <h2>
                🏠 Chumba
                ${selectedRoom.roomNumber}
            </h2>


            <div class="booking-detail">

                <span>
                    Bei ya chumba
                </span>

                <strong>
                    ${formatMoney(
                        selectedRoom.price
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida inayokadiriwa kwa siku
                </span>

                <strong>
                    ${formatMoney(
                        dailyProfit
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Muda wa uwekezaji
                </span>

                <strong>
                    ${ROOM_DURATION_DAYS}
                    siku
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida inayokadiriwa kwa kipindi
                </span>

                <strong>
                    ${formatMoney(
                        totalEstimatedProfit
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Kikomo cha bookings zako
                </span>

                <strong>
                    Hadi
                    ${selectedRoom.maxBookingsPerUser}
                </strong>

            </div>


            <div class="booking-notice">

                <p>
                    ℹ️ Faida itaendelea kuhesabiwa
                    kulingana na mfumo wa RoomRent
                    baada ya booking kuthibitishwa.
                </p>


                <p>
                    Makadirio haya hayamaanishi kuwa
                    faida yote inalipwa mara moja.
                </p>

            </div>


            <button

                type="button"

                class="primary-button"

                id="continueBookingButton"

                data-room-number="${selectedRoom.roomNumber}"

            >

                Endelea

            </button>

        </div>

    `;


    const continueButton =
        getElement(
            "continueBookingButton"
        );


    if (continueButton) {

        continueButton.addEventListener(

            "click",

            function() {

                openBookingConfirmation(
                    selectedRoom
                );

            }

        );

    }

}


/* =========================================================
   25B. BOOKING CONFIRMATION
========================================================= */

function openBookingConfirmation(
    room
) {

    if (!room) {

        return;

    }


    selectedRoom =
        room;


    const bookingContent =
        getElement(
            "bookingContent"
        );


    if (!bookingContent) {

        console.error(

            "RoomRent: bookingContent haipo."

        );

        return;

    }


    const dailyProfit =
        room.price *
        ROOM_PROFIT_RATE_PER_DAY;


    const totalEstimatedProfit =
        dailyProfit *
        ROOM_DURATION_DAYS;


    bookingContent.innerHTML = `

        <div class="booking-card">

            <h2>
                🔐 Thibitisha Booking
            </h2>


            <div class="booking-detail">

                <span>
                    Chumba
                </span>

                <strong>
                    ${room.roomNumber}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Bei
                </span>

                <strong>
                    ${formatMoney(
                        room.price
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Muda
                </span>

                <strong>
                    ${ROOM_DURATION_DAYS}
                    siku
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida inayokadiriwa kwa siku
                </span>

                <strong>
                    ${formatMoney(
                        dailyProfit
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida inayokadiriwa kwa kipindi
                </span>

                <strong>
                    ${formatMoney(
                        totalEstimatedProfit
                    )}
                </strong>

            </div>


            <div class="booking-notice">

                <p>
                    Tafadhali hakikisha taarifa za
                    chumba na bei kabla ya kuendelea.
                </p>

            </div>


            <button

                type="button"

                class="primary-button"

                id="confirmBookingButton"

                data-room-number="${room.roomNumber}"

            >

                Thibitisha Booking

            </button>


            <button

                type="button"

                class="secondary-button"

                id="cancelBookingButton"

            >

                Rudi

            </button>

        </div>

    `;


    const cancelButton =
        getElement(
            "cancelBookingButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(

            "click",

            function() {

                openBookingSection(
                    room.roomNumber
                );

            }

        );

    }


    const confirmButton =
        getElement(
            "confirmBookingButton"
        );


    if (confirmButton) {

        confirmButton.addEventListener(

            "click",

            function() {

                handleBookingConfirmation(
                    room
                );

            }

        );

    }

}


/* =========================================================
   25C. PAYMENT METHOD SELECTION
========================================================= */

function handleBookingConfirmation(
    room
) {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye akaunti yako kwanza."
        );

        return;

    }


    if (!room) {

        return;

    }


    selectedRoom =
        room;


    console.log(

        "RoomRent: Payment method selection:",

        room.roomNumber

    );


    const bookingContent =
        getElement(
            "bookingContent"
        );


    if (!bookingContent) {

        console.error(

            "RoomRent: bookingContent haipo."

        );

        return;

    }


    const dailyProfit =
        room.price *
        ROOM_PROFIT_RATE_PER_DAY;


    const totalEstimatedProfit =
        dailyProfit *
        ROOM_DURATION_DAYS;


    bookingContent.innerHTML = `

        <div class="booking-card">

            <h2>
                💳 Chagua Njia ya Malipo
            </h2>


            <div class="booking-detail">

                <span>
                    Chumba
                </span>

                <strong>
                    ${room.roomNumber}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Kiasi cha kulipa
                </span>

                <strong>
                    ${formatMoney(
                        room.price
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Muda wa uwekezaji
                </span>

                <strong>
                    ${ROOM_DURATION_DAYS}
                    siku
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida inayokadiriwa kwa siku
                </span>

                <strong>
                    ${formatMoney(
                        dailyProfit
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida inayokadiriwa kwa kipindi
                </span>

                <strong>
                    ${formatMoney(
                        totalEstimatedProfit
                    )}
                </strong>

            </div>


            <div class="payment-methods">

                <h3>
                    Chagua njia ya malipo
                </h3>


                <button

                    type="button"

                    class="primary-button payment-method-button"

                    id="mixxPaymentButton"

                >

                    💳 MIXX BY YAS

                </button>


                <button

                    type="button"

                    class="primary-button payment-method-button"

                    id="airtelPaymentButton"

                >

                    📱 Airtel Money

                </button>

            </div>


            <button

                type="button"

                class="secondary-button"

                id="backToBookingConfirmationButton"

            >

                Rudi

            </button>

        </div>

    `;


    const mixxButton =
        getElement(
            "mixxPaymentButton"
        );


    if (mixxButton) {

        mixxButton.addEventListener(

            "click",

            function() {

                showPaymentDetails(
                    room,
                    "MIXX BY YAS"
                );

            }

        );

    }


    const airtelButton =
        getElement(
            "airtelPaymentButton"
        );


    if (airtelButton) {

        airtelButton.addEventListener(

            "click",

            function() {

                showPaymentDetails(
                    room,
                    "Airtel Money"
                );

            }

        );

    }


    const backButton =
        getElement(
            "backToBookingConfirmationButton"
        );


    if (backButton) {

        backButton.addEventListener(

            "click",

            function() {

                openBookingConfirmation(
                    room
                );

            }

        );

    }

}

/* =========================================================
   26. PAYMENT DETAILS
========================================================= */

function showPaymentDetails(room, paymentMethod) {

    selectedRoom = room;
    selectedPaymentMethod = paymentMethod;

    const bookingSection = getElement("bookingSection");

    if (!bookingSection) {
        console.error("bookingSection haipo.");
        return;
    }

    let ownerName = "HARUNA ISSA HAMAD";
    let paymentNumber = "";

    if (paymentMethod === "MIXX BY YAS") {
        paymentNumber = "0651590936";
    } else if (paymentMethod === "Airtel Money") {
        paymentNumber = "0667872515";
    }

    bookingSection.innerHTML = `
        <div class="section-header">
            <button id="backToBookingConfirmationButton" class="back-button">
                ← Rudi
            </button>

            <h2>Maelekezo ya Malipo</h2>
        </div>

        <div class="payment-details-card">

            <h3>Room ${room.roomNumber}</h3>

            <p>
                <strong>Kiasi cha kulipa:</strong>
                ${formatMoney(room.price)}
            </p>

            <p>
                <strong>Njia ya malipo:</strong>
                ${paymentMethod}
            </p>

            <hr>

            <p>
                <strong>Jina la mpokeaji:</strong><br>
                ${ownerName}
            </p>

            <p>
                <strong>Namba ya malipo:</strong><br>
                <span class="payment-number">
                    ${paymentNumber}
                </span>
            </p>

            <div class="payment-warning">
                <strong>MUHIMU:</strong><br>
                Hakikisha unatuma kiasi sahihi kwenye namba iliyoonyeshwa
                hapo juu.
            </div>

            <button
                id="paymentDoneButton"
                class="primary-button"
                type="button"
            >
                Nimeshafanya Malipo
            </button>

            <button
                id="chooseAnotherPaymentButton"
                class="secondary-button"
                type="button"
            >
                Chagua Njia Nyingine
            </button>

        </div>
    `;

    showElement("bookingSection");

    const paymentDoneButton =
        getElement("paymentDoneButton");

    if (paymentDoneButton) {

        paymentDoneButton.addEventListener("click", function () {

            showPaymentSubmission(
                room,
                paymentMethod
            );

        });

    }

    const chooseAnotherPaymentButton =
        getElement("chooseAnotherPaymentButton");

    if (chooseAnotherPaymentButton) {

        chooseAnotherPaymentButton.addEventListener(
            "click",
            function () {

                handleBookingConfirmation(room);

            }
        );

    }

    const backButton =
        getElement("backToBookingConfirmationButton");

    if (backButton) {

        backButton.addEventListener("click", function () {

            openBookingConfirmation(room);

        });

    }
}


/* =========================================================
   27. PAYMENT SUBMISSION
========================================================= */

function showPaymentSubmission(room, paymentMethod) {

    selectedRoom = room;
    selectedPaymentMethod = paymentMethod;

    const bookingSection =
        getElement("bookingSection");

    if (!bookingSection) {
        console.error("bookingSection haipo.");
        return;
    }

    bookingSection.innerHTML = `
        <div class="section-header">

            <button
                id="backToPaymentDetailsButton"
                class="back-button"
                type="button"
            >
                ← Rudi
            </button>

            <h2>Tuma Uthibitisho wa Malipo</h2>

        </div>

        <div class="payment-submission-card">

            <h3>Room ${room.roomNumber}</h3>

            <p>
                <strong>Kiasi:</strong>
                ${formatMoney(room.price)}
            </p>

            <p>
                <strong>Njia ya malipo:</strong>
                ${paymentMethod}
            </p>

            <div class="form-group">

                <label for="transactionIdInput">
                    Transaction ID / Reference Number
                </label>

                <input
                    type="text"
                    id="transactionIdInput"
                    placeholder="Weka Transaction ID"
                    autocomplete="off"
                >

            </div>

            <div class="form-group">

                <label for="senderPhoneInput">
                    Namba ya simu iliyotuma pesa
                </label>

                <input
                    type="tel"
                    id="senderPhoneInput"
                    placeholder="Mfano: 06XXXXXXXX"
                    autocomplete="tel"
                >

            </div>

            <div
                id="paymentSubmissionMessage"
                class="form-message"
            ></div>

            <button
                id="submitPaymentProofButton"
                class="primary-button"
                type="button"
            >
                Tuma Uthibitisho
            </button>

        </div>
    `;

    showElement("bookingSection");

    const submitButton =
        getElement("submitPaymentProofButton");

    if (submitButton) {

        submitButton.addEventListener(
            "click",
            async function () {

                const transactionId =
                    getElement("transactionIdInput")?.value.trim();

                const senderPhone =
                    getElement("senderPhoneInput")?.value.trim();

                const message =
                    getElement("paymentSubmissionMessage");

                if (!currentUser) {

                    if (message) {
                        setMessage(
                            "Tafadhali ingia kwenye akaunti yako kwanza.",
                            "error"
                        );
                    }

                    return;
                }

                if (!transactionId) {

                    if (message) {
                        setMessage(
                            "Tafadhali weka Transaction ID.",
                            "error"
                        );
                    }

                    return;
                }

                if (!senderPhone) {

                    if (message) {
                        setMessage(
                            "Tafadhali weka namba ya simu iliyotuma malipo.",
                            "error"
                        );
                    }

                    return;
                }

                submitButton.disabled = true;
                submitButton.textContent =
                    "Inatuma...";

                /*
                 * KWA SASA:
                 * Hatua hii inathibitisha taarifa za mtumiaji
                 * kwenye interface tu.
                 *
                 * Hatutaandika "malipo yamehifadhiwa" kwa sababu
                 * Firestore booking/payment collection bado
                 * haijaunganishwa katika sehemu hii.
                 */

                if (message) {

                    setMessage(
                        "Uthibitisho umejazwa vizuri. Hatua inayofuata ni kuunganisha taarifa hizi na Firestore ili booking itunzwe na admin aweze kuithibitisha.",
                        "success"
                    );

                }

                submitButton.disabled = false;
                submitButton.textContent =
                    "Tuma Uthibitisho";

            }
        );

    }

    const backButton =
        getElement("backToPaymentDetailsButton");

    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                showPaymentDetails(
                    room,
                    paymentMethod
                );

            }
        );

    }
}


/* =========================================================
   28. INITIALIZE ROOMS
========================================================= */

function initializeRoomsSection() {

    const roomsSection =
        getElement("roomsSection");

    if (!roomsSection) {
        console.warn("roomsSection haipo kwenye HTML.");
        return;
    }

    loadRooms();

}


/* =========================================================
   29. EVENT BINDING
========================================================= */

function bindEvents() {

    /* ---------- LOGIN ---------- */

    const signInForm =
        getElement("signInForm");

    if (signInForm) {

        signInForm.addEventListener(
            "submit",
            signInUser
        );

    }


    /* ---------- REGISTER ---------- */

    const signUpForm =
        getElement("signUpForm");

    if (signUpForm) {

        signUpForm.addEventListener(
            "submit",
            registerUser
        );

    }


    /* ---------- FORGOT PASSWORD ---------- */

    const forgotPasswordForm =
        getElement("forgotPasswordForm");

    if (forgotPasswordForm) {

        forgotPasswordForm.addEventListener(
            "submit",
            resetPassword
        );

    }


    /* ---------- SHOW REGISTER ---------- */

    const showRegisterButton =
        getElement("showRegisterButton");

    if (showRegisterButton) {

        showRegisterButton.addEventListener(
            "click",
            showRegisterPanel
        );

    }


    /* ---------- SHOW LOGIN ---------- */

    const showLoginButton =
        getElement("showLoginButton");

    if (showLoginButton) {

        showLoginButton.addEventListener(
            "click",
            showLoginPanel
        );

    }


    /* ---------- SHOW FORGOT PASSWORD ---------- */

    const showForgotPasswordButton =
        getElement("showForgotPasswordButton");

    if (showForgotPasswordButton) {

        showForgotPasswordButton.addEventListener(
            "click",
            showForgotPasswordPanel
        );

    }


    /* ---------- BACK TO LOGIN ---------- */

    const backToLoginButton =
        getElement("backToLoginButton");

    if (backToLoginButton) {

        backToLoginButton.addEventListener(
            "click",
            showLoginPanel
        );

    }


    /* ---------- LOGOUT ---------- */

    const logoutButton =
        getElement("logoutButton");

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            signOutUser
        );

    }


    /* ---------- COPY REFERRAL ---------- */

    const copyReferralButton =
        getElement("copyReferralButton");

    if (copyReferralButton) {

        copyReferralButton.addEventListener(
            "click",
            copyReferralLink
        );

    }


    /* ---------- DASHBOARD: ROOMS ---------- */

    const viewRoomsButton =
        getElement("viewRoomsButton");

    if (viewRoomsButton) {

        viewRoomsButton.addEventListener(
            "click",
            openRoomsSection
        );

    }


    /* ---------- DASHBOARD: MY BOOKINGS ---------- */

    const viewBookingsButton =
        getElement("viewBookingsButton");

    if (viewBookingsButton) {

        viewBookingsButton.addEventListener(
            "click",
            function () {

                showSection("myBookingsSection");

            }
        );

    }


    /* ---------- DASHBOARD: WITHDRAW ---------- */

    const withdrawButton =
        getElement("withdrawButton");

    if (withdrawButton) {

        withdrawButton.addEventListener(
            "click",
            function () {

                showSection("withdrawalSection");

            }
        );

    }


    /* ---------- DASHBOARD: REFERRAL ---------- */

    const referralButton =
        getElement("referralButton");

    if (referralButton) {

        referralButton.addEventListener(
            "click",
            function () {

                showSection("referralSection");

            }
        );

    }


    /* =====================================================
       BOTTOM NAVIGATION
    ===================================================== */

    const bottomHomeButton =
        getElement("bottomHomeButton");

    if (bottomHomeButton) {

        bottomHomeButton.addEventListener(
            "click",
            function () {

                showSection("dashboardSection");

            }
        );

    }


    const bottomRoomsButton =
        getElement("bottomRoomsButton");

    if (bottomRoomsButton) {

        bottomRoomsButton.addEventListener(
            "click",
            openRoomsSection
        );

    }


    const bottomBookingsButton =
        getElement("bottomBookingsButton");

    if (bottomBookingsButton) {

        bottomBookingsButton.addEventListener(
            "click",
            function () {

                showSection("myBookingsSection");

            }
        );

    }


    const bottomAccountButton =
        getElement("bottomAccountButton");

    if (bottomAccountButton) {

        bottomAccountButton.addEventListener(
            "click",
            function () {

                showSection("accountSection");

            }
        );

    }


    /* =====================================================
       BACK BUTTONS
    ===================================================== */

    const backFromRoomsButton =
        getElement("backFromRoomsButton");

    if (backFromRoomsButton) {

        backFromRoomsButton.addEventListener(
            "click",
            function () {

                showSection("dashboardSection");

            }
        );

    }


    const backFromBookingsButton =
        getElement("backFromBookingsButton");

    if (backFromBookingsButton) {

        backFromBookingsButton.addEventListener(
            "click",
            function () {

                showSection("dashboardSection");

            }
        );

    }


    const backFromWithdrawalButton =
        getElement("backFromWithdrawalButton");

    if (backFromWithdrawalButton) {

        backFromWithdrawalButton.addEventListener(
            "click",
            function () {

                showSection("dashboardSection");

            }
        );

    }


    const backFromReferralButton =
        getElement("backFromReferralButton");

    if (backFromReferralButton) {

        backFromReferralButton.addEventListener(
            "click",
            function () {

                showSection("dashboardSection");

            }
        );

    }


    const backFromAccountButton =
        getElement("backFromAccountButton");

    if (backFromAccountButton) {

        backFromAccountButton.addEventListener(
            "click",
            function () {

                showSection("dashboardSection");

            }
        );

    }

}


/* =========================================================
   30. INITIALIZE ROOMRENT
========================================================= */

function initializeRoomRent() {

    try {

        console.log("RoomRent inaanza...");

        bindEvents();

        initializeAuthListener();

        initializeRoomsSection();

        loadReferralFromURL();

        console.log(
            "RoomRent imeanzishwa kikamilifu."
        );

    } catch (error) {

        console.error(
            "Hitilafu wakati wa kuanzisha RoomRent:",
            error
        );

    }

}


/* =========================================================
   31. DOM READY
========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeRoomRent
    );

} else {

    initializeRoomRent();

           }/* =========================================================
   26. PAYMENT DETAILS
========================================================= */

function showPaymentDetails(room, paymentMethod) {

    selectedRoom = room;
    selectedPaymentMethod = paymentMethod;

    const bookingSection = getElement("bookingSection");

    if (!bookingSection) {
        console.error("bookingSection haipo.");
        return;
    }

    let ownerName = "HARUNA ISSA HAMAD";
    let paymentNumber = "";

    if (paymentMethod === "MIXX BY YAS") {
        paymentNumber = "0651590936";
    } else if (paymentMethod === "Airtel Money") {
        paymentNumber = "0667872515";
    }

    bookingSection.innerHTML = `
        <div class="section-header">
            <button id="backToBookingConfirmationButton" class="back-button">
                ← Rudi
            </button>

            <h2>Maelekezo ya Malipo</h2>
        </div>

        <div class="payment-details-card">

            <h3>Room ${room.roomNumber}</h3>

            <p>
                <strong>Kiasi cha kulipa:</strong>
                ${formatMoney(room.price)}
            </p>

            <p>
                <strong>Njia ya malipo:</strong>
                ${paymentMethod}
            </p>

            <hr>

            <p>
                <strong>Jina la mpokeaji:</strong><br>
                ${ownerName}
            </p>

            <p>
                <strong>Namba ya malipo:</strong><br>
                <span class="payment-number">
                    ${paymentNumber}
                </span>
            </p>

            <div class="payment-warning">
                <strong>MUHIMU:</strong><br>
                Hakikisha unatuma kiasi sahihi kwenye namba iliyoonyeshwa
                hapo juu.
            </div>

            <button
                id="paymentDoneButton"
                class="primary-button"
                type="button"
            >
                Nimeshafanya Malipo
            </button>

            <button
                id="chooseAnotherPaymentButton"
                class="secondary-button"
                type="button"
            >
                Chagua Njia Nyingine
            </button>

        </div>
    `;

    showElement("bookingSection");

    const paymentDoneButton =
        getElement("paymentDoneButton");

    if (paymentDoneButton) {

        paymentDoneButton.addEventListener("click", function () {

            showPaymentSubmission(
                room,
                paymentMethod
            );

        });

    }

    const chooseAnotherPaymentButton =
        getElement("chooseAnotherPaymentButton");

    if (chooseAnotherPaymentButton) {

        chooseAnotherPaymentButton.addEventListener(
            "click",
            function () {

                handleBookingConfirmation(room);

            }
        );

    }

    const backButton =
        getElement("backToBookingConfirmationButton");

    if (backButton) {

        backButton.addEventListener("click", function () {

            openBookingConfirmation(room);

        });

    }
}


/* =========================================================
   27. PAYMENT SUBMISSION
========================================================= */

function showPaymentSubmission(room, paymentMethod) {

    selectedRoom = room;
    selectedPaymentMethod = paymentMethod;

    const bookingSection =
        getElement("bookingSection");

    if (!bookingSection) {
        console.error("bookingSection haipo.");
        return;
    }

    bookingSection.innerHTML = `
        <div class="section-header">

            <button
                id="backToPaymentDetailsButton"
                class="back-button"
                type="button"
            >
                ← Rudi
            </button>

            <h2>Tuma Uthibitisho wa Malipo</h2>

        </div>

        <div class="payment-submission-card">

            <h3>Room ${room.roomNumber}</h3>

            <p>
                <strong>Kiasi:</strong>
                ${formatMoney(room.price)}
            </p>

            <p>
                <strong>Njia ya malipo:</strong>
                ${paymentMethod}
            </p>

            <div class="form-group">

                <label for="transactionIdInput">
                    Transaction ID / Reference Number
                </label>

                <input
                    type="text"
                    id="transactionIdInput"
                    placeholder="Weka Transaction ID"
                    autocomplete="off"
                >

            </div>

            <div class="form-group">

                <label for="senderPhoneInput">
                    Namba ya simu iliyotuma pesa
                </label>

                <input
                    type="tel"
                    id="senderPhoneInput"
                    placeholder="Mfano: 06XXXXXXXX"
                    autocomplete="tel"
                >

            </div>

            <div
                id="paymentSubmissionMessage"
                class="form-message"
            ></div>

            <button
                id="submitPaymentProofButton"
                class="primary-button"
                type="button"
            >
                Tuma Uthibitisho
            </button>

        </div>
    `;

    showElement("bookingSection");

    const submitButton =
        getElement("submitPaymentProofButton");

    if (submitButton) {

        submitButton.addEventListener(
            "click",
            async function () {

                const transactionId =
                    getElement("transactionIdInput")?.value.trim();

                const senderPhone =
                    getElement("senderPhoneInput")?.value.trim();

                const message =
                    getElement("paymentSubmissionMessage");

                if (!currentUser) {

                    if (message) {
                        setMessage(
                            "Tafadhali ingia kwenye akaunti yako kwanza.",
                            "error"
                        );
                    }

                    return;
                }

                if (!transactionId) {

                    if (message) {
                        setMessage(
                            "Tafadhali weka Transaction ID.",
                            "error"
                        );
                    }

                    return;
                }

                if (!senderPhone) {

                    if (message) {
                        setMessage(
                            "Tafadhali weka namba ya simu iliyotuma malipo.",
                            "error"
                        );
                    }

                    return;
                }

                submitButton.disabled = true;
                submitButton.textContent =
                    "Inatuma...";

                /*
                 * KWA SASA:
                 * Hatua hii inathibitisha taarifa za mtumiaji
                 * kwenye interface tu.
                 *
                 * Hatutaandika "malipo yamehifadhiwa" kwa sababu
                 * Firestore booking/payment collection bado
                 * haijaunganishwa katika sehemu hii.
                 */

                if (message) {

                    setMessage(
                        "Uthibitisho umejazwa vizuri. Hatua inayofuata ni kuunganisha taarifa hizi na Firestore ili booking itunzwe na admin aweze kuithibitisha.",
                        "success"
                    );

                }

                submitButton.disabled = false;
                submitButton.textContent =
                    "Tuma Uthibitisho";

            }
        );

    }

    const backButton =
        getElement("backToPaymentDetailsButton");

    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                showPaymentDetails(
                    room,
                    paymentMethod
                );

            }
        );

    }
}


/* =========================================================
   28. INITIALIZE ROOMS
========================================================= */

function initializeRoomsSection() {

    const roomsSection =
        getElement("roomsSection");

    if (!roomsSection) {
        console.warn("roomsSection haipo kwenye HTML.");
        return;
    }

    loadRooms();

}


/* =========================================================
   29. EVENT BINDING
========================================================= */

function bindEvents() {

    /* ---------- LOGIN ---------- */

    const signInForm =
        getElement("signInForm");

    if (signInForm) {

        signInForm.addEventListener(
            "submit",
            signInUser
        );

    }


    /* ---------- REGISTER ---------- */

    const signUpForm =
        getElement("signUpForm");

    if (signUpForm) {

        signUpForm.addEventListener(
            "submit",
            registerUser
        );

    }


    /* ---------- FORGOT PASSWORD ---------- */

    const forgotPasswordForm =
        getElement("forgotPasswordForm");

    if (forgotPasswordForm) {

        forgotPasswordForm.addEventListener(
            "submit",
            resetPassword
        );

    }


    /* ---------- SHOW REGISTER ---------- */

    const showRegisterButton =
        getElement("showRegisterButton");

    if (showRegisterButton) {

        showRegisterButton.addEventListener(
            "click",
            showRegisterPanel
        );

    }


    /* ---------- SHOW LOGIN ---------- */

    const showLoginButton =
        getElement("showLoginButton");

    if (showLoginButton) {

        showLoginButton.addEventListener(
            "click",
            showLoginPanel
        );

    }


    /* ---------- SHOW FORGOT PASSWORD ---------- */

    const showForgotPasswordButton =
        getElement("showForgotPasswordButton");

    if (showForgotPasswordButton) {

        showForgotPasswordButton.addEventListener(
            "click",
            showForgotPasswordPanel
        );

    }


    /* ---------- BACK TO LOGIN ---------- */

    const backToLoginButton =
        getElement("backToLoginButton");

    if (backToLoginButton) {

        backToLoginButton.addEventListener(
            "click",
            showLoginPanel
        );

    }


    /* ---------- LOGOUT ---------- */

    const logoutButton =
        getElement("logoutButton");

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            signOutUser
        );

    }


    /* ---------- COPY REFERRAL ---------- */

    const copyReferralButton =
        getElement("copyReferralButton");

    if (copyReferralButton) {

        copyReferralButton.addEventListener(
            "click",
            copyReferralLink
        );

    }


    /* ---------- DASHBOARD: ROOMS ---------- */

    const viewRoomsButton =
        getElement("viewRoomsButton");

    if (viewRoomsButton) {

        viewRoomsButton.addEventListener(
            "click",
            openRoomsSection
        );

    }


    /* ---------- DASHBOARD: MY BOOKINGS ---------- */

    const viewBookingsButton =
        getElement("viewBookingsButton");

    if (viewBookingsButton) {

        viewBookingsButton.addEventListener(
            "click",
            function () {

                showSection("myBookingsSection");

            }
        );

    }


    /* ---------- DASHBOARD: WITHDRAW ---------- */

    const withdrawButton =
        getElement("withdrawButton");

    if (withdrawButton) {

        withdrawButton.addEventListener(
            "click",
            function () {

                showSection("withdrawalSection");

            }
        );

    }


    /* ---------- DASHBOARD: REFERRAL ---------- */

    const referralButton =
        getElement("referralButton");

    if (referralButton) {

        referralButton.addEventListener(
            "click",
            function () {

                showSection("referralSection");

            }
        );

    }


    /* =====================================================
       BOTTOM NAVIGATION
    ===================================================== */

    const bottomHomeButton =
        getElement("bottomHomeButton");

    if (bottomHomeButton) {

        bottomHomeButton.addEventListener(
            "click",
            function () {

                showSection("dashboardSection");

            }
        );

    }


    const bottomRoomsButton =
        getElement("bottomRoomsButton");

    if (bottomRoomsButton) {

        bottomRoomsButton.addEventListener(
            "click",
            openRoomsSection
        );

    }


    const bottomBookingsButton =
        getElement("bottomBookingsButton");

    if (bottomBookingsButton) {

        bottomBookingsButton.addEventListener(
            "click",
            function () {

                showSection("myBookingsSection");

            }
        );

    }


    const bottomAccountButton =
        getElement("bottomAccountButton");

    if (bottomAccountButton) {

        bottomAccountButton.addEventListener(
            "click",
            function () {

                showSection("accountSection");

            }
        );

    }


    /* =====================================================
       BACK BUTTONS
    ===================================================== */

    const backFromRoomsButton =
        getElement("backFromRoomsButton");

    if (backFromRoomsButton) {

        backFromRoomsButton.addEventListener(
            "click",
            function () {

                showSection("dashboardSection");

            }
        );

    }


    const backFromBookingsButton =
        getElement("backFromBookingsButton");

    if (backFromBookingsButton) {

        backFromBookingsButton.addEventListener(
            "click",
            function () {

                showSection("dashboardSection");

            }
        );

    }


    const backFromWithdrawalButton =
        getElement("backFromWithdrawalButton");

    if (backFromWithdrawalButton) {

        backFromWithdrawalButton.addEventListener(
            "click",
            function () {

                showSection("dashboardSection");

            }
        );

    }


    const backFromReferralButton =
        getElement("backFromReferralButton");

    if (backFromReferralButton) {

        backFromReferralButton.addEventListener(
            "click",
            function () {

                showSection("dashboardSection");

            }
        );

    }


    const backFromAccountButton =
        getElement("backFromAccountButton");

    if (backFromAccountButton) {

        backFromAccountButton.addEventListener(
            "click",
            function () {

                showSection("dashboardSection");

            }
        );

    }

}


/* =========================================================
   30. INITIALIZE ROOMRENT
========================================================= */

function initializeRoomRent() {

    try {

        console.log("RoomRent inaanza...");

        bindEvents();

        initializeAuthListener();

        initializeRoomsSection();

        loadReferralFromURL();

        console.log(
            "RoomRent imeanzishwa kikamilifu."
        );

    } catch (error) {

        console.error(
            "Hitilafu wakati wa kuanzisha RoomRent:",
            error
        );

    }

}


/* =========================================================
   31. DOM READY
========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeRoomRent
    );

} else {

    initializeRoomRent();

}

/* =========================================================
   32. SAVE BOOKING + PAYMENT PROOF TO FIRESTORE
========================================================= */

async function saveBookingPaymentProof(
    room,
    paymentMethod,
    transactionId,
    senderPhone
) {

    if (!currentUser) {
        throw new Error(
            "Mtumiaji hajaingia kwenye akaunti."
        );
    }

    if (!room || !room.roomNumber) {
        throw new Error(
            "Room haijachaguliwa."
        );
    }

    if (!paymentMethod) {
        throw new Error(
            "Njia ya malipo haijachaguliwa."
        );
    }

    if (!transactionId) {
        throw new Error(
            "Transaction ID haijawekwa."
        );
    }

    if (!senderPhone) {
        throw new Error(
            "Namba ya simu haijawekwa."
        );
    }


    /* -----------------------------------------------------
       UNIQUE BOOKING NUMBER
    ----------------------------------------------------- */

    const bookingNumber =
        "RR-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase();


    /* -----------------------------------------------------
       BOOKING DATA
    ----------------------------------------------------- */

    const bookingData = {

        bookingNumber: bookingNumber,

        userId: currentUser.uid,

        userEmail:
            currentUser.email || "",

        userName:
            currentUserData?.name || "",

        userPhone:
            currentUserData?.phone || "",


        roomNumber:
            room.roomNumber,

        roomPrice:
            Number(room.price) || 0,

        durationDays:
            ROOM_DURATION_DAYS,

        profitRatePerDay:
            ROOM_PROFIT_RATE_PER_DAY,

        estimatedDailyProfit:
            (Number(room.price) || 0) *
            ROOM_PROFIT_RATE_PER_DAY,

        estimatedTotalProfit:
            (Number(room.price) || 0) *
            ROOM_PROFIT_RATE_PER_DAY *
            ROOM_DURATION_DAYS,


        paymentMethod:
            paymentMethod,

        transactionId:
            transactionId,

        senderPhone:
            senderPhone,


        paymentStatus:
            "pending",

        bookingStatus:
            "pending",


        createdAt:
            firebase.firestore.FieldValue.serverTimestamp(),

        updatedAt:
            firebase.firestore.FieldValue.serverTimestamp()

    };


    /* -----------------------------------------------------
       SAVE TO FIRESTORE
    ----------------------------------------------------- */

    const bookingRef =
        await db
            .collection("bookings")
            .add(bookingData);


    return {

        id: bookingRef.id,

        bookingNumber: bookingNumber

    };

}


/* =========================================================
   33. UPDATED PAYMENT SUBMISSION
========================================================= */

async function submitPaymentProof() {

    const transactionInput =
        getElement("transactionIdInput");

    const phoneInput =
        getElement("senderPhoneInput");

    const message =
        getElement("paymentSubmissionMessage");

    const submitButton =
        getElement("submitPaymentProofButton");


    const transactionId =
        transactionInput
            ? transactionInput.value.trim()
            : "";

    const senderPhone =
        phoneInput
            ? phoneInput.value.trim()
            : "";


    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (!currentUser) {

        if (message) {
            setMessage(
                "Tafadhali ingia kwenye akaunti yako kwanza.",
                "error"
            );
        }

        return;
    }


    if (!selectedRoom) {

        if (message) {
            setMessage(
                "Tafadhali chagua room kwanza.",
                "error"
            );
        }

        return;
    }


    if (!selectedPaymentMethod) {

        if (message) {
            setMessage(
                "Tafadhali chagua njia ya malipo.",
                "error"
            );
        }

        return;
    }


    if (!transactionId) {

        if (message) {
            setMessage(
                "Tafadhali weka Transaction ID.",
                "error"
            );
        }

        if (transactionInput) {
            transactionInput.focus();
        }

        return;
    }


    if (!senderPhone) {

        if (message) {
            setMessage(
                "Tafadhali weka namba ya simu iliyotuma malipo.",
                "error"
            );
        }

        if (phoneInput) {
            phoneInput.focus();
        }

        return;
    }


    /* -----------------------------------------------------
       DISABLE BUTTON
    ----------------------------------------------------- */

    if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
            "Inahifadhi...";

    }


    if (message) {

        setMessage(
            "Tafadhali subiri...",
            "info"
        );

    }


    try {

        const result =
            await saveBookingPaymentProof(
                selectedRoom,
                selectedPaymentMethod,
                transactionId,
                senderPhone
            );


        /* -------------------------------------------------
           SUCCESS
        ------------------------------------------------- */

        if (message) {

            setMessage(
                "Booking yako imetumwa kikamilifu. Booking Number: " +
                result.bookingNumber +
                ". Subiri admin athibitishe malipo yako.",
                "success"
            );

        }


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                "Booking Imetumwa";

        }


        /*
         * Baada ya kuhifadhi booking,
         * tunampa user nafasi ya kurudi kwenye Rooms.
         */

        const bookingSection =
            getElement("bookingSection");

        if (bookingSection) {

            const oldActions =
                bookingSection.querySelector(
                    ".booking-success-actions"
                );

            if (!oldActions) {

                const actions =
                    document.createElement("div");

                actions.className =
                    "booking-success-actions";

                actions.innerHTML = `

                    <button
                        id="viewMyBookingsAfterPayment"
                        class="primary-button"
                        type="button"
                    >
                        Angalia Bookings Zangu
                    </button>

                    <button
                        id="backToRoomsAfterPayment"
                        class="secondary-button"
                        type="button"
                    >
                        Rudi Rooms
                    </button>

                `;

                bookingSection.appendChild(actions);


                const viewBookingsButton =
                    getElement(
                        "viewMyBookingsAfterPayment"
                    );

                if (viewBookingsButton) {

                    viewBookingsButton.addEventListener(
                        "click",
                        function () {

                            showSection(
                                "myBookingsSection"
                            );

                        }
                    );

                }


                const backRoomsButton =
                    getElement(
                        "backToRoomsAfterPayment"
                    );

                if (backRoomsButton) {

                    backRoomsButton.addEventListener(
                        "click",
                        openRoomsSection
                    );

                }

            }

        }


    } catch (error) {

        console.error(
            "Booking save error:",
            error
        );


        if (message) {

            setMessage(
                "Booking haikuweza kuhifadhiwa. Tafadhali jaribu tena.",
                "error"
            );

        }


        if (submitButton) {

            submitButton.disabled = false;

            submitButton.textContent =
                "Tuma Uthibitisho";

        }

    }

}


/* =========================================================
   34. REPLACE PAYMENT SUBMISSION BUTTON
========================================================= */

function setupPaymentSubmissionButton() {

    const submitButton =
        getElement("submitPaymentProofButton");

    if (!submitButton) {
        return;
    }

    submitButton.onclick =
        submitPaymentProof;

}


/* =========================================================
   35. MY BOOKINGS
========================================================= */

async function loadMyBookings() {

    const container =
        getElement("myBookingsContent");

    if (!container) {
        return;
    }


    if (!currentUser) {

        container.innerHTML = `
            <p>
                Tafadhali ingia kwenye akaunti yako
                ili kuona bookings zako.
            </p>
        `;

        return;
    }


    container.innerHTML = `
        <p>Inapakia bookings...</p>
    `;


    try {

        const snapshot =
            await db
                .collection("bookings")
                .where(
                    "userId",
                    "==",
                    currentUser.uid
                )
                .get();


        if (snapshot.empty) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>Hakuna Booking bado</h3>

                    <p>
                        Chagua room ili kuanza booking yako.
                    </p>

                    <button
                        id="emptyBookingsRoomsButton"
                        class="primary-button"
                        type="button"
                    >
                        Angalia Rooms
                    </button>
                </div>
            `;


            const roomsButton =
                getElement(
                    "emptyBookingsRoomsButton"
                );

            if (roomsButton) {

                roomsButton.addEventListener(
                    "click",
                    openRoomsSection
                );

            }

            return;

        }


        let html = "";


        snapshot.forEach(function(doc) {

            const booking =
                doc.data();


            let createdDate =
                "Inasubiri...";


            if (
                booking.createdAt &&
                booking.createdAt.toDate
            ) {

                createdDate =
                    booking.createdAt
                        .toDate()
                        .toLocaleString();

            }


            html += `

                <div class="booking-card">

                    <h3>
                        Room ${booking.roomNumber}
                    </h3>

                    <p>
                        <strong>
                            Booking Number:
                        </strong>
                        ${booking.bookingNumber || "-"}
                    </p>

                    <p>
                        <strong>
                            Kiasi:
                        </strong>
                        ${formatMoney(
                            booking.roomPrice || 0
                        )}
                    </p>

                    <p>
                        <strong>
                            Malipo:
                        </strong>
                        ${booking.paymentMethod || "-"}
                    </p>

                    <p>
                        <strong>
                            Payment Status:
                        </strong>
                        ${booking.paymentStatus || "pending"}
                    </p>

                    <p>
                        <strong>
                            Booking Status:
                        </strong>
                        ${booking.bookingStatus || "pending"}
                    </p>

                    <p>
                        <strong>
                            Tarehe:
                        </strong>
                        ${createdDate}
                    </p>

                </div>

            `;

        });


        container.innerHTML = html;


    } catch (error) {

        console.error(
            "Load bookings error:",
            error
        );


        container.innerHTML = `
            <div class="error-state">
                Imeshindikana kupakia bookings.
                Tafadhali jaribu tena.
            </div>
        `;

    }

}


/* =========================================================
   36. OPEN MY BOOKINGS
========================================================= */

function openMyBookingsSection() {

    showSection(
        "myBookingsSection"
    );

    loadMyBookings();

}


/* =========================================================
   37. UPDATE BOOKING NAVIGATION
========================================================= */

function setupBookingsNavigation() {

    const viewBookingsButton =
        getElement("viewBookingsButton");

    if (viewBookingsButton) {

        viewBookingsButton.onclick =
            openMyBookingsSection;

    }


    const bottomBookingsButton =
        getElement("bottomBookingsButton");

    if (bottomBookingsButton) {

        bottomBookingsButton.onclick =
            openMyBookingsSection;

    }

}

/* =========================================================
   38. FINAL EVENT SETUP
========================================================= */

function setupFinalEvents() {

    /*
     * MY BOOKINGS
     */

    setupBookingsNavigation();


    /*
     * PAYMENT SUBMISSION
     *
     * Kwa sababu payment form inatengenezwa
     * dynamically, tunatumia event delegation.
     */

    document.addEventListener(
        "click",
        function (event) {

            if (
                event.target &&
                event.target.id ===
                "submitPaymentProofButton"
            ) {

                submitPaymentProof();

            }

        }
    );

}


/* =========================================================
   39. FINAL INITIALIZATION
========================================================= */

function startFinalRoomRentFeatures() {

    try {

        setupFinalEvents();

        console.log(
            "RoomRent features zimeunganishwa."
        );

    } catch (error) {

        console.error(
            "Final features initialization error:",
            error
        );

    }

}


/* =========================================================
   40. START FINAL FEATURES
========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        startFinalRoomRentFeatures
    );

} else {

    startFinalRoomRentFeatures();

}


/* =========================================================
   41. ROOMRENT TEST CHECK
========================================================= */

function roomRentSystemTest() {

    console.log(
        "===================================="
    );

    console.log(
        "ROOMRENT SYSTEM TEST"
    );

    console.log(
        "===================================="
    );


    /* Firebase */

    console.log(
        "Firebase:",
        typeof firebase !== "undefined"
            ? "OK"
            : "ERROR"
    );


    /* Auth */

    console.log(
        "Firebase Auth:",
        auth
            ? "OK"
            : "ERROR"
    );


    /* Firestore */

    console.log(
        "Firestore:",
        db
            ? "OK"
            : "ERROR"
    );


    /* Rooms */

    console.log(
        "Rooms:",
        Array.isArray(ROOM_DATA) &&
        ROOM_DATA.length > 0
            ? ROOM_DATA.length + " rooms OK"
            : "ERROR"
    );


    /* Current user */

    console.log(
        "Current user:",
        currentUser
            ? currentUser.email
            : "No user logged in"
    );


    /* User data */

    console.log(
        "User data:",
        currentUserData
            ? "OK"
            : "Not loaded"
    );


    /* Selected room */

    console.log(
        "Selected room:",
        selectedRoom
            ? selectedRoom.roomNumber
            : "None"
    );


    /* Payment method */

    console.log(
        "Payment method:",
        selectedPaymentMethod
            ? selectedPaymentMethod
            : "None"
    );


    console.log(
        "===================================="
    );

    console.log(
        "ROOMRENT TEST IMEKAMILIKA"
    );

    console.log(
        "===================================="
    );

}


/* =========================================================
   42. EXPOSE TEST FUNCTION
========================================================= */

window.roomRentSystemTest =
    roomRentSystemTest;
