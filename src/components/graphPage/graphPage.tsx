import { useEffect, useRef, useState } from 'react'
import NeoVis, { type NeovisConfig } from 'neovis.js'
import './graphPage.css'


const QUERIES = [
    {
        label: 'Hele grafen (begrenset)',
        cypher: 'MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 150',
    },
    {
        label: 'Konsulenter → Kompetanse',
        cypher: 'MATCH (c:Consultant)-[r:HAS_SKILL]->(s:Skill) RETURN c, r, s',
    },
    {
        label: 'Konsulenter → Prosjekter',
        cypher: 'MATCH (c:Consultant)-[r:ASSIGNED_TO]->(p:Project) RETURN c, r, p',
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
    const [isCustom, setIsCustom] = useState(false)

    // Build neovis config and render graph
    const renderGraph = (cypher: string) => {
        if (!vizRef.current) return

        // Clean up previous instance
        if (vizInstance.current) {
            vizInstance.current.clearNetwork()
        }

        const config: NeovisConfig = {
            containerId: vizRef.current.id,
            neo4j: {
                serverUrl: `bolt://${window.location.hostname}:7687`,
                serverUser: 'neo4j',
                serverPassword: 'staffing123',
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
                        gravitationalConstant: -10000,
                        springLength: 100,
                        damping: 0.15,
                    },
                    stabilization: {
                        enabled: true,
                        iterations: 150,
                        updateInterval: 25,
                    },
                },
                interaction: {
                    hover: true,
                    tooltipDelay: 200,
                },
            },
            labels: {
                Consultant: {
                    label: 'name',
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        function: {
                            label: (node: { properties?: { name?: string } }) => node.properties?.name ?? '',
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
                            label: (node: { properties?: { name?: string } }) => node.properties?.name ?? '',
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
                            label: (node: { properties?: { name?: string } }) => node.properties?.name ?? '',
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
                            label: (node: { properties?: { name?: string } }) => node.properties?.name ?? '',
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

    useEffect(() => {
        const cypher = QUERIES[selectedQuery].cypher
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
        const cypher = QUERIES[selectedQuery].cypher
        if (cypher.trim()) {
            renderGraph(cypher)
        }
    }

    return (
        <>
            <div className="header">
                <h1>Graph Explorer</h1>
            </div>

            {}
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

                    <button className="run-button" onClick={handleRunQuery}>
                        Kjør
                    </button>
                </div>

                {}
                <div className="graph-legend">
                    <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#A100FF' }} /> Konsulent</span>
                    <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#4CAF50' }} /> Kompetanse</span>
                    <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#2196F3' }} /> Prosjekt</span>
                    <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#FF9800' }} /> Bedrift</span>
                </div>
            </div>

            {}
            <div className="graph-wrapper">
                <div id="neo4j-viz" ref={vizRef} className="graph-canvas" />
            </div>
        </>
    )
}

export default GraphPage