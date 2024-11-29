import React from 'react'

function TestPage() {
  console.log('TestPage component rendered') // Debug log
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-500 mb-4">Test Page</h1>
        <p className="text-lg">If you can see this, the routing is working!</p>
      </div>
    </div>
  )
}

export default TestPage