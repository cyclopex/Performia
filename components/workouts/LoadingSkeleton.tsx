export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sport p-6 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Header con titolo e tipo */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              
              {/* Descrizione */}
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              
              {/* Dettagli */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              
              {/* Note */}
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            
            {/* Azioni */}
            <div className="flex space-x-2 ml-4">
              <div className="w-10 h-10 bg-gray-200 rounded"></div>
              <div className="w-10 h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
