/** Mission checker
 * check if mission is accomplished by user,
 * if completed return true
 * if not completed but step changed return {step}
 * if no change on progress return false
 * 2
 */

import {
    trainingSuccess,
    trainingSuccessAllModes,
    trainingSuccessSubTypeFn
} from "./training-success";
import {
    playCompetition,
    playCompetitionTimesFn,
} from "./competition-missions";
import {finishedTournamentFn, playTournamentTimesFn} from "./tournament.missions";
import {craftAnyPart, refineAnyMaterial} from "./crafting-missions";
import {playSeasonTimesFn} from "./season.missions";

export default {
    "training-success":trainingSuccess,
    "training-success-all-modes":trainingSuccessAllModes,
    "training-success-race":trainingSuccessSubTypeFn(1),
    "training-success-zone":trainingSuccessSubTypeFn(2),
    "training-success-voxters":trainingSuccessSubTypeFn(3),
    "training-success-hole":trainingSuccessSubTypeFn(4),
    "competition-played": playCompetition,
    "competition-played5":playCompetitionTimesFn(5),
    "competition-played20":playCompetitionTimesFn(20),
    "tournament-played": playTournamentTimesFn(1),
    "tournament-finished": finishedTournamentFn(1),
    "tournament-finished4": finishedTournamentFn(4),
    "material-refine-any": refineAnyMaterial,
    "part-craft-any":craftAnyPart,
    "season-game": playSeasonTimesFn(1),
    "season-game5": playSeasonTimesFn(5),
    "season-game10": playSeasonTimesFn(10),
    //"craft-any-part":
    //"refine-any-material":
};