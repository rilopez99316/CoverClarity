import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export interface RecommendationData {
  type: string
  priority?: string
  title: string
  description: string
  action_type: string
  estimated_impact?: string
}

export const useRecommendations = () => {
  const { user } = useAuth()

  const addRecommendation = async (recommendationData: RecommendationData) => {
    if (!user) {
      console.error('User not authenticated. Cannot add recommendation.')
      // You might want to redirect to login or show an error message
      return { data: null, error: new Error('User not authenticated') }
    }

    try {
      const { data, error } = await supabase
        .from('coverage_recommendations')
        .insert({
          ...recommendationData,
          user_id: user.id, // <--- This is the crucial part: ensure user.id is used
        })

      if (error) {
        console.error('Error adding recommendation:', error)
        throw error
      }
      console.log('Recommendation added successfully:', data)
      return { data, error: null }
    } catch (err) {
      console.error('Failed to add recommendation:', err)
      return { data: null, error: err }
    }
  }

  const fetchRecommendations = async () => {
    if (!user) {
      console.error('User not authenticated. Cannot fetch recommendations.')
      return { data: null, error: new Error('User not authenticated') }
    }

    try {
      const { data, error } = await supabase
        .from('coverage_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching recommendations:', error)
        throw error
      }
      return { data, error: null }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
      return { data: null, error: err }
    }
  }

  const updateRecommendation = async (id: string, updates: Partial<RecommendationData & { is_dismissed?: boolean, is_completed?: boolean }>) => {
    if (!user) {
      console.error('User not authenticated. Cannot update recommendation.')
      return { data: null, error: new Error('User not authenticated') }
    }

    try {
      const { data, error } = await supabase
        .from('coverage_recommendations')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own recommendations

      if (error) {
        console.error('Error updating recommendation:', error)
        throw error
      }
      console.log('Recommendation updated successfully:', data)
      return { data, error: null }
    } catch (err) {
      console.error('Failed to update recommendation:', err)
      return { data: null, error: err }
    }
  }

  return {
    addRecommendation,
    fetchRecommendations,
    updateRecommendation
  }
}