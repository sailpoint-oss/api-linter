// Copyright (c) 2026. SailPoint Technologies, Inc. All rights reserved.
enum VersionExemptPaths {
    OAUTH = "/oauth/"
}

export function IsPathExemptFromVersioning(path: string): boolean {
    for (const exemption in VersionExemptPaths) {
        if (path.includes(exemption)) {
            return true
        }
    }

    return false
}

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