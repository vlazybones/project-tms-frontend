import React from "react";
import { Link } from "react-router-dom";
import Page from "./Page";

function PageNotFound() {
  return (
    <>
      <Page title="Not Found">
        <div className="boxMessage">
          <p className="alignMiddle"> The page you are looking for cannot be found</p>
          <p className="alignMiddleLink">
            <Link to="/"> Back to home </Link>
          </p>
        </div>
      </Page>
    </>
  );
}

export default PageNotFound;
