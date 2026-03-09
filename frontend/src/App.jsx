import { Routes, Route } from "react-router";
import { AllImages } from "./images/AllImages.jsx";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { UploadPage } from "./UploadPage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { MainLayout } from "./MainLayout.jsx";
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
    return (
        <Routes>
            <Route path={VALID_ROUTES.HOME} element={<MainLayout />}>
                <Route index element={<AllImages />} />
                <Route path={VALID_ROUTES.IMAGE_DETAILS} element={<ImageDetails />} />
                <Route path={VALID_ROUTES.UPLOAD} element={<UploadPage />} />
                <Route path={VALID_ROUTES.LOGIN} element={<LoginPage />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
