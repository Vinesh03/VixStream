import React from 'react';

const Loading = ({ fullScreen = false, text = 'Caricamento...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-primary z-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent"></div>
          <p className="mt-4 text-lg text-gray-300">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-accent"></div>
        <p className="mt-3 text-gray-300">{text}</p>
      </div>
    </div>
  );
};

export default Loading;
