"use client"
import { useState, useEffect } from "react"
import "./splash-loader.css"

export default function SplashLoader({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {show && (
        <div className="splash-overlay">
          <div className="splash-content">
            <h1 className="splash-title">WebCore</h1>
          </div>
        </div>
      )}
      {children}
    </>
  )
}
