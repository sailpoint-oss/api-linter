// Copyright (c) 2026. SailPoint Technologies, Inc. All rights reserved.
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import {Route, RouteKeys} from "./types.js";
import {CheckInterfaceForField} from "./utils.js";

export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {},
    },
    (incomingRoute: Object, options: { }) => {
        let errors: {message: string}[] = [];
        const routeName = (incomingRoute as Route).id

        CheckInterfaceForField(routeName, incomingRoute, RouteKeys, errors)
        return errors
    }
);