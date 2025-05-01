import React from "react";

interface LoadingSpinnerProps {
  loading: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="flex items-center justify-center">
      <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"></div>
      <span className="ml-2">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
