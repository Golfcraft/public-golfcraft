"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
//TODO should take private key from .env
var ethers_1 = require("ethers");
var provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
var crafting_abi_json_1 = __importDefault(require("./crafting.abi.json"));
console.log("craftingAbi", !!crafting_abi_json_1["default"]);
var GWEI = Math.pow(10, 9);
var cross_fetch_1 = __importDefault(require("cross-fetch"));
var BLOCK_MAX_GAS_LIMIT = 3000000;
var materialTokenIds = {
    WD: 4,
    ST: 5,
    IR: 6,
    GD: 7,
    DM: 2
};
var _a = process.argv.map(function (i) { return Number(i); }), ids = _a.slice(2);
console.log("argIDs", ids);
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var parts, signer, craftingContract, i, gasInfo, _loop_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.parts.findMany({
                    where: {
                        OR: ids.map(function (ID) { return ({ ID: ID }); })
                    }
                })];
            case 1:
                parts = _a.sent();
                console.log("parts", parts === null || parts === void 0 ? void 0 : parts.length);
                console.log("parts aliases", parts.map(function (p) { return p.alias; }).join(","));
                signer = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
                craftingContract = new ethers_1.ethers.Contract("0x8e1e2bbf6dfae62a1988d5a12969ebd057597e4a", crafting_abi_json_1["default"], provider);
                i = parts.length;
                return [4 /*yield*/, (0, cross_fetch_1["default"])("https://gasstation.polygon.technology/v2").then(function (r) { return r.json(); })];
            case 2:
                gasInfo = _a.sent();
                console.log("gasInfo", gasInfo);
                _loop_1 = function () {
                    var part, recipeObj_1, materialIDs, materialAmounts, estimatedGasAmount, tx, e_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                part = parts[i];
                                if (!(part && part.recipe)) return [3 /*break*/, 6];
                                recipeObj_1 = deserializeRecipe(part.recipe);
                                materialIDs = Object.keys(recipeObj_1).map(function (key) { return materialTokenIds[key]; });
                                materialAmounts = Object.keys(recipeObj_1).map(function (key) { return recipeObj_1[key]; });
                                console.log("setting up recipe", part.alias, part.ID, part.recipe, materialIDs, materialAmounts);
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 4, , 5]);
                                return [4 /*yield*/, craftingContract.connect(signer).estimateGas.addRecipe(part.ID, materialIDs, materialAmounts)];
                            case 2:
                                estimatedGasAmount = _b.sent();
                                if (!estimatedGasAmount) {
                                    console.log("not estimate", estimatedGasAmount);
                                    process.exit(1);
                                }
                                console.log("Deploying recipe for part ".concat(part.alias, "(").concat(part.ID, ")"));
                                console.log("estimatedGasAmount", estimatedGasAmount);
                                return [4 /*yield*/, craftingContract.connect(signer).addRecipe(part.ID, materialIDs, materialAmounts, {
                                        gasLimit: Math.ceil(estimatedGasAmount.toNumber()),
                                        maxFeePerGas: process.env.MAX_FEE ? (Number(process.env.MAX_FEE) * GWEI) : Math.ceil(gasInfo.fast.maxFee * GWEI * (process.env.REPLACE_TX ? 1.2 : 1)),
                                        maxPriorityFeePerGas: process.env.MAX_FEE_PRIORITY ? (Number(process.env.MAX_FEE_PRIORITY) * GWEI) : Math.ceil(gasInfo.fast.maxPriorityFee * GWEI)
                                    })];
                            case 3:
                                tx = _b.sent();
                                console.log("TRANSACTION EXECUTED", !!tx);
                                return [3 /*break*/, 5];
                            case 4:
                                e_1 = _b.sent();
                                console.log("FAILED TX, EXITING", e_1);
                                process.exit(1);
                                return [3 /*break*/, 5];
                            case 5: return [3 /*break*/, 7];
                            case 6:
                                console.log("MISSING RECIPE ON PART ", part.alias);
                                _b.label = 7;
                            case 7: return [2 /*return*/];
                        }
                    });
                };
                _a.label = 3;
            case 3:
                if (!i--) return [3 /*break*/, 5];
                return [5 /*yield**/, _loop_1()];
            case 4:
                _a.sent();
                return [3 /*break*/, 3];
            case 5:
                console.log("COMPLETE !!!");
                return [2 /*return*/];
        }
    });
}); })();
function deserializeRecipe(recipe) {
    if (!recipe || !recipe.trim())
        return {};
    return recipe.replace(/\s+/g, " ").split(" ").reduce(function (acc, declaration) {
        var _a = declaration.split(":"), material = _a[0], amount = _a[1];
        acc[material] = Number(amount);
        return acc;
    }, {});
}
