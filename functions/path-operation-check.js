// path-operation-check:
// message: "{{error}}: https://sailpoint-oss.github.io/sailpoint-api-guidelines/#321"
// given: $[*]
// severity: warn
// then:
//   function: path-operation-check
//   functionOptions:
//     rule: 400



module.exports = (targetVal, _opts) => {
    const { rule } = _opts;

    let results = [];

    const allowedOperationsForGetArrayMethods = [ 'compare', 'export', 'get', 'list', 'search' ]
    const allowedOperationsForGetMethods = ['get', 'search', 'test' ]
    
    const allowedOperationsForPostMethods = [
        'approve', 'cancel',     'complete',
        'create',  'delete',     'disable',
        'enable',  'export',     'hide',
        'import',  'move',       'ping',
        'reject',  'reset',      'search',
        'send',    'set',        'show',
        'start',   'submit',     'sync',
        'unlock',  'unregister', 'update'
      ];

    const allowedOperationsForPutMethods = [
        'put', 'set'
    ];

    const allowedOperationsForPatchMethods = [
        'patch', 'update'
    ]

    const allowedOperationsForDeleteMethods = [
        'delete', 'remove'
    ]

    for (const [key, value] of Object.entries(targetVal)) {
        if (value.operationId === undefined) {
            results.push({
                message: `Rule ${rule}: operationId must be provided`,
                path: [key, 'operationId'],
              });
        }
        // GET operations
        const descriptor = value.operationId?.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1)[0]

        // if (key == 'get' && value.responses["200"]?.content["application/json"]?.schema?.type == 'array') {
        //     //operationId must start with get or list
        //     if (!allowedOperationsForGetArrayMethods.includes(descriptor)) {
        //         results.push({
        //             message: `Rule ${rule}: ${descriptor} is invalid, the operationId must start with one of the allowed values [${allowedOperationsForGetArrayMethods}] for get endpoints that return an array of results`,
        //             path: [key, 'operationId'],
        //           });
        //     }
        // } else if (key == 'get') {
        //     //operationId must start with get
        //     if(!allowedOperationsForGetMethods.includes(descriptor)) {
        //         results.push({
        //             message: `Rule ${rule}: ${descriptor} is invalid, the operationId must start with one of the allowed values [${allowedOperationsForGetMethods}] for get endpoints that return a single result`,
        //             path: [key, 'operationId'],
        //           });
        //     }
        // } else if (key == 'post') {
        //     if (!allowedOperationsForPostMethods.includes(descriptor)) {
        //         results.push({
        //             message: `Rule ${rule}: ${descriptor} is invalid, the operationId must start with one of the allowed values [${allowedOperationsForPostMethods}] for post endpoints`,
        //             path: [key, 'operationId'],
        //           });
        //     }
        // } else if (key == 'put'){
        //     if (!allowedOperationsForPutMethods.includes(descriptor)) {
        //         results.push({
        //             message: `Rule ${rule}: ${descriptor} is invalid, the operationId must start with one of the allowed values [${allowedOperationsForPutMethods}] for put endpoints`,
        //             path: [key, 'operationId'],
        //           });
        //     }
        // } else if (key == 'patch') {
        //     if(!allowedOperationsForPatchMethods.includes(descriptor)) {
        //         results.push({
        //             message: `Rule ${rule}: ${descriptor} is invalid, the operationId must start with one of the allowed values [${allowedOperationsForPatchMethods}] for patch endpoints`,
        //             path: [key, 'operationId'],
        //           });
        //     }
        // } else if (key == 'delete') {
        //     if(!allowedOperationsForDeleteMethods.includes(descriptor)) {
        //         results.push({
        //             message: `Rule ${rule}: ${descriptor} is invalid, the operationId must start with one of the allowed values [${allowedOperationsForDeleteMethods}] for delete endpoints`,
        //             path: [key, 'operationId'],
        //           });
        //     }
        // }
    }

    return results;
  };