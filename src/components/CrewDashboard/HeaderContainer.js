import { useState, useEffect } from "react";
import logo from "../../Login.png";
import { FaSearch, FaSignOutAlt } from "react-icons/fa"; // Import the search icon
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { supabase } from "../../supabaseClient";
import { useSelector } from "react-redux";

function HeaderContainer({ headerStyle }) {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory
  const [userInfo, setUserInfo] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const userEmail = user?.Email || sessionStorage.getItem("User");
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data: userData, error } = await supabase.auth.getUser();
        if (error || !userData?.user) {
          console.error("No user found or error occurred:", error);
          return;
        }

        // Assuming 'users' table stores user data with a foreign key to auth.users
        const { data, error: userError } = await supabase
          .from("Users")
          .select("*")
          .eq("id", userData.user.id)
          .single();

        if (userError) throw userError;

        setUserInfo(data);
      } catch (err) {
        console.error("Error fetching user info:", err.message);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("isUserAuthenticated");
    sessionStorage.removeItem("isAdmin");
    sessionStorage.removeItem("User");
    sessionStorage.removeItem("UserRole");
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
            Welcome, <span>{user?.Email}</span>
          </h1>
          <p className="header-subtitle">Los Angeles, CA</p>
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
            style={{ right: headerStyle }}
            onClick={handleLogout}
          />
        </div>
      </div>
    </div>
  );
}

export default HeaderContainer;
