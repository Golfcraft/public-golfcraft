// import { Bytes } from "@graphprotocol/graph-ts"
import { GolfcraftLand } from '../generated/GolfcraftLand/GolfcraftLand'
import {
    Transfer,
    LandManagerSet,
    LandOperatorSet,
    PartsMovedFromLand,
    PartsMovedToLand,
    PartsStored,
    PartsUnstored,
    PartsUnstoredToLand
} from "../generated/GolfcraftLand/GolfcraftLand"
import { GolfLand, Account, Part, LandPartBalance, StoragePartBalance, PartsStorage, PartBalance } from "../generated/schema"


export function handleTransfer(event: Transfer): void {
    //address from
    //address to
    //uint256 tokenId
    let contract = GolfcraftLand.bind(event.address)

    // From account
    let from = new Account(event.params.from)
    from.save()

    // To account
    let to = new Account(event.params.to)
    to.save()

    // Golfland collection id
    let golfland = GolfLand.load(event.params.tokenId.toString())
    if (golfland == null) {
        golfland = new GolfLand(event.params.tokenId.toString())
        // TODO: Transfer is called before collectionId is set
        // collection is always 0
        golfland.collection = contract.getCollectionId(event.params.tokenId).toI32()
    }
    golfland.owner = event.params.to
    golfland.save()
}

export function handleLandManagerSet(event: LandManagerSet): void {
    let owner = new Account(event.params.owner)
    owner.lands_manager = event.params.landManager
    owner.save()
}

export function handleLandOperatorSet(event: LandOperatorSet): void {
    let land = GolfLand.load(event.params.landId.toString())
    if (land == null) {
        land = new GolfLand(event.params.landId.toString())
        // Dirty hack to make sure the land is saved
        // TODO: Find a better way to do this
        // OperatorSet is called before land is minted
        // So land don't have an owner yet
        land.owner = event.params.landOperator
        // End of dirty hack
        land.collection = 0
    }
    land.operator = event.params.landOperator
    
    land.save()
}

export function handlePartsMovedFromLand(event: PartsMovedFromLand): void {
    // landId partIds amounts
    let land = GolfLand.load(event.params.landId.toString())
    if (land == null) {
        return
    }

    for (let i = 0; i < event.params.partIds.length; i++) {
        let part = new Part(event.params.partIds[i].toString())
        part.save()

        let land_part_balance_id = event.params.landId.toString() + "-" + event.params.partIds[i].toString()
        let land_part_balance = LandPartBalance.load(land_part_balance_id)
        if (land_part_balance == null) {
            land_part_balance = new LandPartBalance(land_part_balance_id)
            land_part_balance.land = land.id
            land_part_balance.balance = 0
            land_part_balance.part = part.id
        }
        land_part_balance.balance -= event.params.amounts[i].toI32()
        land_part_balance.save()

        let owner_part_balance_id = land.owner.toString() + "-" + event.params.partIds[i].toString()
        let owner_part_balance = PartBalance.load(owner_part_balance_id)
        if (owner_part_balance == null) {
            owner_part_balance = new PartBalance(owner_part_balance_id)
            owner_part_balance.owner = land.owner
            owner_part_balance.balance = 0
            owner_part_balance.part = part.id
        }
        owner_part_balance.balance += event.params.amounts[i].toI32()
        owner_part_balance.save()
    }
}

export function handlePartsMovedToLand(event: PartsMovedToLand): void {
    // landId partIds amounts
    let land = GolfLand.load(event.params.landId.toString())
    if (land == null) {
        return
    }

    for (let i = 0; i < event.params.partIds.length; i++) {
        let part = new Part(event.params.partIds[i].toString())
        part.save()

        let land_part_balance_id = event.params.landId.toString() + "-" + event.params.partIds[i].toString()
        let land_part_balance = LandPartBalance.load(land_part_balance_id)
        if (land_part_balance == null) {
            land_part_balance = new LandPartBalance(land_part_balance_id)
            land_part_balance.land = land.id
            land_part_balance.balance = 0
            land_part_balance.part = part.id
        }
        land_part_balance.balance += event.params.amounts[i].toI32()
        land_part_balance.save()

        let owner_part_balance_id = land.owner.toString() + "-" + event.params.partIds[i].toString()
        let owner_part_balance = PartBalance.load(owner_part_balance_id)
        if (owner_part_balance == null) {
            owner_part_balance = new PartBalance(owner_part_balance_id)
            owner_part_balance.owner = land.owner
            owner_part_balance.balance = 0
            owner_part_balance.part = part.id
        }
        owner_part_balance.balance -= event.params.amounts[i].toI32()
        owner_part_balance.save()
    }
}

export function handlePartsStored(event: PartsStored): void {
    // owner operatorOrManager partIds amounts

    let parts_storage_id = event.params.owner.toHexString() + "-" + event.params.operatorOrManager.toHexString()

    let parts_storage = new PartsStorage(parts_storage_id)
    parts_storage.save()

    for (let i = 0; i < event.params.partIds.length; i++) {
        let part = new Part(event.params.partIds[i].toString())
        part.save()

        let storage_part_balance_id = parts_storage_id + "-" + event.params.partIds[i].toString()
        let storage_part_balance = StoragePartBalance.load(storage_part_balance_id)
        if (storage_part_balance == null) {
            storage_part_balance = new StoragePartBalance(storage_part_balance_id)
            storage_part_balance.parts_storage = parts_storage_id
            storage_part_balance.balance = 0
            storage_part_balance.part = part.id
        }
        storage_part_balance.parts_storage = parts_storage_id
        storage_part_balance.balance += event.params.amounts[i].toI32()
        storage_part_balance.save()

        let owner_part_balance_id = event.params.owner.toHexString() + "-" + event.params.partIds[i].toString()
        let owner_part_balance = PartBalance.load(owner_part_balance_id)
        if (owner_part_balance == null) {
            owner_part_balance = new PartBalance(owner_part_balance_id)
            owner_part_balance.owner = event.params.owner
            owner_part_balance.balance = 0
            owner_part_balance.part = part.id
        }
        owner_part_balance.owner = event.params.owner
        owner_part_balance.balance -= event.params.amounts[i].toI32()
        owner_part_balance.save()
    }
}

export function handlePartsUnstored(event: PartsUnstored): void {
    // owner operatorOrManager partIds amounts

    let parts_storage_id = event.params.owner.toHexString() + "-" + event.params.operatorOrManager.toHexString()

    let parts_storage = new PartsStorage(parts_storage_id)
    parts_storage.save()

    for (let i = 0; i < event.params.partIds.length; i++) {
        let part = new Part(event.params.partIds[i].toString())
        part.save()

        let storage_part_balance_id = parts_storage_id + "-" + event.params.partIds[i].toString()
        let storage_part_balance = StoragePartBalance.load(storage_part_balance_id)
        if (storage_part_balance == null) {
            storage_part_balance = new StoragePartBalance(storage_part_balance_id)
            storage_part_balance.parts_storage = parts_storage_id
            storage_part_balance.balance = 0
            storage_part_balance.part = part.id
        }
        storage_part_balance.parts_storage = parts_storage_id
        storage_part_balance.balance -= event.params.amounts[i].toI32()
        storage_part_balance.save()

        let owner_part_balance_id = event.params.owner.toHexString() + "-" + event.params.partIds[i].toString()
        let owner_part_balance = PartBalance.load(owner_part_balance_id)
        if (owner_part_balance == null) {
            owner_part_balance = new PartBalance(owner_part_balance_id)
            owner_part_balance.owner = event.params.owner
            owner_part_balance.balance = 0
            owner_part_balance.part = part.id
        }
        owner_part_balance.owner = event.params.owner
        owner_part_balance.balance += event.params.amounts[i].toI32()
        owner_part_balance.save()
    }
}

export function handlePartsUnstoredToLand(event: PartsUnstoredToLand): void {
    // owner operatorOrManager landId partIds amounts

    let parts_storage_id = event.params.owner.toHexString() + "-" + event.params.operatorOrManager.toHexString()

    let parts_storage = new PartsStorage(parts_storage_id)
    parts_storage.save()

    for (let i = 0; i < event.params.partIds.length; i++) {
        let part = new Part(event.params.partIds[i].toString())
        part.save()

        let storage_part_balance_id = parts_storage_id + "-" + event.params.partIds[i].toString()
        let storage_part_balance = StoragePartBalance.load(storage_part_balance_id)
        if (storage_part_balance == null) {
            storage_part_balance = new StoragePartBalance(storage_part_balance_id)
            storage_part_balance.parts_storage = parts_storage_id
            storage_part_balance.balance = 0
            storage_part_balance.part = part.id
        }
        storage_part_balance.parts_storage = parts_storage_id
        storage_part_balance.balance -= event.params.amounts[i].toI32()
        storage_part_balance.save()

        let land_part_balance_id = event.params.landId.toString() + "-" + event.params.partIds[i].toString()
        let land_part_balance = LandPartBalance.load(land_part_balance_id)
        if (land_part_balance == null) {
            land_part_balance = new LandPartBalance(land_part_balance_id)
            land_part_balance.land = event.params.landId.toString()
            land_part_balance.balance = 0
            land_part_balance.part = part.id
        }
        land_part_balance.land = event.params.landId.toString()
        land_part_balance.balance += event.params.amounts[i].toI32()
        land_part_balance.save()
    }
}