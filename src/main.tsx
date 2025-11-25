import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // Optional: Create this if you have global styles, otherwise remove this line

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)