import React from 'react'

export const Placeholder = ({ title, description, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <i className={`${icon} text-blue-600 text-4xl`}></i>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
      <p className="text-gray-500 max-w-md">{description}</p>
      <div className="mt-8 px-6 py-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-700">
          <i className="fas fa-tools mr-2"></i>
          Fitur ini sedang dalam pengembangan
        </p>
      </div>
    </div>
  )
}

export default Placeholder
