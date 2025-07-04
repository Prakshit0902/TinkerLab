import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Package, Calendar, AlertCircle } from 'lucide-react';

const EquipmentCard = ({ equipment }) => {
  const getStatusColor = () => {
    if (equipment.availableQuantity === 0) return 'text-red-600 bg-red-50';
    if (equipment.availableQuantity < equipment.totalQuantity * 0.3) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusText = () => {
    if (equipment.availableQuantity === 0) return 'Unavailable';
    if (equipment.availableQuantity < equipment.totalQuantity * 0.3) return 'Limited';
    return 'Available';
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{equipment.name}</h3>
          <p className="text-sm text-gray-600">{equipment.category}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">{equipment.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{equipment.location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Package className="h-4 w-4 mr-2" />
          <span>{equipment.availableQuantity} of {equipment.totalQuantity} available</span>
        </div>
        {equipment.requiresTraining && (
          <div className="flex items-center text-sm text-orange-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>Training required</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <Link
          to={`/equipment/${equipment._id}`}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          View Details
        </Link>
        <Link
          to={`/reservations/new?equipment=${equipment._id}`}
          className="btn btn-primary"
          disabled={equipment.availableQuantity === 0}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Reserve
        </Link>
      </div>
    </div>
  );
};

export default EquipmentCard;