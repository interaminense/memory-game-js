import classNames from "classnames";
import React from "react";
import "./Modal.css";

export const Modal: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  children,
  className,
}) => {
  return (
    <div className={classNames("modal", className)}>
      <div className="modal__body">{children}</div>
    </div>
  );
};
