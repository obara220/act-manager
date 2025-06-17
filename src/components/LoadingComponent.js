import React from "react";

const LoadingComponent = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-600">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
      <p className="text-lg">{message}</p>
    </div>
  );
};

export default LoadingComponent;
