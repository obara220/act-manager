// import logo from "./logo.svg";
import "./LoginRegisterContainer.scss";
import Login from "../Login/Login"
import logo from "../../Login.png"
import RightLogin from "../../images/logo-right.svg"
import LeftTopLogin from "../../images/login-left-top.png"
import LeftBottomLogin from "../../images/login-left-bottom.png"
import Register from "../Register/Register";
import { useState } from "react";

function LoginRegisterContainer(props) {
    const [isRegisterUser, setRegisteredUser] = useState(true)
    const navigateToLoginPage = () => {
        setRegisteredUser(true);
    };

    const navigateToRegisterPage = () => {
        setRegisteredUser(false);
    };
    return (
        <div className="login-Register-container">
            <div className="login-form-card">
                <div className="form-container">
                    <div className="logo">
                        <img src={logo} alt="Logo" />
                    </div>
                    {isRegisterUser ? (
                        <Login navigateToRegisterPage={navigateToRegisterPage} setUserAuthenticatedStatus={props.setUserAuthenticatedStatus} />
                    ) : (
                        <Register navigateToLoginPage={navigateToLoginPage} />
                    )}
                </div>
                <div>
                    <img style={{ width: '458px', height: 'auto' }} src={RightLogin}></img>
                </div>
            </div>

        </div>
    );
}

export default LoginRegisterContainer;
