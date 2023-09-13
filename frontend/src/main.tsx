import React from 'react'
import ReactDOM from 'react-dom/client'
import Game from './game'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Game width={1000} height={550} className='canvasGame' />
  </React.StrictMode>,
)
