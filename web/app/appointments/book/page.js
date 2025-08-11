'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { userAPI, appointmentAPI } from '../../services/api';
import Link from 'next/link';

export default function BookAppointmentPage() {
  const { isAuthenticated, isPatient } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: '',
    dateTime: '',
    patientId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isPatient) {
      router.push('/auth/login');
      return;
    }

    loadDoctors();
  }, [isAuthenticated, isPatient, router]);

  const loadDoctors = async () => {
    try {
      const response = await userAPI.getDoctors();
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      if (error.response?.status === 403) {
        setError('Access denied. Please make sure you are logged in as a patient.');
      } else if (error.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else {
        setError('Failed to load doctors list: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Convert datetime to the format expected by backend
      const appointmentData = {
        doctorId: formData.doctorId,
        dateTime: formData.dateTime,
        status: 'pending'
      };

      const response = await appointmentAPI.createAppointment(appointmentData);
      if (response.data) {
        setSuccess('Appointment booked successfully!');
        setFormData({
          doctorId: '',
          dateTime: '',
          patientId: ''
        });
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (!isAuthenticated || !isPatient) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
            </div>
            <Link
              href="/dashboard"
              className="text-indigo-600 hover:text-indigo-900"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                  Select Doctor
                </label>
                {doctorsLoading ? (
                  <div className="mt-1 text-gray-500">Loading doctors...</div>
                ) : (
                  <select
                    id="doctorId"
                    name="doctorId"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.doctorId}
                    onChange={handleChange}
                  >
                    <option value="">Choose a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name}
                        {doctor.specialization && ` - ${doctor.specialization}`}
                        {doctor.address && ` (${doctor.address})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700">
                  Appointment Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="dateTime"
                  name="dateTime"
                  required
                  min={getMinDateTime()}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.dateTime}
                  onChange={handleChange}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Please select a future date and time for your appointment.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-red-600 text-sm">
                    {error}
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="text-green-600 text-sm">
                    {success}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Link
                  href="/dashboard"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading || doctorsLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Booking...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Available Doctors */}
        {!doctorsLoading && doctors.length > 0 && (
          <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Available Doctors</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <h4 className="font-medium text-gray-900">Dr. {doctor.name}</h4>
                    {doctor.specialization && (
                      <p className="text-sm text-gray-600">Specialization: {doctor.specialization}</p>
                    )}
                    {doctor.address && (
                      <p className="text-sm text-gray-600">Address: {doctor.address}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
