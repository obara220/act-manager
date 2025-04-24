import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux"; // Import useDispatch
import { setUserAuth } from "../../redux/actions/authActions"; // Import action

import "./Login.scss";
import { getBaseURL } from "../apiConfig";
import TokenRefresher from "../Utils/token";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBRow,
  MDBInput,
  MDBCheckbox,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBIcon
}
  from 'mdb-react-ui-kit';

import 'mdb-react-ui-kit/dist/css/mdb.min.css';
// import "@fortawesome/fontawesome-free/css/all.min.css";

function Login(props) {
  const dispatch = useDispatch(); // Initialize dispatch
  const [selectedLocation, setSelectedLocation] = useState("");

  const locations = ["New York", "Los Angeles", "Chicago", "Houston", "Miami"];


  let [uname, setUname] = useState("");
  let [password, setPass] = useState("");
  let [error, setError] = useState("");
  const [flightNumber, setFlightNumber] = useState();
  const [nextStep, setNextStep] = useState(false);
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  let [isUserAuthenticated, setUserAuthorization] = useState(
    sessionStorage.getItem("isUserAuthenticated") === "true" || false
  );
  // Adding click handler
  function handleClick() {
    if (uname === "manager@gmail.com" && password === "123") {
      sessionStorage.setItem("isUserAuthenticated", true);
      setError("");
      setNextStep(true);

    } else if (uname === "admin@gmail.com" && password === "123") {
      sessionStorage.setItem("isUserAuthenticated", true);
      navigate("/super-admin");
      setError("");
      dispatch(setUserAuth(true));
    }
    else {
      setError("You don't have access!")
    }

    // if (validateInputs()) {
    //   const user = {
    //     email: uname,
    //     password: password,
    //   };
    //   let url = `${getBaseURL()}api/users/login`;
    //   axios
    //     .post(url, { ...user })
    //     .then((res) => {
    //       console.log(res);
    //       if (res.data.length > 0) {
    //         console.log("Logged in successfully");
    //         sessionStorage.setItem("isUserAuthenticated", true);
    //         const user = res.data[0].isAdmin;
    //         sessionStorage.setItem("customerId", res.data[0].userId);
    //         sessionStorage.setItem("isAdmin", user ? true : false);
    //         sessionStorage.setItem("jwt_token", res.data[0].token);
    //         sessionStorage.setItem("jwt_refresh_token", res.data[0].refreshToken);
    //         TokenRefresher(res.data[0].refreshToken);
    //         props.setUserAuthenticatedStatus(user ? true : false, res.data[0].userId);
    //       } else {
    //         console.log("User not available");
    //       }
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //       console.log("error");
    //     });
    // }
  }

  // Function to validate email format
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Function to validate password length
  function validatePassword(password) {
    return password.length >= 6;
  }

  // Function to validate inputs
  function validateInputs() {
    if (!validateEmail(uname)) {
      setError("Please provide a valid email address.");
      return false;
    } else if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    setError("");
    return true;
  }

  // Function to handle changes in email input
  function changeName(event) {
    setUname(event.target.value);
  }

  // Function to handle changes in password input
  function changePass(event) {
    setPass(event.target.value);
  }
  const handleFind = () => {
    // if (flightNumber === "123") {
    // window.location.reload(); // Refresh the page
    setError("");
    navigate("/manager"); // Use navigate to redirect to the login page
    dispatch(setUserAuth(true));

    // } else {
    //   setError("Invalid flight number!"); // Show error message

    // }
  }

  const changeFlightNumber = (event) => {
    setFlightNumber(event.target.value);
  }

  return (
    <>
      <div className="login-container" style={{ paddingBottom: error ? '0px' : '22px' }}>
        <h1>LOG IN</h1>
        {!nextStep &&
          <p>Welcome back!</p>
        }
        {nextStep &&
          <div style={{ marginTop: '20px', marginBottom: '45px' }}>
            <p>Select your service location to manage drivers, vehicles, and schedules efficiently.</p>
          </div>
        }

        {!nextStep &&
          <>
            <MDBInput wrapperClass='mb-4' label='User ID' id='form1' type='text' value={uname} onChange={changeName} />
            <MDBInput wrapperClass='mb-4' label='Password' id='form1' type='password' value={password} onChange={changePass} />

            {error && <div className="error-message">{error}</div>}
            <MDBBtn
              className={`w-100 mb-4 ${error ? 'custom-btn' : ''}`}

              size='md'
              onClick={handleClick}
            >
              Sign In
            </MDBBtn>
          </>
        }
        {nextStep &&
          <>
            <MDBContainer className="location-dropdown">
              <select
                className="form-control"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="" disabled>Select Location</option>
                {locations.map((location, index) => (
                  <option key={index} value={location}>{location}</option>
                ))}
              </select>
            </MDBContainer>
            {/* <MDBInput wrapperClass='mb-4' label='Flight Number' id='form2' type='text' value={flightNumber} onChange={changeFlightNumber} /> */}
            {error && <div className="error-message">{error}</div>}
            <MDBBtn
              className={`w-100 mb-68 ${error ? "mb-58" : ""}`}
              size='md'
              onClick={handleFind}
            >
              Continue
            </MDBBtn>
          </>
        }
        {/* <button className="green-blue-btn" onClick={handleClick}>Sign In</button> */}
        {/* <div className="register-link" onClick={() => props.navigateToRegisterPage()}>
          Is New User
        </div> */}
      </div>
    </>
  );
}

export default Login;
