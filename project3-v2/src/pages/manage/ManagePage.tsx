import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, Layers, Settings } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';

interface TileProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function Tile({ icon, title, description, onClick }: TileProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 hover:border-blue-300"
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg text-white">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function ManagePage() {
  const navigate = useNavigate();

  const tiles = [
    {
      icon: <Settings size={24} />,
      title: 'Polisher',
      description: 'Manage polisher configurations and settings',
      path: '/manage/polisher',
    },
    {
      icon: <User size={24} />,
      title: 'User',
      description: 'Manage system users and permissions',
      path: '/manage/user',
    },
    {
      icon: <Package size={24} />,
      title: 'Bag Type',
      description: 'Configure bag types and specifications',
      path: '/manage/bag-type',
    },
    {
      icon: <Layers size={24} />,
      title: 'Items',
      description: 'Manage inventory items and categories',
      path: '/manage/items',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage</h1>
          <p className="text-gray-600 mt-2">Configure and manage system entities</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiles.map((tile) => (
            <Tile
              key={tile.title}
              icon={tile.icon}
              title={tile.title}
              description={tile.description}
              onClick={() => navigate(tile.path)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}