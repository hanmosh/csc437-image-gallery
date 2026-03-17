import { MongoClient, ObjectId } from "mongodb";
import { getEnvVar } from "./src/getEnvVar.js";

export class ImageProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        const collectionName = getEnvVar("IMAGES_COLLECTION_NAME");
        this.collection = this.mongoClient.db().collection(collectionName);
        this.usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");
    }

    getAllImages() {
        const pipeline = [];
        pipeline.push({
            $addFields: {
                authorRef: {
                    $ifNull: ["$authorId", "$author"]
                }
            }
        });
        pipeline.push({
            $lookup: {
                from: this.usersCollectionName,
                let: { authorRef: "$authorRef" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$_id", "$$authorRef"] },
                                    { $eq: ["$username", "$$authorRef"] }
                                ]
                            }
                        }
                    }
                ],
                as: "author"
            }
        });
        pipeline.push({
            $unwind: {
                path: "$author",
                preserveNullAndEmptyArrays: true
            }
        });
        pipeline.push({
            $project: {
                authorRef: 0
            }
        });
        return this.collection.aggregate(pipeline).toArray();
    }

    async getOneImage(imageId) {
        const pipeline = [];
        pipeline.push({
            $match: {
                _id: new ObjectId(imageId)
            }
        });
        pipeline.push({
            $addFields: {
                authorRef: {
                    $ifNull: ["$authorId", "$author"]
                }
            }
        });
        pipeline.push({
            $lookup: {
                from: this.usersCollectionName,
                let: { authorRef: "$authorRef" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$_id", "$$authorRef"] },
                                    { $eq: ["$username", "$$authorRef"] }
                                ]
                            }
                        }
                    }
                ],
                as: "author"
            }
        });
        pipeline.push({
            $unwind: {
                path: "$author",
                preserveNullAndEmptyArrays: true
            }
        });
        pipeline.push({
            $project: {
                authorRef: 0
            }
        });
        const results = await this.collection.aggregate(pipeline).toArray();
        return results[0] ?? null;
    }

    async updateImageName(imageId, newName) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(imageId) },
            { $set: { name: newName } }
        );
        return result.matchedCount;
    }

    async createImage({ src, name, authorId }) {
        const result = await this.collection.insertOne({
            src,
            name,
            authorId
        });
        return result.insertedId;
    }
}
