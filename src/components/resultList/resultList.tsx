import { useState } from 'react'
import type { Consultant } from '../../data/api'
import './resultList.css'

interface ResultListProps {
    results: Consultant[]
    highlightedSkills?: string[]
}

const ResultList = ({ results, highlightedSkills = [] }: ResultListProps) => {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id)
    }

    if (results.length === 0) {
        return (
            <div className='result-container'>
                <h3>Resultater</h3>
                <p className='no-results'>Ingen konsulenter matcher søket ditt.</p>
            </div>
        )
    }

    return (
        <div className='result-container'>
            <h3>Resultater ({results.length} konsulenter)</h3>
            <div className='result-list'>
                {results.map(consultant => (
                    <div key={consultant.id} className={`result-card ${expandedId === consultant.id ? 'expanded' : ''}`}>
                        <div className='result-card-summary' onClick={() => toggleExpand(consultant.id)}>

                            <div className='summary-name'>
                                <h4>{consultant.name}</h4>
                            </div>

                            <div className='summary-email'>
                                <span className='result-email'>{consultant.email}</span>
                            </div>

                            <div className='summary-tags'>
                                <span className={`tag tag--status ${consultant.availability ? 'tag--positive' : 'tag--negative'}`}>
                                    {consultant.availability ? 'Ledig' : 'Ikke ledig'}
                                </span>
                                <span className={`tag tag--status ${consultant.wantsNewProject ? 'tag--positive' : 'tag--negative'}`}>
                                    {consultant.wantsNewProject ? 'Vil ta nytt prosjekt' : 'Vil ikke ta nytt prosjekt'}
                                </span>
                            </div>
                            <span className='expand-icon'>{expandedId === consultant.id ? '▲' : '▼'}</span> 
                        </div>

                        {expandedId === consultant.id && (
                            <div className='result-card-details'>
                                <div className='details-grid'>
                                    <div className='details-left'>
                                        <div className='result-tags'>
                                            <span className='detail-label'>Prosjekter:</span>
                                            <div className='tag-list'>
                                                {consultant.projectAssignments?.map(assignment => (
                                                    <span key={assignment.projectId} className='project-bubble'>
                                                        <span className='project-name'>{assignment.projectName}</span>
                                                        <span className='project-rolle'>
                                                            {assignment.role} 
                                                            {assignment.isActive ? ' (Aktiv)' : ' (Tidligere)'}
                                                        </span>
                                                    </span>
                                                ))}  
                                            </div>
                                        </div>
                                    </div>
                                    <div className='details-right'>
                                        <div className='result-tags'>
                                            <span className='detail-label'>Kompetanse:</span>
                                            <div className='tag-list'>
                                                {consultant.skills?.map(skill => (
                                                    <span key={skill.skillId} className={`tag ${highlightedSkills.includes(skill.skillName) ? 'tag--highlighted' : ''}`}>
                                                        {skill.skillName} ({skill.skillYearsOfExperience} år)
                                                    </span>
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
