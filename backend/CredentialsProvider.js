import bcrypt from "bcrypt";
import { getEnvVar } from "./src/getEnvVar.js";

export class CredentialsProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        const credsCollectionName = getEnvVar("CREDS_COLLECTION_NAME");
        const usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");
        this.credsCollection = this.mongoClient.db().collection(credsCollectionName);
        this.usersCollection = this.mongoClient.db().collection(usersCollectionName);
    }

    /**
     * Registers a user in the credentials and users collections.
     * Returns true if created, false if username already exists.
     */
    async registerUser(username, email, password) {
        const existingCreds = await this.credsCollection.findOne({ username });
        if (existingCreds) {
            return false;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await this.credsCollection.insertOne({
            username,
            // bcrypt output already encodes the salt + hash together.
            password: hashedPassword
        });

        await this.usersCollection.insertOne({
            username,
            email
        });

        return true;
    }

    async verifyPassword(username, password) {
        const creds = await this.credsCollection.findOne({ username });
        if (!creds) {
            return false;
        }

        return bcrypt.compare(password, creds.password);
    }
}
