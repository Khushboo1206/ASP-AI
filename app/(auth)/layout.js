import React from 'react'

const AuthLayout = ({children}) => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>{children}</div>
  )
}

export default AuthLayout 