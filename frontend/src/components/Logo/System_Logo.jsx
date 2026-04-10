import React from 'react';
import Logo from '/system_logo.png';

export default function System_Logo({ size = 60 }) {
  return (
    <img
      src={Logo}
      alt="System Logo"
      style={{ width: size, height: size }}
      className=" border border-white shadow-md object-cover"
    />
  );
}
