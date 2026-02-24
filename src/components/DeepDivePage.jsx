import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CompanyCard from './CompanyCard'

export default function DeepDivePage({ onViewCard }) {
  const { corpCode } = useParams()
  const navigate = useNavigate()

  return (
    <CompanyCard
      corpCode={corpCode || null}
      onBack={() => navigate('/deep-dive')}
      onViewCard={onViewCard}
    />
  )
}
