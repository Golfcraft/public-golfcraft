import {
    TransferBatch,
    TransferSingle
} from "../generated/GolfcraftMaterials/GolfcraftMaterials"
import { MaterialBalance, Account, Material } from "../generated/schema"



export function handleTransferBatch(event: TransferBatch): void {
    // TransferBatch(address operator, address from, address to, uint256[] ids, uint256[] values)

    let operator = new Account(event.params.operator)
    operator.save()

    let from = new Account(event.params.from)
    from.save()

    let to = new Account(event.params.to)
    to.save()

    for (let i = 0; i < event.params.ids.length; i++) {
        let id = event.params.ids[i]
        let value = event.params.values[i]

        let material = new Material(id.toString())
        material.save()

        let materialbalance_from_id = event.params.from.toHexString() + "-" + id.toString()
        let materialbalance_to_id = event.params.to.toHexString() + "-" + id.toString()

        let balance_from = MaterialBalance.load(materialbalance_from_id)
        if (balance_from == null) {
            balance_from = new MaterialBalance(materialbalance_from_id)
            balance_from.balance = 0
            balance_from.material = material.id
        }
        balance_from.owner = event.params.from
        balance_from.balance -= value.toI32()
        balance_from.save()

        let balance_to = MaterialBalance.load(materialbalance_to_id)
        if (balance_to == null) {
            balance_to = new MaterialBalance(materialbalance_to_id)
            balance_to.balance = 0
            balance_to.material = material.id
        }
        balance_to.owner = event.params.to
        balance_to.balance += value.toI32()
        balance_to.save()
    }
}

export function handleTransferSingle(event: TransferSingle): void {
    // TransferSingle(address operator,address from,address to,uint256 id,uint256 value)

    let id = event.params.id.toString()
    let value = event.params.value.toI32()

    let material = new Material(id)
    material.save()

    let operator = new Account(event.params.operator)
    operator.save()

    let from = new Account(event.params.from)
    from.save()

    let to = new Account(event.params.to)
    to.save()

    let materialbalance_from_id = event.params.from.toHexString() + "-" + id
    let materialbalance_to_id = event.params.to.toHexString() + "-" + id

    let balance_from = MaterialBalance.load(materialbalance_from_id)
    if (balance_from == null) {
        balance_from = new MaterialBalance(materialbalance_from_id)
        balance_from.balance = 0
        balance_from.material = material.id
    }
    balance_from.owner = event.params.from
    balance_from.balance -= value
    balance_from.save()

    let balance_to = MaterialBalance.load(materialbalance_to_id)
    if (balance_to == null) {
        balance_to = new MaterialBalance(materialbalance_to_id)
        balance_to.balance = 0
        balance_to.material = material.id
    }
    balance_to.owner = event.params.to
    balance_to.balance += value
    balance_to.save()
}