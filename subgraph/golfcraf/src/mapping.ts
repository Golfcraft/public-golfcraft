import { Golfclub as GolfclubContract } from '../generated/Golfclub/Golfclub'
import {
    Transfer,
    Issued,
    PlayerSet,
    PropertySet
} from "../generated/Golfclub/Golfclub"
import { Golfclub, Account, Property } from "../generated/schema"

// Golfclubs

export function handleTransfer(event: Transfer): void {
    //address from
    //address to
    //uint256 tokenId
    let contract = GolfclubContract.bind(event.address)

    // From account
    let from = new Account(event.params.from)
    from.save()

    // To account
    let to = new Account(event.params.to)
    to.save()

    // Golfclub id
    let golfclub = Golfclub.load(event.params.tokenId.toString())
    if (golfclub == null) {
        golfclub = new Golfclub(event.params.tokenId.toString())
        golfclub.golfclubid = 0
    }
    golfclub.owner = event.params.to
    golfclub.save()
}

export function handleIssued(event: Issued): void {
    //uint256 tokenId
    //address owner
    let contract = GolfclubContract.bind(event.address)
    let golfclub = Golfclub.load(event.params.tokenId.toString())
    if (golfclub != null) {
        golfclub.golfclubid = contract.getGolfclubId(event.params.tokenId) //.toI32()
        golfclub.save()
    }
}

export function handlePlayerSet(event: PlayerSet): void {
    //uint256 tokenId
    //address newPlayer
    //address oldPlayer

    // From account
    let oldPlayer = new Account(event.params.oldPlayer)
    oldPlayer.save()

    // To account
    let newPlayer = new Account(event.params.newPlayer)
    newPlayer.save()

    // Golfclub id
    let golfclub = Golfclub.load(event.params.tokenId.toString())
    if (golfclub == null) {
        golfclub = new Golfclub(event.params.tokenId.toString())
        golfclub.golfclubid = 0
    }
    golfclub.player = event.params.newPlayer
    golfclub.save()
}

export function handlePropertySet(event: PropertySet): void {
    //uint256 tokenId, uint16 propertyId, uint16 value

    //let golfclub = Golfclub.load(event.params.tokenId.toHex())

    let property_id = event.params.tokenId.toString() + "-" + event.params.propertyId.toString()
    let property = Property.load(property_id)
    if (property == null) {
        property = new Property(property_id)
        property.property_id = event.params.propertyId
        property.golfclub = event.params.tokenId.toString()
    }
    property.value = event.params.value
    property.save()
}
