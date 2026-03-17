import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { SHARED_TEST } from "./shared/example.js";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";
import { connectMongo } from "../connectMongo.js";
import { CredentialsProvider } from "../CredentialsProvider.js";
import { ImageProvider } from "../ImageProvider.js";
import { verifyAuthToken } from "../routes/authMiddleware.js";
import { registerAuthRoutes } from "../routes/authRoutes.js";
import { registerImageRoutes } from "../routes/imageRoutes.js";
import {
    imageMiddlewareFactory,
    handleImageFileErrors
} from "../imageUploadMiddleware.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const IMAGE_UPLOAD_DIR = getEnvVar("IMAGE_UPLOAD_DIR") || "uploads";
const app = express();
app.use(express.static(STATIC_DIR));
app.use("/uploads", express.static(IMAGE_UPLOAD_DIR));
app.use(express.json());

const mongoClient = connectMongo();
const credentialsProvider = new CredentialsProvider(mongoClient);
const imageProvider = new ImageProvider(mongoClient);

app.get("/api/hello", (req, res) => {
    res.send("Hello, World " + SHARED_TEST);
});

app.use("/api/images", verifyAuthToken);
app.post(
    "/api/images",
    imageMiddlewareFactory.single("image"),
    handleImageFileErrors,
    async (req, res) => {
        // Final handler function after the above two middleware functions finish running
        const name = req.body?.name;
        const username = req.userInfo?.username;
        if (!req.file || typeof name !== "string" || typeof username !== "string") {
            res.status(400).send({
                error: "Bad Request",
                message: "Missing image file, name, or user"
            });
            return;
        }

        const src = `/uploads/${req.file.filename}`;
        const insertedId = await imageProvider.createImage({
            src,
            name,
            authorId: username
        });

        res.status(201).send({ id: insertedId.toString() });
    }
);
registerImageRoutes(app, imageProvider);
registerAuthRoutes(app, credentialsProvider);

app.get(Object.values(VALID_ROUTES), (req, res) => {
    res.sendFile("index.html", { root: STATIC_DIR });
});

async function startServer() {
    await mongoClient.connect();
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}.  CTRL+C to stop.`);
    });
}

startServer();
