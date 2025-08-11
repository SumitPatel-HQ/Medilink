'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authAPI, userAPI, appointmentAPI } from '../services/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isDoctor, isPatient } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Check if email is verified
    if (user && !user.verifiedEmail) {
      setShowEmailVerification(true);
    }

    // Load appointments
    const loadAppointments = async () => {
      try {
        const role = user?.role;
        if (role) {
          const response = await appointmentAPI.getAppointments(role);
          setAppointments(response.data || []);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [isAuthenticated, user, router]);

  const loadAppointments = async () => {
    try {
      const role = user?.role;
      if (role) {
        const response = await appointmentAPI.getAppointments(role);
        setAppointments(response.data || []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      router.push('/');
    }
  };

  const requestEmailVerification = async () => {
    try {
      setVerificationLoading(true);
      await authAPI.requestEmailVerification();
      alert('Verification email sent! Check your inbox.');
    } catch (error) {
      alert('Failed to send verification email: ' + (error.response?.data?.message || error.message));
    } finally {
      setVerificationLoading(false);
    }
  };

  const submitEmailVerification = async () => {
    try {
      setVerificationLoading(true);
      const response = await authAPI.submitEmailVerification(otp);
      if (response.data) {
        alert('Email verified successfully!');
        setShowEmailVerification(false);
        // Update user data
        window.location.reload();
      }
    } catch (error) {
      alert('Verification failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setVerificationLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(parseInt(timestamp)).toLocaleString();
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
              <h1 className="text-3xl font-bold text-gray-900">MediLink Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {user?.role}
              </span>
              <Link
                href="/profile"
                className="text-indigo-600 hover:text-indigo-900"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Email Verification Banner */}
        {showEmailVerification && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-yellow-800">Email Verification Required</h3>
                <p className="text-yellow-700">Please verify your email address to access all features.</p>
              </div>
              <button
                onClick={requestEmailVerification}
                disabled={verificationLoading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {verificationLoading ? 'Sending...' : 'Send Verification'}
              </button>
            </div>
            {/* OTP Input */}
            <div className="mt-4 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={submitEmailVerification}
                disabled={verificationLoading || !otp}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                Verify
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {isPatient && (
                  <>
                    <Link
                      href="/appointments/book"
                      className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Book Appointment
                    </Link>
                    <Link
                      href="/reports/upload"
                      className="block w-full bg-green-600 hover:bg-green-700 text-white text-center px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Upload Medical Report
                    </Link>
                  </>
                )}
                {isDoctor && (
                  <div className="text-gray-600">
                    Manage your appointments and view patient reports below.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Appointments
              </h3>
              {loading ? (
                <div>Loading appointments...</div>
              ) : appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment._id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          {isPatient && appointment.doctorId && (
                            <p className="font-medium">Dr. {appointment.doctorId.name}</p>
                          )}
                          {isDoctor && (
                            <p className="font-medium">Patient ID: {appointment.patientId}</p>
                          )}
                          <p className="text-sm text-gray-600">
                            {formatDate(appointment.dateTime)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No appointments found.</p>
              )}
              {appointments.length > 3 && (
                <Link
                  href="/appointments"
                  className="mt-3 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  View all appointments →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Statistics</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">{appointments.length}</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Appointments
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {appointments.length}
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
                      <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">
                          {appointments.filter(a => a.status === 'confirmed').length}
                        </span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Confirmed
                        </dt>
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
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pending
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {appointments.filter(a => a.status === 'pending').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
