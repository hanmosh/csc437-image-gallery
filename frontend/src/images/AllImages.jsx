import { useEffect, useState } from "react";
import { ImageGrid } from "./ImageGrid.jsx";

export function AllImages() {
    const [imageData, setImageData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // Code in here will run just once when this component is created
        // (Or just twice in development mode)
        async function doFetch() {
            try {
                const response = await fetch("/api/images");
                if (!response.ok) {
                    throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);
                }
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
    }, []);
    return (
        <>
            <h2>All Images</h2>
            {isLoading && <p>Loading...</p>}
            {errorMessage !== "" && <p>{errorMessage}</p>}
            <ImageGrid images={imageData} />
        </>
    );
}
