import React, { useState, useContext } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import DispatchContext from "../DispatchContext";
import { Icon } from '@iconify/react';

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
    <div className="loggedOutPage">
      <div className="split left">
        <p className="leftText">
        {/* <Icon icon="iconoir:kanban-board" style={{ background: 'transparent', verticalAlign: 'middle' }} /> */}
        &nbsp;
        TASK 
        MANAGEMENT 
        SYSTEM
        </p>

      </div>

      <div className="split right">
      <div className="loginForm">
      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <input
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              name="username"
              className="form-control form-control-sm input-dark uname"
              type="text"
              placeholder="Username"
              autoComplete="off"
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              className="form-control form-control-sm input-dark psw"
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
      </div>
    </div>








    
  );
}

export default HeaderLoggedOut;
