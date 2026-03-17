import { useState } from "react";
import { Routes, Route } from "react-router";
import { AllImages } from "./images/AllImages.jsx";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { UploadPage } from "./UploadPage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { MainLayout } from "./MainLayout.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";

function NotFound() {
    return (
        <>
            <h2>Page not found</h2>
            <p>Try one of the links above.</p>
        </>
    );
}

function App() {
    const [authToken, setAuthToken] = useState("");
    function handleLogout() {
        setAuthToken("");
    }

    return (
        <Routes>
            <Route
                path={VALID_ROUTES.HOME}
                element={<MainLayout authToken={authToken} onLogout={handleLogout} />}
            >
                <Route
                    index
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <AllImages authToken={authToken} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={VALID_ROUTES.IMAGE_DETAILS}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <ImageDetails authToken={authToken} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={VALID_ROUTES.UPLOAD}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <UploadPage authToken={authToken} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={VALID_ROUTES.LOGIN}
                    element={<LoginPage onLoginSuccess={setAuthToken} />}
                />
                <Route
                    path={VALID_ROUTES.REGISTER}
                    element={<LoginPage isRegistering={true} onLoginSuccess={setAuthToken} />}
                />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
