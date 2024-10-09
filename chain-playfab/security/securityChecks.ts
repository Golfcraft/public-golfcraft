import { authenticateUsingAuthChain } from './authenticate'
import { checkCoords, checkPlayer, checkArea } from './verifyOnMap'

// allow requests from localhost
export const TESTS_ENABLED = process.env.TESTS_ENABLED;
console.log("TESTS_ENABLED",!!TESTS_ENABLED);
// number of parcels to use as margin of error when comparing coordinates
export const MARGIN_OF_ERROR = 100;

// reject any request from these IPs
export const denyListedIPS = [
  `14.161.47.252`,
  `170.233.124.66`,
  `2001:818:db0f:7500:3576:469a:760a:8ded`,
  `85.158.181.20`,
  `185.39.220.232`,
  `178.250.10.230`,
  `185.39.220.156`,
]
const addressWhitelist = [
  "0x598f8af1565003AE7456DaC280a18ee826Df7a2c",//pablo
  "0xbdedb6351b46513f45f48d8c326b8bc000fd2995",//prashant
  "0xcf10cd8b5dc2323b1eb6de6164647756bad4de4d",//eibriel
  "0x6eb7de10448e5eb74fd96861c63879d447feb0bc",//carlos
  "0x748e87b933fd0d6e12355995780d81c84d441e34",//laura
  "0xd677743ffa24b738c252d88e5d9a2910b7bce69a",//account6
  "0x23C446650e27AaDd8D34104FbA02F2ea5C6A1aF7",//omv new account 2
].map(a=>a.toLowerCase());
export async function runChecks(req: any, parcels?: number[][]) {
  // fetch metadata from auth headers
  const metadata = await JSON.parse(req.header(`x-identity-metadata`))
  const authchain0 = await JSON.parse(req.header(`x-identity-auth-chain-0`))
  /*if(~addressWhitelist.indexOf(authchain0.payload)){ //TODO REVIEW SECURITY !!!!!!!
    return true;
  }*/
  const coordinates = metadata.parcel.split(',').map((item: string) => {
    return parseInt(item, 10)
  })

  console.log('FULL METADATA: ', metadata)

  console.log(
    'CATALYST: ',
    metadata.realm,
    ' PLAYER ID',
    authchain0.payload,
    ' PARCEL',
    coordinates
  )

  // check that the request comes from a decentraland domain
  let origin: boolean
  if (testModeIsActivated(metadata)) {
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
  if (testModeIsActivated(metadata) || !parcels) {
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
    return false
  }
}

export function checkOrigin(req: any) {
  if (
    req.header('origin') !== 'https://play.decentraland.org' &&
    req.header('origin') !== 'https://play.decentraland.zone' &&
    req.header('origin') !== 'https://decentraland.org' &&
    req.header('origin') !== 'https://decentraland.zone'
  ) {
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
function testModeIsActivated(metadata){
  return TESTS_ENABLED &&  (metadata.realm.catalystName === 'localhost' || metadata.realm.hostname === 'localhost' || metadata.realm.hostname === '127.0.0.1')
}