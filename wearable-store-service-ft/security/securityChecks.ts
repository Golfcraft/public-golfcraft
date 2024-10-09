import { authenticateUsingAuthChain } from './authenticate'
import { checkCoords, checkPlayer, checkArea } from './verifyOnMap'

// allow requests from localhost
export const TESTS_ENABLED = false

// number of parcels to use as margin of error when comparing coordinates
export const MARGIN_OF_ERROR = 2

// reject any request from these IPs
export const denyListedIPS = [
  `14.161.47.252`,
  `170.233.124.66`,
  `2001:818:db0f:7500:3576:469a:760a:8ded`,
  `85.158.181.20`,
  `185.39.220.232`,
  `178.250.10.230`,
  `185.39.220.156`,
];

export async function runChecks(req: any, parcels?: number[][]) {
  try{
    // fetch metadata from auth headers
    const metadata = await JSON.parse(req.header(`x-identity-metadata`))
    const authchain0 = await JSON.parse(req.header(`x-identity-auth-chain-0`))

    const coordinates = metadata.parcel.split(',').map((item: string) => {
      return parseInt(item, 10)
    })

    console.log('FULL METADATA: ', metadata)

    console.log(
      'CATALYST: ',
      metadata.realm.domain||metadata.realm.hostname,
      ' PLAYER ID',
      authchain0.payload,
      ' PARCEL',
      coordinates
    )

    // check that the request comes from a decentraland domain
    let origin: boolean
    if (TESTS_ENABLED && metadata.realm.catalystName === 'localhost') {
      origin = true
    } else {
      origin = checkOrigin(req)
    }

    // filter against a denylist of malicious ips
    const ipFilter = checkBannedIPs(req)

    // Validate that the authchain signature is real
    const authChain = await authenticateUsingAuthChain(req)

    // validate that the player is in the catalyst & location from the signature
    let catalystPos: boolean
    if (TESTS_ENABLED && metadata.realm.catalystName === 'localhost') {
      catalystPos = true
    } else {
      catalystPos = await checkPlayer(
        authchain0.payload,
        metadata.realm.domain||metadata.realm.hostname,
        parcels
      )
    }

    // validate that the player is in a valid location for this operation - if a parcel is provided
    let validPos: boolean
    if (parcels) {
      validPos = checkArea(coordinates, parcels)
    } else {
      validPos = true
    }

    if (origin && ipFilter && authChain && catalystPos && validPos) {
      return true
    } else {
      if(!validPos) console.log("invalid pos");
      return false
    }
  }catch(err){
    console.error(err);
    console.trace();
    return Promise.reject(err);
  }
  
}

export function checkOrigin(req: any) {
  if (
    req.header('origin') !== 'https://play.decentraland.org' &&
    req.header('origin') !== 'https://play.decentraland.zone'
  ) {
    console.log("not valid origin");
    return false
  }
  return true
}

export function checkBannedIPs(req: any) {
  for (const ip of denyListedIPS) {
    if (req.header('X-Forwarded-For') === ip) return false
  }
  return true
}
