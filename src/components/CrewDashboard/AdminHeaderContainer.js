import { useState } from "react";
import logo from "../../Login.png";
import { FaSearch, FaSignOutAlt } from "react-icons/fa"; // Import the search icon
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { supabase } from "../../supabaseClient";
import { useSelector } from "react-redux";

function AdminHeaderContainer() {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory
  const user = useSelector((state) => state.auth.user);
  const userEmail = user?.Email || sessionStorage.getItem("User");
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
    navigate("/login");
  };

  return (
    <div className="header-container">
      <div className="header-left flex">
        <div>
          <img src={logo} alt="ACT Logo" className="header-left img" />
        </div>
        <div>
          <h1 className="header-title">
            Welcome, <span>{userEmail}</span>
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
          <FaSignOutAlt
            className="logout-icon"
            style={{ right: "100px" }}
            onClick={handleLogout}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminHeaderContainer;
