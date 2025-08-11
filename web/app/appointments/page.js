'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { appointmentAPI } from '../../services/api';
import Link from 'next/link';

export default function AppointmentsPage() {
  const { user, isAuthenticated, isDoctor, isPatient } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const loadAppointments = async () => {
      try {
        const role = user?.role;
        if (role) {
          const response = await appointmentAPI.getAppointments(role);
          setAppointments(response.data || []);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
        setError('Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, [isAuthenticated, user, router]);

  const loadAppointmentsRefresh = async () => {
    try {
      const role = user?.role;
      if (role) {
        const response = await appointmentAPI.getAppointments(role);
        setAppointments(response.data || []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    setUpdatingStatus(appointmentId);
    try {
      await appointmentAPI.updateAppointmentStatus(appointmentId, { status: newStatus });
      // Reload appointments to get updated data
      await loadAppointmentsRefresh();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update appointment status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(parseInt(timestamp)).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isDoctor ? 'Patient Appointments' : 'My Appointments'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {isPatient && (
                <Link
                  href="/appointments/book"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Book New Appointment
                </Link>
              )}
              <Link
                href="/dashboard"
                className="text-indigo-600 hover:text-indigo-900"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading appointments...</div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No appointments found</div>
            {isPatient && (
              <Link
                href="/appointments/book"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Book Your First Appointment
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Appointments Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {appointments.map((appointment) => (
                <div key={appointment._id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <div className="text-sm text-gray-500">
                        ID: {appointment._id.slice(-6)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {isPatient && appointment.doctorId && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Doctor</dt>
                          <dd className="text-sm text-gray-900">Dr. {appointment.doctorId.name}</dd>
                        </div>
                      )}
                      
                      {isDoctor && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Patient</dt>
                          <dd className="text-sm text-gray-900">Patient ID: {appointment.patientId}</dd>
                        </div>
                      )}
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                        <dd className="text-sm text-gray-900">{formatDate(appointment.dateTime)}</dd>
                      </div>
                    </div>

                    {/* Doctor Actions */}
                    {isDoctor && appointment.status === 'pending' && (
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                          disabled={updatingStatus === appointment._id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                          {updatingStatus === appointment._id ? 'Updating...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                          disabled={updatingStatus === appointment._id}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                          {updatingStatus === appointment._id ? 'Updating...' : 'Cancel'}
                        </button>
                      </div>
                    )}

                    {/* Patient Actions */}
                    {isPatient && appointment.status === 'pending' && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-600">
                          Waiting for doctor confirmation
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Statistics */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Summary</h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                  <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                            <span className="text-white font-bold">{appointments.length}</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                            <dd className="text-lg font-medium text-gray-900">{appointments.length}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                            <span className="text-white font-bold">
                              {appointments.filter(a => a.status === 'confirmed').length}
                            </span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Confirmed</dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {appointments.filter(a => a.status === 'confirmed').length}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-600 rounded-md flex items-center justify-center">
                            <span className="text-white font-bold">
                              {appointments.filter(a => a.status === 'pending').length}
                            </span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {appointments.filter(a => a.status === 'pending').length}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
                            <span className="text-white font-bold">
                              {appointments.filter(a => a.status === 'cancelled').length}
                            </span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Cancelled</dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {appointments.filter(a => a.status === 'cancelled').length}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
