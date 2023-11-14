import React, { useContext, useState, useEffect } from "react";
import StateContext from "../StateContext";
import Page from "./Page";
import Axios from "axios";
import HeaderLoggedOut from "./HeaderLoggedOut";
import Container from "./Container";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import DispatchContext from "../DispatchContext";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

function Home(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const navigate = useNavigate();

  //const [userType, setUserType] = useState("");
  //const [admin, setAdmin] = useState(false);
  const [isPM, setIsPM] = useState("");
  const [isPL, setIsPL] = useState("");
  const [isDT, setIsDT] = useState("");

  const [username, setUsername] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [refresh, setRefresh] = useState("false");

  //array to store fetched groups data
  const allGroupsData = [];
  const [listOfGroupsData, setlistOfGroupsData] = useState(allGroupsData);

  // for select
  const animatedComponents = makeAnimated();

  // for add new application form
  const [appAcronym, setAppAcronym] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [appRNumber, setAppRNumber] = useState("");
  const [appStartDate, setAppStartDate] = useState("");
  const [appEndDate, setAppEndDate] = useState("");

  // Selected options by user on create application
  const [selectedOptionsPermitCreate, setselectedOptionsPermitCreate] = useState(null);
  const [selectedOptionsPermitOpen, setselectedOptionsPermitOpen] = useState(null);
  const [selectedOptionsPermitToDo, setselectedOptionsPermitToDo] = useState(null);
  const [selectedOptionsPermitDoing, setselectedOptionsPermitDoing] = useState(null);
  const [selectedOptionsPermitDone, setselectedOptionsPermitDone] = useState(null);

  // for add new plan form
  const [planMVPname, setPlanMVPname] = useState("");
  const [planStartDate, setPlanStartDate] = useState("");
  const [planEndDate, setPlanEndDate] = useState("");
  const [planAppAcronym, setPlanAcronym] = useState("");
  const [planColor, setPlanColor] = useState("#000000");

  const now = new Date();

  // for add new task form
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskNotes, setTaskNotes] = useState(""); //this tasknotes is RO
  const [taskID, setTaskID] = useState("");
  const [taskAppAcronym, setTaskAppAcronym] = useState("");
  const [taskState, setTaskState] = useState("");
  const [taskCreator, setTaskCreator] = useState("");
  const [taskOwner, setTaskOwner] = useState("");
  const [taskCreateDate, setTaskCreateDate] = useState(now);

  // selected plan to store into the task (task_plan)
  const [selectedPlanForTask, setselectedPlanForTask] = useState(null);

  // for editable task notes
  const [editableTaskNotes, setEditableTaskNotes] = useState("");

  //handle plan to store into the task
  function handleSelectChangePlanForTask(selectedPlanForTask) {
    //const selectedValuesPermitOpen = selectedOptionsPermitOpen.map((option) => option.value);
    setselectedPlanForTask(selectedPlanForTask);
  }

  // array to store fetched tasks data
  const allTasksData = [];
  const [listOfTaskData, setlistOfTaskData] = useState(allTasksData);

  //to check for permission against user groups
  const [permitCreate, setPermitCreate] = useState("");
  const [permitOpen, setPermitOpen] = useState("");
  const [permitToDo, setPermitToDo] = useState("");
  const [permitDoing, setPermitDoing] = useState("");
  const [permitDone, setPermitDone] = useState("");

  //permission
  const [permissionCreate, setPermissionCreate] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [permissionToDo, setPermissionToDo] = useState(false);
  const [permissionDoing, setPermissioDoing] = useState(false);
  const [permissionDone, setPermissionDone] = useState(false);

  // for modal error message (form validation)
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // for showing and hiding of kanban
  const [showKanban, setshowKanban] = useState(false);
  const [acronymKanban, setacronymKanban] = useState("");

  // for showing and hiding of the applications
  const [showApplication, setshowApplication] = useState(true);

  // regex form validation for add new applcation
  let checkAppAcronym = new RegExp("^[a-zA-Z]+$");

  // for validation of new plan/task ascii only and leading white spaces
  const checkPlanTaskName = /^[^\s][\x00-\x7F]*$/;

  // check for int in front
  const checkRNumRegex = /^0+[1-9]\d*$/;

  // store applications fetched
  const allApps = [];
  const [listOfAllApps, setlistOfAllApps] = useState(allApps);

  // store plans fetched for each application
  const allPlansForSelectedApp = [];
  const [listOfAllPlansForSelectedApp, setlistOfAllPlansForSelectedApp] =
    useState(allPlansForSelectedApp);

  // error function to display error message and timeout duration
  const showError = (message, duration = 2000) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage("");
    }, duration);
  };

  // sccess function to display success message and timeout duration
  const showSuccess = (message, duration = 2000) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, duration);
  };

  function handleLogout() {
    appDispatch({ type: "logout" });
  }

  /*  
  useEffect(() => {
    if (appState.loggedIn) {
      verifyUserType();
      getAllApplications();
      handleShowAllApplication();
    } else {
      setUsername("");
      clearAllPermits();
    }
  }, [appState.loggedIn]); 
  */

  useEffect(() => {
    async function fetchData() {
      if (appState.loggedIn) {
        await authenticateUser();
        getRoles();
        getAllApplications();
        handleShowAllApplication();
      } else {
        setUsername("");
        clearAllPermits();
      }
    }
    fetchData();
  }, [appState.loggedIn]);

  useEffect(() => {}, [username !== ""]);

  useEffect(() => {
    if (listOfGroupsData) {
      getAllGroupsData();
    }
  }, [refresh]);

  useEffect(() => {});

  function clearAllPermits() {
    setPermitCreate("");
    setPermitOpen("");
    setPermitToDo("");
    setPermitDoing("");
    setPermitDone("");
  }

  async function authenticateUser() {
    try {
      const checkIfAdmin = await Axios.post("/verify", {
        token: appState.user.token,
        groupNameToCheck: "admin",
      });
      if (checkIfAdmin.data) {
        if (checkIfAdmin.data.data.checkgroupboolean === true) {
          setUsername(checkIfAdmin.data.data.username);
        } else {
          setUsername(checkIfAdmin.data.data.username);
        }
      }
    } catch (e) {
      console.log("authenticatedUser error: " + e);
      handleLogout();
    }
  }

  async function getRoles() {
    try {
      //pl, pm, dt
      let rolesToCheck = ["projectlead", "projectmanager", "devteam"];
      const response = await Axios.post("/getRoles", { token: appState.user.token, rolesToCheck });
      if (response.data && response.data.message === "ok") {
        setIsPL(response.data.data[0]);
        setIsPM(response.data.data[1]);
        setIsDT(response.data.data[2]);
      }
    } catch (e) {
      console.log("getRoles error: " + e);
    }
  }

  // console.log(isPL, isPM, isDT);
  // console.log("typeofPL: " + typeof isPL);

  async function backendCheckAutho(username, permitgrouptocheck) {
    try {
      const response = await Axios.post("/checkAuthorization", {
        username,
        permitgrouptocheck,
        token: appState.user.token,
      });
      if (response.data) {
        if (response.data.message === "true") {
          return true;
        } else {
          return false;
        }
      }
    } catch (e) {
      console.log("checkAuthorizationerror: " + e);
    }
  }

  async function checkIfAuthorisedCreate(username, permitgrouptocheck) {
    const isAuthorized = await backendCheckAutho(username, permitgrouptocheck);
    setPermissionCreate(isAuthorized);
    // console.log("u/n: " + username);
    // console.log("permit group to check: " + permitOpen);
    // console.log("isAuthoooo setPermissionCreate: " + isAuthorized);
  }

  // console.log("u/n!!!!!!!!!!!!!: " + username);

  async function checkIfAuthorisedOpen(username, permitgrouptocheck) {
    const isAuthorized = await backendCheckAutho(username, permitgrouptocheck);
    setPermissionOpen(isAuthorized);
  }

  async function checkIfAuthorisedToDo(username, permitgrouptocheck) {
    const isAuthorized = await backendCheckAutho(username, permitgrouptocheck);
    setPermissionToDo(isAuthorized);
  }

  async function checkIfAuthorisedDoing(username, permitgrouptocheck) {
    const isAuthorized = await backendCheckAutho(username, permitgrouptocheck);
    setPermissioDoing(isAuthorized);
  }

  async function checkIfAuthorisedDone(username, permitgrouptocheck) {
    const isAuthorized = await backendCheckAutho(username, permitgrouptocheck);
    setPermissionDone(isAuthorized);
  }

  const [modalModeApp, setModalModeApp] = useState("create"); // or "edit"

  // for create application modal
  function handleShowModal() {
    setModalModeApp("create");
    setShowModal(true);
    clearNewApplicationFields();
  }

  function handleHideModal() {
    setShowModal(false);
    clearNewApplicationFields();
  }

  // for edit application modal
  function handleShowModalEdit() {
    setModalModeApp("edit");
    setShowModal(true);
  }

  // for create plan modal
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);

  const [modalModePlan, setModalModePlan] = useState("create");

  function handleShowModalCreatePlan() {
    setModalModePlan("create");
    setShowCreatePlanModal(true);
  }

  function handleHideModalPlan() {
    setShowCreatePlanModal(false);
    clearNewPlanFields();
  }

  function handleShowModalEditPlan() {
    if (isPM) {
      setModalModePlan("edit");
    } else {
      setModalModePlan("view");
    }
    console.log("modalModePlan: " + modalModePlan);
    setShowCreatePlanModal(true);
  }

  // for create/edit task modal
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [modalModeTask, setModalModeTask] = useState("create");
  const [modalState, setModalState] = useState("");

  //const [taskStateToUpdate, settaskStateToUpdate] = useState("");

  function handleShowModalCreateTask() {
    setModalModeTask("create");
    setShowCreateTaskModal(true);
  }

  function handleHideModalTask() {
    setShowCreateTaskModal(false);
    clearNewTaskFields();
    setModalState("");
    setDisablePlan(false);
  }

  function handleShowModalEditTask(permission) {
    if (permission) {
      setModalModeTask("edit");
    } else {
      setModalModeTask("view");
    }
    setShowCreateTaskModal(true);
  }

  const [disablePlan, setDisablePlan] = useState(false);

  function disablePlanFn() {
    setDisablePlan(true);
  }

  async function handleShowModalOpenPromote(task_id) {
    console.log("modalTaskModeee: " + modalModeTask);
    console.log("ModalState: " + modalState);
    await editSelectedTask(task_id);
    setShowCreateTaskModal(true);
  }

  function handleShowAllApplication() {
    // set the hide and show trigger here.
    setshowKanban(false);
    // hide the applications with another trigger
    setshowApplication(true);
    //everytime it is clicked, reset the value for show plans to be true so plans will always be shown
    setShowPlansTrigger(true);
    //clear all task/plan
    setlistOfTaskData(allTasksData);
    setlistOfAllPlansForSelectedApp(allPlansForSelectedApp);
  }

  // select application on click
  async function openSelectedApplication(app_acronym) {
    // set the hide and show trigger here.
    setshowKanban(true);
    setacronymKanban(app_acronym);

    //fetch the data from selected application
    editSelectedApplication(app_acronym);

    getlistOfAllPlans(app_acronym);
    getListOfAllTasks(app_acronym);

    // hide the applications with another trigger
    setshowApplication(false);
  }

  useEffect(() => {
    checkIfAuthorisedCreate(username, permitCreate);
    checkIfAuthorisedOpen(username, permitOpen);
    checkIfAuthorisedToDo(username, permitToDo);
    checkIfAuthorisedDoing(username, permitDoing);
    checkIfAuthorisedDone(username, permitDone);
  }, [permitCreate, permitOpen, permitToDo, permitDoing, permitDone]);

  // trigger for show and hide plans
  const [showPlansTrigger, setShowPlansTrigger] = useState(true);

  // to change trigger hide and show upon clicking btuton
  function handlePlanShowOrHide() {
    if (showPlansTrigger === true) {
      setShowPlansTrigger(false);
    } else if (showPlansTrigger === false) {
      setShowPlansTrigger(true);
    }
  }

  // edit application on click
  async function editSelectedApplication(app_acronym) {
    // fetch the fields and set the editable fields with the data fetched
    try {
      const response = await Axios.post("/getEditApplication", {
        token: appState.user.token,
        app_acronym,
      });
      if (response.data) {
        setAppAcronym(response.data.data[0].app_acronym);
        setAppDescription(response.data.data[0].app_description);
        setAppRNumber(response.data.data[0].app_rnumber);
        setAppStartDate(response.data.data[0].app_startdate);
        setAppEndDate(response.data.data[0].app_enddate);
        setselectedOptionsPermitCreate(convertToValue(response.data.data[0].app_permit_create));
        setselectedOptionsPermitOpen(convertToValue(response.data.data[0].app_permit_open));
        setselectedOptionsPermitToDo(convertToValue(response.data.data[0].app_permit_todo));
        setselectedOptionsPermitDoing(convertToValue(response.data.data[0].app_permit_doing));
        setselectedOptionsPermitDone(convertToValue(response.data.data[0].app_permit_done));

        if (response.data.data[0].app_permit_create !== undefined) {
          setPermitCreate(response.data.data[0].app_permit_create);
        } else {
          setPermitCreate("");
        }

        if (response.data.data[0].app_permit_open !== undefined) {
          setPermitOpen(response.data.data[0].app_permit_open);
        } else {
          setPermitOpen("");
        }
        if (response.data.data[0].app_permit_todo !== undefined) {
          setPermitToDo(response.data.data[0].app_permit_todo);
        } else {
          setPermitToDo("");
        }
        if (response.data.data[0].app_permit_doing !== undefined) {
          setPermitDoing(response.data.data[0].app_permit_doing);
        } else {
          setPermitDoing("");
        }
        if (response.data.data[0].app_permit_done !== undefined) {
          setPermitDone(response.data.data[0].app_permit_done);
        } else {
          setPermitDone("");
        }
      }
    } catch (e) {
      console.log("editSelectedApplication error: " + e);
    }
  }

  //console.log("permitCreate: " + permitCreate);
  //console.log("permitOpen: " + permitOpen);
  //console.log("permiToDo: " + permitToDo);
  /*console.log();
  console.log();
  console.log();
  console.log();
  */

  // for submission of editing form
  async function handleEditApplicationSubmit(e) {
    e.preventDefault();

    let startDate = "";
    let endDate = "";

    if (appStartDate && appEndDate) {
      startDate = new Date(appStartDate);
      endDate = new Date(appEndDate);
    }
    if (appStartDate && appEndDate && startDate.getTime() > endDate.getTime()) {
      showError("End date cannot be earlier than start date. ");
    } else {
      try {
        // update the selected application
        const response = await Axios.post("/updateApplication", {
          appAcronym,
          appDescription,
          appRNumber,
          appStartDate,
          appEndDate,
          selectedOptionsPermitCreate,
          selectedOptionsPermitOpen,
          selectedOptionsPermitToDo,
          selectedOptionsPermitDoing,
          selectedOptionsPermitDone,
          token: appState.user.token,
        });
        if (response.data) {
          if (response.data.message === "updated") {
            handleHideModal();
            appDispatch({ type: "flashMessage", value: "Application successfully updated. " });
          } else if (response.data.message === "failed to update") {
            showError("An error occured trying to update. Application not updated. ");
          }
        }
      } catch (e) {
        console.log("handleEditApplicationSubmit error: " + e);
      }
    }
  }

  // clear all previous fields for create new application
  function clearNewApplicationFields() {
    setAppAcronym("");
    setAppDescription("");
    setAppRNumber("");
    setAppStartDate("");
    setAppEndDate("");
    setselectedOptionsPermitCreate(null);
    setselectedOptionsPermitOpen(null);
    setselectedOptionsPermitToDo(null);
    setselectedOptionsPermitDoing(null);
    setselectedOptionsPermitDone(null);
  }

  // clear all previous fields for create new plan
  function clearNewPlanFields() {
    setPlanMVPname("");
    setPlanStartDate("");
    setPlanEndDate("");
    setPlanColor("#000000");
  }

  // clear all previous fields for create new task
  function clearNewTaskFields() {
    setTaskName("");
    setTaskDescription("");
    setselectedPlanForTask(null);
    setTaskNotes("");
    setTaskID("");
    setTaskAppAcronym("");
    setTaskState("");
    setTaskCreator("");
    setTaskOwner("");
    setTaskCreateDate(now);
    setEditableTaskNotes("");
  }

  async function handleAddNewApplicationSubmit(e) {
    e.preventDefault();
    //frontend validation check for mandatory fields

    let startDate = "";
    let endDate = "";

    if (appStartDate && appEndDate) {
      startDate = new Date(appStartDate);
      endDate = new Date(appEndDate);
    }

    if (!appAcronym || !appRNumber) {
      showError("Please ensure mandatory fields are entered. ");
    } else {
      if (appAcronym && !checkAppAcronym.test(appAcronym)) {
        showError("App acronym should contain letters only. ");
      } else if (appStartDate && appEndDate && startDate.getTime() > endDate.getTime()) {
        showError("End date cannot be earlier than start date. ");
      } else if (appRNumber && checkRNumRegex.test(appRNumber)) {
        showError("Invalid App R number. ");
      } else {
        try {
          const response = await Axios.post("/addNewApplication", {
            appAcronym,
            appDescription,
            appRNumber,
            appStartDate,
            appEndDate,
            selectedOptionsPermitCreate,
            selectedOptionsPermitOpen,
            selectedOptionsPermitToDo,
            selectedOptionsPermitDoing,
            selectedOptionsPermitDone,
            token: appState.user.token,
          });
          if (response.data) {
            setRefresh("false");
            console.log(response.data.message);
            if (response.data.message === "appacronym exist") {
              showError("App Acronym exists. Please input new acronym. ");
            } else if (response.data.message === "new application created") {
              appDispatch({ type: "flashMessage", value: "New Application Created. " });
              //showSuccess("New Application Created.");
              clearNewApplicationFields();
              getAllApplications();
              handleHideModal();
            } else if (response.data.message === "failed to add") {
              showError("An error occurred. Application not created. ");
            }
          }
        } catch (e) {
          console.log("error handleAddNewApplicationSubmit: " + e);
        }
      }
    }
  }

  // add new plan to application
  async function handleAddNewPlanSubmit(e) {
    e.preventDefault();

    let startDate = "";
    let endDate = "";

    if (planStartDate && planEndDate) {
      startDate = new Date(planStartDate);
      endDate = new Date(planEndDate);
    }

    // frontend validation
    if (!planMVPname) {
      showError("Please ensure mandatory fields are entered. Plan name is mandatory. ");
    } else if (planStartDate && planEndDate && startDate.getTime() > endDate.getTime()) {
      showError("End date cannot be earlier than start date. ");
    } else if (!planStartDate || !planEndDate) {
      showError("Please ensure mandatory fields are entered. Plan dates are mandatory. ");
    } else if (!checkPlanTaskName.test(planMVPname)) {
      showError("Invalid plan name. ");
    } else {
      // post to backend after validations
      try {
        const response = await Axios.post("/addNewPlan", {
          planMVPname,
          planStartDate,
          planEndDate,
          acronymKanban,
          planColor,
          token: appState.user.token,
        });
        if (response.data) {
          if (response.data.message === "added new plan") {
            //showSuccess("New Plan Created.");
            appDispatch({ type: "flashMessage", value: "New Plan Created. " });
            clearNewPlanFields();
            getlistOfAllPlans(acronymKanban);
            handleHideModalPlan();
          } else if (response.data.message === "mvpname exists") {
            showError("There is existing plan in this application with the same plan MVP name. ");
          } else if (response.data.message === "add plan failed") {
            showError("An error occurred. Plan not created. ");
          }
        }
      } catch (e) {
        console.log("handleAddNewPlanSubmit error: " + e);
      }
    }
  }

  // fetch all application
  async function getAllApplications() {
    console.log("getAllApplications ran.");
    console.log(isPL, isPM, isDT);
    try {
      const response = await Axios.post("/getAllApplication", { token: appState.user.token });
      if (response.data) {
        if (response.data.message === "all apps fetched") {
          setlistOfAllApps(response.data.data);
        } else {
          setlistOfAllApps(allApps);
        }
      }
    } catch (e) {
      console.log("getAllApplications error: " + e);
    }
  }

  // get all groups data
  async function getAllGroupsData() {
    try {
      const response = await Axios.post("/getAllGroups", {
        token: appState.user.token,
      });
      if (response.data) {
        if (response.data.message === "getAllGroups") {
          setlistOfGroupsData(response.data.data);
        } else {
          //if no response == error sending to db
          setlistOfGroupsData(allGroupsData);
          console.log("error getting response from db");
        }
      }
    } catch (e) {
      console.log("getAllGroupsData error: " + e);
    }
  }

  // fetch all plans in selected application
  async function getlistOfAllPlans(app_acronym) {
    try {
      const response = await Axios.post("/getAllPlans", {
        acronymKanban: app_acronym,
        token: appState.user.token,
      });
      if (response.data) {
        if (response.data.message === "data retrieved") {
          setlistOfAllPlansForSelectedApp(response.data.data);
        } else if (response.data.message === "no plans") {
          setlistOfAllPlansForSelectedApp(allPlansForSelectedApp);
        }
      }
    } catch (e) {
      console.log("getlistOfAllPlans error: " + e);
    }
  }

  // fetch selected plans data to edit
  async function editSelectedPlan(plan_MVP_name) {
    //set trigger to true so to show the modal
    handleShowModalEditPlan();

    // fetch selected plans by getting fields
    try {
      const response = await Axios.post("/getEditPlan", {
        plan_MVP_name,
        acronymKanban,
        token: appState.user.token,
      });
      if (response.data) {
        if (response.data.message === "getEditPlan fetched") {
          setPlanMVPname(response.data.data[0].plan_MVP_name);
          setPlanStartDate(response.data.data[0].plan_startdate);
          setPlanEndDate(response.data.data[0].plan_enddate);
          setPlanAcronym(response.data.data[0].plan_app_acronym);
          setPlanColor(response.data.data[0].plan_color);
        }
      }
    } catch (e) {
      console.log("editSelectedPlan error: " + e);
    }
  }

  // for submission of editing form
  async function handleEditPlanSubmit(e) {
    e.preventDefault();

    let startDate = "";
    let endDate = "";

    if (planStartDate && planEndDate) {
      startDate = new Date(planStartDate);
      endDate = new Date(planEndDate);
    }

    if (planStartDate && planEndDate && startDate.getTime() > endDate.getTime()) {
      showError("Please ensure mandatory fields are entered. Plan name is mandatory.");
    } else if (!planStartDate || !planEndDate) {
      showError("Please ensure mandatory fields are entered. Plan dates are mandatory. ");
    } else {
      try {
        // axios post
        const response = await Axios.post("/updateSelectedPlan", {
          planMVPname,
          planStartDate,
          planEndDate,
          acronymKanban,
          planColor,
          token: appState.user.token,
        });
        if (response.data) {
          if (response.data.message === "failed to update") {
            showError("An error occured trying to update. Plan not updated. ");
          }
          if (response.data.message === "updated") {
            handleHideModalPlan();
            appDispatch({ type: "flashMessage", value: "Plan successfully updated. " });
            getlistOfAllPlans(acronymKanban);
            getListOfAllTasks(acronymKanban);
          }
        }
      } catch (e) {
        console.log("handleEditPlanSubmit error: " + e);
      }
    }
  }

  async function handleAddNewTask(e) {
    // handle task axios post here
    e.preventDefault();
    // check front end validations before adding into db
    if (!taskName) {
      showError("Please ensure mandatory fields are entered. ");
    } else if (!checkPlanTaskName.test(taskName)) {
      showError("Invalid task name. ");
    } else {
      // post to backend
      const response = await Axios.post("/createNewTask", {
        taskName,
        taskDescription,
        taskNotes,
        taskID,
        selectedPlanForTask,
        taskAppAcronym,
        taskState,
        taskCreator,
        taskOwner,
        acronymKanban,
        username,
        taskCreateDate: now,
        token: appState.user.token,
      });
      if (response.data) {
        if (response.data.message === "added") {
          //showSuccess("New Task Created. ");
          appDispatch({ type: "flashMessage", value: "Application successfully added. " });
          clearNewTaskFields();
          getListOfAllTasks(acronymKanban);
          handleHideModalTask();
        } else {
          showError("An error occured. Please try again. ");
        }
      }
    }
  }

  // fetch all task for the application.
  async function getListOfAllTasks(app_acronym) {
    try {
      const response = await Axios.post("/getAllTasks", {
        acronymKanban: app_acronym,
        token: appState.user.token,
      });
      if (response.data) {
        if (response.data.message === "data retrieved") {
          setlistOfTaskData(response.data.data);
        } else if (response.data.message === "no tasks") {
          setlistOfTaskData(allTasksData);
        }
      }
    } catch (e) {
      console.log("getListOfAllTasks error: " + e);
    }
  }

  // fetching selected task to fill edit modal
  async function editSelectedTask(task_id) {
    try {
      const response = await Axios.post("/getEditTask", { task_id, token: appState.user.token });
      if (response.data) {
        if (response.data.message === "getEditTask fetched") {
          setTaskName(response.data.data[0].task_name);
          setTaskDescription(response.data.data[0].task_description);
          setTaskNotes(response.data.data[0].task_notes);
          setTaskID(response.data.data[0].task_id);
          setTaskAppAcronym(response.data.data[0].task_app_acronym);
          setTaskState(response.data.data[0].task_state);
          setTaskCreator(response.data.data[0].task_creator);
          setTaskOwner(response.data.data[0].task_owner);
          setTaskCreateDate(response.data.data[0].task_createDate);
          setselectedPlanForTask(convertToValue(response.data.data[0].task_plan));
        }
      }
    } catch (e) {
      console.log("editSelectedTask error: " + e);
    }
  }

  // for submission of editing form for TASK
  async function handleEditTaskSubmit(e) {
    e.preventDefault();
    // check the state and process data based on the field behavior
    try {
      const response = await Axios.post("/updateSelectedTask", {
        editableTaskNotes,
        taskID,
        username,
        selectedPlanForTask,
        taskState,
        editDate: now,
        token: appState.user.token,
      });
      if (response.data) {
        if (response.data.message === "updated task") {
          handleHideModalTask();
          appDispatch({ type: "flashMessage", value: "Task successfully updated. " });
          //editSelectedTask(taskID);
          getListOfAllTasks(acronymKanban);
          setEditableTaskNotes("");
        }
        if (response.data.message === "failed to update") {
          showError("An error occured trying to update. Task not updated. ");
        }
      }
    } catch (e) {
      console.log("handleEditTaskSubmit error: " + e);
    }
  }

  // for promoting task
  async function handlePromoteTask(e) {
    e.preventDefault();
    console.log("handlePromoteTask taskstate: " + taskState);

    let sendEmail = false;
    if (taskState === "doing") {
      sendEmail = true;
      console.log("?");
    }

    if (!selectedPlanForTask) {
      showError("Please select a plan before promoting. ");
    } // check taskplan validation if state is at doing because from doing to done, it can be
    else {
      try {
        const response = await Axios.post("/promoteTask", {
          editableTaskNotes,
          taskID,
          username,
          selectedPlanForTask,
          taskState,
          promoteDate: now,
          token: appState.user.token,
        });
        if (response.data) {
          if (response.data.message === "promoted") {
            //showSuccess("Task promoted. ");
            //editSelectedTask(taskID);
            getListOfAllTasks(acronymKanban);
            setEditableTaskNotes("");
            handleHideModalTask();
            appDispatch({ type: "flashMessage", value: "Task promoted. " });

            if (sendEmail) {
              console.log("sus....");
              sendEmailToPL();
            }
          }
          if (response.data.message === "failed to promote") {
            showError("An error occured. Task not promoted. ");
          }
        }
      } catch (e) {
        console.log("handlePromoteTask error: " + e);
      }
    }
  }

  async function sendEmailToPL() {
    console.log("2. more sus. ");
    try {
      //post to axios for sending of email.
      const response = await Axios.post("/sendEmail", { token: appState.user.token });
      if (response.data) {
        if (response.data.message === "email sent") {
          console.log("email sent");
        }
      }
    } catch (e) {
      console.log("handlePromoteTask error send Email: " + e);
    }
  }

  // demote
  async function handleDemoteTask(e) {
    e.preventDefault();
    console.log("handleDemoteTask:))) : " + taskState);
    try {
      const response = await Axios.post("/demoteTask", {
        editableTaskNotes,
        taskID,
        username,
        selectedPlanForTask,
        taskState,
        demoteDate: now,
        token: appState.user.token,
      });
      if (response.data) {
        if (response.data.message === "demoted") {
          getListOfAllTasks(acronymKanban);
          setEditableTaskNotes("");
          handleHideModalTask();
          appDispatch({ type: "flashMessage", value: "Task demoted. " });
        } else if (response.data.message === "failed to demote") {
          showError("An error occured. Task not demoted. ");
        }
      }
    } catch (e) {
      console.log("handleDemoteTask erorr: " + e);
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
  }));

  // function to convert the value into an select component
  function convertToValue(selectName) {
    if (selectName) {
      return { label: selectName, value: selectName };
    }
  }

  // Create an array of options for each unique group name
  const planOptions = listOfAllPlansForSelectedApp.map((item) => ({
    value: item.plan_MVP_name,
    label: item.plan_MVP_name,
  }));

  //handle create permit groups
  function handleSelectChangePermitCreate(selectedOptionsPermitCreate) {
    setselectedOptionsPermitCreate(selectedOptionsPermitCreate);
  }

  //handle open permit groups
  function handleSelectChangePermitOpen(selectedOptionsPermitOpen) {
    setselectedOptionsPermitOpen(selectedOptionsPermitOpen);
  }
  //handle to do permit groups
  function handleSelectChangePermitToDo(selectedOptionsPermitToDo) {
    setselectedOptionsPermitToDo(selectedOptionsPermitToDo);
  }

  //handle doing permit groups
  function handleSelectChangePermitDoing(selectedOptionsPermitDoing) {
    setselectedOptionsPermitDoing(selectedOptionsPermitDoing);
  }

  //handle done permit groups
  function handleSelectChangePermitDone(selectedOptionsPermitDone) {
    setselectedOptionsPermitDone(selectedOptionsPermitDone);
  }

  return (
    <>
      <Container>
        <Page title="KANBAN">
          <div>
            {appState.loggedIn ? "" : <HeaderLoggedOut setLoggedIn={props.setLoggedIn} />}
            {/* check userType if PL then show create application button / update */}
            {appState.loggedIn === true && (
              <div>
                <div>
                  {showApplication === true && (
                    <div>
                      <div>
                        {isPL && (
                          <Button className="kanbanButton" onClick={handleShowModal}>
                            <Icon icon="mdi:create-new-folder" width="30" />
                          </Button>
                        )}
                        <b className="vertical-align">&nbsp; APPLICATIONS</b>
                      </div>
                    </div>
                  )}

                  <Modal
                    dialogClassName="custom-modal"
                    className="modalWidth"
                    show={showModal}
                    onHide={handleHideModal}
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>
                        {modalModeApp === "create" ? "Create New Application" : "Edit Application"}
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      {errorMessage && (
                        <div className="alert alert-danger alignMiddle" role="alert">
                          {errorMessage}
                        </div>
                      )}{" "}
                      {successMessage && (
                        <div className="alert alert-success alignMiddle" role="alert">
                          {successMessage}
                        </div>
                      )}
                      <Form
                        onSubmit={
                          modalModeApp === "create"
                            ? handleAddNewApplicationSubmit
                            : handleEditApplicationSubmit
                        }
                      >
                        <Form.Group className="row mb-1">
                          <Form.Label className="col-2 col-form-label alignRight">
                            App Acronym:{" "}
                          </Form.Label>
                          <div className="col-sm-10">
                            <Form.Control
                              type="text"
                              value={appAcronym}
                              onChange={(e) => setAppAcronym(e.target.value)}
                              disabled={modalModeApp === "edit"}
                            />
                          </div>
                        </Form.Group>

                        <Form.Group className="row mb-1">
                          <Form.Label className="col-2 col-form-label alignRight">
                            {" "}
                            App Description:{" "}
                          </Form.Label>
                          <div className="col-sm-10">
                            <Form.Control
                              as="textarea"
                              className="modalTextAreaCSS"
                              value={appDescription}
                              onChange={(e) => setAppDescription(e.target.value)}
                            />
                          </div>
                        </Form.Group>

                        <Form.Group className="row mb-1">
                          <Form.Label className="col-2 col-form-label alignRight">
                            {" "}
                            App R Number:{" "}
                          </Form.Label>
                          <div className="col-sm-10">
                            <Form.Control
                              type="number"
                              value={appRNumber}
                              min={1}
                              max={214748364}
                              onChange={(e) => setAppRNumber(e.target.value)}
                              disabled={modalModeApp === "edit"}
                            />
                          </div>
                        </Form.Group>

                        <Form.Group className="row mb-1">
                          <Form.Label className="col-2 col-form-label alignRight">
                            {" "}
                            App Start Date:{" "}
                          </Form.Label>
                          <div className="col-sm-4">
                            <Form.Control
                              type="date"
                              value={appStartDate}
                              onChange={(e) => setAppStartDate(e.target.value)}
                            />
                          </div>
                          <Form.Label className="col-2 col-form-label alignRight">
                            {" "}
                            App End Date:{" "}
                          </Form.Label>
                          <div className="col-sm-4">
                            <Form.Control
                              type="date"
                              value={appEndDate}
                              onChange={(e) => setAppEndDate(e.target.value)}
                            />
                          </div>
                        </Form.Group>

                        <Form.Group className="row mb-1">
                          <Form.Label className="col-1 col-form-label alignMiddle"> </Form.Label>
                          <Form.Label className="col-2 col-form-label alignMiddle">
                            {" "}
                            Create Permit:{" "}
                          </Form.Label>
                          <Form.Label className="col-2 col-form-label alignMiddle">
                            {" "}
                            Open Permit:{" "}
                          </Form.Label>
                          <Form.Label className="col-2 col-form-label alignMiddle">
                            {" "}
                            To-do Permit:{" "}
                          </Form.Label>
                          <Form.Label className="col-2 col-form-label alignMiddle">
                            {" "}
                            Doing Permit:{" "}
                          </Form.Label>
                          <Form.Label className="col-2 col-form-label alignMiddle">
                            {" "}
                            Done Permit:{" "}
                          </Form.Label>
                        </Form.Group>

                        <Form.Group className="row mb-1">
                          {" "}
                          <Form.Label className="col-1 col-form-label alignMiddle"> </Form.Label>
                          <div className="col-sm-2">
                            <div className="select-wrapper alignMiddle">
                              <Select
                                closeMenuOnSelect={true}
                                components={animatedComponents}
                                options={groupOptions}
                                isMulti={false}
                                value={selectedOptionsPermitCreate}
                                onChange={handleSelectChangePermitCreate}
                                isClearable={true}
                              />
                            </div>
                          </div>
                          <div className="col-sm-2">
                            <div className="select-wrapper alignMiddle">
                              <Select
                                closeMenuOnSelect={true}
                                components={animatedComponents}
                                options={groupOptions}
                                isMulti={false}
                                value={selectedOptionsPermitOpen}
                                onChange={handleSelectChangePermitOpen}
                                isClearable={true}
                              />
                            </div>
                          </div>
                          <div className="col-sm-2">
                            <div className="select-wrapper alignMiddle">
                              <Select
                                closeMenuOnSelect={true}
                                components={animatedComponents}
                                options={groupOptions}
                                isMulti={false}
                                value={selectedOptionsPermitToDo}
                                onChange={handleSelectChangePermitToDo}
                                isClearable={true}
                              />
                            </div>
                          </div>
                          <div className="col-sm-2">
                            <div className="select-wrapper alignMiddle">
                              <Select
                                closeMenuOnSelect={true}
                                components={animatedComponents}
                                options={groupOptions}
                                isMulti={false}
                                value={selectedOptionsPermitDoing}
                                onChange={handleSelectChangePermitDoing}
                                isClearable={true}
                              />
                            </div>
                          </div>
                          <div className="col-sm-2">
                            <div className="select-wrapper alignMiddle">
                              <Select
                                closeMenuOnSelect={true}
                                components={animatedComponents}
                                options={groupOptions}
                                isMulti={false}
                                value={selectedOptionsPermitDone}
                                onChange={handleSelectChangePermitDone}
                                isClearable={true}
                              />
                            </div>
                          </div>
                        </Form.Group>

                        <br />
                        <Modal.Footer className="d-flex justify-content-center">
                          <Button className="modalButtons" onClick={handleHideModal} value="Cancel">
                            {" "}
                            Cancel{" "}
                          </Button>
                          <Button className="modalButtons" type="submit" value="Confirm">
                            {" "}
                            Confirm{" "}
                          </Button>
                        </Modal.Footer>
                      </Form>
                    </Modal.Body>
                  </Modal>
                </div>

                {appState.loggedIn === true &&
                  listOfAllApps &&
                  listOfAllApps.map(
                    ({ app_acronym }) =>
                      showApplication === true && (
                        <div key={app_acronym} className="application-box">
                          <button
                            className="appEditBtn"
                            onClick={async () => {
                              await openSelectedApplication(app_acronym);
                            }}
                          >
                            {app_acronym}
                          </button>
                          {isPL && (
                            <button
                              className="appEditBtn"
                              onClick={async () => {
                                handleShowModalEdit();
                                editSelectedApplication(app_acronym);
                              }}
                            >
                              <Icon icon="typcn:edit" />
                            </button>
                          )}
                        </div>
                      )
                  )}
              </div>
            )}

            {appState.loggedIn === true &&
              listOfAllApps &&
              listOfAllApps.map(
                ({ app_acronym }) =>
                  acronymKanban === app_acronym &&
                  showKanban === true &&
                  showApplication === false && (
                    <>
                      <p className="borderApp alignMiddle"> {app_acronym.toUpperCase()} </p>
                      <div key={app_acronym}>
                        <div className="topAligning">
                          <Button className="kanbanButton" onClick={handleShowAllApplication}>
                            <Icon icon="ic:round-home" width="35" height="30" />
                            <b className="vertical-align"> HOME</b>
                          </Button>
                          {isPM && (
                            <Button className="kanbanButton" onClick={handleShowModalCreatePlan}>
                              <Icon
                                icon="material-symbols:new-label-outline"
                                width="35"
                                height="30"
                              />
                              <b className="vertical-align">CREATE PLAN</b>
                            </Button>
                          )}
                          {listOfAllPlansForSelectedApp.length !== 0 && (
                            <Button className="kanbanButton" onClick={handlePlanShowOrHide}>
                              <Icon icon="icon-park-outline:plan" width="25" height="30" />
                              <b className="vertical-align"> SHOW/HIDE PLANS</b>
                            </Button>
                          )}

                          {/* check condition app_permit_create */}
                          {permissionCreate && (
                            <Button className="kanbanButton" onClick={handleShowModalCreateTask}>
                              <Icon
                                icon="fluent:task-list-square-add-24-regular"
                                width="35"
                                height="30"
                              />
                              <b className="vertical-align"> CREATE TASK</b>
                            </Button>
                          )}
                          <Modal
                            dialogClassName="custom-modal"
                            className="modalWidth"
                            show={showCreatePlanModal}
                            onHide={handleHideModalPlan}
                          >
                            <Modal.Header closeButton>
                              <Modal.Title>
                                {modalModePlan === "create"
                                  ? "Create New Plan"
                                  : modalModePlan === "edit"
                                  ? "Edit Plan"
                                  : modalModePlan === "view"
                                  ? "View Plan"
                                  : ""}
                              </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              {errorMessage && (
                                <div className="alert alert-danger alignMiddle" role="alert">
                                  {errorMessage}
                                </div>
                              )}{" "}
                              {successMessage && (
                                <div className="alert alert-success alignMiddle" role="alert">
                                  {successMessage}
                                </div>
                              )}
                              <Form
                                onSubmit={
                                  modalModePlan === "create"
                                    ? handleAddNewPlanSubmit
                                    : handleEditPlanSubmit
                                }
                              >
                                <Form.Group className="row mb-1">
                                  <Form.Label className="col-2 col-form-label alignRight">
                                    Plan MVP Name:{" "}
                                  </Form.Label>
                                  <div className="col-sm-10">
                                    <Form.Control
                                      type="text"
                                      value={planMVPname}
                                      onChange={(e) => setPlanMVPname(e.target.value)}
                                      disabled={
                                        modalModePlan === "edit" || modalModePlan === "view"
                                      }
                                    />
                                  </div>
                                </Form.Group>

                                <Form.Group className="row mb-1">
                                  <Form.Label className="col-2 col-form-label alignRight">
                                    {" "}
                                    Plan Start Date:{" "}
                                  </Form.Label>
                                  <div className="col-sm-4">
                                    <Form.Control
                                      type="date"
                                      value={planStartDate}
                                      onChange={(e) => setPlanStartDate(e.target.value)}
                                      disabled={modalModePlan === "view"}
                                    />
                                  </div>
                                  <Form.Label className="col-2 col-form-label alignRight">
                                    {" "}
                                    Plan End Date:{" "}
                                  </Form.Label>
                                  <div className="col-sm-4">
                                    <Form.Control
                                      type="date"
                                      value={planEndDate}
                                      onChange={(e) => setPlanEndDate(e.target.value)}
                                      disabled={modalModePlan === "view"}
                                    />
                                  </div>
                                </Form.Group>

                                <Form.Group className="row mb-1">
                                  <Form.Label className="col-2 col-form-label alignRight">
                                    Plan App Acronym:{" "}
                                  </Form.Label>
                                  <div className="col-sm-10">
                                    <Form.Control type="text" value={acronymKanban} disabled />
                                  </div>
                                </Form.Group>

                                <Form.Group className="row mb-1">
                                  <Form.Label className="col-2 col-form-label alignRight">
                                    Plan App Color:{" "}
                                  </Form.Label>
                                  <div className="col-sm-10">
                                    <Form.Control
                                      type="color"
                                      value={planColor}
                                      onChange={(e) => setPlanColor(e.target.value)}
                                      disabled={modalModePlan === "view"}
                                    />
                                  </div>
                                </Form.Group>

                                <br />
                                <Modal.Footer className="d-flex justify-content-center">
                                  {modalModePlan !== "view" && (
                                    <>
                                      <Button
                                        className="modalButtons"
                                        onClick={handleHideModalPlan}
                                        value="Cancel"
                                      >
                                        {" "}
                                        Cancel{" "}
                                      </Button>
                                      <Button
                                        className="modalButtons"
                                        type="submit"
                                        value="Confirm"
                                      >
                                        {" "}
                                        Confirm{" "}
                                      </Button>{" "}
                                    </>
                                  )}
                                </Modal.Footer>
                              </Form>{" "}
                            </Modal.Body>
                          </Modal>
                        </div>
                        {appState.loggedIn === true &&
                          listOfAllPlansForSelectedApp &&
                          showPlansTrigger &&
                          (listOfAllPlansForSelectedApp.length > 0
                            ? listOfAllPlansForSelectedApp.map(({ plan_MVP_name, plan_color }) => (
                                <div
                                  style={{
                                    outline: `5px solid ${plan_color}`,
                                    borderRadius: "2px",
                                    padding: "2px",
                                    marginTop: "10px",
                                  }}
                                  key={plan_MVP_name}
                                  className="application-box"
                                >
                                  <button className="appEditBtn">{plan_MVP_name}</button>

                                  <button
                                    className="appEditBtn"
                                    onClick={async () => {
                                      handleShowModalEditPlan();
                                      await editSelectedPlan(plan_MVP_name);
                                    }}
                                  >
                                    {isPM ? (
                                      <Icon icon="typcn:edit" />
                                    ) : (
                                      <Icon icon="ion:eye-sharp" />
                                    )}
                                  </button>
                                </div>
                              ))
                            : "")}

                        {/* for create/edit task */}
                        <Modal
                          dialogClassName="custom-modal"
                          className="modalWidth"
                          show={showCreateTaskModal}
                          onHide={handleHideModalTask}
                        >
                          <Modal.Header closeButton>
                            <Modal.Title>
                              {modalModeTask === "create" && modalState === ""
                                ? "Create New Task"
                                : modalModeTask === "edit" && modalState === ""
                                ? "Edit Task"
                                : modalModeTask === "view" && modalState === ""
                                ? "View Task"
                                : modalState === "openpromote" && modalModeTask !== ""
                                ? "Promote Task [Open → To-Do]"
                                : modalState === "todopromote" && modalModeTask !== ""
                                ? "Promote Task [To-Do → Doing]"
                                : modalState === "doingpromote" && modalModeTask !== ""
                                ? "Promote Task [Doing → Done]"
                                : modalState === "donepromote" && modalModeTask !== ""
                                ? "Promote Task [Done → Close]"
                                : modalState === "donedemote" && modalModeTask !== ""
                                ? "Demote Task [Done → Doing]"
                                : modalState === "doingdemote" && modalModeTask !== ""
                                ? "Demote Task [Doing → To-Do]"
                                : ""}
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            {errorMessage && (
                              <div className="alert alert-danger alignMiddle" role="alert">
                                {errorMessage}
                              </div>
                            )}{" "}
                            {successMessage && (
                              <div className="alert alert-success alignMiddle" role="alert">
                                {successMessage}
                              </div>
                            )}
                            <Form
                              onSubmit={
                                modalModeTask === "create" && modalState === ""
                                  ? handleAddNewTask
                                  : modalModeTask === "edit" && modalState === ""
                                  ? handleEditTaskSubmit
                                  : (modalState === "openpromote" && modalModeTask !== "") ||
                                    (modalState === "todopromote" && modalModeTask !== "") ||
                                    (modalState === "doingpromote" && modalModeTask !== "") ||
                                    (modalState === "donepromote" && modalModeTask !== "")
                                  ? handlePromoteTask
                                  : (modalState === "donedemote" && modalModeTask !== "") ||
                                    (modalState === "doingdemote" && modalModeTask !== "")
                                  ? handleDemoteTask
                                  : handleHideModalTask
                              }
                            >
                              <Form.Group className="row mb-1">
                                <Form.Label className="col-2 col-form-label alignRight">
                                  Task Name:{" "}
                                </Form.Label>
                                <div className="col-sm-10">
                                  <Form.Control
                                    type="text"
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                    disabled={modalModeTask !== "create"}
                                  />
                                </div>
                              </Form.Group>

                              <Form.Group className="row mb-1">
                                <Form.Label className="col-2 col-form-label alignRight">
                                  {" "}
                                  Task Description:{" "}
                                </Form.Label>
                                <div className="col-sm-10">
                                  <Form.Control
                                    as="textarea"
                                    style={{ height: "100px" }}
                                    className="modalTextAreaCSS"
                                    value={taskDescription}
                                    onChange={(e) => setTaskDescription(e.target.value)}
                                    disabled={modalModeTask !== "create"}
                                  />
                                </div>
                              </Form.Group>

                              <Form.Group className="row mb-1">
                                <Form.Label className="col-2 col-form-label alignRight">
                                  {" "}
                                  Task Plan:{" "}
                                </Form.Label>
                                <div className="col-sm-4">
                                  <div className="select-wrapper alignMiddle">
                                    <Select
                                      closeMenuOnSelect={true}
                                      components={animatedComponents}
                                      options={planOptions}
                                      isMulti={false}
                                      value={selectedPlanForTask}
                                      onChange={handleSelectChangePlanForTask}
                                      isClearable={
                                        modalState !== "donedemote" && modalState !== "donepromote"
                                      }
                                      isDisabled={
                                        modalModeTask === "view" ||
                                        modalState === "todopromote" ||
                                        modalState === "doingpromote" ||
                                        modalState === "doingdemote" ||
                                        disablePlan
                                      }
                                    />
                                  </div>
                                </div>
                              </Form.Group>

                              {(modalModeTask === "edit" || modalState !== "") && (
                                <>
                                  <Form.Group className="row mb-1">
                                    <Form.Label className="col-2 col-form-label alignRight">
                                      Add Notes:{" "}
                                    </Form.Label>
                                    <div className="col-sm-10">
                                      <Form.Control
                                        as="textarea"
                                        style={{ height: "100px" }}
                                        className="modalTextAreaCSS"
                                        value={editableTaskNotes}
                                        onChange={(e) => setEditableTaskNotes(e.target.value)}
                                      />
                                    </div>
                                  </Form.Group>
                                </>
                              )}

                              {(modalModeTask !== "create" || modalState !== "") && (
                                <>
                                  <Form.Group className="row mb-1">
                                    <Form.Label className="col-2 col-form-label alignRight">
                                      Task Notes:{" "}
                                    </Form.Label>
                                    <div className="col-sm-10">
                                      <Form.Control
                                        as="textarea"
                                        style={{ height: "100px" }}
                                        defaultValue={taskNotes}
                                        className="modalTextAreaCSS"
                                        disabled={true}
                                      />
                                    </div>
                                  </Form.Group>

                                  <Form.Group className="row mb-1">
                                    <Form.Label className="col-2 col-form-label alignRight">
                                      Task ID:{" "}
                                    </Form.Label>
                                    <div className="col-sm-4">
                                      <Form.Control
                                        className="alignMiddle"
                                        type="text"
                                        value={taskID}
                                        disabled
                                      />
                                    </div>

                                    <Form.Label className="col-2 col-form-label alignRight">
                                      Task App Acronym:{" "}
                                    </Form.Label>
                                    <div className="col-sm-4">
                                      <Form.Control
                                        className="alignMiddle"
                                        type="text"
                                        value={taskAppAcronym}
                                        disabled
                                      />
                                    </div>
                                  </Form.Group>

                                  <Form.Group className="row mb-1">
                                    <Form.Label className="col-2 col-form-label alignRight">
                                      Task Creator:{" "}
                                    </Form.Label>
                                    <div className="col-sm-4">
                                      <Form.Control
                                        className="alignMiddle"
                                        type="text"
                                        value={taskCreator}
                                        disabled
                                      />
                                    </div>

                                    <Form.Label className="col-2 col-form-label alignRight">
                                      Task Owner:{" "}
                                    </Form.Label>
                                    <div className="col-sm-4 ">
                                      <Form.Control
                                        className="alignMiddle"
                                        type="text"
                                        value={taskOwner}
                                        disabled
                                      />
                                    </div>
                                  </Form.Group>

                                  <Form.Group className="row mb-1">
                                    <Form.Label className="col-2 col-form-label alignRight">
                                      Task State:{" "}
                                    </Form.Label>
                                    <div className="col-sm-4 ">
                                      <Form.Control
                                        className="alignMiddle"
                                        type="text"
                                        value={taskState}
                                        disabled
                                      />
                                    </div>
                                    <Form.Label className="col-2 col-form-label alignRight">
                                      Task Create Date:{" "}
                                    </Form.Label>
                                    <div className="col-sm-4 ">
                                      <Form.Control
                                        className="alignMiddle"
                                        type="text"
                                        value={taskCreateDate}
                                        disabled
                                      />
                                    </div>
                                  </Form.Group>
                                </>
                              )}

                              <br />

                              <Modal.Footer className="d-flex justify-content-center">
                                {(modalModeTask === "create" ||
                                  modalModeTask === "edit" ||
                                  modalState !== "") && (
                                  <>
                                    <Button
                                      className="modalButtons"
                                      onClick={handleHideModalTask}
                                      value="Cancel"
                                    >
                                      {" "}
                                      Cancel{" "}
                                    </Button>
                                    <Button className="modalButtons" type="submit" value="Confirm">
                                      {" "}
                                      Confirm{" "}
                                    </Button>{" "}
                                  </>
                                )}
                              </Modal.Footer>
                            </Form>{" "}
                          </Modal.Body>
                        </Modal>
                        {appState.loggedIn === true && listOfTaskData && (
                          <div>
                            <div className="kanban-board">
                              <div className="kanban-column">
                                <p className="kanban-header alignMiddle">Open</p>
                                {listOfTaskData.map(
                                  ({ task_name, task_id, task_state, plan_color }) =>
                                    task_state === "Open" && (
                                      <div
                                        style={
                                          plan_color
                                            ? { borderRightColor: `${plan_color}` }
                                            : { borderRightColor: "transparent" }
                                        }
                                        key={task_id}
                                        className="kanban-card alignMiddle"
                                      >
                                        {task_name}
                                        <br />
                                        {task_id} <br />
                                        <button
                                          className={`appEditBtn${
                                            permissionOpen ? " btnMiddle" : ""
                                          }`}
                                          onClick={async () => {
                                            handleShowModalEditTask(permissionOpen);
                                            await editSelectedTask(task_id);
                                          }}
                                        >
                                          {permissionOpen ? (
                                            <Icon icon="typcn:edit" />
                                          ) : (
                                            <Icon icon="ion:eye-sharp" />
                                          )}
                                        </button>
                                        {permissionOpen && (
                                          <button
                                            className="appEditBtn btnRight"
                                            onClick={() => {
                                              //handleShowModalOpenState();
                                              setModalState("openpromote");
                                              handleShowModalOpenPromote(task_id);
                                              //handleShowModalEdit();
                                              //editSelectedApplication(app_acronym);
                                              //editSelectedTask(task_id);
                                            }}
                                          >
                                            <Icon icon="solar:double-alt-arrow-right-bold" />
                                          </button>
                                        )}
                                      </div>
                                    )
                                )}
                              </div>

                              <div className="kanban-column">
                                <p className="kanban-header alignMiddle">To do</p>
                                {listOfTaskData.map(
                                  ({ task_name, task_id, task_state, plan_color }) =>
                                    task_state === "toDo" && (
                                      <div
                                        style={
                                          plan_color
                                            ? { borderRightColor: `${plan_color}` }
                                            : { borderRightColor: "transparent" }
                                        }
                                        key={task_id}
                                        className="kanban-card alignMiddle"
                                      >
                                        {task_name}
                                        <br />
                                        {task_id} <br />
                                        <button
                                          className={`appEditBtn${
                                            permissionToDo ? " btnMiddle" : ""
                                          }`}
                                          onClick={() => {
                                            disablePlanFn();
                                            handleShowModalEditTask(permissionToDo);
                                            editSelectedTask(task_id);
                                          }}
                                        >
                                          {permissionToDo ? (
                                            <Icon icon="typcn:edit" />
                                          ) : (
                                            <Icon icon="ion:eye-sharp" />
                                          )}
                                        </button>
                                        {permissionToDo && (
                                          <button
                                            className="appEditBtn btnRight"
                                            onClick={() => {
                                              //handleShowModalToDoState();
                                              setModalState("todopromote");
                                              handleShowModalOpenPromote(task_id);
                                            }}
                                          >
                                            <Icon icon="solar:double-alt-arrow-right-bold" />
                                          </button>
                                        )}
                                      </div>
                                    )
                                )}
                              </div>

                              <div className="kanban-column">
                                <p className="kanban-header alignMiddle">Doing</p>
                                {listOfTaskData.map(
                                  ({ task_name, task_id, task_state, plan_color }) =>
                                    task_state === "Doing" && (
                                      <div
                                        style={
                                          plan_color
                                            ? { borderRightColor: `${plan_color}` }
                                            : { borderRightColor: "transparent" }
                                        }
                                        key={task_id}
                                        className="kanban-card alignMiddle"
                                      >
                                        {task_name}
                                        <br />
                                        {task_id} <br />
                                        {permissionDoing && (
                                          <button
                                            className="appEditBtn btnLeft"
                                            onClick={() => {
                                              //handleShowModalDoneDemoteState();
                                              setModalState("doingdemote");
                                              handleShowModalOpenPromote(task_id);
                                            }}
                                          >
                                            <Icon icon="solar:double-alt-arrow-left-bold" />
                                          </button>
                                        )}
                                        <button
                                          className={`appEditBtn${
                                            permissionDoing ? " btnDblMiddle" : ""
                                          }`}
                                          onClick={() => {
                                            disablePlanFn();
                                            handleShowModalEditTask(permissionDoing);
                                            editSelectedTask(task_id);
                                          }}
                                        >
                                          {permissionDoing ? (
                                            <Icon icon="typcn:edit" />
                                          ) : (
                                            <Icon icon="ion:eye-sharp" />
                                          )}
                                        </button>
                                        {permissionDoing && (
                                          <button
                                            className="appEditBtn btnRight"
                                            onClick={() => {
                                              setModalState("doingpromote");
                                              //handleShowModalDoingState();
                                              handleShowModalOpenPromote(task_id);
                                            }}
                                          >
                                            <Icon icon="solar:double-alt-arrow-right-bold" />
                                          </button>
                                        )}
                                      </div>
                                    )
                                )}
                              </div>

                              <div className="kanban-column">
                                <p className="kanban-header alignMiddle">Done</p>
                                {listOfTaskData.map(
                                  ({ task_name, task_id, task_state, plan_color }) =>
                                    task_state === "Done" && (
                                      <div
                                        style={
                                          plan_color
                                            ? { borderRightColor: `${plan_color}` }
                                            : { borderRightColor: "transparent" }
                                        }
                                        key={task_id}
                                        className="kanban-card alignMiddle"
                                      >
                                        {task_name}
                                        <br />
                                        {task_id} <br />
                                        {permissionDone && (
                                          <button
                                            className="appEditBtn btnLeft"
                                            onClick={() => {
                                              //handleShowModalDoneDemoteState();
                                              setModalState("donedemote");
                                              handleShowModalOpenPromote(task_id);
                                            }}
                                          >
                                            <Icon icon="solar:double-alt-arrow-left-bold" />
                                          </button>
                                        )}
                                        <button
                                          className={`appEditBtn${
                                            permissionDone ? " btnDblMiddle" : ""
                                          }`}
                                          onClick={async () => {
                                            handleShowModalEditTask(permissionDone);
                                            await editSelectedTask(task_id);
                                          }}
                                        >
                                          {permissionDone ? (
                                            <Icon icon="typcn:edit" />
                                          ) : (
                                            <Icon icon="ion:eye-sharp" />
                                          )}
                                        </button>
                                        {permissionDone && (
                                          <button
                                            className="appEditBtn btnRight"
                                            onClick={() => {
                                              //handleShowModalDoneState();
                                              setModalState("donepromote");
                                              handleShowModalOpenPromote(task_id);
                                            }}
                                          >
                                            <Icon icon="solar:double-alt-arrow-right-bold" />
                                          </button>
                                        )}
                                      </div>
                                    )
                                )}
                              </div>

                              <div className="kanban-column">
                                <p className="kanban-header alignMiddle">Close</p>
                                {listOfTaskData.map(
                                  ({ task_name, task_id, task_state, plan_color }) =>
                                    task_state === "Closed" && (
                                      <div
                                        style={
                                          plan_color
                                            ? { borderRightColor: `${plan_color}` }
                                            : { borderRightColor: "transparent" }
                                        }
                                        key={task_id}
                                        className="kanban-card alignMiddle"
                                      >
                                        {task_name}
                                        <br />
                                        {task_id} <br />
                                        <button
                                          className="appEditBtn"
                                          onClick={async () => {
                                            handleShowModalEditTask(false);
                                            await editSelectedTask(task_id);
                                          }}
                                        >
                                          <Icon icon="typcn:edit" />
                                        </button>
                                      </div>
                                    )
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )
              )}
          </div>
        </Page>
      </Container>
    </>
  );
}

export default Home;
