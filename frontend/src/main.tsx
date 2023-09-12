import React from 'react'
import ReactDOM from 'react-dom/client'
import Game from './game'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Game width={1200} height={700} className='canvasGame' />
  </React.StrictMode>,
)
