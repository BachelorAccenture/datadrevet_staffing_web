import { useEffect, useRef, useState } from 'react'
import NeoVis, { type NeovisConfig } from 'neovis.js'
import './graphPage.css'

// NEW: Predefined Cypher queries for quick exploration
const QUERIES = [
    {
        label: 'Hele grafen (begrenset)',
        cypher: 'MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 150',
    },
    {
        label: 'Konsulenter → Kompetanse',
        cypher: 'MATCH (c:Consultant)-[r:HAS_SKILL]->(s:Skill) RETURN c, r, s LIMIT 150',
    },
    {
        label: 'Konsulenter → Prosjekter',
        cypher: 'MATCH (c:Consultant)-[r:ASSIGNED_TO]->(p:Project) RETURN c, r, p LIMIT 150',
    },
    {
        label: 'Prosjekter → Bedrifter',
        cypher: 'MATCH (p:Project)-[r:OWNED_BY]->(co:Company) RETURN p, r, co',
    },
    {
        label: 'Prosjekter → Krav',
        cypher: 'MATCH (p:Project)-[r:REQUIRES_SKILL]->(s:Skill) RETURN p, r, s',
    },
    {
        label: 'Ledige konsulenter',
        cypher: `MATCH (c:Consultant)
                 WHERE c.availability = true
                 OPTIONAL MATCH (c)-[r:HAS_SKILL]->(s:Skill)
                 RETURN c, r, s LIMIT 100`,
    },
]

const GraphPage = () => {
    const vizRef = useRef<HTMLDivElement>(null)
    const vizInstance = useRef<NeoVis | null>(null)
    const [selectedQuery, setSelectedQuery] = useState(0)
    const [customCypher, setCustomCypher] = useState('')
    const [isCustom, setIsCustom] = useState(false)

    // NEW: Build neovis config and render graph
    const renderGraph = (cypher: string) => {
        if (!vizRef.current) return

        // Clean up previous instance
        if (vizInstance.current) {
            vizInstance.current.clearNetwork()
        }

        const config: NeovisConfig = {
            containerId: vizRef.current.id,
            neo4j: {
                serverUrl: 'bolt://localhost:7687',
                serverUser: 'neo4j',
                serverPassword: 'password',
            },
            visConfig: {
                nodes: {
                    shape: 'dot',
                    font: { size: 12, color: '#333' },
                    borderWidth: 2,
                },
                edges: {
                    arrows: { to: { enabled: true } },
                    font: { size: 9, align: 'middle' },
                    color: { color: '#999' },
                },
                physics: {
                    barnesHut: {
                        gravitationalConstant: -8000,
                        springLength: 150,
                    },
                },
                interaction: {
                    hover: true,
                    tooltipDelay: 200,
                },
            },
            // REMOVE the old labels config and REPLACE with:
            labels: {
                Consultant: {
                    label: 'name',
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        function: {
                            label: (node: any) => node.properties.name,
                        },
                        static: {
                            color: { background: '#A100FF', border: '#7B00BF' },
                            font: { color: '#333', size: 14 },
                            shape: 'dot',
                            size: 20,
                        },
                    },
                },
                Skill: {
                    label: 'name',
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        function: {
                            label: (node: any) => node.properties.name,
                        },
                        static: {
                            color: { background: '#4CAF50', border: '#388E3C' },
                            font: { color: '#333', size: 14 },
                            shape: 'dot',
                            size: 15,
                        },
                    },
                },
                Project: {
                    label: 'name',
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        function: {
                            label: (node: any) => node.properties.name,
                        },
                        static: {
                            color: { background: '#2196F3', border: '#1565C0' },
                            font: { color: '#333', size: 14 },
                            shape: 'dot',
                            size: 20,
                        },
                    },
                },
                Company: {
                    label: 'name',
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        function: {
                            label: (node: any) => node.properties.name,
                        },
                        static: {
                            color: { background: '#FF9800', border: '#E65100' },
                            font: { color: '#333', size: 14 },
                            shape: 'dot',
                            size: 20,
                        },
                    },
                },
            },
            relationships: {
                HAS_SKILL: {},
                ASSIGNED_TO: {},
                OWNED_BY: {},
                REQUIRES_SKILL: {},
            },
            initialCypher: cypher,
        }

        const viz = new NeoVis(config)
        viz.render()
        vizInstance.current = viz
    }

    // NEW: Render on mount and when query changes
    useEffect(() => {
        const cypher = isCustom ? customCypher : QUERIES[selectedQuery].cypher
        if (cypher.trim()) {
            renderGraph(cypher)
        }
        return () => {
            if (vizInstance.current) {
                vizInstance.current.clearNetwork()
            }
        }
    }, [])

    const handleRunQuery = () => {
        const cypher = isCustom ? customCypher : QUERIES[selectedQuery].cypher
        if (cypher.trim()) {
            renderGraph(cypher)
        }
    }

    return (
        <>
            <div className="header">
                <h1>Graph Explorer</h1>
            </div>

            {/* NEW: Query controls */}
            <div className="graph-controls">
                <div className="graph-controls-row">
                    <div className="query-selector">
                        <label>
                            <input
                                type="radio"
                                checked={!isCustom}
                                onChange={() => setIsCustom(false)}
                            />
                            Forhåndsdefinert
                        </label>
                        <select
                            value={selectedQuery}
                            onChange={(e) => setSelectedQuery(Number(e.target.value))}
                            disabled={isCustom}
                        >
                            {QUERIES.map((q, i) => (
                                <option key={i} value={i}>{q.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="query-selector">
                        <label>
                            <input
                                type="radio"
                                checked={isCustom}
                                onChange={() => setIsCustom(true)}
                            />
                            Egendefinert Cypher
                        </label>
                        <input
                            type="text"
                            placeholder="MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 50"
                            value={customCypher}
                            onChange={(e) => setCustomCypher(e.target.value)}
                            disabled={!isCustom}
                            className="cypher-input"
                        />
                    </div>

                    <button className="run-button" onClick={handleRunQuery}>
                        Kjør
                    </button>
                </div>

                {/* NEW: Legend */}
                <div className="graph-legend">
                    <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#A100FF' }} /> Konsulent</span>
                    <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#4CAF50' }} /> Kompetanse</span>
                    <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#2196F3' }} /> Prosjekt</span>
                    <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#FF9800' }} /> Bedrift</span>
                </div>
            </div>

            {/* NEW: Graph container */}
            <div className="graph-wrapper">
                <div id="neo4j-viz" ref={vizRef} className="graph-canvas" />
            </div>
        </>
    )
}

export default GraphPage