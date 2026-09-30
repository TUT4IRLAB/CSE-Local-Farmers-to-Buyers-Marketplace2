import React, { useState } from 'react';
import { User, Farmer, ShoppingCart } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleChange }) => {
  const roles = [
    { id: 'buyer', label: 'Buyer', icon: ShoppingCart, desc: 'I want to buy fresh produce' },
    { id: 'farmer', label: 'Farmer', icon: User, desc: 'I want to sell my produce' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {roles.map(role => (
        <button
          key={role.id}
          onClick={() => onRoleChange(role.id)}
          className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 ${
            selectedRole === role.id
            ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-100'
            : 'border-secondary-100 bg-white hover:border-secondary-300'
          }`}
        >
          <div className={`p-2 rounded-lg w-fit ${selectedRole === role.id ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600'}`}>
            <role.icon size={20} />
          </div>
          <div>
            <p className="font-bold text-secondary-900">{role.label}</p>
            <p className="text-[10px] text-secondary-500 leading-tight">{role.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default RoleSelector;
