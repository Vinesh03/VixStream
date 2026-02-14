import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ 
  message = 'Si è verificato un errore',
  onRetry,
  fullScreen = false 
}) => {
  const content = (
    <div className="text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">Ops!</h3>
      <p className="text-gray-300 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary inline-flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Riprova
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-primary z-50 p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">
      {content}
    </div>
  );
};

export default ErrorMessage;
