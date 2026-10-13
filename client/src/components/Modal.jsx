import React from "react";

export default function Modal({ onClose, children }) {
  console.log("Modal mounted");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
