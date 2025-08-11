'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { reportsAPI, appointmentAPI } from '../../services/api';
import Link from 'next/link';

export default function UploadReportPage() {
  const { isAuthenticated, isPatient } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    appointmentId: '',
    reportFile: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isPatient) {
      router.push('/auth/login');
      return;
    }

    loadAppointments();
  }, [isAuthenticated, isPatient, router]);

  const loadAppointments = async () => {
    try {
      const response = await appointmentAPI.getAppointments('patient');
      // Filter for confirmed appointments only
      const confirmedAppointments = (response.data || []).filter(
        appointment => appointment.status === 'confirmed'
      );
      setAppointments(confirmedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'reportFile') {
      setFormData({
        ...formData,
        reportFile: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!formData.reportFile) {
      setError('Please select a file to upload');
      setIsLoading(false);
      return;
    }

    if (!formData.appointmentId) {
      setError('Please select an appointment');
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('reportFile', formData.reportFile);
      formDataToSend.append('appointmentId', formData.appointmentId);

      const response = await reportsAPI.uploadReport(formDataToSend);
      if (response.data) {
        setSuccess('Medical report uploaded successfully!');
        setFormData({
          appointmentId: '',
          reportFile: null
        });
        
        // Reset file input
        const fileInput = document.getElementById('reportFile');
        if (fileInput) fileInput.value = '';
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload report');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(parseInt(timestamp)).toLocaleString();
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
              <h1 className="text-3xl font-bold text-gray-900">Upload Medical Report</h1>
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
                <label htmlFor="appointmentId" className="block text-sm font-medium text-gray-700">
                  Select Appointment
                </label>
                {appointmentsLoading ? (
                  <div className="mt-1 text-gray-500">Loading appointments...</div>
                ) : appointments.length === 0 ? (
                  <div className="mt-1 text-gray-500">
                    No confirmed appointments found. You need a confirmed appointment to upload reports.
                  </div>
                ) : (
                  <select
                    id="appointmentId"
                    name="appointmentId"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.appointmentId}
                    onChange={handleChange}
                  >
                    <option value="">Choose an appointment</option>
                    {appointments.map((appointment) => (
                      <option key={appointment._id} value={appointment._id}>
                        {appointment.doctorId && `Dr. ${appointment.doctorId.name}`} - {formatDate(appointment.dateTime)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="reportFile" className="block text-sm font-medium text-gray-700">
                  Medical Report File
                </label>
                <input
                  type="file"
                  id="reportFile"
                  name="reportFile"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={handleChange}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
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
                  disabled={isLoading || appointmentsLoading || appointments.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Uploading...' : 'Upload Report'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Upload Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-blue-900 mb-2">Upload Instructions</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• You can only upload reports for confirmed appointments</li>
              <li>• Ensure the file is clear and readable</li>
              <li>• Supported file formats: PDF, JPG, PNG, DOC, DOCX</li>
              <li>• Maximum file size: 10MB</li>
              <li>• The report will be linked to the selected appointment</li>
            </ul>
          </div>
        </div>

        {/* Recent Confirmed Appointments */}
        {!appointmentsLoading && appointments.length > 0 && (
          <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Confirmed Appointments</h3>
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        {appointment.doctorId && (
                          <p className="font-medium">Dr. {appointment.doctorId.name}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          {formatDate(appointment.dateTime)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {appointment._id}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    </div>
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
