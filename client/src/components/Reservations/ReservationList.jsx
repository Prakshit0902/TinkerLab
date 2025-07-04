import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { reservationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Calendar, Clock, User, Package, Plus, Filter } from 'lucide-react';

const ReservationList = () => {
  const { user, isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: reservations, isLoading } = useQuery(
    ['reservations', statusFilter],
    () => reservationAPI.getAll({ status: statusFilter }),
    {
      select: (response) => response.data
    }
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      in_use: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
        <Link
          to="/reservations/new"
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Reservation
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="form-input md:w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="in_use">In Use</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {reservations?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No reservations found.</p>
              <Link
                to="/reservations/new"
                className="btn btn-primary mt-4"
              >
                Create Your First Reservation
              </Link>
            </div>
          ) : (
            reservations?.map(reservation => (
              <div key={reservation._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{reservation.projectDetails.title}</h3>
                    <p className="text-sm text-gray-600">{reservation.equipment.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                    {reservation.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(new Date(reservation.requestedStartTime), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(reservation.requestedStartTime), 'HH:mm')} - 
                      {format(new Date(reservation.requestedEndTime), 'HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    <span>Qty: {reservation.quantity}</span>
                  </div>
                </div>

                {reservation.approvalComments && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Approval Comments:</strong> {reservation.approvalComments}
                    </p>
                  </div>
                )}

                {reservation.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {reservation.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Requested on {format(new Date(reservation.createdAt), 'MMM dd, yyyy')}
                  </p>
                  <Link
                    to={`/reservations/${reservation._id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationList;