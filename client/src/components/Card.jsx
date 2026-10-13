import React from 'react';

function Card({ title, children }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6 mb-6 transition-transform hover:scale-105">
      {title && (
        <h2 className="text-xl font-semibold mb-4 text-white">
          {title}
        </h2>
      )}
      <div className="text-white/90">
        {children}
      </div>
    </div>
  );
}

export default Card;
