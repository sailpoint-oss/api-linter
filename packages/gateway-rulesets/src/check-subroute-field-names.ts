// Copyright (c) 2026. SailPoint Technologies, Inc. All rights reserved.
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import {Route, RouteKeys, SubrouteKeys} from "./types.js";
import {CheckInterfaceForField} from "./utils.js";

export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {},
    },
    (incomingSubroutes: Map<string, Object>, options: { }) => {
        let errors: {message: string}[] = [];

        new Map<string, Object>(Object.entries(incomingSubroutes)).forEach((subroute, id) => {
            CheckInterfaceForField(id, subroute, SubrouteKeys, errors)
        })

        return errors
    }
);