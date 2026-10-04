/* =========================================================
ROOMRENT - SCRIPT.JS
FIREBASE + AUTHENTICATION + DASHBOARD + ROOMS
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

/*

Ondoa display:none iliyowekwa

moja kwa moja kwenye HTML.
*/

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

    linkElement.value =
        currentUserData.referralLink ||
        "";

    }

}

/* =========================================================
16B. LOAD MY BOOKINGS
========================================================= */

async function loadMyBookings() {

    const list =
        getElement("myBookingsList");

    if (!list) {
        console.error(
            "RoomRent: myBookingsList haipo."
        );
        return;
    }

    if (!currentUser) {

        list.innerHTML = `
            <div class="empty-state">
                <h3>🔐 Tafadhali ingia kwanza.</h3>
            </div>
        `;

        return;
    }

    if (!db) {

        list.innerHTML = `
            <div class="empty-state">
                <h3>❌ Firestore haijaandaliwa.</h3>
            </div>
        `;

        return;
    }

    list.innerHTML = `
        <div class="empty-state">
            <p>⏳ Inapakia bookings zako...</p>
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

            list.innerHTML = `
                <div class="empty-state">

                    <h3>
                        📭 Hakuna booking bado.
                    </h3>

                    <p>
                        Bookings zako zitaonekana hapa
                        baada ya kufanya booking.
                    </p>

                </div>
            `;

            return;
        }

        const bookings = [];

        snapshot.forEach(function(doc) {

            bookings.push({
                id: doc.id,
                ...doc.data()
            });

        });

        bookings.sort(function(a, b) {

            const timeA =
                a.createdAt &&
                typeof a.createdAt.toMillis === "function"
                    ? a.createdAt.toMillis()
                    : 0;

            const timeB =
                b.createdAt &&
                typeof b.createdAt.toMillis === "function"
                    ? b.createdAt.toMillis()
                    : 0;

            return timeB - timeA;

        });

        let html = "";

        bookings.forEach(function(booking) {

            html += `

                <div class="booking-card">

                    <h3>
                        📋
                        ${booking.bookingNumber || "-"}
                    </h3>

                    <p>
                        <strong>Chumba:</strong>
                        ${booking.roomNumber || "-"}
                    </p>

                    <p>
                        <strong>Bei:</strong>
                        ${formatMoney(
                            booking.roomPrice ||
                            booking.paymentAmount ||
                            0
                        )}
                    </p>

                    <p>
                        <strong>Njia ya malipo:</strong>
                        ${booking.paymentMethod || "-"}
                    </p>

                    <p>
                        <strong>Hali ya malipo:</strong>
                        ${booking.paymentStatus || "-"}
                    </p>

                    <p>
                        <strong>Hali ya booking:</strong>
                        ${booking.bookingStatus || "-"}
                    </p>

                    <p>
                        <strong>Profit:</strong>
                        ${booking.profitStatus || "-"}
                    </p>

                </div>

            `;

        });

        list.innerHTML = html;

    } catch (error) {

        console.error(
            "RoomRent: My bookings error:",
            error
        );

        list.innerHTML = `

            <div class="empty-state">

                <h3>
                    ❌ Imeshindikana kupakia bookings.
                </h3>

                <p>
                    ${error.message || ""}
                </p>

            </div>

        `;

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

const selectedRoom = ROOM_DATA.find(
function(room) {
return String(room.roomNumber) === String(roomNumber);
}
);

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

const totalEstimatedProfit =
dailyProfit *
ROOM_DURATION_DAYS;

bookingContent.innerHTML = `

<div class="booking-card">      <h2>      
    🏠 Chumba ${selectedRoom.roomNumber}      
</h2>      

<div class="booking-detail">      

    <span>      
        Bei ya chumba      
    </span>      

    <strong>      
        ${formatMoney(selectedRoom.price)}      
    </strong>      

</div>      


<div class="booking-detail">      

    <span>      
        Faida inayokadiriwa kwa siku      
    </span>      

    <strong>      
        ${formatMoney(dailyProfit)}      
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
        Faida inayokadiriwa kwa siku 90      
    </span>      

    <strong>      
        ${formatMoney(totalEstimatedProfit)}      
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

</div>  `;

const continueButton =
getElement("continueBookingButton");

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

function openBookingConfirmation(selectedRoom) {

if (!selectedRoom) {
return;
}

const bookingContent =
getElement("bookingContent");

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

<div class="booking-card">      <h2>      
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
        ${formatMoney(selectedRoom.price)}      
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
        Faida inayokadiriwa kwa siku      
    </span>      

    <strong>      
        ${formatMoney(dailyProfit)}      
    </strong>      

</div>      


<div class="booking-detail">      

    <span>      
        Faida inayokadiriwa kwa kipindi      
    </span>      

    <strong>      
        ${formatMoney(totalEstimatedProfit)}      
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
    data-room-number="${selectedRoom.roomNumber}"      
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

</div>  `;

const cancelButton =
getElement("cancelBookingButton");

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
getElement("confirmBookingButton");

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

function handleBookingConfirmation(selectedRoom) {

if (!currentUser) {

alert(
"Tafadhali ingia kwenye akaunti yako kwanza."
);

return;

}

if (!selectedRoom) {

return;

}

console.log(
"RoomRent: Payment method selection:",
selectedRoom.roomNumber
);

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

const totalEstimatedProfit =
dailyProfit *
ROOM_DURATION_DAYS;

bookingContent.innerHTML = `

<div class="booking-card">      <h2>      
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
        ${formatMoney(selectedRoom.price)}      
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
        Faida inayokadiriwa kwa siku      
    </span>      

    <strong>      
        ${formatMoney(dailyProfit)}      
    </strong>      

</div>      

<div class="booking-detail">      

    <span>      
        Faida inayokadiriwa kwa kipindi      
    </span>      

    <strong>      
        ${formatMoney(totalEstimatedProfit)}      
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

</div>  `;

/* =====================================================
MIXX BY YAS
===================================================== */

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

/* =====================================================
AIRTEL MONEY
===================================================== */

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

/* =====================================================
RUDI KWENYE CONFIRMATION
===================================================== */

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
getElement("bookingContent");

if (!bookingContent) {

return;

}

let paymentName = "";
let paymentPhone = "";

if (paymentMethod === "MIXX BY YAS") {

paymentName =
"HARUNA ISSA HAMAD";

paymentPhone =
"0651590936";

}

else if (paymentMethod === "Airtel Money") {

paymentName =
"HARUNA ISSA HAMAD";

paymentPhone =
"0667872515";

}

bookingContent.innerHTML = `

<div class="booking-card">      <h2>      
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
        1. Tuma ${formatMoney(      
            selectedRoom.price      
        )} kupitia ${paymentMethod}.      
    </p>      

    <p>      
        2. Hakikisha jina na namba ya      
        mpokeaji ni sahihi kabla ya kutuma.      
    </p>      

    <p>      
        3. Baada ya malipo, utawasilisha      
        uthibitisho wa malipo.      
    </p>      

    <p>      
        4. Booking haitakuwa active mpaka      
        malipo yatakapothibitishwa na admin.      
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

</div>  `;

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
25E. PAYMENT SUBMISSION + FIRESTORE BOOKING
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
getElement("bookingContent");

if (!bookingContent) {

console.error(
"RoomRent: bookingContent haipo."
);

return;

}

bookingContent.innerHTML = `

<div class="booking-card">      <h2>      
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
        Kiasi cha kulipa      
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
        <strong>${paymentMethod}</strong>.      
    </p>      

    <p>      
        Baada ya kuwasilisha, booking yako      
        itaingia kwenye mfumo ikiwa      
        <strong>inasubiri uthibitisho wa malipo</strong>.      
    </p>      

    <p>      
        Admin atakagua malipo kabla booking      
        kuwa active.      
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

</div>  `;

/* =====================================================
RUDI KWENYE TAARIFA ZA MALIPO
===================================================== */

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

/* =====================================================
WASILISHA BOOKING
===================================================== */

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

/* -------------------------------------------------
BUTTON STATE
------------------------------------------------- */

if (submitButton) {

submitButton.disabled =      
    true;      

submitButton.textContent =      
    "Inahifadhi Booking...";

}

/* -------------------------------------------------
GENERATE UNIQUE BOOKING NUMBER
------------------------------------------------- */

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

/* -------------------------------------------------
CALCULATE PROFIT
------------------------------------------------- */

const dailyProfit =
selectedRoom.price *
ROOM_PROFIT_RATE_PER_DAY;

const totalEstimatedProfit =
dailyProfit *
ROOM_DURATION_DAYS;

/* -------------------------------------------------
BOOKING DATA
------------------------------------------------- */

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

console.log(
"RoomRent: Inatuma booking Firestore...",
bookingData
);

/* -------------------------------------------------
SAVE BOOKING
------------------------------------------------- */

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

/* -------------------------------------------------
SUCCESS
------------------------------------------------- */

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

/* -------------------------------------------------
SHOW REAL FIREBASE ERROR
------------------------------------------------- */

let errorMessage =
"Imeshindikana kuhifadhi booking.";

if (
error &&
error.code ===
"permission-denied"
) {

errorMessage =      
    "Firebase imezuia kuhifadhi booking. Firestore Rules zinahitaji kurekebishwa.";

}

else if (
error &&
error.code ===
"unauthenticated"
) {

errorMessage =      
    "Session yako ya Firebase imekwisha. Tafadhali login tena.";

}

else if (
error &&
error.code ===
"failed-precondition"
) {

errorMessage =      
    "Firestore ina hitaji la ziada. Angalia Firestore configuration/index.";

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
25G. BOOKING SUCCESS SCREEN
========================================================= */

function bookingContentAfterSubmission(
bookingNumber,
selectedRoom,
paymentMethod
) {

const bookingContent =
getElement("bookingContent");

if (!bookingContent) {

return;

}

bookingContent.innerHTML = `

<div class="booking-card">      <h2>      
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
        Hali ya malipo      
    </span>      

    <strong>      
        Inasubiri uthibitisho      
    </strong>      

</div>      


<div class="booking-notice">      

    <p>      
        Booking yako imepokelewa      
        na kuhifadhiwa kwenye mfumo.      
    </p>      

    <p>      
        Booking Number yako ni:      
        <strong>${bookingNumber}</strong>      
    </p>      

    <p>      
        Admin atakagua malipo yako      
        na kuthibitisha booking.      
    </p>      

    <p>      
        Faida haitaanza kuhesabiwa      
        mpaka booking ithibitishwe      
        na admin.      
    </p>      

</div>      


<button      
    type="button"      
    class="primary-button"      
    id="backToDashboardAfterBookingButton"      
>      

    Rudi Dashboard      

</button>

</div>  `;

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

}

/* =========================================================
26. INITIALIZE ROOMS
========================================================= */

function initializeRoomsSection() {

console.log(

"RoomRent: Rooms section imeandaliwa."

);

}

/* =========================================================
27. EVENT BINDING
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
DASHBOARD BUTTONS
----------------------------------------------------- */

const viewRoomsButton =
getElement(
"viewRoomsButton"
);

if (viewRoomsButton) {

viewRoomsButton.addEventListener(

"click",      

function() {      

    /*      
     * MUHIMU:      
     * Usitumie showSection hapa.      
     * openRoomsSection() ndiyo      
     * inafungua section na kujaza vyumba.      
     */      

    openRoomsSection();      

}

);

}

const myBookingsButton =
    getElement("myBookingsButton");

if (myBookingsButton) {

    myBookingsButton.addEventListener(
        "click",
        async function() {

            showSection(
                "myBookingsSection"
            );

            await loadMyBookings();

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

            loadReferralInfo();

        }
    );

}

/* -----------------------------------------------------
ADMIN BUTTON
----------------------------------------------------- */

const adminBookingsButton =
    getElement("adminBookingsButton");

if (adminBookingsButton) {

    adminBookingsButton.addEventListener(
        "click",
        function() {

            console.log(
                "RoomRent: Admin Angalia Bookings imebonyezwa."
            );

            anzishaAdminBookingsListener();

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

function() {      

    /*      
     * MUHIMU:      
     * Rooms navigation pia lazima      
     * iite openRoomsSection()      
     * ili loadRooms() ifanye kazi.      
     */      

    openRoomsSection();      

}

);

}

const bookingsNavButton =
    getElement("bookingsNavButton");

if (bookingsNavButton) {

    bookingsNavButton.addEventListener(
        "click",
        async function() {

            showSection(
                "myBookingsSection"
            );

            await loadMyBookings();

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

    }      

);

}

);

}

/* =========================================================
28. INITIALIZATION
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
29. START AFTER DOM IS READY
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

/* =========================================================
30. ADMIN DASHBOARD + VIEW BOOKINGS
========================================================= */

function niAdmin() {

if (!currentUser) {  
    return false;  
}  

return currentUser.uid === ADMIN_UID;

}

function requireAdmin() {

if (!currentUser) {  

    alert("Tafadhali ingia kwanza.");  

    return false;  
}  

if (!niAdmin()) {  

    alert("Huna ruhusa ya Admin.");  

    return false;  
}  

return true;

}

/* =========================================================
30.1 OPEN ADMIN DASHBOARD
========================================================= */

function funguaAdminDashboard() {

    if (!requireAdmin()) {
        return;
    }

    const adminSection =
        getElement("adminSection");

    if (!adminSection) {
        alert("adminSection haipo kwenye HTML.");
        return;
    }

    hideAllAppSections();

    adminSection.classList.remove("hidden");
    adminSection.style.display = "block";

    adminSection.innerHTML = `

        <div class="admin-dashboard">

            <h2>
                🛠️ RoomRent Admin Dashboard
            </h2>

            <p>
                Karibu Admin. Hapa unaweza
                kusimamia bookings za wateja.
            </p>

            <div class="admin-menu">

                <button
                    type="button"
                    id="adminBookingsBtn">

                    📋 Angalia Bookings

                </button>

                <button
                    type="button"
                    id="adminRefreshBtn">

                    🔄 Refresh

                </button>

            </div>

            <div id="adminContent">

                <div class="admin-welcome">

                    <h3>
                        👋 Karibu Admin
                    </h3>

                    <p>
                        Bonyeza "Angalia Bookings"
                        kuona bookings za wateja.
                    </p>

                </div>

            </div>

        </div>

    `;


    /* =====================================================
       ADMIN BOOKINGS BUTTON
    ===================================================== */

    const bookingsBtn =
        document.getElementById(
            "adminBookingsBtn"
        );

    if (bookingsBtn) {

        bookingsBtn.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                console.log(
                    "RoomRent Admin: Angalia Bookings imebonyezwa."
                );

                anzishaAdminBookingsListener();

            }
        );

    }


    /* =====================================================
       ADMIN REFRESH BUTTON
    ===================================================== */

    const refreshBtn =
        document.getElementById(
            "adminRefreshBtn"
        );

    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                console.log(
                    "RoomRent Admin: Refresh imebonyezwa."
                );

                funguaAdminDashboard();

            }
        );

    }

}

                        
/* =========================================================
   30.2 ADMIN BOOKINGS LISTENER
========================================================= */

function anzishaAdminBookingsListener() {

    if (!requireAdmin()) {
        return;
    }

    if (!db) {

        alert(
            "Firebase Firestore haijaandaliwa vizuri."
        );

        return;
    }

    const content =
        document.getElementById(
            "adminContent"
        );

    if (!content) {

        alert(
            "adminContent haipo kwenye HTML."
        );

        return;
    }

    /*
     * SIMAMISHA LISTENER YA ZAMANI
     */

    if (
        typeof unsubscribeAdminBookings ===
        "function"
    ) {

        unsubscribeAdminBookings();

        unsubscribeAdminBookings =
            null;
    }

    /*
     * ONYESHA LOADING
     */

    content.innerHTML = `

        <div class="admin-bookings-section">

            <h3>
                📋 Bookings za Wateja
            </h3>

            <p>
                ⏳ Inapakia bookings...
            </p>

        </div>

    `;

    /*
     * FIRESTORE REAL-TIME LISTENER
     */

    unsubscribeAdminBookings =
        db
            .collection("bookings")
            .onSnapshot(

                function(snapshot) {

                    console.log(
                        "RoomRent Admin: Bookings zimepatikana:",
                        snapshot.size
                    );

                    const bookings = [];

                    snapshot.forEach(
                        function(doc) {

                            bookings.push({

                                id:
                                    doc.id,

                                ...doc.data()

                            });

                        }
                    );

                    /*
                     * PANGA MPYA KWANZA
                     */

                    bookings.sort(
                        function(a, b) {

                            const timeA =
                                a.createdAt &&
                                typeof
                                a.createdAt.toMillis ===
                                "function"
                                    ? a.createdAt.toMillis()
                                    : 0;

                            const timeB =
                                b.createdAt &&
                                typeof
                                b.createdAt.toMillis ===
                                "function"
                                    ? b.createdAt.toMillis()
                                    : 0;

                            return timeB - timeA;

                        }
                    );

                    /*
                     * ONYESHA BOOKINGS
                     */

                    onyeshaAdminBookings(
                        bookings
                    );

                },

                function(error) {

                    console.error(
                        "RoomRent Admin Bookings Firestore Error:",
                        error
                    );

                    const list =
                        document.getElementById(
                            "adminBookingsList"
                        );

                    if (list) {

                        let message =
                            "Imeshindikana kupakia bookings.";

                        if (
                            error &&
                            error.code ===
                            "permission-denied"
                        ) {

                            message =
                                "Huna ruhusa ya kusoma bookings. Hakikisha Admin UID na Firestore Rules ziko sahihi.";

                        }

                        else if (
                            error &&
                            error.code ===
                            "unauthenticated"
                        ) {

                            message =
                                "Session ya Firebase imekwisha. Tafadhali login tena.";

                        }

                        else if (
                            error &&
                            error.message
                        ) {

                            message =
                                "Firebase Error: " +
                                error.message;

                        }

                        list.innerHTML = `

                            <div class="empty-state">

                                <h3>
                                    ❌ ${message}
                                </h3>

                                <p>
                                    Angalia Console kama kuna
                                    taarifa zaidi.
                                </p>

                            </div>

                        `;

                    }

                }

            );

                                }
            


/* =========================================================
30.3 EXPOSE ADMIN FUNCTIONS
========================================================= */

window.funguaAdminDashboard =
funguaAdminDashboard;

window.anzishaAdminBookingsListener =
anzishaAdminBookingsListener;

window.niAdmin =
niAdmin;

window.requireAdmin =
requireAdmin;
