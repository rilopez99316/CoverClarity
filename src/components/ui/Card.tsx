import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false 
}) => {
  const Component = hover ? motion.div : 'div'
  const motionProps = hover ? {
    whileHover: { y: -4, shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
    transition: { duration: 0.2 }
  } : {}

  return (
    <Component
      className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}
      {...motionProps}
    >
      {children}
    </Component>
  )
}