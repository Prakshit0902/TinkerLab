import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { equipmentAPI, reservationAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, FileText, User } from 'lucide-react';

const ReservationForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const equipmentId = searchParams.get('equipment');

  const [formData, setFormData] = useState({
    equipmentId: equipmentId || '',
    projectDetails: {
      title: '',
      description: '',
      supervisor: ''
    },
    requestedStartTime: '',
    requestedEndTime: '',
    quantity: 1
  });
  const [loading, setLoading] = useState(false);

  const { data: equipment } = useQuery(
    ['equipment'],
    () => equipmentAPI.getAll(),
    {
      select: (response) => response.data
    }
  );

  const { data: selectedEquipment } = useQuery(
    ['equipment', formData.equipmentId],
    () => equipmentAPI.getById(formData.equipmentId),
    {
      enabled: !!formData.equipmentId,
      select: (response) => response.data
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startTime = new Date(formData.requestedStartTime);
      const endTime = new Date(formData.requestedEndTime);
      
      if (startTime >= endTime) {
        toast.error('End time must be after start time');
        setLoading(false);
        return;
      }

      if (startTime < new Date()) {
        toast.error('Start time cannot be in the past');
        setLoading(false);
        return;
      }

      await reservationAPI.create({
        equipmentId: formData.equipmentId,
        projectDetails: formData.projectDetails,
        requestedStartTime: formData.requestedStartTime,
        requestedEndTime: formData.requestedEndTime,
        quantity: parseInt(formData.quantity)
      });

      toast.success('Reservation request submitted successfully');
      navigate('/reservations');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit reservation');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Reservation Request</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">
              <FileText className="h-4 w-4 inline mr-2" />
              Equipment
            </label>
            <select
              name="equipmentId"
              required
              className="form-input"
              value={formData.equipmentId}
              onChange={handleChange}
            >
              <option value="">Select Equipment</option>
              {equipment?.filter(eq => eq.availableQuantity > 0).map(eq => (
                <option key={eq._id} value={eq._id}>
                  {eq.name} - {eq.category} ({eq.availableQuantity} available)
                </option>
              ))}
            </select>
          </div>

          {selectedEquipment && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">{selectedEquipment.name}</h3>
              <p className="text-blue-800 text-sm mb-2">{selectedEquipment.description}</p>
              <div className="flex justify-between text-sm text-blue-700">
                <span>Available: {selectedEquipment.availableQuantity}</span>
                <span>Max Duration: {selectedEquipment.maxBookingDuration}h</span>
              </div>
            </div>
          )}

          <div>
            <label className="form-label">Quantity</label>
            <input
              type="number"
              name="quantity"
              required
              min="1"
              max={selectedEquipment?.availableQuantity || 1}
              className="form-input"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                <Calendar className="h-4 w-4 inline mr-2" />
                Start Time
              </label>
              <input
                type="datetime-local"
                name="requestedStartTime"
                required
                min={getMinDateTime()}
                className="form-input"
                value={formData.requestedStartTime}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="form-label">
                <Clock className="h-4 w-4 inline mr-2" />
                End Time
              </label>
              <input
                type="datetime-local"
                name="requestedEndTime"
                required
                min={formData.requestedStartTime}
                className="form-input"
                value={formData.requestedEndTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
            
            <div>
              <label className="form-label">Project Title</label>
              <input
                type="text"
                name="projectDetails.title"
                required
                className="form-input"
                value={formData.projectDetails.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">Project Description</label>
              <textarea
                name="projectDetails.description"
                required
                rows="4"
                className="form-input"
                value={formData.projectDetails.description}
                onChange={handleChange}
                placeholder="Describe your project and how you plan to use the equipment..."
              />
            </div>

            <div>
              <label className="form-label">
                <User className="h-4 w-4 inline mr-2" />
                Supervisor/Guide (Optional)
              </label>
              <input
                type="text"
                name="projectDetails.supervisor"
                className="form-input"
                value={formData.projectDetails.supervisor}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/reservations')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;