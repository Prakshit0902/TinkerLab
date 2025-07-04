import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { equipmentAPI } from '../../services/api';
import { ArrowLeft, MapPin, Package, Calendar, AlertCircle, FileText, Play } from 'lucide-react';

const EquipmentDetail = () => {
  const { id } = useParams();
  
  const { data: equipment, isLoading, error } = useQuery(
    ['equipment', id],
    () => equipmentAPI.getById(id),
    {
      select: (response) => response.data
    }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading equipment details: {error.message}</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Equipment not found.</p>
      </div>
    );
  }

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
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/equipment"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Equipment
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{equipment.name}</h1>
                <p className="text-lg text-gray-600">{equipment.category}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3" />
                <span>{equipment.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Package className="h-5 w-5 mr-3" />
                <span>{equipment.availableQuantity} of {equipment.totalQuantity} available</span>
              </div>
              {equipment.requiresTraining && (
                <div className="flex items-center text-orange-600">
                  <AlertCircle className="h-5 w-5 mr-3" />
                  <span>Training required before use</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{equipment.description}</p>
            </div>

            {equipment.specifications && Object.keys(equipment.specifications).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(equipment.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {equipment.trainingMaterials && equipment.trainingMaterials.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Materials</h3>
              <div className="space-y-3">
                {equipment.trainingMaterials.map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {material.type === 'video' && <Play className="h-5 w-5 text-blue-600" />}
                      {material.type === 'document' && <FileText className="h-5 w-5 text-green-600" />}
                      <div>
                        <p className="font-medium text-gray-900">{material.title}</p>
                        <p className="text-sm text-gray-600 capitalize">{material.type}</p>
                      </div>
                    </div>
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to={`/reservations/new?equipment=${equipment._id}`}
                className="btn btn-primary w-full flex items-center justify-center"
                disabled={equipment.availableQuantity === 0}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Reserve Equipment
              </Link>
              {equipment.availableQuantity === 0 && (
                <p className="text-sm text-gray-500 text-center">
                  Equipment is currently unavailable
                </p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Units:</span>
                <span className="font-medium">{equipment.totalQuantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available:</span>
                <span className="font-medium">{equipment.availableQuantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">In Use:</span>
                <span className="font-medium">{equipment.totalQuantity - equipment.availableQuantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Booking:</span>
                <span className="font-medium">{equipment.maxBookingDuration}h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;