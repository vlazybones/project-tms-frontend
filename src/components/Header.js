import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StateContext from "../StateContext";
import "bootstrap/dist/css/bootstrap.min.css";
import Axios from "axios";
import DispatchContext from "../DispatchContext";

// Link replace a href in jsx, Link To

function Header(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const navigate = useNavigate();

  const [usernameLoggedIn, setUsernameLoggedIn] = useState("");
  const [userType, setUserType] = useState("");

  function handleLogout() {
    appDispatch({ type: "logout" });

    navigate("/");
  }

  function handleLinkClick() {
    window.location.href = "/";
  }

  //let token = appState.user.token;

  async function verifyUser() {
    try {
      // post to getgroups
      let groupNameToCheck = "admin";
      const response = await Axios.post("/verify", {
        token: appState.user.token,
        groupNameToCheck,
      });
      if (response.data) {
        //console.log(response.data.data.username);
        //console.log(response.data.data.checkgroupboolean);
        if (response.data.data.checkgroupboolean === true) {
          setUserType("admin");
          setUsernameLoggedIn(response.data.data.username);
        } else {
          setUserType("user");
          setUsernameLoggedIn(response.data.data.username);
        }
      } else {
        console.log("verify sending error");
      }
    } catch (e) {
      console.log("verify user error: " + e);
      handleLogout();
    }
  }

  useEffect(() => {
    if (appState.loggedIn) {
      verifyUser();
    } else {
      setUsernameLoggedIn("");
    }
  }, [appState.loggedIn]);

  if (appState.loggedIn) {
    return (
      <>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <Link to="/" className="navbar-brand" onClick={handleLinkClick}>
            &nbsp; Task Management System
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
              <Link to="/EditProfile" className="nav-item nav-link">
                &nbsp;&nbsp;Edit Profile
              </Link>
              {userType === "admin" && (
                <Link to="/UserManagement" className="nav-item nav-link ">
                  &nbsp;&nbsp;User Management
                </Link>
              )}
            </div>
          </div>
        </nav>
        <div className="alignMiddle">
          {usernameLoggedIn && (
            <div className="welcomeMsg">
              Welcome, <strong>{usernameLoggedIn}</strong>.&nbsp; &nbsp;
            </div>
          )}{" "}
          {appState.loggedIn ? (
            <button onClick={handleLogout} className="btn logOutBtn">
              Sign Out
            </button>
          ) : (
            ""
          )}
        </div>
      </>
    );
  } else {
    return (
      <>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <Link to="/" className="navbar-brand">
            &nbsp;Task Management System
          </Link>
        </nav>
      </>
    );
  }
}
export default Header;
