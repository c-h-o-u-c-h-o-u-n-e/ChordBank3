import React from 'react';

interface FormRowProps {
  children: React.ReactNode;
}

const FormRow: React.FC<FormRowProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {children}
    </div>
  );
};

export default FormRow;