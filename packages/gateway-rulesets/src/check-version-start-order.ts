import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

function countDigits(num:number) {
    return String(num).split('').reduce(
        (count) => count + 1, 0);
}
let isYear:boolean = false;
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

        if(isYear && digitCount==1){
            results.push({
                message: `non-versioned apis must be specified above versioned apis`
            });
        }else{
            if(digitCount>=4){
                isYear = true;
            }
        }
        return results;
    },
);