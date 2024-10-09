import {
    TransferBatch,
    TransferSingle
} from "../generated/GolfcraftParts/GolfcraftParts"
import { PartBalance, Account, Part } from "../generated/schema"



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

        let part = new Part(id.toString())
        part.save()

        let balance_from_id = event.params.from.toHexString() + "-" + id.toString()
        let balance_to_id = event.params.to.toHexString() + "-" + id.toString()

        let balance_from = PartBalance.load(balance_from_id)
        if (balance_from == null) {
            balance_from = new PartBalance(balance_from_id)
            balance_from.owner = event.params.from
            balance_from.balance = 0
            balance_from.part = part.id
        }
        balance_from.balance -= value.toI32()
        balance_from.save()

        let balance_to = PartBalance.load(balance_to_id)
        if (balance_to == null) {
            balance_to = new PartBalance(balance_to_id)
            balance_to.owner = event.params.to
            balance_to.balance = 0
            balance_to.part = part.id
        }
        balance_to.balance += value.toI32()
        balance_to.save()
    }
}

export function handleTransferSingle(event: TransferSingle): void {
    // TransferSingle(address operator,address from,address to,uint256 id,uint256 value)

    let id = event.params.id.toString()
    let value = event.params.value.toI32()

    let part = new Part(id)
    part.save()

    let balance_from_id = event.params.from.toHexString() + "-" + id
    let balance_to_id = event.params.to.toHexString() + "-" + id

    let balance_from = PartBalance.load(balance_from_id)
    if (balance_from == null) {
        balance_from = new PartBalance(balance_from_id)
        balance_from.owner = event.params.from
        balance_from.balance = 0
        balance_from.part = part.id
    }
    balance_from.balance -= value
    balance_from.save()

    let balance_to = PartBalance.load(balance_to_id)
    if (balance_to == null) {
        balance_to = new PartBalance(balance_to_id)
        balance_to.owner = event.params.to
        balance_to.balance = 0
        balance_to.part = part.id
    }
    balance_to.balance += value
    balance_to.save()
}