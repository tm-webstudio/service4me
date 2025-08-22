/**
 * UK Postcode to Area Name Converter
 * Maps UK postcodes to their corresponding area names
 */

interface PostcodeArea {
  code: string
  area: string
  region: string
}

// UK Postcode Areas - Major London and surrounding areas
const POSTCODE_AREAS: PostcodeArea[] = [
  // Central London
  { code: 'WC', area: 'West Central London', region: 'Central London' },
  { code: 'EC', area: 'East Central London', region: 'Central London' },
  { code: 'W1', area: 'West End', region: 'Central London' },
  { code: 'SW1', area: 'Westminster', region: 'Central London' },
  { code: 'SE1', area: 'South Bank', region: 'Central London' },
  { code: 'E1', area: 'Whitechapel', region: 'East London' },
  { code: 'N1', area: 'Islington', region: 'North London' },
  { code: 'NW1', area: 'Camden', region: 'North London' },
  
  // North London
  { code: 'N2', area: 'East Finchley', region: 'North London' },
  { code: 'N3', area: 'Finchley Central', region: 'North London' },
  { code: 'N4', area: 'Finsbury Park', region: 'North London' },
  { code: 'N5', area: 'Highbury', region: 'North London' },
  { code: 'N6', area: 'Highgate', region: 'North London' },
  { code: 'N7', area: 'Holloway', region: 'North London' },
  { code: 'N8', area: 'Hornsey', region: 'North London' },
  { code: 'N9', area: 'Lower Edmonton', region: 'North London' },
  { code: 'N10', area: 'Muswell Hill', region: 'North London' },
  { code: 'N11', area: 'New Southgate', region: 'North London' },
  { code: 'N12', area: 'North Finchley', region: 'North London' },
  { code: 'N13', area: 'Palmers Green', region: 'North London' },
  { code: 'N14', area: 'Southgate', region: 'North London' },
  { code: 'N15', area: 'Seven Sisters', region: 'North London' },
  { code: 'N16', area: 'Stoke Newington', region: 'North London' },
  { code: 'N17', area: 'Tottenham', region: 'North London' },
  { code: 'N18', area: 'Upper Edmonton', region: 'North London' },
  { code: 'N19', area: 'Upper Holloway', region: 'North London' },
  { code: 'N20', area: 'Whetstone', region: 'North London' },
  { code: 'N21', area: 'Winchmore Hill', region: 'North London' },
  { code: 'N22', area: 'Wood Green', region: 'North London' },
  { code: 'NW2', area: 'Cricklewood', region: 'North London' },
  { code: 'NW3', area: 'Hampstead', region: 'North London' },
  { code: 'NW4', area: 'Hendon', region: 'North London' },
  { code: 'NW5', area: 'Kentish Town', region: 'North London' },
  { code: 'NW6', area: 'West Hampstead', region: 'North London' },
  { code: 'NW7', area: 'Mill Hill', region: 'North London' },
  { code: 'NW8', area: "St John's Wood", region: 'North London' },
  { code: 'NW9', area: 'Colindale', region: 'North London' },
  { code: 'NW10', area: 'Willesden', region: 'North London' },
  { code: 'NW11', area: 'Golders Green', region: 'North London' },
  
  // East London
  { code: 'E2', area: 'Bethnal Green', region: 'East London' },
  { code: 'E3', area: 'Bow', region: 'East London' },
  { code: 'E4', area: 'Chingford', region: 'East London' },
  { code: 'E5', area: 'Clapton', region: 'East London' },
  { code: 'E6', area: 'East Ham', region: 'East London' },
  { code: 'E7', area: 'Forest Gate', region: 'East London' },
  { code: 'E8', area: 'Hackney', region: 'East London' },
  { code: 'E9', area: 'Hackney Wick', region: 'East London' },
  { code: 'E10', area: 'Leyton', region: 'East London' },
  { code: 'E11', area: 'Leytonstone', region: 'East London' },
  { code: 'E12', area: 'Manor Park', region: 'East London' },
  { code: 'E13', area: 'Plaistow', region: 'East London' },
  { code: 'E14', area: 'Canary Wharf', region: 'East London' },
  { code: 'E15', area: 'Stratford', region: 'East London' },
  { code: 'E16', area: 'Canning Town', region: 'East London' },
  { code: 'E17', area: 'Walthamstow', region: 'East London' },
  { code: 'E18', area: 'South Woodford', region: 'East London' },
  { code: 'E20', area: 'Olympic Park', region: 'East London' },
  
  // South London
  { code: 'SE2', area: 'Abbey Wood', region: 'South London' },
  { code: 'SE3', area: 'Blackheath', region: 'South London' },
  { code: 'SE4', area: 'Brockley', region: 'South London' },
  { code: 'SE5', area: 'Camberwell', region: 'South London' },
  { code: 'SE6', area: 'Catford', region: 'South London' },
  { code: 'SE7', area: 'Charlton', region: 'South London' },
  { code: 'SE8', area: 'Deptford', region: 'South London' },
  { code: 'SE9', area: 'Eltham', region: 'South London' },
  { code: 'SE10', area: 'Greenwich', region: 'South London' },
  { code: 'SE11', area: 'Kennington', region: 'South London' },
  { code: 'SE12', area: 'Lee', region: 'South London' },
  { code: 'SE13', area: 'Lewisham', region: 'South London' },
  { code: 'SE14', area: 'New Cross', region: 'South London' },
  { code: 'SE15', area: 'Peckham', region: 'South London' },
  { code: 'SE16', area: 'Rotherhithe', region: 'South London' },
  { code: 'SE17', area: 'Walworth', region: 'South London' },
  { code: 'SE18', area: 'Woolwich', region: 'South London' },
  { code: 'SE19', area: 'Crystal Palace', region: 'South London' },
  { code: 'SE20', area: 'Anerley', region: 'South London' },
  { code: 'SE21', area: 'Dulwich', region: 'South London' },
  { code: 'SE22', area: 'East Dulwich', region: 'South London' },
  { code: 'SE23', area: 'Forest Hill', region: 'South London' },
  { code: 'SE24', area: 'Herne Hill', region: 'South London' },
  { code: 'SE25', area: 'South Norwood', region: 'South London' },
  { code: 'SE26', area: 'Sydenham', region: 'South London' },
  { code: 'SE27', area: 'West Norwood', region: 'South London' },
  { code: 'SE28', area: 'Thamesmead', region: 'South London' },
  
  // South West London
  { code: 'SW2', area: 'Brixton', region: 'South London' },
  { code: 'SW3', area: 'Chelsea', region: 'South London' },
  { code: 'SW4', area: 'Clapham', region: 'South London' },
  { code: 'SW5', area: "Earl's Court", region: 'South London' },
  { code: 'SW6', area: 'Fulham', region: 'South London' },
  { code: 'SW7', area: 'South Kensington', region: 'South London' },
  { code: 'SW8', area: 'South Lambeth', region: 'South London' },
  { code: 'SW9', area: 'Stockwell', region: 'South London' },
  { code: 'SW10', area: 'West Brompton', region: 'South London' },
  { code: 'SW11', area: 'Battersea', region: 'South London' },
  { code: 'SW12', area: 'Balham', region: 'South London' },
  { code: 'SW13', area: 'Barnes', region: 'South London' },
  { code: 'SW14', area: 'Mortlake', region: 'South London' },
  { code: 'SW15', area: 'Putney', region: 'South London' },
  { code: 'SW16', area: 'Streatham', region: 'South London' },
  { code: 'SW17', area: 'Tooting', region: 'South London' },
  { code: 'SW18', area: 'Wandsworth', region: 'South London' },
  { code: 'SW19', area: 'Wimbledon', region: 'South London' },
  { code: 'SW20', area: 'Raynes Park', region: 'South London' },
  
  // West London
  { code: 'W2', area: 'Bayswater', region: 'West London' },
  { code: 'W3', area: 'Acton', region: 'West London' },
  { code: 'W4', area: 'Chiswick', region: 'West London' },
  { code: 'W5', area: 'Ealing', region: 'West London' },
  { code: 'W6', area: 'Hammersmith', region: 'West London' },
  { code: 'W7', area: 'Hanwell', region: 'West London' },
  { code: 'W8', area: 'Kensington', region: 'West London' },
  { code: 'W9', area: 'Maida Vale', region: 'West London' },
  { code: 'W10', area: 'Ladbroke Grove', region: 'West London' },
  { code: 'W11', area: 'Notting Hill', region: 'West London' },
  { code: 'W12', area: "Shepherd's Bush", region: 'West London' },
  { code: 'W13', area: 'West Ealing', region: 'West London' },
  { code: 'W14', area: 'West Kensington', region: 'West London' },
  
  // Outer London - Essential areas
  { code: 'BR1', area: 'Bromley', region: 'South London' },
  { code: 'BR2', area: 'Hayes', region: 'South London' },
  { code: 'BR3', area: 'Beckenham', region: 'South London' },
  { code: 'CR0', area: 'Croydon', region: 'South London' },
  { code: 'CR7', area: 'Thornton Heath', region: 'South London' },
  { code: 'DA1', area: 'Dartford', region: 'Kent' },
  { code: 'DA5', area: 'Bexley', region: 'South London' },
  { code: 'DA6', area: 'Bexleyheath', region: 'South London' },
  { code: 'DA7', area: 'Bexleyheath', region: 'South London' },
  { code: 'DA8', area: 'Erith', region: 'South London' },
  { code: 'DA14', area: 'Sidcup', region: 'South London' },
  { code: 'DA15', area: 'Sidcup', region: 'South London' },
  { code: 'DA16', area: 'Welling', region: 'South London' },
  { code: 'DA17', area: 'Belvedere', region: 'South London' },
  { code: 'DA18', area: 'Erith', region: 'South London' },
  { code: 'EN1', area: 'Enfield', region: 'North London' },
  { code: 'EN2', area: 'Enfield', region: 'North London' },
  { code: 'EN3', area: 'Enfield Lock', region: 'North London' },
  { code: 'EN4', area: 'Hadley Wood', region: 'North London' },
  { code: 'EN5', area: 'Barnet', region: 'North London' },
  { code: 'HA0', area: 'Wembley', region: 'North London' },
  { code: 'HA1', area: 'Harrow', region: 'North London' },
  { code: 'HA2', area: 'Harrow', region: 'North London' },
  { code: 'HA3', area: 'Harrow Weald', region: 'North London' },
  { code: 'HA4', area: 'Ruislip', region: 'West London' },
  { code: 'HA5', area: 'Pinner', region: 'North London' },
  { code: 'HA6', area: 'Northwood', region: 'North London' },
  { code: 'HA7', area: 'Stanmore', region: 'North London' },
  { code: 'HA8', area: 'Edgware', region: 'North London' },
  { code: 'HA9', area: 'Wembley', region: 'North London' },
  { code: 'IG1', area: 'Ilford', region: 'East London' },
  { code: 'IG2', area: 'Gants Hill', region: 'East London' },
  { code: 'IG3', area: 'Seven Kings', region: 'East London' },
  { code: 'IG4', area: 'Redbridge', region: 'East London' },
  { code: 'IG5', area: 'Clayhall', region: 'East London' },
  { code: 'IG6', area: 'Barkingside', region: 'East London' },
  { code: 'IG7', area: 'Chigwell', region: 'East London' },
  { code: 'IG8', area: 'Woodford Green', region: 'East London' },
  { code: 'IG9', area: 'Buckhurst Hill', region: 'East London' },
  { code: 'IG10', area: 'Loughton', region: 'East London' },
  { code: 'IG11', area: 'Barking', region: 'East London' },
  { code: 'KT1', area: 'Kingston upon Thames', region: 'South London' },
  { code: 'KT2', area: 'Kingston upon Thames', region: 'South London' },
  { code: 'KT3', area: 'New Malden', region: 'South London' },
  { code: 'KT4', area: 'Worcester Park', region: 'South London' },
  { code: 'KT5', area: 'Surbiton', region: 'South London' },
  { code: 'KT6', area: 'Surbiton', region: 'South London' },
  { code: 'RM1', area: 'Romford', region: 'East London' },
  { code: 'RM2', area: 'Gidea Park', region: 'East London' },
  { code: 'RM3', area: 'Harold Wood', region: 'East London' },
  { code: 'RM6', area: 'Chadwell Heath', region: 'East London' },
  { code: 'RM7', area: 'Rush Green', region: 'East London' },
  { code: 'RM8', area: 'Becontree Heath', region: 'East London' },
  { code: 'RM9', area: 'Dagenham', region: 'East London' },
  { code: 'RM10', area: 'Dagenham', region: 'East London' },
  { code: 'SM1', area: 'Sutton', region: 'South London' },
  { code: 'SM2', area: 'Sutton', region: 'South London' },
  { code: 'SM3', area: 'Cheam', region: 'South London' },
  { code: 'SM4', area: 'Morden', region: 'South London' },
  { code: 'SM5', area: 'Carshalton', region: 'South London' },
  { code: 'SM6', area: 'Wallington', region: 'South London' },
  { code: 'TW1', area: 'Twickenham', region: 'West London' },
  { code: 'TW2', area: 'Twickenham', region: 'West London' },
  { code: 'TW3', area: 'Hounslow', region: 'West London' },
  { code: 'TW4', area: 'Hounslow', region: 'West London' },
  { code: 'TW5', area: 'Heston', region: 'West London' },
  { code: 'TW7', area: 'Isleworth', region: 'West London' },
  { code: 'TW8', area: 'Brentford', region: 'West London' },
  { code: 'TW9', area: 'Richmond', region: 'West London' },
  { code: 'TW10', area: 'Ham', region: 'West London' },
  { code: 'TW11', area: 'Teddington', region: 'West London' },
  { code: 'TW12', area: 'Hampton', region: 'West London' },
  { code: 'TW13', area: 'Feltham', region: 'West London' },
  { code: 'UB1', area: 'Southall', region: 'West London' },
  { code: 'UB2', area: 'Southall', region: 'West London' },
  { code: 'UB3', area: 'Hayes', region: 'West London' },
  { code: 'UB4', area: 'Hayes', region: 'West London' },
  { code: 'UB5', area: 'Northolt', region: 'West London' },
  { code: 'UB6', area: 'Greenford', region: 'West London' },
  { code: 'UB7', area: 'West Drayton', region: 'West London' },
  { code: 'UB8', area: 'Uxbridge', region: 'West London' },
  { code: 'UB9', area: 'Uxbridge', region: 'West London' },
  { code: 'UB10', area: 'Hillingdon', region: 'West London' },
  { code: 'UB11', area: 'Stockley Park', region: 'West London' },
  { code: 'WD3', area: 'Rickmansworth', region: 'Hertfordshire' },
  { code: 'WD6', area: 'Borehamwood', region: 'Hertfordshire' },
  { code: 'WD23', area: 'Bushey', region: 'Hertfordshire' },
  { code: 'WD24', area: 'Watford', region: 'Hertfordshire' },
  { code: 'WD25', area: 'Watford', region: 'Hertfordshire' }
]

/**
 * Extract the postcode area from a full postcode
 * E.g., "SW1A 1AA" -> "SW1A", "E14 5AB" -> "E14", "RM6 5PD" -> "RM6"
 */
function extractPostcodeArea(postcode: string): string {
  const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase()
  
  // UK postcode format: 1-2 letters, 1-2 digits, optional letter, then space, then digit + 2 letters
  // First part (district): [A-Z]{1,2}[0-9]{1,2}[A-Z]?
  // We only want the first part before the space
  
  // Match the district part only (before the space in original format)
  const match = cleanPostcode.match(/^([A-Z]{1,2}[0-9]{1,2}[A-Z]?)([0-9][A-Z]{2})$/)
  if (match) {
    return match[1] // Return only the district part
  }
  
  // Fallback for partial postcodes or unusual formats
  const partialMatch = cleanPostcode.match(/^([A-Z]{1,2}[0-9]{1,2})/)
  if (partialMatch) {
    return partialMatch[1]
  }
  
  return ''
}

/**
 * Convert a UK postcode to its area name
 * @param postcode - UK postcode (e.g., "SW1A 1AA")
 * @returns Area name (e.g., "Westminster") or postcode if not found
 */
export function postcodeToAreaName(postcode: string): string {
  if (!postcode || typeof postcode !== 'string') {
    return 'London'
  }
  
  const postcodeArea = extractPostcodeArea(postcode)
  
  // Find exact match first
  const exactMatch = POSTCODE_AREAS.find(area => area.code === postcodeArea)
  if (exactMatch) {
    return exactMatch.area
  }
  
  // Find partial match (for subcodes like SW1A -> SW1)
  const partialCode = postcodeArea.replace(/[A-Z]$/, '') // Remove trailing letter
  const partialMatch = POSTCODE_AREAS.find(area => area.code === partialCode)
  if (partialMatch) {
    return partialMatch.area
  }
  
  // Find broader match (for numbered postcodes like SW10 -> SW)
  const broadCode = postcodeArea.replace(/\d+[A-Z]?$/, '') // Remove numbers and trailing letter
  const broadMatch = POSTCODE_AREAS.find(area => area.code === broadCode)
  if (broadMatch) {
    return broadMatch.area
  }
  
  // If no match found, return the postcode itself
  return postcode
}

/**
 * Get the region for a postcode
 * @param postcode - UK postcode (e.g., "SW1A 1AA")
 * @returns Region name (e.g., "Central London") or "London" if not found
 */
export function postcodeToRegion(postcode: string): string {
  if (!postcode || typeof postcode !== 'string') {
    return 'London'
  }
  
  const postcodeArea = extractPostcodeArea(postcode)
  
  // Find exact match first
  const exactMatch = POSTCODE_AREAS.find(area => area.code === postcodeArea)
  if (exactMatch) {
    return exactMatch.region
  }
  
  // Find partial match
  const partialCode = postcodeArea.replace(/[A-Z]$/, '')
  const partialMatch = POSTCODE_AREAS.find(area => area.code === partialCode)
  if (partialMatch) {
    return partialMatch.region
  }
  
  // Find broader match
  const broadCode = postcodeArea.replace(/\d+[A-Z]?$/, '')
  const broadMatch = POSTCODE_AREAS.find(area => area.code === broadCode)
  if (broadMatch) {
    return broadMatch.region
  }
  
  return 'London'
}

/**
 * Get the outward code (first part) from a UK postcode
 * @param postcode - UK postcode (e.g., "SW1A 1AA")
 * @returns Outward code (e.g., "SW1A") or empty string
 */
export function getPostcodeOutwardCode(postcode: string): string {
  if (!postcode || typeof postcode !== 'string') {
    return ''
  }
  
  return extractPostcodeArea(postcode)
}

/**
 * Convert a UK postcode to area name with outward code
 * @param postcode - UK postcode (e.g., "SW1A 1AA")
 * @returns Area name with outward code (e.g., "Westminster (SW1A)") or area name only
 */
export function postcodeToAreaNameWithCode(postcode: string): string {
  if (!postcode || typeof postcode !== 'string') {
    return 'London'
  }
  
  const areaName = postcodeToAreaName(postcode)
  const outwardCode = getPostcodeOutwardCode(postcode)
  
  // If we successfully converted to an area name (not returning the original postcode)
  // and we have an outward code, combine them
  if (areaName !== postcode && outwardCode) {
    return `${areaName} (${outwardCode})`
  }
  
  // Otherwise just return the area name
  return areaName
}

/**
 * Validate if a string is a valid UK postcode format
 * @param postcode - String to validate
 * @returns Boolean indicating if it's a valid UK postcode
 */
export function isValidUKPostcode(postcode: string): boolean {
  if (!postcode || typeof postcode !== 'string') {
    return false
  }
  
  const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase()
  
  // UK postcode regex pattern
  const pattern = /^[A-Z]{1,2}\d{1,2}[A-Z]?\d[A-Z]{2}$/
  
  return pattern.test(cleanPostcode)
}