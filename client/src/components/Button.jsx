import React from "react";

const Button = ({ onClick, children, className = "", type = "button", size = "md" }) => {
  const sizeClasses = {
    sm: "text-sm px-3 py-1",
    md: "text-base px-4 py-2",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded bg-blue-500 hover:bg-blue-600 text-white ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>


  );
};

export default Button;



