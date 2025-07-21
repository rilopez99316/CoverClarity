import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Eye, FileText, Image } from 'lucide-react'
import { Button } from './Button'

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  documentUrl: string
  documentName: string
  documentType?: string
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  onClose,
  documentUrl,
  documentName,
  documentType
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const isPDF = documentType?.toLowerCase().includes('pdf') || documentUrl.toLowerCase().includes('.pdf')
  const isImage = documentType?.toLowerCase().includes('image') || 
                  /\.(jpg|jpeg|png|gif|webp)$/i.test(documentUrl)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = documentUrl
    link.download = documentName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleLoad = () => {
    setLoading(false)
    setError(false)
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  {isPDF ? (
                    <FileText className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Image className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{documentName}</h3>
                  <p className="text-sm text-gray-500">
                    {isPDF ? 'PDF Document' : isImage ? 'Image' : 'Document'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download</span>
                </Button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="relative h-[calc(90vh-80px)] bg-gray-50">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Unable to preview document
                    </h3>
                    <p className="text-gray-600 mb-4">
                      The document format is not supported for preview
                    </p>
                    <Button onClick={handleDownload} className="flex items-center space-x-2">
                      <Download size={16} />
                      <span>Download to View</span>
                    </Button>
                  </div>
                </div>
              )}

              {isPDF && !error && (
                <iframe
                  src={`${documentUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-full border-0"
                  onLoad={handleLoad}
                  onError={handleError}
                  title={documentName}
                />
              )}

              {isImage && !error && (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={documentUrl}
                    alt={documentName}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    onLoad={handleLoad}
                    onError={handleError}
                  />
                </div>
              )}

              {!isPDF && !isImage && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Document Preview
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Click download to view this document
                    </p>
                    <Button onClick={handleDownload} className="flex items-center space-x-2">
                      <Download size={16} />
                      <span>Download Document</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}