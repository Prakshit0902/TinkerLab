import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { equipmentAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Package, MapPin, FileText, Settings } from 'lucide-react';

const EquipmentForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    totalQuantity: 1,
    requiresTraining: false,
    maxBookingDuration: 24,
    specifications: {},
    images: []
  });

  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);

  const categories = ['Mechanical', 'Electronics', 'Testing', 'Computing', 'Manufacturing'];

  const createMutation = useMutation(
    (data) => equipmentAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['equipment']);
        toast.success('Equipment added successfully');
        navigate('/equipment');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add equipment');
      }
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const specs = {};
    specifications.forEach(spec => {
      if (spec.key && spec.value) {
        specs[spec.key] = spec.value;
      }
    });

    const submitData = {
      ...formData,
      specifications: specs,
      totalQuantity: parseInt(formData.totalQuantity),
      maxBookingDuration: parseInt(formData.maxBookingDuration)
    };

    createMutation.mutate(submitData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/equipment')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Equipment
        </button>
      </div>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Equipment</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">
                <Package className="h-4 w-4 inline mr-2" />
                Equipment Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., 3D Printer - Ultimaker S3"
              />
            </div>

            <div>
              <label className="form-label">Category</label>
              <select
                name="category"
                required
                className="form-input"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">
                <MapPin className="h-4 w-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                name="location"
                required
                className="form-input"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Lab Room 101, Shelf A"
              />
            </div>

            <div>
              <label className="form-label">Total Quantity</label>
              <input
                type="number"
                name="totalQuantity"
                required
                min="1"
                className="form-input"
                value={formData.totalQuantity}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">Max Booking Duration (hours)</label>
              <input
                type="number"
                name="maxBookingDuration"
                required
                min="1"
                className="form-input"
                value={formData.maxBookingDuration}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="requiresTraining"
                id="requiresTraining"
                className="rounded border-gray-300 mr-2"
                checked={formData.requiresTraining}
                onChange={handleChange}
              />
              <label htmlFor="requiresTraining" className="text-sm font-medium text-gray-700">
                Requires Training
              </label>
            </div>
          </div>

          <div>
            <label className="form-label">
              <FileText className="h-4 w-4 inline mr-2" />
              Description
            </label>
            <textarea
              name="description"
              required
              rows="4"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the equipment, its capabilities, and usage instructions..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="form-label">
                <Settings className="h-4 w-4 inline mr-2" />
                Specifications
              </label>
              <button
                type="button"
                onClick={addSpecification}
                className="btn btn-secondary text-sm"
              >
                Add Specification
              </button>
            </div>
            
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Property (e.g., Power)"
                    className="form-input flex-1"
                    value={spec.key}
                    onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., 220V)"
                    className="form-input flex-1"
                    value={spec.value}
                    onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="text-red-600 hover:text-red-700 px-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/equipment')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="btn btn-primary"
            >
              {createMutation.isLoading ? 'Adding...' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentForm;