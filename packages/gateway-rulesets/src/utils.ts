import {RouteKeys} from "./types.js";

export function CheckInterfaceForField(objectName: string, incomingObject: Object, interfaceKeys: string[], errors: {message: string}[]): void{
    let results: {message: string}[] = [];

    for (const field in incomingObject) {
        if (interfaceKeys.includes(field)) {
            continue;
        }
        errors.push({
            message: `${objectName} has an invalid field: ${field}`
        });
    }
}