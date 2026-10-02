/* =========================================================
   ROOMRENT - SCRIPT.JS
   FIREBASE + AUTHENTICATION + DASHBOARD + ROOMS
   BOOKINGS + MY BOOKINGS + ADMIN BOOKING MANAGEMENT
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


    /* -----------------------------------------------------
       SECTION-SPECIFIC LOADERS
    ----------------------------------------------------- */

    if (
        sectionId ===
        "roomsSection"
    ) {

        loadRooms();

    }


    if (
        sectionId ===
        "myBookingsSection"
    ) {

        loadMyBookings();

    }


    if (
        sectionId ===
        "adminSection"
    ) {

        loadAdminBookings();

    }

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

            } catch (referralError) {

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


    const isAdmin =
        currentUser &&
        currentUser.uid ===
        ADMIN_UID;


    if (isAdmin) {

        showElement(
            adminSection
        );


        /*
         * Admin akifungua dashboard,
         * tunapakia bookings zake pia.
         */

        loadAdminBookings();

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
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
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

    showSection(
        "roomsSection"
    );


    loadRooms();

}


/* =========================================================
   25. OPEN BOOKING SECTION
========================================================= */

function openBookingSection(roomNumber) {

    const selectedRoom =
        ROOM_DATA.find(
            function(room) {

                return String(
                    room.roomNumber
                ) === String(
                    roomNumber
                );

            }
        );


    if (!selectedRoom) {

        console.error(
            "RoomRent: Chumba hakijapatikana:",
            roomNumber
        );

        return;

    }


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
                🏠 Chumba ${selectedRoom.roomNumber}
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
                    ${ROOM_DURATION_DAYS} siku
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
                    Hadi ${selectedRoom.maxBookingsPerUser}
                </strong>

            </div>


            <div class="booking-notice">

                <p>
                    ℹ️ Faida haitaanza kuhesabiwa
                    mpaka booking ithibitishwe
                    na admin.
                </p>

                <p>
                    Makadirio ya faida si malipo
                    ya papo hapo.
                </p>

            </div>


            <button
                type="button"
                class="primary-button"
                id="continueBookingButton"
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
    selectedRoom
) {

    if (!selectedRoom) {

        return;

    }


    const bookingContent =
        getElement(
            "bookingContent"
        );


    if (!bookingContent) {

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
                🔐 Thibitisha Booking
            </h2>


            <div class="booking-detail">

                <span>
                    Chumba
                </span>

                <strong>
                    ${selectedRoom.roomNumber}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Bei
                </span>

                <strong>
                    ${formatMoney(
                        selectedRoom.price
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Muda
                </span>

                <strong>
                    ${ROOM_DURATION_DAYS} siku
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida kwa siku
                </span>

                <strong>
                    ${formatMoney(
                        dailyProfit
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida inayokadiriwa
                </span>

                <strong>
                    ${formatMoney(
                        totalEstimatedProfit
                    )}
                </strong>

            </div>


            <div class="booking-notice">

                <p>
                    Tafadhali hakikisha taarifa
                    zote kabla ya kuendelea.
                </p>

            </div>


            <button
                type="button"
                class="primary-button"
                id="confirmBookingButton"
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
                    selectedRoom.roomNumber
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
                    selectedRoom
                );

            }
        );

    }

}


/* =========================================================
   25C. PAYMENT METHOD SELECTION
========================================================= */

function handleBookingConfirmation(
    selectedRoom
) {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye akaunti yako kwanza."
        );

        return;

    }


    if (!selectedRoom) {

        return;

    }


    const bookingContent =
        getElement(
            "bookingContent"
        );


    if (!bookingContent) {

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
                💳 Chagua Njia ya Malipo
            </h2>


            <div class="booking-detail">

                <span>
                    Chumba
                </span>

                <strong>
                    ${selectedRoom.roomNumber}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Kiasi cha kulipa
                </span>

                <strong>
                    ${formatMoney(
                        selectedRoom.price
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Muda
                </span>

                <strong>
                    ${ROOM_DURATION_DAYS} siku
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida kwa siku
                </span>

                <strong>
                    ${formatMoney(
                        dailyProfit
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Faida inayokadiriwa
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
                    selectedRoom,
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
                    selectedRoom,
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
                    selectedRoom
                );

            }
        );

    }

}


/* =========================================================
   25D. PAYMENT DETAILS
========================================================= */

function showPaymentDetails(
    selectedRoom,
    paymentMethod
) {

    if (!selectedRoom) {

        return;

    }


    const bookingContent =
        getElement(
            "bookingContent"
        );


    if (!bookingContent) {

        return;

    }


    let paymentName = "";

    let paymentPhone = "";


    if (
        paymentMethod ===
        "MIXX BY YAS"
    ) {

        paymentName =
            "HARUNA ISSA HAMAD";

        paymentPhone =
            "0651590936";

    }


    else if (
        paymentMethod ===
        "Airtel Money"
    ) {

        paymentName =
            "HARUNA ISSA HAMAD";

        paymentPhone =
            "0667872515";

    }


    bookingContent.innerHTML = `

        <div class="booking-card">

            <h2>
                💳 ${paymentMethod}
            </h2>


            <div class="booking-detail">

                <span>
                    Chumba
                </span>

                <strong>
                    ${selectedRoom.roomNumber}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Kiasi cha kulipa
                </span>

                <strong>
                    ${formatMoney(
                        selectedRoom.price
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Jina la kupokea
                </span>

                <strong>
                    ${paymentName}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Namba ya malipo
                </span>

                <strong>
                    ${paymentPhone}
                </strong>

            </div>


            <div class="booking-notice">

                <p>
                    1. Tuma
                    ${formatMoney(
                        selectedRoom.price
                    )}
                    kupitia
                    ${paymentMethod}.
                </p>

                <p>
                    2. Hakikisha jina na namba
                    ya mpokeaji ni sahihi.
                </p>

                <p>
                    3. Baada ya malipo,
                    wasilisha uthibitisho.
                </p>

                <p>
                    4. Booking haitakuwa active
                    mpaka admin athibitishe.
                </p>

            </div>


            <button
                type="button"
                class="primary-button"
                id="paymentMadeButton"
            >

                Nimeshafanya Malipo

            </button>


            <button
                type="button"
                class="secondary-button"
                id="backToPaymentMethodsButton"
            >

                Chagua Njia Nyingine

            </button>

        </div>

    `;


    const paymentMadeButton =
        getElement(
            "paymentMadeButton"
        );


    if (paymentMadeButton) {

        paymentMadeButton.addEventListener(
            "click",
            function() {

                showPaymentSubmission(
                    selectedRoom,
                    paymentMethod
                );

            }
        );

    }


    const backButton =
        getElement(
            "backToPaymentMethodsButton"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            function() {

                handleBookingConfirmation(
                    selectedRoom
                );

            }
        );

    }

}


/* =========================================================
   25E. PAYMENT SUBMISSION
========================================================= */

async function showPaymentSubmission(
    selectedRoom,
    paymentMethod
) {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye akaunti yako kwanza."
        );

        return;

    }


    if (!selectedRoom) {

        return;

    }


    const bookingContent =
        getElement(
            "bookingContent"
        );


    if (!bookingContent) {

        return;

    }


    bookingContent.innerHTML = `

        <div class="booking-card">

            <h2>
                📋 Uthibitisho wa Malipo
            </h2>


            <div class="booking-detail">

                <span>
                    Chumba
                </span>

                <strong>
                    ${selectedRoom.roomNumber}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Njia ya malipo
                </span>

                <strong>
                    ${paymentMethod}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Kiasi
                </span>

                <strong>
                    ${formatMoney(
                        selectedRoom.price
                    )}
                </strong>

            </div>


            <div class="booking-notice">

                <p>
                    Umechagua
                    <strong>
                        ${paymentMethod}
                    </strong>.
                </p>

                <p>
                    Booking itaingia kwenye mfumo
                    ikiwa inasubiri uthibitisho
                    wa malipo.
                </p>

                <p>
                    Admin atakagua malipo kabla
                    booking kuwa active.
                </p>

            </div>


            <button
                type="button"
                class="primary-button"
                id="submitPaymentProofButton"
            >

                Wasilisha Uthibitisho wa Malipo

            </button>


            <button
                type="button"
                class="secondary-button"
                id="backToPaymentDetailsButton"
            >

                Rudi

            </button>

        </div>

    `;


    const backButton =
        getElement(
            "backToPaymentDetailsButton"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            function() {

                showPaymentDetails(
                    selectedRoom,
                    paymentMethod
                );

            }
        );

    }


    const submitButton =
        getElement(
            "submitPaymentProofButton"
        );


    if (submitButton) {

        submitButton.addEventListener(
            "click",
            async function() {

                await createPendingBooking(
                    selectedRoom,
                    paymentMethod,
                    submitButton
                );

            }
        );

    }

}


/* =========================================================
   25F. CREATE PENDING BOOKING
========================================================= */

async function createPendingBooking(
    selectedRoom,
    paymentMethod,
    submitButton
) {

    if (!currentUser) {

        alert(
            "Session yako imekwisha. Tafadhali login tena."
        );

        return;

    }


    if (!db) {

        alert(
            "Firebase Firestore haijaandaliwa vizuri."
        );

        return;

    }


    if (!selectedRoom) {

        alert(
            "Chumba hakijapatikana."
        );

        return;

    }


    try {

        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.textContent =
                "Inahifadhi Booking...";

        }


        const timestamp =
            Date.now();


        const randomPart =
            Math.random()
                .toString(36)
                .substring(
                    2,
                    8
                )
                .toUpperCase();


        const bookingNumber =
            "RR-" +
            timestamp +
            "-" +
            randomPart;


        const dailyProfit =
            selectedRoom.price *
            ROOM_PROFIT_RATE_PER_DAY;


        const totalEstimatedProfit =
            dailyProfit *
            ROOM_DURATION_DAYS;


        const bookingData = {

            bookingNumber:
                bookingNumber,

            userId:
                currentUser.uid,

            customerName:
                currentUserData &&
                currentUserData.name
                    ? currentUserData.name
                    : "",

            customerPhone:
                currentUserData &&
                currentUserData.phone
                    ? currentUserData.phone
                    : "",

            customerEmail:
                currentUser.email ||
                "",

            roomNumber:
                selectedRoom.roomNumber,

            roomPrice:
                selectedRoom.price,

            durationDays:
                ROOM_DURATION_DAYS,

            profitRatePerDay:
                ROOM_PROFIT_RATE_PER_DAY,

            dailyProfit:
                dailyProfit,

            totalEstimatedProfit:
                totalEstimatedProfit,

            paymentMethod:
                paymentMethod,

            paymentAmount:
                selectedRoom.price,

            paymentStatus:
                "pending_verification",

            bookingStatus:
                "pending_payment_verification",

            profitStatus:
                "not_started",

            adminConfirmed:
                false,

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        const bookingReference =
            await db
                .collection("bookings")
                .add(
                    bookingData
                );


        console.log(
            "RoomRent: Booking imehifadhiwa:",
            bookingReference.id
        );


        bookingContentAfterSubmission(
            bookingNumber,
            selectedRoom,
            paymentMethod
        );


    } catch (error) {

        console.error(
            "ROOMRENT FIRESTORE ERROR:",
            error
        );


        let errorMessage =
            "Imeshindikana kuhifadhi booking.";


        if (
            error &&
            error.code ===
            "permission-denied"
        ) {

            errorMessage =
                "Firebase imezuia kuhifadhi booking. Angalia Firestore Rules.";

        }


        else if (
            error &&
            error.code ===
            "unauthenticated"
        ) {

            errorMessage =
                "Session yako imekwisha. Tafadhali login tena.";

        }


        else if (
            error &&
            error.message
        ) {

            errorMessage =
                "Firebase Error: " +
                error.message;

        }


        alert(
            errorMessage
        );


        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Wasilisha Uthibitisho wa Malipo";

        }

    }

}


/* =========================================================
   25G. BOOKING SUCCESS
========================================================= */

function bookingContentAfterSubmission(
    bookingNumber,
    selectedRoom,
    paymentMethod
) {

    const bookingContent =
        getElement(
            "bookingContent"
        );


    if (!bookingContent) {

        return;

    }


    bookingContent.innerHTML = `

        <div class="booking-card">

            <h2>
                ✅ Booking Imepokelewa
            </h2>


            <div class="booking-detail">

                <span>
                    Booking Number
                </span>

                <strong>
                    ${bookingNumber}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Chumba
                </span>

                <strong>
                    ${selectedRoom.roomNumber}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Kiasi
                </span>

                <strong>
                    ${formatMoney(
                        selectedRoom.price
                    )}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Njia ya malipo
                </span>

                <strong>
                    ${paymentMethod}
                </strong>

            </div>


            <div class="booking-detail">

                <span>
                    Hali
                </span>

                <strong>
                    Inasubiri uthibitisho
                </strong>

            </div>


            <div class="booking-notice">

                <p>
                    Booking yako imehifadhiwa
                    kwenye mfumo.
                </p>

                <p>
                    Booking Number:
                    <strong>
                        ${bookingNumber}
                    </strong>
                </p>

                <p>
                    Admin atakagua malipo
                    na kuthibitisha booking.
                </p>

                <p>
                    Faida haitaanza kuhesabiwa
                    mpaka booking ithibitishwe.
                </p>

            </div>


            <button
                type="button"
                class="primary-button"
                id="backToDashboardAfterBookingButton"
            >

                Rudi Dashboard

            </button>


            <button
                type="button"
                class="secondary-button"
                id="viewMyBookingsAfterBookingButton"
            >

                My Bookings

            </button>

        </div>

    `;


    const dashboardButton =
        getElement(
            "backToDashboardAfterBookingButton"
        );


    if (dashboardButton) {

        dashboardButton.addEventListener(
            "click",
            function() {

                showSection(
                    "dashboardSection"
                );

                loadUserDashboard();

            }
        );

    }


    const myBookingsButton =
        getElement(
            "viewMyBookingsAfterBookingButton"
        );


    if (myBookingsButton) {

        myBookingsButton.addEventListener(
            "click",
            function() {

                showSection(
                    "myBookingsSection"
                );

            }
        );

    }

}


/* =========================================================
   26. MY BOOKINGS - CUSTOMER
========================================================= */

async function loadMyBookings() {

    const container =
        getElement(
            "myBookingsList"
        );


    if (!container) {

        console.warn(
            "RoomRent: myBookingsList haipo kwenye HTML."
        );

        return;

    }


    if (!currentUser || !db) {

        container.innerHTML = `

            <div class="empty-state">

                <p>
                    Tafadhali login kwanza.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="empty-state">

            <p>
                Inapakia bookings...
            </p>

        </div>

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

                    <p>
                        Bado hujafanya booking yoyote.
                    </p>

                </div>

            `;

            return;

        }


        const bookings =
            snapshot.docs.map(
                function(doc) {

                    return {

                        id:
                            doc.id,

                        ...doc.data()

                    };

                }
            );


        bookings.sort(
            function(a, b) {

                const aTime =
                    a.createdAt &&
                    a.createdAt.toMillis
                        ? a.createdAt.toMillis()
                        : 0;

                const bTime =
                    b.createdAt &&
                    b.createdAt.toMillis
                        ? b.createdAt.toMillis()
                        : 0;

                return bTime - aTime;

            }
        );


        container.innerHTML =
            "";


        bookings.forEach(
            function(booking) {

                container.appendChild(
                    createCustomerBookingCard(
                        booking
                    )
                );

            }
        );


    } catch (error) {

        console.error(
            "RoomRent: loadMyBookings error:",
            error
        );


        container.innerHTML = `

            <div class="empty-state">

                <p>
                    Imeshindikana kupakia bookings.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   26B. CUSTOMER BOOKING CARD
========================================================= */

function createCustomerBookingCard(
    booking
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "booking-card";


    const paymentStatus =
        getReadablePaymentStatus(
            booking.paymentStatus
        );


    const bookingStatus =
        getReadableBookingStatus(
            booking.bookingStatus
        );


    const createdDate =
        formatFirestoreDate(
            booking.createdAt
        );


    card.innerHTML = `

        <h3>
            🏠 Chumba ${escapeHtml(
                booking.roomNumber || ""
            )}
        </h3>


        <div class="booking-detail">

            <span>
                Booking Number
            </span>

            <strong>
                ${escapeHtml(
                    booking.bookingNumber || ""
                )}
            </strong>

        </div>


        <div class="booking-detail">

            <span>
                Kiasi
            </span>

            <strong>
                ${formatMoney(
                    booking.paymentAmount || 0
                )}
            </strong>

        </div>


        <div class="booking-detail">

            <span>
                Njia ya malipo
            </span>

            <strong>
                ${escapeHtml(
                    booking.paymentMethod || ""
                )}
            </strong>

        </div>


        <div class="booking-detail">

            <span>
                Malipo
            </span>

            <strong>
                ${paymentStatus}
            </strong>

        </div>


        <div class="booking-detail">

            <span>
                Booking
            </span>

            <strong>
                ${bookingStatus}
            </strong>

        </div>


        <div class="booking-detail">

            <span>
                Tarehe
            </span>

            <strong>
                ${createdDate}
            </strong>

        </div>


        ${
            booking.bookingStatus ===
            "active"

            ? `

                <div class="booking-notice">

                    <p>
                        ✅ Booking yako imethibitishwa.
                    </p>

                    <p>
                        Faida inaweza kuanza
                        kulingana na mfumo
                        wa RoomRent.
                    </p>

                </div>

              `

            : ""
        }


        ${
            booking.bookingStatus ===
            "payment_rejected"

            ? `

                <div class="booking-notice">

                    <p>
                        ❌ Malipo ya booking hii
                        hayakuthibitishwa.
                    </p>

                    ${
                        booking.rejectionReason
                        ? `
                            <p>
                                Sababu:
                                ${escapeHtml(
                                    booking.rejectionReason
                                )}
                            </p>
                          `
                        : ""
                    }

                </div>

              `

            : ""
        }

    `;


    return card;

}


/* =========================================================
   27. ADMIN BOOKINGS CONTAINER
========================================================= */

function getAdminBookingsContainer() {

    let container =
        getElement(
            "adminBookingsList"
        );


    if (container) {

        return container;

    }


    const adminSection =
        getElement(
            "adminSection"
        );


    if (!adminSection) {

        return null;

    }


    container =
        document.createElement(
            "div"
        );


    container.id =
        "adminBookingsList";


    container.className =
        "admin-bookings-list";


    adminSection.appendChild(
        container
    );


    return container;

}


/* =========================================================
   28. LOAD ADMIN BOOKINGS
========================================================= */

async function loadAdminBookings() {

    if (!currentUser) {

        return;

    }


    const isAdmin =
        currentUser.uid ===
        ADMIN_UID;


    if (!isAdmin) {

        return;

    }


    if (!db) {

        return;

    }


    const container =
        getAdminBookingsContainer();


    if (!container) {

        console.warn(
            "RoomRent: adminSection haipo."
        );

        return;

    }


    container.innerHTML = `

        <div class="empty-state">

            <p>
                Inapakia bookings za wateja...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db
                .collection("bookings")
                .get();


        if (snapshot.empty) {

            container.innerHTML = `

                <div class="empty-state">

                    <p>
                        Hakuna booking bado.
                    </p>

                </div>

            `;

            return;

        }


        const bookings =
            snapshot.docs.map(
                function(doc) {

                    return {

                        id:
                            doc.id,

                        ...doc.data()

                    };

                }
            );


        bookings.sort(
            function(a, b) {

                const aTime =
                    a.createdAt &&
                    a.createdAt.toMillis
                        ? a.createdAt.toMillis()
                        : 0;

                const bTime =
                    b.createdAt &&
                    b.createdAt.toMillis
                        ? b.createdAt.toMillis()
                        : 0;

                return bTime - aTime;

            }
        );


        container.innerHTML = `

            <div class="booking-card">

                <h2>
                    🛠️ Admin - Booking Management
                </h2>

                <p>
                    Jumla ya bookings:
                    <strong>
                        ${bookings.length}
                    </strong>
                </p>

            </div>

        `;


        bookings.forEach(
            function(booking) {

                container.appendChild(
                    createAdminBookingCard(
                        booking
                    )
                );

            }
        );


    } catch (error) {

        console.error(
            "RoomRent: loadAdminBookings error:",
            error
        );


        container.innerHTML = `

            <div class="booking-card">

                <h3>
                    ⚠️ Imeshindikana kupakia bookings
                </h3>

                <p>
                    ${escapeHtml(
                        error.message || ""
                    )}
                </p>

            </div>

        `;

    }

}


/* =========================================================
   29. CREATE ADMIN BOOKING CARD
========================================================= */

function createAdminBookingCard(
    booking
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "booking-card admin-booking-card";


    const paymentStatus =
        getReadablePaymentStatus(
            booking.paymentStatus
        );


    const bookingStatus =
        getReadableBookingStatus(
            booking.bookingStatus
        );


    const createdDate =
        formatFirestoreDate(
            booking.createdAt
        );


    const isPending =
        booking.paymentStatus ===
            "pending_verification" ||

        booking.bookingStatus ===
            "pending_payment_verification";


    card.innerHTML = `

        <h3>
            📋 Booking
            ${escapeHtml(
                booking.bookingNumber || ""
            )}
        </h3>


        <div class="booking-detail">

            <span>
                Mteja
            </span>

            <strong>
                ${escapeHtml(
                    booking.customerName || ""
                )}
            </strong>

        </div>


        <div class="booking-detail">

            <span>
                Simu
            </span>

            <strong>
                ${escapeHtml(
                    booking.customerPhone || ""
                )}
            </strong>

        </div>


        <div class="booking-detail">

            <span>
                Email
            </span>

            <strong>
                ${escapeHtml(
                    booking.customerEmail || ""
                )}
            </strong>

        </div>


        <div class="booking-detail">

            <span>
                Chumba
            </span>

            <strong>
                ${escapeHtml(
                    booking.roomNumber || ""
                )}
            </strong>

        </div>


        <div class="booking-detail">

            <span>
                Kiasi
            </span>

            <strong>
                ${formatMoney(
                    booking.paymentAmount || 0
                )}
            </strong>

        </div>


        <div class="booking-detail">

            <span>
                Njia ya malipo
            </span>

            <strong>
                ${escapeHtml(
                    booking.paymentMethod || ""
                )}
            </strong>

        </div>


        <div class="booking-detail">

            <span>
                Payment Status
            </span>

            <strong>
                ${paymentStatus}
            </strong>

        </div>


        <div class="booking-detail">

            <span>
                Booking Status
            </span>

            <strong>
                ${bookingStatus}
            </strong>

        </div>


        <div class="booking-detail">

            <span>
                Tarehe
            </span>

            <strong>
                ${createdDate}
            </strong>

        </div>


        <div class="booking-detail">

            <span>
                Profit Status
            </span>

            <strong>
                ${escapeHtml(
                    booking.profitStatus || "not_started"
                )}
            </strong>

        </div>


        ${
            booking.rejectionReason
            ? `

                <div class="booking-notice">

                    <p>
                        Sababu ya rejection:
                    </p>

                    <strong>
                        ${escapeHtml(
                            booking.rejectionReason
                        )}
                    </strong>

                </div>

              `
            : ""
        }


        ${
            isPending

            ? `

                <div class="admin-booking-actions">

                    <button
                        type="button"
                        class="primary-button admin-confirm-booking-button"
                        data-booking-id="${booking.id}"
                    >

                        ✅ Confirm Payment

                    </button>


                    <button
                        type="button"
                        class="secondary-button admin-reject-booking-button"
                        data-booking-id="${booking.id}"
                    >

                        ❌ Reject Payment

                    </button>

                </div>

              `

            : `

                <div class="booking-notice">

                    <p>
                        Booking hii tayari imefanyiwa
                        uamuzi na admin.
                    </p>

                </div>

              `
        }

    `;


    const confirmButton =
        card.querySelector(
            ".admin-confirm-booking-button"
        );


    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            function() {

                confirmAdminBooking(
                    booking.id
                );

            }
        );

    }


    const rejectButton =
        card.querySelector(
            ".admin-reject-booking-button"
        );


    if (rejectButton) {

        rejectButton.addEventListener(
            "click",
            function() {

                rejectAdminBooking(
                    booking.id
                );

            }
        );

    }


    return card;

}


/* =========================================================
   30. ADMIN CONFIRM BOOKING
========================================================= */

async function confirmAdminBooking(
    bookingId
) {

    if (!currentUser) {

        alert(
            "Tafadhali login kwanza."
        );

        return;

    }


    if (
        currentUser.uid !==
        ADMIN_UID
    ) {

        alert(
            "Huna ruhusa ya kufanya kitendo hiki."
        );

        return;

    }


    if (!db || !bookingId) {

        return;

    }


    const confirmed =
        window.confirm(
            "Una uhakika unataka kuthibitisha malipo ya booking hii?"
        );


    if (!confirmed) {

        return;

    }


    try {

        await db
            .collection("bookings")
            .doc(bookingId)
            .update({

                paymentStatus:
                    "confirmed",

                bookingStatus:
                    "active",

                profitStatus:
                    "active",

                adminConfirmed:
                    true,

                confirmedBy:
                    ADMIN_UID,

                confirmedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        alert(
            "Malipo yamethibitishwa. Booking sasa ni ACTIVE."
        );


        await loadAdminBookings();


    } catch (error) {

        console.error(
            "RoomRent: confirm booking error:",
            error
        );


        alert(
            "Imeshindikana kuthibitisha booking: " +
            (
                error.message ||
                ""
            )
        );

    }

}


/* =========================================================
   31. ADMIN REJECT BOOKING
========================================================= */

async function rejectAdminBooking(
    bookingId
) {

    if (!currentUser) {

        alert(
            "Tafadhali login kwanza."
        );

        return;

    }


    if (
        currentUser.uid !==
        ADMIN_UID
    ) {

        alert(
            "Huna ruhusa ya kufanya kitendo hiki."
        );

        return;

    }


    if (!db || !bookingId) {

        return;

    }


    const reason =
        window.prompt(
            "Andika sababu ya kukataa malipo haya:"
        );


    if (reason === null) {

        return;

    }


    const cleanReason =
        reason.trim();


    if (!cleanReason) {

        alert(
            "Sababu ya rejection inahitajika."
        );

        return;

    }


    const confirmed =
        window.confirm(
            "Una uhakika unataka kukataa malipo ya booking hii?"
        );


    if (!confirmed) {

        return;

    }


    try {

        await db
            .collection("bookings")
            .doc(bookingId)
            .update({

                paymentStatus:
                    "rejected",

                bookingStatus:
                    "payment_rejected",

                profitStatus:
                    "not_started",

                adminConfirmed:
                    false,

                rejectionReason:
                    cleanReason,

                rejectedBy:
                    ADMIN_UID,

                rejectedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        alert(
            "Malipo yamekataliwa."
        );


        await loadAdminBookings();


    } catch (error) {

        console.error(
            "RoomRent: reject booking error:",
            error
        );


        alert(
            "Imeshindikana kukataa booking: " +
            (
                error.message ||
                ""
            )
        );

    }

}


/* =========================================================
   32. READABLE STATUS HELPERS
========================================================= */

function getReadablePaymentStatus(
    status
) {

    switch (status) {

        case "pending_verification":
            return "⏳ Inasubiri uthibitisho";

        case "confirmed":
            return "✅ Imethibitishwa";

        case "rejected":
            return "❌ Imekataliwa";

        default:
            return status || "Haijulikani";

    }

}


function getReadableBookingStatus(
    status
) {

    switch (status) {

        case "pending_payment_verification":
            return "⏳ Inasubiri malipo";

        case "active":
            return "🟢 Active";

        case "payment_rejected":
            return "❌ Malipo yamekataliwa";

        case "completed":
            return "✅ Imekamilika";

        case "cancelled":
            return "🚫 Imeghairiwa";

        default:
            return status || "Haijulikani";

    }

}


/* =========================================================
   33. FIRESTORE DATE FORMAT
========================================================= */

function formatFirestoreDate(
    timestamp
) {

    if (!timestamp) {

        return "-";

    }


    try {

        let date;


        if (
            timestamp.toDate
        ) {

            date =
                timestamp.toDate();

        }


        else {

            date =
                new Date(
                    timestamp
                );

        }


        return date.toLocaleString(
            "en-TZ",
            {
                dateStyle:
                    "medium",

                timeStyle:
                    "short"
            }
        );

    } catch (error) {

        return "-";

    }

}


/* =========================================================
   34. BASIC HTML ESCAPE
========================================================= */

function escapeHtml(
    value
) {

    if (
        value ===
        null ||
        value ===
        undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   35. INITIALIZE ROOMS
========================================================= */

function initializeRoomsSection() {

    console.log(
        "RoomRent: Rooms section imeandaliwa."
    );

}


/* =========================================================
   36. EVENT BINDING
========================================================= */

function bindEvents() {

    const signInForm =
        getElement(
            "signInForm"
        );


    const signUpForm =
        getElement(
            "signUpForm"
        );


    const forgotPasswordForm =
        getElement(
            "forgotPasswordForm"
        );


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
        getElement(
            "showRegisterButton"
        );


    if (showRegisterButton) {

        showRegisterButton.addEventListener(
            "click",
            showRegisterPanel
        );

    }


    const showLoginButton =
        getElement(
            "showLoginButton"
        );


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
        getElement(
            "backToLoginButton"
        );


    if (backToLoginButton) {

        backToLoginButton.addEventListener(
            "click",
            showLoginPanel
        );

    }


    const signOutButton =
        getElement(
            "signOutButton"
        );


    if (signOutButton) {

        signOutButton.addEventListener(
            "click",
            signOutUser
        );

    }


    const copyReferralButton =
        getElement(
            "copyReferralButton"
        );


    if (copyReferralButton) {

        copyReferralButton.addEventListener(
            "click",
            copyReferralLink
        );

    }


    /* -----------------------------------------------------
       DASHBOARD
    ----------------------------------------------------- */

    const viewRoomsButton =
        getElement(
            "viewRoomsButton"
        );


    if (viewRoomsButton) {

        viewRoomsButton.addEventListener(
            "click",
            openRoomsSection
        );

    }


    const myBookingsButton =
        getElement(
            "myBookingsButton"
        );


    if (myBookingsButton) {

        myBookingsButton.addEventListener(
            "click",
            function() {

                showSection(
                    "myBookingsSection"
                );

            }
        );

    }


    const withdrawButton =
        getElement(
            "withdrawButton"
        );


    if (withdrawButton) {

        withdrawButton.addEventListener(
            "click",
            function() {

                showSection(
                    "withdrawalSection"
                );

            }
        );

    }


    const referralButton =
        getElement(
            "referralButton"
        );


    if (referralButton) {

        referralButton.addEventListener(
            "click",
            function() {

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
        getElement(
            "homeNavButton"
        );


    if (homeNavButton) {

        homeNavButton.addEventListener(
            "click",
            function() {

                showSection(
                    "dashboardSection"
                );

                loadUserDashboard();

            }
        );

    }


    const roomsNavButton =
        getElement(
            "roomsNavButton"
        );


    if (roomsNavButton) {

        roomsNavButton.addEventListener(
            "click",
            openRoomsSection
        );

    }


    const bookingsNavButton =
        getElement(
            "bookingsNavButton"
        );


    if (bookingsNavButton) {

        bookingsNavButton.addEventListener(
            "click",
            function() {

                showSection(
                    "myBookingsSection"
                );

            }
        );

    }


    const accountNavButton =
        getElement(
            "accountNavButton"
        );


    if (accountNavButton) {

        accountNavButton.addEventListener(
            "click",
            function() {

                showSection(
                    "accountSection"
                );

            }
        );

    }


    /* -----------------------------------------------------
       ADMIN NAVIGATION
    ----------------------------------------------------- */

    const adminButton =
        getElement(
            "adminButton"
        );


    if (adminButton) {

        adminButton.addEventListener(
            "click",
            function() {

                if (
                    currentUser &&
                    currentUser.uid ===
                    ADMIN_UID
                ) {

                    showSection(
                        "adminSection"
                    );

                }

                else {

                    alert(
                        "Huna ruhusa ya admin."
                    );

                }

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

        "accountBackButton",

        "adminBackButton"

    ];


    backButtons.forEach(
        function(id) {

            const button =
                getElement(id);


            if (!button) {

                return;

            }


            button.addEventListener(
                "click",
                function() {

                    showSection(
                        "dashboardSection"
                    );

                    loadUserDashboard();

                }
            );

        }
    );

}


/* =========================================================
   37. INITIALIZATION
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


    initializeRoomsSection();


    loadReferralFromURL();


    console.log(
        "RoomRent: initialization imekamilika."
    );

}


/* =========================================================
   38. START AFTER DOM IS READY
========================================================= */

console.log(
    "ROOMRENT SCRIPT IMELOADED"
);


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(

        "DOMContentLoaded",

        function() {

            console.log(
                "ROOMRENT DOM READY"
            );


            initializeRoomRent();

        },

        {
            once: true
        }

    );

}


else {

    console.log(
        "ROOMRENT DOM ALREADY READY"
    );


    initializeRoomRent();

       }

