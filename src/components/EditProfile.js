import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Page from "./Page";
import Axios from "axios";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import Container from "./Container";
import { Icon } from "@iconify/react";
import Spinner from "./Spinner";
import NotAuthorized from "./NotAuthorized";
import Select from "react-select";
import makeAnimated from "react-select/animated";

function EditProfile() {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  let userGroups = [];

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [groups, setGroups] = useState("");
  const [passwordType, setPasswordType] = useState("password");

  const [refresh, setRefresh] = useState("false");
  const [loading, setLoading] = useState(true);

  //let token = appState.user.token;

  let checkEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let checkPassword = new RegExp("^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,10}$");

  const [userType, setUserType] = useState("");
  const [username, setUsername] = useState("");

  const animatedComponents = makeAnimated();

  function handleLogout() {
    appDispatch({ type: "logout" });

    navigate("/");
  }

  const styles = {
    multiValue: (base, state) => {
      return state.data.isFixed ? { ...base, backgroundColor: "gray" } : base;
    },
    multiValueLabel: (base, state) => {
      return state.data.isFixed
        ? { ...base, fontWeight: "bold", color: "white", paddingRight: 6, backgroundColor: "none" }
        : base;
    },
    multiValueRemove: (base, state) => {
      return state.data.isFixed ? { ...base, display: "none" } : base;
    },
    control: (base, state) => ({
      ...base,
      background: "transparent",
      border: "none", // Remove the border
      boxShadow: "none", // Remove the box shadow
      cursor: "pointer", // Set cursor style to pointer
      minHeight: "unset", // Remove the minimum height
    }),
    indicatorsContainer: (base) => ({
      ...base,
      display: "none", // Remove the indicators container (e.g., dropdown arrow)
    }),
  };


  function convertGroupString(groupString) {
    if (Array.isArray(groupString)) {
      const groupList = groupString.map((group) => {
        const trimmedGroup = group.trim().replace(/,$/, ""); // Remove trailing comma
        return {
          label: trimmedGroup,
          value: trimmedGroup,
          isFixed: true,
        };
      });
      return groupList;
    }
  }

  async function verifyUser() {
    try {
      // post to getgroups
      //let groupNameToCheck = "admin";
      const response = await Axios.post("/verify", {
        token: appState.user.token,
        groupNameToCheck: "admin",
      });
      if (response.data) {
        //console.log(response.data.data.username);
        //console.log(response.data.data.checkgroupboolean);
        if (response.data.data.checkgroupboolean === true) {
          setUserType("admin");
          setUsername(response.data.data.username);
          setLoading(false);
        } else {
          setUserType("user");
          setUsername(response.data.data.username);
          setLoading(false);
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
      setUsername("");
    }
  }, [appState.loggedIn]);

  useEffect(() => {
    getProfile();
    getGroups();
  }, [userType !== "", refresh]);

  async function getProfile() {
    if (username && userType) {
      try {
        const response = await Axios.post("/getProfile", { username, token: appState.user.token });
        if (response.data) {
          //console.log(response.data);
          //console.log("response data for :/getProfile: " + response.data.data[0].uemail);
          setEmail(response.data.data[0].uemail);
          setLoading(false);
        } else {
          console.log("getprofile: no response data");
        }
      } catch (e) {
        console.log("Get profile error!" + e);
      }
    }
  }

  async function getGroups() {
    if (username && userType) {
      try {
        // post to getgroups
        const response = await Axios.post("/getGroup", { username, token: appState.user.token });
        if (response.data) {
          //console.log("getgroups data: " + response.data.data);
          //console.log("groupname 0: " + response.data.data[0].groupname);

          for (let i = 0; i < response.data.data.length; i++) {
            if (response.data.message === "getGroups") {
              if (i === response.data.data.length - 1) {
                userGroups.push(" " + response.data.data[i].groupname);
              } else {
                userGroups.push(" " + response.data.data[i].groupname + ",");
              }
            }
          }
          setGroups(userGroups);
          setLoading(false);
        } else {
          console.log("no groups");
          setGroups("");
        }
      } catch (e) {
        if (e instanceof Error) {
          console.log("undefined. no group.");
        } else {
          console.log("Get groups error: " + e);
        }
      }
    }
  }

  function togglePassword() {
    if (passwordType === "password") {
      setPasswordType("text");
      return;
    }
    setPasswordType("password");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setRefresh("true");

    if (email && password) {
      if (!checkEmail.test(email)) {
        appDispatch({ type: "errorMessage", value: "Please enter a valid email." });
      } else if (!checkPassword.test(password)) {
        appDispatch({
          type: "errorMessage",
          value:
            "Please enter a password of minimum 8 characters and maximum 10 characters, comprising of alphabets, numbers, and special character",
        });
      } else {
        try {
          const editProfileResponse = await Axios.post("/editProfile", {
            username,
            password,
            email,
            token: appState.user.token,
          });
          if (editProfileResponse.data) {
            appDispatch({ type: "flashMessage", value: "Profile updated. " });
            setRefresh("false");
          } else {
            // no response data
            console.log("editprofile: no response data");
          }
        } catch (e) {
          console.log("error updating: " + e);
        }
      }
    } else if (email && !checkEmail.test(email)) {
      appDispatch({ type: "errorMessage", value: "Please enter a valid email." });
    } else if (password && !checkPassword.test(password)) {
      appDispatch({
        type: "errorMessage",
        value:
          "Please enter a password of minimum 8 characters and maximum 10 characters, comprising of alphabets, numbers, and special character",
      });
    } else if (
      (email && checkEmail.test(email)) ||
      (password && checkPassword.test(password)) ||
      !(password && email)
    ) {
      try {
        const editProfileResponse = await Axios.post("/editProfile", {
          username,
          password,
          email,
          token: appState.user.token,
        });
        if (editProfileResponse.data) {
          appDispatch({ type: "flashMessage", value: "Profile updated. " });
          setRefresh("false");
          setLoading(false);
        } else {
          // no response data
          console.log("editprofile: no response data");
        }
      } catch (e) {
        console.log("error updating: " + e);
      }
    }
    //console.log("refresh stats aft: " + refresh);
  }

  if (loading) {
    return <Spinner />;
  } else {
    if (username && (userType === "admin" || userType === "user")) {
      return (
        <>
          <Container small={true}>
            <Page title="Edit Profile">
              <div className="table-responsive-lg">
                <h1 className="alignMiddle"> Profile </h1>
                <form onSubmit={handleSubmit} id="editProfileFormTable">
                  <table className="editPtable">
                    <thead>
                      <tr className="alignMiddle">
                        <th>Username</th>
                        <th>Password</th>
                        <th>Email</th>
                        <th>Group</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="alignMiddle">
                          <input
                            value={username}
                            className="transparent-border alignMiddle"
                            disabled
                          />
                        </td>
                        <td className="alignMiddle">
                          <input
                            className="transparent-border alignMiddle"
                            type={passwordType}
                            onChange={(e) => setPassword(e.target.value)}
                            name="password"
                            value={password}
                          />
                          {password && (
                            <button type="button" className="btn" onClick={togglePassword}>
                              {passwordType === "password" ? (
                                <Icon icon="zmdi:eye" />
                              ) : (
                                <Icon icon="zmdi:eye-off" />
                              )}
                            </button>
                          )}
                        </td>
                        <td className="alignMiddle">
                          <input
                            className="transparent-border alignMiddle"
                            onChange={(e) => setEmail(e.target.value)}
                            name="email"
                            value={email}
                          />
                        </td>
                        <td id="groupsTD">
                          <div className="overflowAdjust" disabled id="alignGroupMiddle">
                            <div>
                              <Select
                                isDisabled={true}
                                styles={styles}
                                components={animatedComponents}
                                value={convertGroupString(groups)}
                                isMulti
                                isClearable={false}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <button className="userButton">Update Profile</button>
                </form>
              </div>
            </Page>
          </Container>
      </>
      );
    } else {
      return (
        <>
          <NotAuthorized />
        </>
      );
    }
  }
}

export default EditProfile;
