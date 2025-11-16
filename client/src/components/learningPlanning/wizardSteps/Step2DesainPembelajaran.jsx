import React from 'react'
import FormSection from '../FormSection'

/**
 * Step 2: Desain Pembelajaran
 * Learning design including pedagogical practices, partnerships, environment, and digital tools
 */
export const Step2DesainPembelajaran = ({ formData, onChange }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target
    onChange({ [name]: value })
  }

  const handleDigitalToolToggle = (tool) => {
    const newTools = formData.digital_tools.includes(tool)
      ? formData.digital_tools.filter((t) => t !== tool)
      : [...formData.digital_tools, tool]
    onChange({ digital_tools: newTools })
  }

  const praktikOptions = [
    { value: 'inquiry', label: 'Pembelajaran Berbasis Inkuiri', icon: 'fas fa-search' },
    { value: 'project', label: 'Pembelajaran Berbasis Proyek', icon: 'fas fa-project-diagram' },
    { value: 'problem', label: 'Pembelajaran Berbasis Masalah', icon: 'fas fa-lightbulb' },
    { value: 'discovery', label: 'Pembelajaran Penemuan', icon: 'fas fa-compass' },
    { value: 'cooperative', label: 'Pembelajaran Kooperatif', icon: 'fas fa-users' },
    { value: 'differentiated', label: 'Pembelajaran Berdiferensiasi', icon: 'fas fa-layer-group' },
  ]

  const digitalToolOptions = [
    { value: 'video', label: 'Video Pembelajaran', icon: 'fas fa-video' },
    { value: 'presentation', label: 'Presentasi Digital', icon: 'fas fa-presentation' },
    { value: 'quiz', label: 'Kuis Online', icon: 'fas fa-question-circle' },
    { value: 'simulation', label: 'Simulasi/Game', icon: 'fas fa-gamepad' },
    { value: 'lms', label: 'Learning Management System', icon: 'fas fa-chalkboard' },
    { value: 'collaboration', label: 'Tools Kolaborasi', icon: 'fas fa-comments' },
  ]

  return (
    <div className="space-y-6">
      {/* Praktik Pedagogis */}
      <FormSection
        title="Praktik Pedagogis"
        description="Pilih pendekatan pembelajaran yang akan digunakan"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {praktikOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                formData.praktik_pedagogis === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <input
                type="radio"
                name="praktik_pedagogis"
                value={option.value}
                checked={formData.praktik_pedagogis === option.value}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <i className={`${option.icon} text-blue-600`}></i>
                <span className="text-sm font-medium text-gray-900">{option.label}</span>
              </div>
            </label>
          ))}
        </div>
      </FormSection>

      {/* Kemitraan Pembelajaran */}
      <FormSection
        title="Kemitraan Pembelajaran"
        description="Jelaskan kemitraan atau kolaborasi dalam pembelajaran"
      >
        <textarea
          name="kemitraan"
          value={formData.kemitraan}
          onChange={handleInputChange}
          rows="4"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Contoh: Kolaborasi dengan guru kelas, orang tua, atau komunitas olahraga..."
        ></textarea>
        <p className="mt-2 text-xs text-gray-500">
          Opsional: Jelaskan jika ada kemitraan dengan pihak lain dalam pembelajaran
        </p>
      </FormSection>

      {/* Lingkungan Pembelajaran */}
      <FormSection
        title="Lingkungan Pembelajaran"
        description="Deskripsi setting dan lingkungan pembelajaran"
      >
        <textarea
          name="lingkungan_pembelajaran"
          value={formData.lingkungan_pembelajaran}
          onChange={handleInputChange}
          rows="4"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Contoh: Lapangan sekolah, ruang olahraga, halaman kelas..."
        ></textarea>
        <p className="mt-2 text-xs text-gray-500">
          Jelaskan di mana pembelajaran akan berlangsung dan bagaimana setting lingkungannya
        </p>
      </FormSection>

      {/* Digital Tools */}
      <FormSection
        title="Digital Tools"
        description="Pilih alat digital yang akan digunakan (opsional)"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {digitalToolOptions.map((tool) => (
            <label
              key={tool.value}
              className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                formData.digital_tools.includes(tool.value)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.digital_tools.includes(tool.value)}
                onChange={() => handleDigitalToolToggle(tool.value)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <i className={`${tool.icon} text-blue-600`}></i>
                <span className="text-sm text-gray-700">{tool.label}</span>
              </div>
            </label>
          ))}
        </div>
      </FormSection>
    </div>
  )
}

export default Step2DesainPembelajaran

