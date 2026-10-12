const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin using the hosting environment.
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT
    );

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
// Verify Firebase Authentication tokens.
async function authenticateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization || "";

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const idToken = authHeader.substring(7);
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || null
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token"
        });
    }
}

// Protected test endpoint.
app.get("/api/me", authenticateUser, (req, res) => {
    res.status(200).json({
        success: true,
        uid: req.user.uid,
        email: req.user.email
    });
});
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "RoomRent backend is running"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        service: "RoomRent Backend",
        status: "healthy"
    });
});


app.listen(PORT, "0.0.0.0", () => {
    console.log(`RoomRent backend running on port ${PORT}`);
});

// Create a booking using server-validated room details.
// =====================================================
// ROOMRENT: CREATE BOOKING SECURELY
// =====================================================

app.post("/api/bookings", authenticateUser, async (req, res) => {
    try {
        const roomId = String(req.body?.roomId || "").trim();
        const submittedMethod = String(
            req.body?.paymentMethod || ""
        ).trim().toLowerCase();

        // Room prices are controlled by the backend.
        const rooms = {
            "0023": { price: 30000, maxBookings: 2 },
            "0024": { price: 70000, maxBookings: 4 },
            "0025": { price: 140000, maxBookings: 4 },
            "0026": { price: 210000, maxBookings: 4 },
            "0027": { price: 280000, maxBookings: 4 },
            "0028": { price: 350000, maxBookings: 4 },
            "0029": { price: 420000, maxBookings: 4 },
            "0030": { price: 490000, maxBookings: 4 },
            "0031": { price: 560000, maxBookings: 4 },
            "0032": { price: 630000, maxBookings: 4 }
        };

        const room = rooms[roomId];

        if (!room) {
            return res.status(400).json({
                success: false,
                message: "Chumba ulicochagua hakipo."
            });
        }

        // Normalize the payment method.
        let paymentMethod;

        if (submittedMethod === "airtel money".toLowerCase()) {
            paymentMethod = "Airtel Money";
        } else if (
            submittedMethod === "mixx by yas" ||
            submittedMethod === "mixx by yas".toUpperCase().toLowerCase()
        ) {
            paymentMethod = "MIXX BY YAS";
        } else {
            return res.status(400).json({
                success: false,
                message: "Njia ya malipo haijatambuliwa."
            });
        }

        const userRef = db.collection("users").doc(req.user.uid);
        const bookingsRef = db.collection("bookings");

        const result = await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                throw new Error("USER_NOT_FOUND");
            }

            const userData = userDoc.data();

            if (userData.status !== "active") {
                throw new Error("USER_NOT_ACTIVE");
            }

            // Count this user's bookings for this specific room.
            const existingBookingsQuery = bookingsRef
                .where("userId", "==", req.user.uid)
                .where("roomNumber", "==", roomId);

            const existingBookings = await transaction.get(
                existingBookingsQuery
            );

            const countedBookings = existingBookings.docs.filter((doc) => {
                const booking = doc.data();

                return ![
                    "rejected",
                    "cancelled"
                ].includes(
                    String(booking.bookingStatus || "").toLowerCase()
                );
            });

            if (countedBookings.length >= room.maxBookings) {
                throw new Error("ROOM_BOOKING_LIMIT_REACHED");
            }

            const bookingRef = bookingsRef.doc();

            const bookingNumber =
                "RR-" +
                Date.now() +
                "-" +
                Math.random().toString(36).slice(2, 7).toUpperCase();

            const dailyProfit = Math.round(room.price * 0.04);

            const bookingData = {
                bookingNumber: bookingNumber,
                userId: req.user.uid,

                customerName: userData.name || "",
                customerPhone: userData.phone || "",
                customerEmail: req.user.email || userData.email || "",

                roomNumber: roomId,
                roomPrice: room.price,

                durationDays: 90,
                profitRatePerDay: 0.04,
                dailyProfit: dailyProfit,
                totalEstimatedProfit: dailyProfit * 90,

                paymentMethod: paymentMethod,
                paymentAmount: room.price,

                paymentStatus: "pending_verification",
                bookingStatus: "pending_payment_verification",
                profitStatus: "not_started",

                adminConfirmed: false,

                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            transaction.create(bookingRef, bookingData);

            return {
                bookingId: bookingRef.id,
                bookingNumber: bookingNumber,
                roomNumber: roomId,
                roomPrice: room.price,
                paymentMethod: paymentMethod,
                paymentStatus: "pending_verification",
                bookingStatus: "pending_payment_verification"
            };
        });

        return res.status(201).json({
            success: true,
            message: "Ombi lako limepokelewa. Subiri admin athibitishe malipo.",
            booking: result
        });

    } catch (error) {
        console.error("RoomRent booking error:", error);

        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Akaunti yako haijapatikana."
            });
        }

        if (error.message === "USER_NOT_ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Akaunti yako haijawezeshwa."
            });
        }

        if (error.message === "ROOM_BOOKING_LIMIT_REACHED") {
            return res.status(409).json({
                success: false,
                message: "Umefikia kikomo cha idadi ya booking za chumba hiki."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Booking haikuweza kuhifadhiwa. Tafadhali jaribu tena."
        });
    }
});

// =====================================================
// ROOMRENT: ADMIN BOOKING AUTHORIZATION
// =====================================================

const ROOMRENT_ADMIN_UID = "1kj3K591EHhHAOiSoxIp1xGve2x1";

function requireRoomRentAdmin(req, res, next) {
    if (!req.user || req.user.uid !== ROOMRENT_ADMIN_UID) {
        return res.status(403).json({
            success: false,
            message: "Admin pekee ndiye anayeruhusiwa kufanya kitendo hiki."
        });
    }

    next();
}


// =====================================================
// ADMIN: CONFIRM BOOKING PAYMENT
// =====================================================

app.post(
    "/api/admin/bookings/:bookingId/confirm",
    authenticateUser,
    requireRoomRentAdmin,
    async (req, res) => {
        try {
            const bookingRef = db
                .collection("bookings")
                .doc(req.params.bookingId);

            await db.runTransaction(async (transaction) => {
                const bookingDoc = await transaction.get(bookingRef);

                if (!bookingDoc.exists) {
                    throw new Error("BOOKING_NOT_FOUND");
                }

                const booking = bookingDoc.data();

                if (
                    booking.paymentStatus !== "pending_verification" ||
                    booking.bookingStatus !== "pending_payment_verification"
                ) {
                    throw new Error("BOOKING_NOT_PENDING");
                }

                transaction.update(bookingRef, {
                    adminConfirmed: true,
                    paymentStatus: "verified",
                    bookingStatus: "active",
                    profitStatus: "running",

                    profitStartAt:
                        admin.firestore.FieldValue.serverTimestamp(),

                    adminConfirmedAt:
                        admin.firestore.FieldValue.serverTimestamp(),

                    updatedAt:
                        admin.firestore.FieldValue.serverTimestamp()
                });
            });

            return res.status(200).json({
                success: true,
                message: "Booking imethibitishwa na Admin."
            });

        } catch (error) {
            if (error.message === "BOOKING_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Booking haijapatikana."
                });
            }

            if (error.message === "BOOKING_NOT_PENDING") {
                return res.status(409).json({
                    success: false,
                    message: "Booking hii si pending tena."
                });
            }

            console.error("Admin confirmation error:", error);

            return res.status(500).json({
                success: false,
                message: "Imeshindwa kuthibitisha booking."
            });
        }
    }
);


// =====================================================
// ADMIN: REJECT BOOKING
// =====================================================

app.post(
    "/api/admin/bookings/:bookingId/reject",
    authenticateUser,
    requireRoomRentAdmin,
    async (req, res) => {
        try {
            const bookingRef = db
                .collection("bookings")
                .doc(req.params.bookingId);

            await db.runTransaction(async (transaction) => {
                const bookingDoc = await transaction.get(bookingRef);

                if (!bookingDoc.exists) {
                    throw new Error("BOOKING_NOT_FOUND");
                }

                const booking = bookingDoc.data();

                if (
                    booking.paymentStatus !== "pending_verification" ||
                    booking.bookingStatus !== "pending_payment_verification"
                ) {
                    throw new Error("BOOKING_NOT_PENDING");
                }

                transaction.update(bookingRef, {
                    adminConfirmed: false,
                    paymentStatus: "rejected",
                    bookingStatus: "rejected",
                    profitStatus: "not_started",

                    adminRejectedAt:
                        admin.firestore.FieldValue.serverTimestamp(),

                    updatedAt:
                        admin.firestore.FieldValue.serverTimestamp()
                });
            });

            return res.status(200).json({
                success: true,
                message: "Booking imekataliwa."
            });

        } catch (error) {
            if (error.message === "BOOKING_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Booking haijapatikana."
                });
            }

            if (error.message === "BOOKING_NOT_PENDING") {
                return res.status(409).json({
                    success: false,
                    message: "Booking hii si pending tena."
                });
            }

            console.error("Admin rejection error:", error);

            return res.status(500).json({
                success: false,
                message: "Imeshindwa kukataa booking."
            });
        }
    }
);
