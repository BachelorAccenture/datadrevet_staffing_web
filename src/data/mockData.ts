import type { Consultant } from '../types/consultant'

/**
 * BACKEND: Denne filen skal FJERNES når backend er klar.
 * Erstatt alle imports av mockKonsulenter med et API-kall.
 * 
 * Eksempel på fremtidig erstatning i searchPage.tsx:
 * 
 *   const response = await fetch('/api/konsulenter/search', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({
 *           kompetanse: kompetanseList,
 *           tidFra, tidTil, ledighet,
 *           onskerABytte, tidligereErfaring: erfaringList, rolle: rolleList
 *       })
 *   })
 *   const resultater: Konsulent[] = await response.json()
 */

export const mockKonsulenter: Consultant[] = [
    {
        id: 1,
        navn: 'Ola Nordmann',
        epost: 'ola.nordmann@accenture.com',
        kompetanse: ['React', 'TypeScript', 'Azure'],
        tidligereProsjekter: [
            { navn: 'DNB Nettbank Redesign', rolle: 'Frontend', periode: '2021-2023' },
            { navn: 'Equinor Dashboard', rolle: 'Frontend', periode: '2019-2021' }
        ],
        ledighet: 'ledig',
        onskerABytte: false
    },
    {
        id: 2,
        navn: 'Kari Hansen',
        epost: 'kari.hansen@accenture.com',
        kompetanse: ['Java', 'SQL', 'AWS'],
        tidligereProsjekter: [
            { navn: 'NAV Modernisering', rolle: 'Backend', periode: '2022-2024' },
            { navn: 'Telenor API Gateway', rolle: 'Tech Lead', periode: '2020-2022' }
        ],
        ledighet: 'ledig',
        onskerABytte: true
    },
    {
        id: 3,
        navn: 'Erik Johansen',
        epost: 'erik.johansen@accenture.com',
        kompetanse: ['React', 'Java', 'TypeScript', 'SQL'],
        tidligereProsjekter: [
            { navn: 'Statoil Intern Portal', rolle: 'Fullstack', periode: '2020-2022' },
            { navn: 'Posten Sporingsapp', rolle: 'Frontend', periode: '2018-2020' }
        ],
        ledighet: 'ikke-ledig',
        onskerABytte: false
    },
    {
        id: 4,
        navn: 'Lise Berg',
        epost: 'lise.berg@accenture.com',
        kompetanse: ['Python', 'AWS', 'SQL'],
        tidligereProsjekter: [
            { navn: 'Finn.no ML Pipeline', rolle: 'Backend', periode: '2023-2025' },
            { navn: 'Vipps Fraud Detection', rolle: 'DevOps', periode: '2021-2023' }
        ],
        ledighet: 'ledig',
        onskerABytte: true
    },
    {
        id: 5,
        navn: 'Anders Vik',
        epost: 'anders.vik@accenture.com',
        kompetanse: ['TypeScript', 'React', 'JavaScript'],
        tidligereProsjekter: [
            { navn: 'Elkjøp Nettbutikk', rolle: 'Frontend', periode: '2022-2024' },
            { navn: 'Ruter Reiseplanlegger', rolle: 'Fullstack', periode: '2020-2022' }
        ],
        ledighet: 'ledig',
        onskerABytte: false
    },
    {
        id: 6,
        navn: 'Marte Solheim',
        epost: 'marte.solheim@accenture.com',
        kompetanse: ['Java', 'Azure', 'C#'],
        tidligereProsjekter: [
            { navn: 'Skatteetaten Digital', rolle: 'DevOps', periode: '2021-2023' },
            { navn: 'Helse Norge Portal', rolle: 'Backend', periode: '2019-2021' }
        ],
        ledighet: 'ikke-ledig',
        onskerABytte: true
    }
]
