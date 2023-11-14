import React, { useEffect, useContext, useState } from "react";
import Page from "./Page";
import Container from "./Container";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import Axios from "axios";
import { Icon } from "@iconify/react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import Spinner from "./Spinner";
import { useNavigate } from "react-router-dom";
import NotAuthorized from "./NotAuthorized";

function UserManagement() {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // check user group , pass this value
  const [groupNameToCheck, setgroupNameToCheck] = useState(null);

  //adding new user. setting value to pass backend and value to empty aft subm
  const [usernameNewUser, setUsernameNewUser] = useState("");
  const [passwordNewUser, setPasswordNewUser] = useState("");
  const [emailNewUser, setEmailNewUser] = useState("");
  const [activeStatusNewUser, setActiveStatusNewUser] = useState("active");
  const [groupsNewUser, setGroupsNewUser] = useState("");

  // for groups edit, user and group
  const [groupsToUpdateForUser, setGroupsToUpdateForUser] = useState(null);
  const [usernameToUpdateForGroup, setUsernameToUpdateForGroup] = useState(null);

  //adding groupname. setting value to empty.
  const [groupnameNew, setgroupnameNew] = useState("");

  // show hide addgroup/adduser buttons etc
  const [addGroupTrigger, setAddGroupTrigger] = useState(false);
  const [addUserTrigger, setAddUserTrigger] = useState(false);

  // for password show and hide
  const [passwordType, setPasswordType] = useState("password");

  // array to store fetched user data
  const allUserData = [];
  const [listOfUsersData, setlistOfUsersData] = useState(allUserData);

  //array to store fetched groups data
  const allGroupsData = [];
  const [listOfGroupsData, setlistOfGroupsData] = useState(allGroupsData);

  const [IsChecked, setIsChecked] = useState(true);

  // refresh data
  const [refresh, setRefresh] = useState("false");

  // for select
  const animatedComponents = makeAnimated();

  // for checking of username and userType (admin or user)
  const [userType, setUserType] = useState("");
  const [usernameCurrent, setUsernameCurrent] = useState("");

  const isSelf = usernameCurrent && userType === "admin";

  const styles = {
    multiValue: (base, state) => {
      return state.data.isFixed ? { ...base, backgroundColor: "gray" } : base;
    },
    multiValueLabel: (base, state) => {
      return state.data.isFixed
        ? { ...base, fontWeight: "bold", color: "white", paddingRight: 6 }
        : base;
    },
    multiValueRemove: (base, state) => {
      return state.data.isFixed ? { ...base, display: "none" } : base;
    },
  };

  //let token = appState.user.token;

  let checkEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let checkPassword = new RegExp("^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,10}$");
  let checkNewUsername = new RegExp("^[a-zA-Z0-9]{2,15}$");

  function handleLogout() {
    appDispatch({ type: "logout" });
    navigate("/");
  }

  async function verifyUser() {
    //console.log("usertype :" + userType);
    setgroupNameToCheck("admin");
    try {
      // post to getgroups
      const response = await Axios.post("/verify", {
        token: appState.user.token,
        groupNameToCheck: "admin",
      });
      //console.log(response);
      if (response.data) {
        // console.log(response.data.data.checkgroupboolean);
        if (response.data.data.checkgroupboolean === true) {
          setUserType("admin");
          setUsernameCurrent(response.data.data.username);
          setLoading(false);
        } else {
          setUserType("user");
          setLoading(false);
          setUsernameCurrent(response.data.data.username);
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
      setUsernameCurrent("");
    }
  }, [appState.loggedIn]);

  useEffect(() => {
    getAllUsersData();
    getAllGroupsData();
  }, [userType !== "", refresh]);

  // Get data from user table
  async function getAllUsersData() {
    if (userType === "admin") {
      try {
        const response = await Axios.post("/getUsers", {
          token: appState.user.token,
          groupNameToCheck,
        });
        if (response.data.data) {
          const allUserData = response.data.data;
          setlistOfUsersData(allUserData);
          setLoading(false);
        } else {
          //if no response == error sending to db
          console.log("no data recevied");
        }
      } catch (e) {
        console.log("error getUsers" + e);
        navigate("/NotAuthorized");
      }
    }
  }

  // get all groups data
  async function getAllGroupsData() {
    if (userType === "admin") {
      try {
        const response = await Axios.post("/getAllGroups", {
          token: appState.user.token,
        });
        if (response.data) {
          const allGroupsData = response.data.data;
          setlistOfGroupsData(allGroupsData);
          setLoading(false);
        } else {
          //if no response == error sending to db
          console.log("error getting response from db");
        }
      } catch (e) {
        console.log("getAllGroupsData error: " + e);
        navigate("/NotAuthorized");
      }
    }
  }

  async function addNewGroupSend() {
    console.log("addNewGroupSend run");
    setRefresh("true");
    if (groupnameNew.length === 0) {
      appDispatch({ type: "errorMessage", value: "Group name cannot be empty. " });
    } else {
      let trimGroupName = groupnameNew.trim();
      setgroupnameNew(trimGroupName);
      //console.log("groupname trim: " + trimGroupName);
      try {
        const response = await Axios.post("/addGroup", {
          groupnameNew,
          token: appState.user.token,
        });
        if (response.data) {
          if (response.data.message === "group exist in db") {
            appDispatch({ type: "errorMessage", value: "Groupname exists in database." });
          } else if (response.data.message === "group added") {
            appDispatch({ type: "flashMessage", value: "New group created." });
            setAddGroupTrigger(true);
            onClear();
            setLoading(false);
            setRefresh("false");
          }
          //console.log("-----addNewGroup-----");
          //console.log(response.data);
        } else if (!response.data) {
          console.log("no response data for : addNewGroup");
        }
      } catch (e) {
        console.log("addNewGroup error: " + e);
      }
    }
  }

  // post data to add new user
  async function addNewUserSend() {
    setRefresh("true");
    if (!(usernameNewUser && passwordNewUser && activeStatusNewUser)) {
      appDispatch({
        type: "errorMessage",
        value:
          "Please ensure all required inputs have been entered. \nRequired: Username, Password",
      });
      //console.log("1");
    } else if (usernameNewUser || passwordNewUser || activeStatusNewUser) {
      if (usernameNewUser && !checkNewUsername.test(usernameNewUser)) {
        //check username regex here
        appDispatch({
          type: "errorMessage",
          value:
            "Please enter a valid username of minimum 5 characters and maximum 15 characters, consisting of alphabetic letters and numbers only.",
        });
        //console.log("1");
      } else if (passwordNewUser && !checkPassword.test(passwordNewUser)) {
        appDispatch({
          type: "errorMessage",
          value:
            "Please enter a password of minimum 8 characters and maximum 10 characters, comprising of alphabets, numbers, and special character",
        });
        //console.log("2");
      }
      // check for email regex only as email can be empty on cr8
      else if (emailNewUser.length !== 0 && !checkEmail.test(emailNewUser)) {
        //check regex
        appDispatch({ type: "errorMessage", value: "Please enter a valid email." });
        //console.log("3");
      } else {
        try {
          let selectedOptionsNewUser = [];
          if (selectedOptions !== null) {
            selectedOptionsNewUser = selectedOptions.map((option) => option.value);
            setGroupsNewUser(selectedOptionsNewUser);
          } else if (selectedOptions == null) {
            setGroupsNewUser("");
          }
          //console.log("selectedOptionsNewUser: " + selectedOptionsNewUser);
          const response = await Axios.post("/adduser", {
            usernameNewUser,
            passwordNewUser,
            emailNewUser,
            activeStatusNewUser,
            selectedOptionsNewUser,
            token: appState.user.token,
          });

          if (response.data) {
            if (response.data.message === "user exist in db") {
              appDispatch({ type: "errorMessage", value: "User exists in database." });
            } else {
              //if response == succssful sending to db
              //console.log("/adduser data: ");
              //console.log(response.data);
              appDispatch({ type: "flashMessage", value: "New user added. " });
              onClearUser();
              setRefresh("false");
              setLoading(false);
            }
          } else {
            //if no response == error sending to db
          }
        } catch (e) {
          console.log("error addNewUserSend: " + e);
        }
      }
    }
  }

  // get each value for row and check before posting with Axios in updateUserProfile()
  const handlePasswordChange = (e, username) => {
    const { name, value } = e.target;

    const editData = listOfUsersData.map((item) => {
      if (item.username === username) {
        return {
          ...item,
          password: e.target.value,
        };
      } else {
        return item;
      }
    });
    setlistOfUsersData(editData);
    //console.log(listOfUsersData);
  };

  // get each value for row and check before posting with Axios in updateUserProfile()
  const handleEmailChange = (e, username) => {
    const { name, value } = e.target;

    const editData = listOfUsersData.map((item) => {
      if (item.username === username) {
        return {
          ...item,
          uemail: e.target.value,
        };
      } else {
        return item;
      }
    });

    setlistOfUsersData(editData);
  };

  // get each value for row and check before posting with Axios in updateUserProfile()
  const handleStatusChange = (e, username) => {
    const newData = [...listOfUsersData];
    const index = newData.findIndex((userData) => userData.username === username);
    if (e.target.checked) {
      newData[index].activestatus = 1;
    } else {
      newData[index].activestatus = 0;
    }
    setlistOfUsersData(newData);
    updateUserProfile(username);
  };

  //edit (*update*) user's profile
  async function updateUserProfile(username) {
    if (userType === "admin") {
      setRefresh("true");
      const userToUpdate = listOfUsersData.filter((item) => item.username === username);
      //console.log("userToUpdate un: " + userToUpdate[0].username);
      //console.log("userToUpdate pw : " + userToUpdate[0].password);
      //console.log("userToUpdate email: " + userToUpdate[0].uemail);
      //console.log("userToUpdate stats: " + userToUpdate[0].activestatus);

      const updateUsername = userToUpdate[0].username;
      const updatePassword = userToUpdate[0].password;
      const updateEmail = userToUpdate[0].uemail;
      const updateStatus = userToUpdate[0].activestatus;

      if (updatePassword && updateEmail) {
        if (!checkEmail.test(updateEmail)) {
          appDispatch({ type: "errorMessage", value: "Please enter a valid email." });
          //console.log("1");
        }
        if (!checkPassword.test(updatePassword)) {
          appDispatch({
            type: "errorMessage",
            value:
              "Please enter a password of minimum 8 characters and maximum 10 characters, comprising of alphabets, numbers, and special character",
          });
        } else if (checkEmail.test(updateEmail) && checkPassword.test(updatePassword)) {
          //axios post to update the data.
          try {
            const response = await Axios.post("/manageUsers", {
              updateUsername,
              updatePassword,
              updateEmail,
              updateStatus,
              token: appState.user.token,
            });
            if (response.data) {
              //if response == succssful sending to db
              const empty = [];
              appDispatch({ type: "flashMessage", value: "User updated." });
              setlistOfUsersData(empty);
              setRefresh("false");
              setLoading(false);
            } else {
              //if no response == error sending to db
              console.log("error sending db");
            }
          } catch (e) {
            console.log("updateUserProfile error: " + e);
          }
        }
      } else if (updatePassword && !checkPassword.test(updatePassword)) {
        //console.log("2");
        appDispatch({
          type: "errorMessage",
          value:
            "Please enter a password of minimum 8 characters and maximum 10 characters, comprising of alphabets, numbers, and special character",
        });
      } else if (updateEmail && !checkEmail.test(updateEmail)) {
        //console.log("3");
        appDispatch({ type: "errorMessage", value: "Please enter a valid email." });
      } else {
        //console.log("4 = saveeee");
        //axios post to update the data.

        try {
          const response = await Axios.post("/manageUsers", {
            updateUsername,
            updatePassword,
            updateEmail,
            updateStatus,
            token: appState.user.token,
          });
          if (response.data) {
            //if response == succssful sending to db
            const empty = [];
            //console.log("/adduser data: ");
            //console.log(response.data);
            appDispatch({ type: "flashMessage", value: "User updated." });
            setlistOfUsersData(empty);
            setRefresh("false");
            setLoading(false);
          } else {
            //if no response == error sending to db
            console.log("error sending to db");
          }
        } catch (e) {
          console.log("updateUserProfile error: " + e);
        }
      }
    }
  }

  // Create an array of all the group names, with duplicates removed
  //... Unique value only (remove dups)
  const groupNames = [
    ...new Set(
      listOfGroupsData.flatMap((username) =>
        username.groupname.split(",").map((group) => group.trim())
      )
    ),
  ];

  // Create an array of options for each unique group name
  const groupOptions = groupNames.map((groupName) => ({
    value: groupName,
    label: groupName,
    isFixed: groupName === "admin",
  }));

  const [selectedOptions, setSelectedOptions] = useState(null);

  function handleSelectChangeNewUser(selectedOption) {
    setSelectedOptions(selectedOption);
  }

  /*
  //convert the groups that user belong to into selects
  function convertGroupString(groupString) {
    if (groupString) {
      const groupNames = groupString.split(",");
      const groupList = groupNames.map((groupName) => ({
        label: groupName,
        value: groupName,
      }));
      return groupList;
    }
  }*/

  function convertGroupString(groupString, ownAccount = false) {
    if (groupString) {
      const groupNames = groupString.split(",");
      const groupList = groupNames.map((groupName) => {
        if (groupName === "admin" && ownAccount === true) {
          return {
            label: groupName,
            value: groupName,
            isFixed: true,
          };
        } else {
          return {
            label: groupName,
            value: groupName,
            isFixed: false,
          };
        }
      });
      return groupList;
    }
  }

  function createHandleGroupnameChangeWithUsername(username) {
    return function handleGroupnameChange(selectedOptions) {
      const selectedValues = selectedOptions.map((option) => option.value);
      //console.log(`Selected group values for ${username}: `, selectedValues);
      // Call the original handleGroupnameChange function with selected options and username
      //console.log("u/n: " + username);
      console.log("sv: " + selectedValues);
      setGroupsToUpdateForUser(selectedValues);
      setUsernameToUpdateForGroup(username);
    };
  }

  useEffect(() => {
    updateChangesGroups();
  }, [groupsToUpdateForUser]);

  async function updateChangesGroups() {
    setRefresh("true");
    if (groupsToUpdateForUser) {
      try {
        const response = await Axios.post("/updateGroupsForSelectedUser", {
          usernameToUpdateForGroup,
          groupsToUpdateForUser,
          token: appState.user.token,
        });
        if (response.data) {
          setRefresh("false");
          setLoading("false");
        }
      } catch (e) {
        console.log("updateChangesGroups error: " + e);
      }
    }
  }

  // other functions to support main functions

  function addNewGroup() {
    if (addGroupTrigger === false) {
      setAddGroupTrigger(true);
      return;
    }
    setAddGroupTrigger(false);
  }

  function addNewUser() {
    if (addUserTrigger === false) {
      setAddUserTrigger(true);
      return;
    }
    setAddUserTrigger(false);
  }

  function checkEnterKey(event) {
    if (event.key === "Enter") {
      addNewUserSend();
    }
  }

  function checkAddGroupEnterReq(event) {
    if (event.key === "Enter") {
      addNewGroupSend();
    }
  }

  function checkUpdateProfileEnterReq(event, username) {
    if (event.key === "Enter") {
      updateUserProfile(username);
    }
  }

  const onClear = () => {
    setgroupnameNew("");
  };

  const onClearUser = () => {
    setUsernameNewUser("");
    setPasswordNewUser("");
    setEmailNewUser("");
    setSelectedOptions(null);
  };

  function togglePassword() {
    if (passwordType === "password") {
      setPasswordType("text");
      return;
    }
    setPasswordType("password");
  }

  const handleKeyDownSelectNewUser = (e) => {
    if (e.key === "Enter") {
      addNewUserSend();
    }
  };

  if (loading) {
    return <Spinner />;
  } else {
    if (userType === "admin") {
      return (
        <>
          <Container small={true}>
            <Page title="User Management">
              <h1 className="alignMiddle"> User Management </h1>

              <button type="button" className="addGroupBtn" onClick={addNewGroup}>
                Add New Group
              </button>

              {addGroupTrigger && (
                <div className="borderForm">
                  <label> New Group Name: &nbsp; </label>
                  <input
                    className="transparent-border"
                    type="text"
                    id="addNewGroupName"
                    name="addNewGroupName"
                    onChange={(e) => setgroupnameNew(e.target.value)}
                    onKeyUp={(e) => checkAddGroupEnterReq(e)}
                    value={groupnameNew}
                  />
                  <input
                    className="submitAddGroupBtn"
                    type="button"
                    value="Submit"
                    onClick={addNewGroupSend}
                  />
                </div>
              )}
              <div className="table-responsive-lg">
                <table className="table table-hover">
                  <thead className="thead-light">
                    <tr className="alignMiddle">
                      <th>Username</th>
                      <th>Password</th>
                      <th>Email</th>
                      <th>Group</th>
                      <th>Active Status</th>
                      <th className="alignMiddle">
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <button type="button" className="addNewUserBtn" onClick={addNewUser}>
                          {!addUserTrigger && (
                            <Icon icon="material-symbols:add-circle" height="40" />
                          )}
                          {addUserTrigger && <Icon icon="ic:baseline-remove-circle" height="40" />}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {addUserTrigger && (
                      <tr className="table-active">
                        <td className="alignMiddle">
                          <input
                            value={usernameNewUser}
                            className="transparent-border alignMiddle"
                            onKeyUp={(e) => checkEnterKey(e)}
                            onChange={(e) => setUsernameNewUser(e.target.value)}
                            placeholder="New Username"
                          />
                        </td>
                        <td className="alignMiddle">
                          <input
                            type={passwordType}
                            className="transparent-border alignMiddle"
                            value={passwordNewUser}
                            onKeyUp={(e) => checkEnterKey(e)}
                            onChange={(e) => setPasswordNewUser(e.target.value)}
                            placeholder="New Password"
                          />
                          {passwordNewUser && (
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
                            value={emailNewUser}
                            onKeyUp={(e) => checkEnterKey(e)}
                            onChange={(e) => setEmailNewUser(e.target.value)}
                            placeholder="New Email"
                          />
                        </td>
                        <td className="alignMiddle">
                          <Select
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            options={groupOptions}
                            isMulti
                            value={selectedOptions}
                            onChange={handleSelectChangeNewUser}
                            onKeyDown={handleKeyDownSelectNewUser}
                          />
                        </td>
                        <td className="alignMiddle">
                          <input
                            type="checkbox"
                            name="activestatus"
                            value={activeStatusNewUser}
                            defaultChecked={IsChecked}
                            onClick={(e) => e.preventDefault()}
                          />{" "}
                          Active{" "}
                        </td>
                      </tr>
                    )}
                    {listOfUsersData.map(
                      ({ username, password, uemail, activestatus, groupname }) => (
                        <tr key={username}>
                          <td className="alignMiddle">
                            <input
                              className="transparent-border alignMiddle"
                              value={username}
                              disabled
                            />
                          </td>
                          <td className="alignMiddle">
                            <input
                              className="transparent-border alignMiddle"
                              name="password"
                              onChange={(e) => handlePasswordChange(e, username)}
                              type={passwordType}
                              value={password}
                              onKeyUp={(e) => checkUpdateProfileEnterReq(e, username)}
                            />
                          </td>
                          <td className="alignMiddle">
                            <input
                              className="transparent-border alignMiddle"
                              name="uemail"
                              value={uemail}
                              onChange={(e) => handleEmailChange(e, username)}
                              onKeyUp={(e) => checkUpdateProfileEnterReq(e, username)}
                            />
                          </td>
                          <td className="alignMiddle">
                            <div className="select-wrapper">
                              <Select
                                styles={styles}
                                closeMenuOnSelect={false}
                                components={animatedComponents}
                                options={groupOptions}
                                value={convertGroupString(
                                  groupname,
                                  usernameCurrent === username || username === "admin"
                                )}
                                isMulti
                                onChange={createHandleGroupnameChangeWithUsername(username)}
                                isClearable={false}
                              />
                            </div>
                          </td>
                          {userType === "admin" && (
                            <td className="alignMiddle">
                              <input
                                type="checkbox"
                                name="activestatus"
                                value={activestatus}
                                checked={activestatus}
                                disabled={
                                  (isSelf && usernameCurrent === username) || username === "admin"
                                }
                                onChange={(e) => handleStatusChange(e, username)}
                              />{" "}
                              Active{" "}
                            </td>
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </Page>
          </Container>
        </>
      );
    } else if (userType !== "admin") {
      return (
        <>
          <NotAuthorized />
        </>
      );
    }
  }
}

export default UserManagement;
