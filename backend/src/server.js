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
