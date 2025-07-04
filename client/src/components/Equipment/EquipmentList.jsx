import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { equipmentAPI } from '../../services/api';
import EquipmentCard from './EquipmentCard';
import { Search, Filter, Grid, List } from 'lucide-react';

const EquipmentList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const { data: equipment, isLoading, error } = useQuery(
    ['equipment', { search: searchTerm, category: selectedCategory, available: showAvailableOnly }],
    () => equipmentAPI.getAll({
      search: searchTerm,
      category: selectedCategory,
      available: showAvailableOnly
    }),
    {
      select: (response) => response.data
    }
  );

  const categories = ['Mechanical', 'Electronics', 'Testing', 'Computing', 'Manufacturing'];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading equipment: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Equipment Catalog</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search equipment..."
              className="pl-10 form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="form-input md:w-48"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <label className="flex items-center space-x-2 md:w-48">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Available only</span>
          </label>
          
          <div className="flex border rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {equipment?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No equipment found matching your criteria.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {equipment?.map(item => (
            <EquipmentCard key={item._id} equipment={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentList;