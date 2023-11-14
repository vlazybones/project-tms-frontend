import React from "react";

function Container(props) {
  return (
    <div
      className={
        "container-fluid py-3 custom-width" +
        (props.small ? "container-fluid py-3 widthForSmallContainer" : "")
      }
    >
      {props.children}
    </div>
  );
}

export default Container;
