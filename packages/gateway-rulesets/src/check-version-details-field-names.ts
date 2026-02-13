// Copyright (c) 2026. SailPoint Technologies, Inc. All rights reserved.
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import {Route, RouteKeys, SubrouteKeys, VersionDetailsKeys} from "./types.js";
import {CheckInterfaceForField} from "./utils.js";

export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {},
    },
    (incomingVersionDetails: Map<string, Object>, options: { }) => {
        let errors: {message: string}[] = [];

        new Map<string, Object>(Object.entries(incomingVersionDetails)).forEach((details, id) => {
            CheckInterfaceForField(id, details, VersionDetailsKeys, errors)
        })

        return errors
    }
);