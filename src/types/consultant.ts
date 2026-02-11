/**
 * Representerer et prosjekt en konsulent har jobbet på.
 * 
 * BACKEND: Denne typen skal matche prosjekt-objektene fra API-et.
 */
export interface Prosjekt {
    navn: string
    rolle: string
    periode: string
}

/**
 * Representerer en konsulent i systemet.
 * 
 * BACKEND: Denne typen skal matche datamodellen fra API-et.
 * Når backend er klar, sørg for at feltnavnene her matcher
 * JSON-responsen fra API-et (eller map dem i fetch-kallet).
 */
export interface Consultant {
    id: number
    navn: string
    epost: string
    kompetanse: string[]
    tidligereProsjekter: Prosjekt[]
    ledighet: 'ledig' | 'ikke-ledig'
    onskerABytte: boolean
}
