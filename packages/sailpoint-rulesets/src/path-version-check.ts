// Checks that every path has a version, either in a server URL or in the path.
//
// paths-must-include-version:
//   given: $
//   then:
//     function: path-version-check
//     functionOptions:
//       rule: 115
//
// The versioned specs put the version in the server URL, for example
// https://{tenant}.api.identitynow.com/v2025. The API collections put it in
// the path, for example /access-profiles/v1/{id}.

import { OpenAPIV3 } from "openapi-types";
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

const SERVER_VERSION = /\/(v\d+|beta)\/?$/;
const PATH_VERSION = /\/(v\d+|beta)(\/|$)/;

export default createOptionalContextRulesetFunction(
  {
    input: null,
    options: {
      type: "object",
      additionalProperties: false,
      properties: {
        rule: true,
      },
      required: ["rule"],
    },
  },
  (targetVal: OpenAPIV3.Document, options: { rule: string }) => {
    const { rule } = options;
    if (!targetVal || typeof targetVal.paths !== "object" || targetVal.paths === null) return;

    const servers = Array.isArray(targetVal.servers) ? targetVal.servers : [];
    if (servers.length > 0 && servers.every((server) => SERVER_VERSION.test(server?.url ?? ""))) return;

    return Object.keys(targetVal.paths)
      .filter((path) => !PATH_VERSION.test(path))
      .map((path) => ({
        message: `Rule ${rule}: The path ${path} must include a version segment, for example /v1 or /beta, or every server URL must end with the version`,
        path: ["paths", path],
      }));
  },
);
