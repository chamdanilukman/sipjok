import React from 'react'

/**
 * Reusable form section component
 * Provides consistent styling for form sections across the wizard
 */
export const FormSection = ({ title, description, children, className = '' }) => {
  return (
    <div className={`mb-6 rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="border-b border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default FormSection

