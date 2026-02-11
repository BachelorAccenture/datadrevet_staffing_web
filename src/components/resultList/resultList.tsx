import { useState } from 'react'
import type { Consultant } from '../../types/consultant'
import './resultList.css'

interface ResultListProps {
    /** 
     * BACKEND: Denne listen vil komme fra API-responsen
     * istedenfor å bli sendt som prop fra mock data.
     */
    resultater: Consultant[]
}

const ResultList = ({ resultater }: ResultListProps) => {
    const [expandedId, setExpandedId] = useState<number | null>(null)

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id)
    }

    if (resultater.length === 0) {
        return (
            <div className='result-container'>
                <h3>Resultater</h3>
                <p className='no-results'>Ingen konsulenter matcher søket ditt.</p>
            </div>
        )
    }

    return (
        <div className='result-container'>
            <h3>Resultater ({resultater.length} konsulenter)</h3>
            <div className='result-list'>
                {resultater.map(konsulent => (
                    <div key={konsulent.id} className={`result-card ${expandedId === konsulent.id ? 'expanded' : ''}`}>
                        <div className='result-card-summary' onClick={() => toggleExpand(konsulent.id)}>
                            <div className='summary-info'>
                                <h4>{konsulent.navn}</h4>
                                <span className='result-email'>{konsulent.epost}</span>
                            </div>
                            <span className='expand-icon'>{expandedId === konsulent.id ? '▲' : '▼'}</span>
                        </div>

                        {expandedId === konsulent.id && (
                            <div className='result-card-details'>
                                <div className='details-grid'>
                                    <div className='details-left'>
                                        <div className='result-tags'>
                                            <span className='detail-label'>Tidligere prosjekter:</span>
                                            <div className='tag-list'>
                                                {konsulent.tidligereProsjekter.map(p => (
                                                    <span key={p.navn} className='project-bubble'>
                                                        <span className='project-name'>{p.navn}</span>
                                                        <span className='project-rolle'>{p.rolle} ({p.periode})</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='details-right'>
                                        <div className='result-tags'>
                                            <span className='detail-label'>Kompetanse:</span>
                                            <div className='tag-list'>
                                                {konsulent.kompetanse.map(k => (
                                                    <span key={k} className='tag'>{k}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ResultList
