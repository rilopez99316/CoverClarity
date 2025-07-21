import React from 'react'
import { motion } from 'framer-motion'
import { Shield, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../contexts/AuthContext'

interface HeroProps {
  onAuthClick: () => void
}

export const Hero: React.FC<HeroProps> = ({ onAuthClick }) => {
  const { user } = useAuth()

  const benefits = [
    'Track all policies & warranties in one place',
    'AI-powered coverage recommendations',
    'Instant claim portal access',
    'Coverage health score & gap analysis'
  ]

  return (
    <section className="relative pt-20 pb-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-2xl animate-bounce-gentle" />
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-32 left-10 w-24 h-24 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-60 animate-bounce-gentle" />
      <div className="absolute bottom-32 right-10 w-36 h-36 bg-gradient-to-br from-indigo-200 to-purple-300 rounded-full opacity-40 animate-bounce-gentle" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-cyan-200 to-teal-300 rounded-full opacity-50 animate-bounce-gentle" style={{ animationDelay: '0.5s' }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm border border-blue-200/50"
              >
                <Shield size={16} />
                <span>Your Protection, Simplified</span>
              </motion.div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Understand your{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">coverage.</span>
                <br />
                Protect what{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">matters.</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed font-medium">
                All your insurance policies and warranties in one intelligent dashboard. 
                Get AI-powered insights, coverage recommendations, and never miss a claim again.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center space-x-4 bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/50"
                >
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-1">
                    <CheckCircle size={18} className="text-white flex-shrink-0" />
                  </div>
                  <span className="text-gray-800 font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {!user && (
                <Button
                  size="lg"
                  onClick={onAuthClick}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <span>Start Free Today</span>
                  <ArrowRight size={20} />
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 border-2 border-gray-300 hover:border-blue-400 bg-white/80 backdrop-blur-sm hover:bg-blue-50 transition-all duration-300"
              >
                <span>Watch Demo</span>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center space-x-8 text-sm text-gray-600"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                <span className="font-medium">Free forever plan</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span className="font-medium">No credit card required</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Coverage Health Score</h3>
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    85/100
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Auto Insurance</span>
                    <div className="w-28 bg-gray-200 rounded-full h-3 shadow-inner">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full w-24 shadow-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Renters Insurance</span>
                    <div className="w-28 bg-gray-200 rounded-full h-3 shadow-inner">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full w-20 shadow-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Phone Warranty</span>
                    <div className="w-28 bg-gray-200 rounded-full h-3 shadow-inner">
                      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-3 rounded-full w-20 shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100/50 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full p-2">
                      <Shield size={16} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900">AI Recommendation</h4>
                      <p className="text-sm text-blue-800 mt-1 font-medium">
                        Consider increasing your renters insurance liability coverage to $300K
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl p-4 border border-white/50"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-700 font-semibold">Policy expires in 30 days</span>
              </div>
            </motion.div>
            
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl p-3 border border-white/50"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-700 font-semibold">$2,400 saved this year</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}