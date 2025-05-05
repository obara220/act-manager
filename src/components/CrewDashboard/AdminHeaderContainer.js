import { useState } from "react";
import logo from "../../Login.png";
import { FaSearch, FaSignOutAlt } from "react-icons/fa"; // Import the search icon
import { useNavigate } from "react-router-dom"; // Import useNavigate

function AdminHeaderContainer() {
    const navigate = useNavigate(); // Use useNavigate instead of useHistory

    const handleLogout = () => {
        sessionStorage.removeItem("isUserAuthenticated");
        sessionStorage.removeItem("isAdmin");
        sessionStorage.removeItem("customerId");
        sessionStorage.removeItem("jwt_token");
        sessionStorage.removeItem("jwt_refresh_token");
        // setUserAuthorization(false);
        // setAdmin(false);
        // setCustomerId(undefined);
        // history.push("/login"); // Adjust the route if needed
        navigate("/login"); // Use navigate to redirect to the login page
    };

    return (
        <div className="header-container">
            <div className="header-left flex">
                <div>
                    <img src={logo} alt="ACT Logo" className="header-left img" />
                </div>
                <div>
                    <h1 className="header-title">
                        Welcome, <span>Admin</span>
                    </h1>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="search-input-wrapper">
                    <div className="search-input-container">
                        <input
                            type="text"
                            placeholder="Search Flight..."
                            className="search-input"
                        />
                        <FaSearch className="search-icon" />
                    </div>
                </div>
                <div className="flex items-center">
                    <FaSignOutAlt className="logout-icon" style={{right: '100px'}} onClick={handleLogout} />
                </div>
            </div>
        </div>
    );
}

export default AdminHeaderContainer;
