const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin using the hosting environment.
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();

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
