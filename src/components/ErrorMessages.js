import React from "react";

function ErrorMessages(props) {
  return (
    <>
      <div className="floating-alerts">
        {props.messages.map((msg, index) => {
          return (
            <div key={index} className="alert alert-danger text-center floating-alert shadow-sm">
              {msg}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default ErrorMessages;
