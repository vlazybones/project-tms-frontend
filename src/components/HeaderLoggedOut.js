import React, { useState, useContext } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import DispatchContext from "../DispatchContext";

function HeaderLoggedOut() {
  const appDispatch = useContext(DispatchContext);

  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) {
      appDispatch({ type: "errorMessage", value: "Invalid credentials. " });
    } else {
      try {
        const response = await Axios.post("/login", { username, password });
        if (response.data) {
          appDispatch({ type: "login", data: response.data });
          navigate("/");
        } else {
          console.log("no resopnse data");
        }
      } catch (e) {
        appDispatch({ type: "errorMessage", value: "Invalid credentials. " });
      }
    }
  }

  return (
    <div className="loginForm">
      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <input
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              name="username"
              className="form-control form-control-sm input-dark"
              type="text"
              placeholder="Username"
              autoComplete="off"
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              className="form-control form-control-sm input-dark"
              type="password"
              placeholder="Password"
            />
          </div>
          <div>
            <button className="alignButtonMiddle">Sign In</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default HeaderLoggedOut;
