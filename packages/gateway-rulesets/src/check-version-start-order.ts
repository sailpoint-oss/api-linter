import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

function countDigits(num:number) {
    return String(num).split('').reduce(
        (count) => count + 1, 0);
}
let isNonVersioned:boolean = false;
// Create the original function using Spectral's helper.
export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {
        },
    },
    (targetVal: number, options: { }) => {
        let results = [];
        let digitCount:number = countDigits(targetVal);

        if(isNonVersioned && digitCount>=4){
            results.push({
                message: `versioned apis must be specified above non-versioned apis`
            });
        }else{
            if(digitCount==1){
                isNonVersioned = true;
            }
        }
        return results;
    },
);