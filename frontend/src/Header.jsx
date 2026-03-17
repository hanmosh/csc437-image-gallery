import "./Header.css";
import { Link } from "react-router";

export function Header({ authToken, onLogout }) {
    const isLoggedIn = Boolean(authToken);
    return (
        <header>
            <h1>My cool image site</h1>
            <div>
                <label>
                    Some switch (dark mode?) <input type="checkbox" />
                </label>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/upload">Upload</Link>
                    {isLoggedIn ? (
                        <button type="button" onClick={onLogout}>
                            Log out
                        </button>
                    ) : (
                        <Link to="/login">Log in</Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
