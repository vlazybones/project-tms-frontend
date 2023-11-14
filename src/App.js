import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

// Components
import Header from "./components/Header";
import Home from "./components/Home";
import PageNotFound from "./components/PageNotFound";
import FlashMessages from "./components/FlashMessages";
import NotAuthorized from "./components/NotAuthorized";
import EditProfile from "./components/EditProfile";
import UserManagement from "./components/UserManagement";
import ErrorMessages from "./components/ErrorMessages";

// bootstrap
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

// Main.js

import React, { useEffect } from "react";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Routes, Route } from "react-router-dom";

//Axios
import Axios from "axios";
Axios.defaults.baseURL = "http://localhost:2424";
/*Axios.defaults.headers.common = {
  Authorization: `Bearer ${localStorage.getItem("token")}`,
};*/

//inside routes, list the routes (path)
function MainPage() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("token")),
    flashMessages: [],
    errorMessages: [],
    user: {
      token: localStorage.getItem("token"),
    },
  };
  //draft: give us a copy of state. state: prev or current state value
  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.user = action.data;
        draft.loggedIn = true;
        //Axios.defaults.headers.common = `Bearer ${draft.user.token}`;
        return;
      case "logout":
        draft.user.token = "";
        draft.loggedIn = false;
        return;
      case "flashMessage":
        draft.flashMessages.push(action.value);
        return;
      case "errorMessage":
        draft.errorMessages.push(action.value);
        return;
      default:
        return;
    }
  }
  // dispatch: update state.
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  // [] = watching for changes/items you want to keep track of its change
  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("token", state.user.token);
      /*Axios.defaults.headers.common = {
        Authorization: `Bearer ${state.user.token}`,
      };*/
    } else {
      localStorage.removeItem("token", state.user.token);
      /*Axios.defaults.headers.common = { Authorization: "" };
       */
    }
  }, [state.loggedIn]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <Header element={state.loggedIn} />
          <FlashMessages messages={state.flashMessages} />
          <ErrorMessages messages={state.errorMessages} />
          <Routes>
            <Route path="/" element={state.loggedIn ? <Home /> : <Home />} />
            <Route path="/NotAuthorized" element={<NotAuthorized />} />
            <Route path="/Home" element={state.loggedIn ? <Home /> : <Home />} />
            <Route
              path="/EditProfile"
              element={state.loggedIn ? <EditProfile /> : <NotAuthorized />}
            />
            <Route
              path="/UserManagement"
              element={state.loggedIn ? <UserManagement /> : <NotAuthorized />}
            />
            <Route path="/*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export default MainPage;
