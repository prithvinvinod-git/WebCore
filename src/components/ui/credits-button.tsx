"use client"
import './credits-button.css'

export default function CreditsButton({ children }: { children?: React.ReactNode }) {
  return (
    <button type="button" className="credits-button">
      <span className="credits-fold" />
      <div className="credits-points-wrapper">
        {Array.from({ length: 10 }).map((_, i) => (
          <i key={i} className="credits-point" />
        ))}
      </div>
      <span className="credits-inner">
        <svg className="credits-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
          <polyline points="13.18 1.37 13.18 9.64 21.45 9.64 10.82 22.63 10.82 14.36 2.55 14.36 13.18 1.37" />
        </svg>
        {children}
      </span>
    </button>
  )
}
