import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Page from "./Page";
import StateContext from "../StateContext";

function NotAuthorized() {
  const appState = useContext(StateContext);

  return (
    <>
      <Page title="Unauthorised">
        <div className="boxMessage">
          {appState.loggedIn === false && (
            <div>
              <p className="alignMiddle">
                {" "}
                ACCESS DENIED. <br /> Please Login.
              </p>
              <p className="alignMiddleLink">
                <Link to="/"> Login </Link>
              </p>
            </div>
          )}
          {appState.loggedIn === true && (
            <div>
              <p className="alignMiddle"> You do not have the rights to access this page. </p>
            </div>
          )}
        </div>
      </Page>
    </>
  );
}

export default NotAuthorized;
