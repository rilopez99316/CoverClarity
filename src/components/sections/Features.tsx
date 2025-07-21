import React from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Brain, 
  Calculator, 
  Users, 
  ExternalLink, 
  MessageCircle,
  FileText,
  TrendingUp,
  Zap
} from 'lucide-react'
import { Card } from '../ui/Card'

const features = [
  {
    icon: FileText,
    title: 'Combined Insurance & Warranties',
    description: 'Manage all insurance policies alongside product, manufacturer, and credit card warranties in one centralized dashboard.',
    color: 'bg-blue-500'
  },
  {
    icon: Brain,
    title: 'AI-Powered Coverage Guidance',
    description: 'Get personalized suggestions on which coverages to adjust, drop, or add based on your unique needs and lifestyle.',
    color: 'bg-purple-500'
  },
  {
    icon: Calculator,
    title: 'Scenario Simulation',
    description: 'Run "what if" scenarios to see who pays, what\'s covered, and your out-of-pocket costs before incidents happen.',
    color: 'bg-green-500'
  },
  {
    icon: TrendingUp,
    title: 'Coverage Health Score',
    description: 'Instantly see how well you\'re protected with a simple score based on gaps, overlaps, and deductible alignment.',
    color: 'bg-orange-500'
  },
  {
    icon: Users,
    title: 'Shared Coverage Mode',
    description: 'Collaborate with your spouse, roommate, or family to co-manage shared insurance policies and warranties.',
    color: 'bg-pink-500'
  },
  {
    icon: ExternalLink,
    title: 'Quick Claim Access',
    description: 'Instantly access insurer and warranty provider portals to start claims without hunting for the right website.',
    color: 'bg-indigo-500'
  },
  {
    icon: MessageCircle,
    title: 'AI Coach "Clara"',
    description: 'Ask questions like "Am I covered if...?" and get clear, personalized guidance using AI and your coverage data.',
    color: 'bg-teal-500'
  },
  {
    icon: Zap,
    title: 'Smart Notifications',
    description: 'Never miss renewals, claim deadlines, or coverage opportunities with intelligent alerts and reminders.',
    color: 'bg-yellow-500'
  }
]

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to protect what matters
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            CoverClarity brings together all your protection needs in one intelligent platform, 
            powered by AI to help you make smarter coverage decisions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="p-6 h-full">
                <div className="space-y-4">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center`}>
                    <feature.icon size={24} className="text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}