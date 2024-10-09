import {setBaseUrl} from "../lib/http";
import {mountApp} from "./index";

setBaseUrl(DEV_MODE?"http://localhost:2569":"");

declare const DEV_MODE;

mountApp();
