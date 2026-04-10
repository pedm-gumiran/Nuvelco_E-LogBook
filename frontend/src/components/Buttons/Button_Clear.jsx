import React from 'react';
import { FiTrash2 } from 'react-icons/fi';
import Button from './Button';

export default function Button_Clear({
  onClick,
  label = "Clear Form",
  ...props
}) {
  return (
    <Button
      label={label}
      icon={<FiTrash2 />}
      variant="secondary"
      size="lg"
      className="border-2 border-green-500 hover:border-green-600 text-green-600 bg-white hover:bg-green-50 rounded-xl"
      onClick={onClick}
      {...props}
    />
  );
}
