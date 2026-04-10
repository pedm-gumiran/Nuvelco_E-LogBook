import React from 'react';
import Logo from '/system_logo.png';

export default function School_Logo({ size = 60 }) {
  return (
    <img
      src={Logo}
      alt="System Logo"
      style={{ width: size, height: size }}
      className="rounded-full border border-white shadow-md object-cover"
    />
  );
}
