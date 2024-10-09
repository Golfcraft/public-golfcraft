import {
    partCrafted,
    recipeAdded,
    recipeRemoved
} from "../generated/GolfcraftCrafting/GolfcraftCrafting"
import { PartRecipe, Account, Material, Part } from "../generated/schema"



export function handlePartCrafted(event: partCrafted): void {}

export function handleRecipeAdded(event: recipeAdded): void {}

export function handleRecipeRemoved(event: recipeRemoved): void {}