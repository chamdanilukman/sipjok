import React from 'react'

export const Placeholder = ({ title, description, icon }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <i className={`${icon} text-6xl text-blue-600 mb-4`}></i>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">Fitur ini sedang dalam pengembangan</p>
        <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <i className="fas fa-info-circle mr-2"></i>
            Kembali ke dashboard untuk melihat fitur yang tersedia
          </p>
        </div>
      </div>
    </div>
  )
}

export default Placeholder

