import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { reservationAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Check, X, User, Calendar, Clock, Package, MessageSquare } from 'lucide-react';

const PendingReservations = () => {
  const queryClient = useQueryClient();
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [actionType, setActionType] = useState('');
  const [comment, setComment] = useState('');

  const { data: pendingReservations, isLoading } = useQuery(
    ['pendingReservations'],
    () => reservationAPI.getPending(),
    {
      select: (response) => response.data
    }
  );

  const approveMutation = useMutation(
    ({ id, data }) => reservationAPI.approve(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pendingReservations']);
        toast.success('Reservation approved successfully');
        setSelectedReservation(null);
        setComment('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to approve reservation');
      }
    }
  );

  const rejectMutation = useMutation(
    ({ id, data }) => reservationAPI.reject(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pendingReservations']);
        toast.success('Reservation rejected');
        setSelectedReservation(null);
        setComment('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to reject reservation');
      }
    }
  );

  const handleAction = (reservation, type) => {
    setSelectedReservation(reservation);
    setActionType(type);
    setComment('');
  };

  const handleConfirmAction = () => {
    if (actionType === 'approve') {
      approveMutation.mutate({
        id: selectedReservation._id,
        data: { approvalComments: comment }
      });
    } else if (actionType === 'reject') {
      if (!comment.trim()) {
        toast.error('Please provide a reason for rejection');
        return;
      }
      rejectMutation.mutate({
        id: selectedReservation._id,
        data: { rejectionReason: comment }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pending Reservations</h1>

      {pendingReservations?.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No pending reservations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingReservations?.map(reservation => (
            <div key={reservation._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {reservation.projectDetails.title}
                  </h3>
                  <p className="text-gray-600">{reservation.equipment.name}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  PENDING
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>{reservation.user.name} ({reservation.user.rollNumber})</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(new Date(reservation.requestedStartTime), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(reservation.requestedStartTime), 'HH:mm')} - 
                      {format(new Date(reservation.requestedEndTime), 'HH:mm')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    <span>Quantity: {reservation.quantity}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Department:</strong> {reservation.user.department}
                  </div>
                  {reservation.projectDetails.supervisor && (
                    <div className="text-sm text-gray-600">
                      <strong>Supervisor:</strong> {reservation.projectDetails.supervisor}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Project Description:</h4>
                <p className="text-gray-700 text-sm">{reservation.projectDetails.description}</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleAction(reservation, 'reject')}
                  className="btn bg-red-600 text-white hover:bg-red-700 flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </button>
                                <button
                  onClick={() => handleAction(reservation, 'approve')}
                  className="btn bg-green-600 text-white hover:bg-green-700 flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReservation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === 'approve' ? 'Approve Reservation' : 'Reject Reservation'}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Equipment:</strong> {selectedReservation.equipment.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Student:</strong> {selectedReservation.user.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Project:</strong> {selectedReservation.projectDetails.title}
              </p>
            </div>

            <div className="mb-4">
              <label className="form-label">
                <MessageSquare className="h-4 w-4 inline mr-2" />
                {actionType === 'approve' ? 'Comments (Optional)' : 'Reason for Rejection'}
              </label>
              <textarea
                className="form-input"
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={actionType === 'approve' 
                  ? 'Any additional comments or instructions...' 
                  : 'Please provide a reason for rejection...'}
                required={actionType === 'reject'}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedReservation(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={approveMutation.isLoading || rejectMutation.isLoading}
                className={`btn ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
              >
                {approveMutation.isLoading || rejectMutation.isLoading ? 'Processing...' : 
                 actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingReservations;