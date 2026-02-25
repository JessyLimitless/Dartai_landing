import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CompanyCard from './CompanyCard'
import ChatPanel from './ChatPanel'
import { useCompanyCard } from '../hooks/useCompanyCard'

export default function DeepDivePage({ onViewCard }) {
  const { corpCode } = useParams()
  const navigate = useNavigate()
  const { card } = useCompanyCard(corpCode)

  const corpName = card?.card_data?.header?.corp_name || ''

  // List view — no corpCode
  if (!corpCode) {
    return (
      <CompanyCard
        corpCode={null}
        onBack={() => navigate('/deep-dive')}
        onViewCard={onViewCard}
      />
    )
  }

  // Detail view — CompanyCard only
  // Phase D: ChatPanel은 Gemini 백엔드 연동 후 2컬럼 레이아웃으로 복원 예정
  return (
    <CompanyCard
      corpCode={corpCode}
      onBack={() => navigate('/deep-dive')}
      onViewCard={onViewCard}
    />
  )
}
