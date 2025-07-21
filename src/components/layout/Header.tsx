import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Menu, User, LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'

interface HeaderProps {
  onAuthClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onAuthClick }) => {
  const { user, signOut, loading, signOutLoading } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    return () => {
      // Clean up any pending timeouts when component unmounts
      if (isSigningOut) {
        setIsSigningOut(false)
      }
    }
  }, [isSigningOut])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-1.5">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CoverClarity</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Pricing
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            ) : user ? (
              <AnimatePresence mode="wait">
                {isSigningOut || signOutLoading ? (
                  <motion.div
                    key="signing-out"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing out...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="user-info"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="flex items-center space-x-2">
                      <User size={20} className="text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {user.user_metadata?.full_name || user.email}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="flex items-center space-x-1 transition-all duration-200 hover:bg-gray-100"
                      disabled={isSigningOut || signOutLoading}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <>
                <Button variant="ghost" onClick={onAuthClick}>
                  Sign In
                </Button>
                <Button onClick={onAuthClick}>
                  Get Started
                </Button>
              </>
            )}
            
            <button className="md:hidden">
              <Menu size={24} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}