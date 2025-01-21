import kaboom from "kaboom";
import { scale } from "./constants";

export const k = kaboom(
    {
        width : 256 * scale, // multiply with scale to fix pixel issue with kaboom slicing
        height : 144 * scale,
        scale,
        letterbox :true, // to scale game UI with resolution,
        global : false, //to prevent other scripts to access kaboom expect from k
    }
);