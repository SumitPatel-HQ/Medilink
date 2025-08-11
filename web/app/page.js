'use client';

import { useEffect, useState } from "react";
import { useAuth } from './contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getGreeting } from "./services/api";
import Link from 'next/link';

export default function Home() {
  const [greeting, setGreeting] = useState('');
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (isAuthenticated) {
      router.push('/dashboard');
      return;
    }

    const fetchGreeting = async () => {
      try {
        const data = await getGreeting();
        setGreeting(data.message);
      } catch (err) {
        setError('Failed to fetch greeting');
      }
    };

    fetchGreeting();
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return <div>Redirecting to dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">MediLink</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-indigo-600"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Welcome to</span>
            <span className="block text-indigo-600">MediLink</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Your comprehensive medical appointment and health record management system. 
            Book appointments with doctors, upload medical reports, and manage your healthcare journey.
          </p>
          
          {/* Server Status */}
          <div className="mt-8 max-w-md mx-auto p-6 bg-white/5 rounded-lg shadow-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-center">Server Status</h2>
            {error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : greeting ? (
              <p className="text-lg text-center text-green-600">✓ {greeting}</p>
            ) : (
              <p className="text-gray-500 text-center">Checking server connection...</p>
            )}
          </div>

          <div className="mt-10 flex justify-center space-x-6">
            <Link
              href="/auth/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md text-lg font-medium"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="bg-white hover:bg-gray-50 text-indigo-600 px-8 py-3 rounded-md text-lg font-medium border border-indigo-600"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                📅
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Book Appointments</h3>
              <p className="mt-2 text-base text-gray-500 text-center">
                Easily schedule appointments with available doctors. Choose your preferred time and date.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                📋
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Manage Records</h3>
              <p className="mt-2 text-base text-gray-500 text-center">
                Upload and organize your medical reports. Keep all your health records in one place.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                👨‍⚕️
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Doctor Portal</h3>
              <p className="mt-2 text-base text-gray-500 text-center">
                Doctors can manage appointments, view patient reports, and update appointment status.
              </p>
            </div>
          </div>
        </div>

        {/* User Types */}
        <div className="mt-24 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Choose Your Role</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Patient */}
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
                👤
              </div>
              <h3 className="text-xl font-medium text-gray-900">Patient</h3>
              <p className="mt-2 text-gray-500">
                Book appointments, upload medical reports, and track your healthcare journey.
              </p>
              <ul className="mt-4 text-sm text-gray-600 space-y-1">
                <li>• Book appointments with doctors</li>
                <li>• Upload medical reports</li>
                <li>• View appointment history</li>
                <li>• Manage profile information</li>
              </ul>
            </div>

            {/* Doctor */}
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
                🩺
              </div>
              <h3 className="text-xl font-medium text-gray-900">Doctor</h3>
              <p className="mt-2 text-gray-500">
                Manage patient appointments, view medical reports, and provide healthcare services.
              </p>
              <ul className="mt-4 text-sm text-gray-600 space-y-1">
                <li>• View patient appointments</li>
                <li>• Confirm or cancel appointments</li>
                <li>• Access patient medical reports</li>
                <li>• Manage clinic information</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 MediLink. Medical Appointment Management System.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
