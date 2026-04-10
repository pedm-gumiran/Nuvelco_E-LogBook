import React from 'react';
import Button from './Button';

export default function Button_Cancel({
  onClick,
  label = "Cancel",
  ...props
}) {
  return (
    <Button
      label={label}
      variant="secondary"
      size="sm"
      className="border-2 border-gray-400 hover:border-gray-500 hover:bg-gray-50 text-gray-600 rounded-md"
      onClick={onClick}
      {...props}
    />
  );
}
