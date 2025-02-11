// path-list-endpoints-must-support-pagination:
// message: "{{error}}: https://sailpoint-oss.github.io/sailpoint-api-guidelines/#159" 
// given: $.get
// severity: error
// then:
//   function: path-query-parameter-pagination-check
//   functionOptions:
//     rule: 159

export default (targetVal, options) => {
    const { rule } = options;
    let results = [];

    if (targetVal.responses?.[200].content?.['application/json']?.schema.type == 'array') {

        let offsetFound = false;
        let limitFound = false;

    if (targetVal.parameters != undefined) {
        for (const [key, value] of Object.entries(targetVal.parameters)) {
            if (value.in == "query" && value.name == "limit") {

                limitFound = true;
                if (value.schema.minimum == undefined) {
                    results.push({
                        message: `Rule ${rule}: All GET list operations must have minimum defined for limit query parameter`
                    });
                }

                if (value.schema.maximum == undefined) {
                    results.push({
                        message: `Rule ${rule}: All GET list operations must have maximum defined for limit query parameter`
                    });
                }
            }

            if (value.in == "query" && value.name == "offset") {
                offsetFound = true;
            }
        }
    }

        if (!offsetFound) {
            results.push({
                message: `Rule ${rule}: All GET list operations must have offset as a query parameter`
            });
        }

        if (!limitFound) {
            results.push({
                message: `Rule ${rule}: All GET list operations must have limit as a query parameter`
            });
        }
    }

    return results;

};