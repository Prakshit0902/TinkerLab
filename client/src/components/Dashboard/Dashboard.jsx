import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { equipmentAPI, reservationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, 
  Calendar, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  const { data: equipment } = useQuery(
    ['equipment'],
    () => equipmentAPI.getAll(),
    {
      select: (response) => response.data
    }
  );

  const { data: reservations } = useQuery(
    ['reservations'],
    () => reservationAPI.getAll(),
    {
      select: (response) => response.data
    }
  );

  const { data: pendingReservations } = useQuery(
    ['pendingReservations'],
    () => reservationAPI.getPending(),
    {
      enabled: isAdmin,
      select: (response) => response.data
    }
  );

  const stats = {
    totalEquipment: equipment?.length || 0,
    availableEquipment: equipment?.filter(eq => eq.availableQuantity > 0).length || 0,
    myReservations: reservations?.length || 0,
    pendingReservations: pendingReservations?.length || 0,
    approvedReservations: reservations?.filter(r => r.status === 'approved').length || 0,
    activeReservations: reservations?.filter(r => r.status === 'in_use').length || 0
  };

  const recentReservations = reservations?.slice(0, 5) || [];
  const lowStockEquipment = equipment?.filter(eq => 
    eq.availableQuantity < eq.totalQuantity * 0.2 && eq.availableQuantity > 0
  ).slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            {user?.department} • {user?.role.replace('_', ' ')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Equipment</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEquipment}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Now</p>
              <p className="text-2xl font-bold text-gray-900">{stats.availableEquipment}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Reservations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.myReservations}</p>
            </div>
          </div>
        </div>

        {isAdmin ? (
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReservations}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedReservations}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reservations</h2>
            <Link
              to="/reservations"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentReservations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reservations yet</p>
            ) : (
              recentReservations.map(reservation => (
                <div key={reservation._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{reservation.projectDetails.title}</p>
                    <p className="text-sm text-gray-600">{reservation.equipment.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reservation.status === 'approved' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    reservation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reservation.status.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Equipment Alerts</h2>
            <Link
              to="/equipment"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {lowStockEquipment.length === 0 ? (
              <p className="text-gray-500 text-center py-4">All equipment well stocked</p>
            ) : (
              lowStockEquipment.map(eq => (
                <div key={eq._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">{eq.name}</p>
                      <p className="text-sm text-gray-600">{eq.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-orange-600">
                    {eq.availableQuantity} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/reservations/pending"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Clock className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Review Pending</p>
                <p className="text-sm text-gray-600">{stats.pendingReservations} requests</p>
              </div>
            </Link>

            <Link
              to="/equipment/new"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Package className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Add Equipment</p>
                <p className="text-sm text-gray-600">Register new equipment</p>
              </div>
            </Link>

            <Link
              to="/reports"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">View Reports</p>
                <p className="text-sm text-gray-600">Usage analytics</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;