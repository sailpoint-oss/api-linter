// Copyright (c) 2026. SailPoint Technologies, Inc. All rights reserved.
export function CheckInterfaceForField(objectName: string, objectToValidate: Object, interfaceKeys: string[], errors: {message: string}[]): void{

    for (const field in objectToValidate) {
        if (interfaceKeys.includes(field)) {
            continue;
        }
        errors.push({
            message: `${objectName} has an invalid field: ${field}`
        });
    }
}