module.exports = (targetVal, _opts) => {
    const { rule, field } = _opts;

    keyFound = false;
    for (const [key, value] of Object.entries(targetVal.parameters)) {
         if (JSON.stringify(value).indexOf(`"in":"query","name":"${field}"`) == 1) {
            keyFound = true
        }
    }

    if (!keyFound) {
        return [
            {
                message: `Rule ${rule}: All GET operations should have ${field} as a query parameter`
            }
        ];
      }


}