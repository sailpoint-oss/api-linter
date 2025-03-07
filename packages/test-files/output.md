# OpenAPI Linting Report

Last updated: 3/6/2025, 4:32:34 PM

Found **9** total issues:
- :x: Error: 9

---

### :x: Invalid Ref



File: `/packages/test-files/sailpoint-api.OpenAPI.yaml`
      <details open>

<summary>Offending lines</summary>

- **[Line 86](./sailpoint-api.OpenAPI.yaml)**: `#/ é, à, ö,/schemas/Pet` does not exist
- **[Line 100](./sailpoint-api.OpenAPI.yaml)**: `#/components/schemas/ é, à, ö,` does not exist
- **[Line 138](./sailpoint-api.OpenAPI.yaml)**: `#/components/ é, à, ö,/Pet` does not exist
- **[Line 313](./sailpoint-api.OpenAPI.yaml)**: `#/components/ é, à, ö,/ApiResponse` does not exist
- **[Line 348](./sailpoint-api.OpenAPI.yaml)**: `#/Test/schemas/Order` does not exist
- **[Line 351](./sailpoint-api.OpenAPI.yaml)**: `#/components/Test/Order` does not exist
- **[Line 354](./sailpoint-api.OpenAPI.yaml)**: `#/components/schemas/Test` does not exist


</details>

### :x: Paths Must Not Reference Documents Outside Of Their Version



File: `/packages/test-files/v2024/paths/account.yaml`
      <details open>

<summary>Offending lines</summary>

- **[Line 1](./v2024/paths/account.yaml)**: Rule 405: Referenced document beta/schemas/Account.yaml is outside the allowed version folder v2024: https://sailpoint-oss.github.io/sailpoint-api-guidelines/#405


</details>

### :x: Root Tags Must Be In Alphabetical Order



File: `/packages/test-files/sailpoint-api.OpenAPI.yaml`
      <details open>

<summary>Offending lines</summary>

- **[Line 23](./sailpoint-api.OpenAPI.yaml)**: Rule 403: Tags must be in alphabetical order: https://sailpoint-oss.github.io/sailpoint-api-guidelines/#403


</details>

