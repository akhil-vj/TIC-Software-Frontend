import React from 'react'

export const FormSection = ({children,className='',bg='f5f5f5'}) => {
  return (
    <div className='col-12'>
        <div className={`row form-section ${className}`} style={{backgroundColor:bg}}>{children}</div>
    </div>
  )
}
