import React from "react";
import { useId, useState } from "react";
import { useNavigate } from "react-router";

export function UploadPage({ authToken }) {
    const fileInputId = useId();
    const [previewUrl, setPreviewUrl] = useState("");
    const navigate = useNavigate();

    function readAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(err);
        });
    }

    function handleFileChange(event) {
        const file = event.target.files?.[0];
        if (!file) {
            setPreviewUrl("");
            return;
        }
        readAsDataURL(file)
            .then((result) => {
                setPreviewUrl(typeof result === "string" ? result : "");
            })
            .catch(() => {
                setPreviewUrl("");
            });
    }

    async function handleUpload(_previousError, formData) {
        try {
            const response = await fetch("/api/images", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                setPreviewUrl("");
                return `Upload failed (HTTP ${response.status}).`;
            }
            const payload = await response.json();
            if (payload?.id) {
                navigate(`/images/${payload.id}`);
                return "";
            }
            return "Upload succeeded, but no image id was returned.";
            return "";
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setPreviewUrl("");
            return `Upload failed: ${message}`;
        }
    }

    const [uploadError, uploadAction, isUploading] = React.useActionState(handleUpload, "");

    return (
        <>
            <h2>Upload</h2>
            <form action={uploadAction}>
                <div>
                    <label htmlFor={fileInputId}>Choose image to upload: </label>
                    <input
                        id={fileInputId}
                        name="image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        required
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </div>
                <div>
                    <label>
                        <span>Image title: </span>
                        <input name="name" required disabled={isUploading} />
                    </label>
                </div>

                <div>
                    <img
                        style={{ width: "20em", maxWidth: "100%" }}
                        src={previewUrl}
                        alt=""
                    />
                </div>

                <input type="submit" value="Confirm upload" disabled={isUploading} />
            </form>
            <div aria-live="polite">
                {uploadError !== "" && <p>{uploadError}</p>}
            </div>
        </>
    );
}
