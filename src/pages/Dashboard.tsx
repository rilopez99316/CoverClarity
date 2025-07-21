import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useRecommendations } from '../utils/recommendations'
import { AddPolicyModal } from '../components/modals/AddPolicyModal'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

interface Policy {
  id: string
  title: string
  type: string
  provider: string
  status: string
  end_date: string | null
  premium: number | null
}

export const Dashboard: React.FC = () => {
  const { user, session } = useAuth()
  const { addRecommendation, fetchRecommendations } = useRecommendations()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && session) {
      fetchPolicies()
    }
  }, [user, session])

  const fetchPolicies = async () => {
    if (!user || !session) {
      setLoading(false)
      return
    }

    try {
      // Ensure we're using the authenticated session
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching policies:', error)
        throw error
      }
      setPolicies(data || [])
    } catch (error) {
      console.error('Error fetching policies:', error)
    } finally {
      setLoading(false)
    }
  }

  // Example function to create sample recommendations
  const createSampleRecommendations = async () => {
    if (!user) return

    const sampleRecommendations = [
      {
        type: 'coverage_gap',
        priority: 'high',
        title: 'Increase Liability Coverage',
        description: 'Consider increasing your renters insurance liability to $300K',
        action_type: 'increase_coverage',
        estimated_impact: 'Better protection against liability claims'
      },
      {
        type: 'renewal',
        priority: 'medium',
        title: 'Policy Renewal Due',
        description: 'Your phone warranty expires in 15 days',
        action_type: 'renew_policy',
        estimated_impact: 'Continued device protection'
      }
    ]

    for (const recommendation of sampleRecommendations) {
      await addRecommendation(recommendation)
    }
  }

  const coverageScore = 85
  const totalPremiums = policies.reduce((sum, policy) => sum + (policy.premium || 0), 0)
  const activePolicies = policies.filter(p => p.status === 'active').length
  const expiringPolicies = policies.filter(p => {
    if (!p.end_date) return false
    const endDate = new Date(p.end_date)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return endDate <= thirtyDaysFromNow
  }).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name || 'there'}!
          </h1>
          <p className="text-gray-600">
            Here's your coverage overview and recent activity
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Coverage Score</p>
                  <p className="text-3xl font-bold text-gray-900">{coverageScore}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${coverageScore}%` }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Policies</p>
                  <p className="text-3xl font-bold text-gray-900">{activePolicies}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Premiums</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${totalPremiums.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expiring Soon</p>
                  <p className="text-3xl font-bold text-gray-900">{expiringPolicies}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Policies List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Policies</h2>
                <Button 
                  size="sm" 
                  className="flex items-center space-x-2"
                  onClick={() => setShowAddPolicyModal(true)}
                >
                  <Plus size={16} />
                  <span>Add Policy</span>
                </Button>
              </div>

              {policies.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No policies yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start by adding your first insurance policy or warranty
                  </p>
                  <Button onClick={() => setShowAddPolicyModal(true)}>
                    Add Your First Policy
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {policies.map((policy) => (
                    <div
                      key={policy.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{policy.title}</h3>
                          <p className="text-sm text-gray-600">
                            {policy.provider} • {policy.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          policy.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {policy.status}
                        </div>
                        {policy.premium && (
                          <p className="text-sm text-gray-600 mt-1">
                            ${policy.premium}/month
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                AI Recommendations
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      Increase Liability Coverage
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Consider increasing your renters insurance liability to $300K
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      Great Auto Coverage
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Your auto insurance coverage looks comprehensive
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      Policy Renewal Due
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Your phone warranty expires in 15 days
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setShowAddPolicyModal(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Add New Policy
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText size={16} className="mr-2" />
                  Upload Documents
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar size={16} className="mr-2" />
                  Set Reminders
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        <AddPolicyModal
          isOpen={showAddPolicyModal}
          onClose={() => setShowAddPolicyModal(false)}
          onSuccess={fetchPolicies}
        />
      </div>
    </div>
  )
}