import jwt from "jsonwebtoken";
import { getEnvVar } from "../src/getEnvVar.js";

/**
 * Creates a Promise for a JWT token, with a specified username embedded inside.
 *
 * @param username the username to embed in the JWT token
 * @return a Promise for a JWT
 */
function generateAuthToken(username) {
    return new Promise((resolve, reject) => {
        const payload = {
            username
        };
        jwt.sign(
            payload,
            getEnvVar("JWT_SECRET"),
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token);
            }
        );
    });
}

export function registerAuthRoutes(app, credentialsProvider) {
    app.post("/api/users", async (req, res) => {
        const { username, email, password } = req.body ?? {};
        if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
            res.status(400).send({
                error: "Bad request",
                message: "Missing username, email, or password"
            });
            return;
        }

        const created = await credentialsProvider.registerUser(username, email, password);
        if (!created) {
            res.status(409).send({
                error: "Conflict",
                message: "Username already taken"
            });
            return;
        }

        const token = await generateAuthToken(username);
        res.status(201).send({ token });
    });

    app.post("/api/auth/tokens", async (req, res) => {
        const { username, password } = req.body ?? {};
        if (typeof username !== "string" || typeof password !== "string") {
            res.status(400).send({
                error: "Bad request",
                message: "Missing username or password"
            });
            return;
        }

        const isValid = await credentialsProvider.verifyPassword(username, password);
        if (!isValid) {
            res.status(401).send({
                error: "Unauthorized",
                message: "Invalid username or password"
            });
            return;
        }

        const token = await generateAuthToken(username);
        res.status(200).send({ token });
    });
}
