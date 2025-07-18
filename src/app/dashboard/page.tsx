'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats] = useState({
    totalBookings: 1247,
    abandonedBookings: 312,
    recoveredBookings: 78,
    recoveryRate: 25.0
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome back, Alex!</span>
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    📊
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Bookings
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalBookings.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    ⚠️
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Abandoned
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.abandonedBookings.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    ✅
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Recovered
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.recoveredBookings.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    📈
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Recovery Rate
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.recoveryRate}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/websites" className="bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 text-left block">
              <div className="font-medium">Add New Website</div>
              <div className="text-sm opacity-90">Start tracking a new booking form</div>
            </Link>
            <button className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 text-left">
              <div className="font-medium">Create Campaign</div>
              <div className="text-sm opacity-90">Set up automated recovery messages</div>
            </button>
            <button className="bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 text-left">
              <div className="font-medium">View Analytics</div>
              <div className="text-sm opacity-90">Detailed performance reports</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Booking abandoned</p>
                  <p className="text-sm text-gray-500">john@example.com • 2 minutes ago</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Abandoned
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Recovery email sent</p>
                  <p className="text-sm text-gray-500">sarah@example.com • 15 minutes ago</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Email Sent
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Booking recovered</p>
                  <p className="text-sm text-gray-500">mike@example.com • 1 hour ago</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Recovered
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
