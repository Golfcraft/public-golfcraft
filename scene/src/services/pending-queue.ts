import {bridgeURL} from "../components/bridge/bridge-url";
import {removeValueFromArray} from "../../../common/utils";
import {globalStore} from "./globalStore/globalStore";

let pendingChecker;

export const createPendingChecker = ({address}) => {
    const state = {
        pending: false,
        checkPendingInterval:false
    };
    const callbacks = {
        onFinishedQueue:[]
    };
    pendingChecker = {
        checkPending,
        isPending:()=>state.pending,
        isChecking:()=>state.checkPendingInterval,
        onFinishedQueue:(fn)=>{
            callbacks.onFinishedQueue.push(fn);
            return () => removeValueFromArray(callbacks.onFinishedQueue, fn);
        }
    };
    return pendingChecker;

    function checkPending() {
        if (state.checkPendingInterval) return;
        state.pending = true;
        state.checkPendingInterval = setInterval(async () => {
            const wasPending = state.pending;

            //TODO add instead an endpoint to get all pending requests for an user
            const isPending = await fetch(`${bridgeURL}/is-address-available/${address}`).then(r => r.json()).then(d => !d.result);

            if (!isPending) {
                clearInterval(state.checkPendingInterval);
                state.checkPendingInterval = null;
                state.pending = false;
                if (wasPending) {
                    callbacks.onFinishedQueue.forEach(fn=>fn());
                }
            } else {
                state.pending = true;
            }
        }, 10000);
    }
}

export const getPendingChecker = () => pendingChecker;

