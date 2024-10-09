import { MARGIN_OF_ERROR } from './securityChecks'

// validate that the player is active in a catalyst server, and in the indicated coordinates, or within a margin of error
export async function checkPlayer(
  playerId: string,
  server: string,
  parcels: number[][]
) {
  let url = server + '/comms/peers/';
  if(url.indexOf("https://") === -1) url = `https://${url}`;
  // const url = `https://peer.decentraland.org/comms/peers`
  if (url == "https://realm-provider.decentraland.org/comms/peers/") {
    url = "https://archipelago-stats.decentraland.org/peers/";
  }
  console.log('URL being used: ', url)

  try {
    console.log("url being used", url);
    const response = await fetch(url)
    const data = await response.json()

    for (const player of data.peers) {
      if (player?.address?.toLowerCase() === playerId.toLowerCase()) {
        console.log('found player')

        if (checkArea(player.parcel, parcels)) {
          return player.parcel;
        }else{
          console.log("player not in area", player.parcel, player.address, parcels);
        }
      }
    }
  } catch (error) {
    console.log("error", error)
    return false
  }
  console.log("checkPlayer false")

  return false
}

// check coordinates against a single parcel - within a margin of error
export function checkCoords(coords: number[], parcel: number[]) {
  console.log("checkCoords", coords, parcel);
  if (parcel[0] === coords[0] && parcel[1] === coords[1]) {
    return true
  }

  if (
    Math.abs(parcel[0] - coords[0]) <= MARGIN_OF_ERROR &&
    Math.abs(parcel[1] - coords[1]) <= MARGIN_OF_ERROR
  ) {
    return true
  } else {
    console.log('player in other parcels ', coords, ' should be ', parcel)
    return false
  }
}

// check coordinates against a list of valid parcels - within a margin of error
export function checkArea(coords: number[], parcels: number[][]) {
  let match = false
  for (let i = 0; i < parcels.length; i++) {
    if (checkCoords(coords, parcels[i])) {
      match = true
    }
  }
  return match
}