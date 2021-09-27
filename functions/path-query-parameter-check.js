module.exports = (targetVal, _opts, paths) => {
    const { field } = _opts;

    const rootPath = paths.target !== void 0 ? paths.target : paths.given;

    keyFound = false;
    for (const [key, value] of Object.entries(targetVal.parameters)) {
         if (JSON.stringify(value).indexOf(`"in":"query","name":"${field}"`) == 1) {
            keyFound = true
        }
    }

    if (!keyFound) {
        return [
            {
                message: `All GET operations should have ${field} as a query parameter`
            }
        ];
      }


}