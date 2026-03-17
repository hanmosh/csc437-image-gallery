import { Outlet } from "react-router";
import { Header } from "./Header.jsx";

export function MainLayout({ authToken, onLogout }) {
    return (
        <div>
            <Header authToken={authToken} onLogout={onLogout} />
            <div style={{ padding: "0 2em" }}>
                <Outlet />
            </div>
        </div>
    );
}
