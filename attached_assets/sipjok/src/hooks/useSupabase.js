import { useState, useCallback } from 'react'
import supabase from '../config/supabase'

/**
 * Custom hook for Supabase database operations
 * Provides methods for CRUD operations with error handling
 */
export const useSupabase = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const clearError = useCallback(() => setError(null), [])

  /**
   * Fetch data from a table
   */
  const fetchData = useCallback(async (table, options = {}) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase.from(table).select(options.select || '*')

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending !== false,
        })
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error: err } = await query

      if (err) throw err
      return data
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch data'
      setError(errorMessage)
      console.error('Supabase fetch error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Insert data into a table
   */
  const insertData = useCallback(async (table, data) => {
    setLoading(true)
    setError(null)
    try {
      const { data: result, error: err } = await supabase
        .from(table)
        .insert([data])
        .select()

      if (err) throw err
      return result?.[0]
    } catch (err) {
      const errorMessage = err.message || 'Failed to insert data'
      setError(errorMessage)
      console.error('Supabase insert error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update data in a table
   */
  const updateData = useCallback(async (table, id, data) => {
    setLoading(true)
    setError(null)
    try {
      const { data: result, error: err } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()

      if (err) throw err
      return result?.[0]
    } catch (err) {
      const errorMessage = err.message || 'Failed to update data'
      setError(errorMessage)
      console.error('Supabase update error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete data from a table
   */
  const deleteData = useCallback(async (table, id) => {
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (err) throw err
      return true
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete data'
      setError(errorMessage)
      console.error('Supabase delete error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Execute a raw query
   */
  const query = useCallback(async (table, options = {}) => {
    return fetchData(table, options)
  }, [fetchData])

  return {
    loading,
    error,
    clearError,
    fetchData,
    insertData,
    updateData,
    deleteData,
    query,
  }
}

export default useSupabase

