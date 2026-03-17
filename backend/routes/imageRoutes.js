import { ObjectId } from "mongodb";

const MAX_NAME_LENGTH = 100;

function waitDuration(numMs) {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

export function registerImageRoutes(app, imageProvider) {
    app.get("/api/images", async (req, res) => {
        await waitDuration(1000);
        const images = await imageProvider.getAllImages();
        res.json(images);
    });

    app.get("/api/images/:imageId", async (req, res) => {
        const { imageId } = req.params;
        if (!ObjectId.isValid(imageId)) {
            res.status(404).send({
                error: "Not Found",
                message: "No image with that ID"
            });
            return;
        }

        const image = await imageProvider.getOneImage(imageId);
        if (!image) {
            res.status(404).send({
                error: "Not Found",
                message: "No image with that ID"
            });
            return;
        }

        res.json(image);
    });

    app.patch("/api/images/:imageId/name", async (req, res) => {
        const { imageId } = req.params;
        if (!ObjectId.isValid(imageId)) {
            res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
            return;
        }

        const { name } = req.body ?? {};
        if (typeof name !== "string") {
            res.status(400).send({
                error: "Bad Request",
                message: "Request body must include a string 'name' field"
            });
            return;
        }

        if (name.length > MAX_NAME_LENGTH) {
            res.status(413).send({
                error: "Content Too Large",
                message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
            });
            return;
        }

        const image = await imageProvider.getOneImage(imageId);
        if (!image) {
            res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
            return;
        }

        const loggedInUsername = req.userInfo?.username;
        const authorUsername = image.authorId ?? image.author?.username ?? image.author;
        if (authorUsername !== loggedInUsername) {
            res.status(403).send({
                error: "Forbidden",
                message: "You cannot edit the name because you do not own the image"
            });
            return;
        }

        const matchedCount = await imageProvider.updateImageName(imageId, name);
        if (matchedCount === 0) {
            res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
            return;
        }

        res.status(204).send();
    });
}
