/**
 * Format date to Indonesian format
 */
export const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return d.toLocaleDateString('id-ID', options)
}

/**
 * Format time
 */
export const formatTime = (time) => {
  if (!time) return '-'
  return time.substring(0, 5)
}

/**
 * Format datetime
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '-'
  const d = new Date(datetime)
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return d.toLocaleDateString('id-ID', options)
}

/**
 * Get day name in Indonesian
 */
export const getDayName = (dayIndex) => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  return days[dayIndex] || '-'
}

/**
 * Get month name in Indonesian
 */
export const getMonthName = (monthIndex) => {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]
  return months[monthIndex] || '-'
}

/**
 * Validate email
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  const re = /^(\+62|0)[0-9]{9,12}$/
  return re.test(phone)
}

/**
 * Generate UUID
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Truncate text
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '-'
  return text.length > length ? text.substring(0, length) + '...' : text
}

/**
 * Capitalize first letter
 */
export const capitalize = (text) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Convert to title case
 */
export const toTitleCase = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    hadir: 'bg-green-100 text-green-800',
    sakit: 'bg-yellow-100 text-yellow-800',
    izin: 'bg-blue-100 text-blue-800',
    alfa: 'bg-red-100 text-red-800',
    aktif: 'bg-green-100 text-green-800',
    nonaktif: 'bg-gray-100 text-gray-800',
    selesai: 'bg-green-100 text-green-800',
    proses: 'bg-blue-100 text-blue-800',
    belum: 'bg-yellow-100 text-yellow-800',
  }
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

/**
 * Get grade label
 */
export const getGradeLabel = (score) => {
  if (score >= 85) return 'A'
  if (score >= 75) return 'B'
  if (score >= 65) return 'C'
  if (score >= 55) return 'D'
  return 'E'
}

/**
 * Calculate average
 */
export const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0
  const sum = numbers.reduce((a, b) => a + b, 0)
  return (sum / numbers.length).toFixed(2)
}

/**
 * Sort array by property
 */
export const sortBy = (array, property, ascending = true) => {
  return [...array].sort((a, b) => {
    if (a[property] < b[property]) return ascending ? -1 : 1
    if (a[property] > b[property]) return ascending ? 1 : -1
    return 0
  })
}

/**
 * Filter array by property
 */
export const filterBy = (array, property, value) => {
  return array.filter((item) => item[property] === value)
}

/**
 * Group array by property
 */
export const groupBy = (array, property) => {
  return array.reduce((groups, item) => {
    const key = item[property]
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {})
}

/**
 * Debounce function
 */
export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

