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

  // Detail view — two-column layout
  return (
    <>
      <div className="deep-dive-layout">
        <div className="deep-dive-card">
          <CompanyCard
            corpCode={corpCode}
            onBack={() => navigate('/deep-dive')}
            onViewCard={onViewCard}
          />
        </div>
        <div className="deep-dive-chat">
          <ChatPanel corpName={corpName} />
        </div>
      </div>

      <style>{`
        .deep-dive-layout {
          display: flex;
          gap: 20px;
          padding: 0 16px;
          max-width: 1600px;
          margin: 0 auto;
          align-items: flex-start;
        }
        .deep-dive-card {
          flex: 2;
          min-width: 0;
        }
        .deep-dive-chat {
          flex: 1;
          min-width: 0;
          position: sticky;
          top: 80px;
        }
        @media (max-width: 768px) {
          .deep-dive-layout {
            flex-direction: column;
          }
          .deep-dive-card,
          .deep-dive-chat {
            flex: none;
            width: 100%;
            position: static;
          }
        }
      `}</style>
    </>
  )
}
