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
app.post("/api/bookings", authenticateUser, async (req, res) => {
try {
const { roomId, paymentMethod } = req.body || {};

    // Only accept known room IDs.
    const rooms = {
        "0023": { price: 30000 },
        "0024": { price: 70000 },
        "0025": { price: 140000 },
        "0026": { price: 210000 },
        "0027": { price: 280000 },
        "0028": { price: 350000 },
        "0029": { price: 420000 },
        "0030": { price: 490000 },
        "0031": { price: 560000 },
        "0032": { price: 630000 }
    };

    const room = rooms[String(roomId)];

    if (!room) {
        return res.status(400).json({
            success: false,
            message: "Invalid room ID"
        });
    }

    const allowedPaymentMethods = ["Airtel Money", "Mixx by Yas"];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({
            success: false,
            message: "Invalid payment method"
        });
    }

    const userRef = db.collection("users").doc(req.user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        return res.status(404).json({
            success: false,
            message: "User account not found"
        });
    }

    const userData = userDoc.data();

    if (userData.status !== "active") {
        return res.status(403).json({
            success: false,
            message: "User account is not active"
        });
    }

    const bookingData = {
        userId: req.user.uid,
        roomId: String(roomId),
        roomPrice: room.price,
        paymentMethod,
        status: "pending_verification",
        paymentStatus: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const bookingRef = await db.collection("bookings").add(bookingData);

    return res.status(201).json({
        success: true,
        bookingId: bookingRef.id,
        booking: bookingData,
        message: "Booking created. Awaiting admin payment verification."
    });
} catch (error) {
    console.error("Booking creation failed:", error);

    return res.status(500).json({
        success: false,
        message: "Unable to create booking"
    });
}

});
