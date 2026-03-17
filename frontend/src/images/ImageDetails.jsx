import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ImageNameEditor } from "./ImageNameEditor.tsx";

export function ImageDetails({ authToken }) {
    const { imageId } = useParams();
    const [imageData, setImageData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function doFetch() {
            try {
                const response = await fetch(`/api/images/${imageId}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const result = await response.json();
                setImageData(result);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                setErrorMessage(message);
            } finally {
                setIsLoading(false);
            }
        }

        doFetch();
    }, [imageId, authToken]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (errorMessage !== "") {
        return <p>{errorMessage}</p>;
    }

    if (!imageData) {
        return <h2>Image not found</h2>;
    }

    function handleNameUpdated(newName) {
        setImageData((prev) => (prev ? { ...prev, name: newName } : prev));
    }

    return (
        <>
            <h2>{imageData.name}</h2>
            <p>By {imageData.author.username}</p>
            <ImageNameEditor
                imageId={imageData._id}
                initialValue={imageData.name}
                authToken={authToken}
                onNameUpdated={handleNameUpdated}
            />
            <img className="ImageDetails-img" src={imageData.src} alt={imageData.name} />
        </>
    )
}
