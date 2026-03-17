import { useState } from "react";

interface ImageNameEditorProps {
    imageId: string;
    initialValue: string;
    onNameUpdated: (newName: string) => void;
    authToken: string;
}

export function ImageNameEditor({
    imageId,
    initialValue,
    onNameUpdated,
    authToken,
}: ImageNameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(initialValue || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    function handleEditPressed() {
        setIsEditingName(true);
        setNameInput(initialValue || "");
    }
    async function handleSubmitPressed() {
        setErrorMessage("");
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/images/${imageId}/name`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ name: nameInput }),
            });

            if (!response.ok) {
                let message = `Error: HTTP ${response.status} ${response.statusText}`;
                try {
                    const payload = await response.json();
                    if (payload?.message) {
                        message = payload.message;
                    }
                } catch {
                    // Ignore JSON parsing errors and keep default message.
                }
                throw new Error(message);
            }

            if (typeof onNameUpdated === "function") {
                onNameUpdated(nameInput);
            }
            setIsEditingName(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <div aria-live="polite">
                    {isSubmitting && <p>Renaming image...</p>}
                    {errorMessage !== "" && <p>{errorMessage}</p>}
                </div>
                <label>
                    New Name
                    <input
                        required
                        style={{ marginLeft: "0.5em" }}
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        disabled={isSubmitting}
                    />
                </label>
                <button
                    disabled={nameInput.length === 0 || isSubmitting}
                    onClick={handleSubmitPressed}
                >
                    Submit
                </button>
                <button onClick={() => setIsEditingName(false)}>Cancel</button>
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <div aria-live="polite">
                    {errorMessage !== "" && <p>{errorMessage}</p>}
                </div>
                <button onClick={handleEditPressed}>Edit name</button>
            </div>
        );
    }
}
