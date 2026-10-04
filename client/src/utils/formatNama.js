/**
 * Kapital huruf depan untuk nama orang/siswa.
 * "budi santoso" -> "Budi Santoso"
 * "muhammad al-fatih" -> "Muhammad Al-Fatih" (kapital juga setelah tanda hubung/apostrof)
 * Dipakai saat menampilkan nama (menyembuhkan data lama yang hurufnya berantakan)
 * dan saat menyimpan form agar data baru selalu rapi.
 */
export const formatNama = (nama) => {
  const v = String(nama ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
  if (!v) return ''
  return v.replace(/(^|[\s\-'])(\p{L})/gu, (_m, p, c) => p + c.toUpperCase())
}

export default formatNama
