# Confluence Performance Report (PC99)

Generated from CSV. Grouped by service, then controller/action. Durations are shown in seconds (converted from nanoseconds). Controllers are sorted by their slowest PC99 duration (desc). Tenants are listed slowest→fastest within each controller/action.

## Overall

| Metric | Value |
| --- | --- |
| PC99 Duration | 0.131s |
| Count | 135930746 |

## Service: identity_suite

| Service Total PC99 | Service Total Count |
| --- | --- |
| 0.157s | 56088088 |

| Controller & Action | PC99 (slowest duration) | Controller __TOTAL__ PC99 | Controller __TOTAL__ Count |
| --- | --- | --- | --- |
| NeprofileAdmin::RolesController::create | 112.231s | 112.231s | 97 |
| NeprofileAdmin::RolesController::update | 63.276s | 49.775s | 537 |
| NeaccessAdmin::NeaccessRolesController::update | 21.922s | 21.922s | 74 |
| Admin::ApiKeysController::edit | 10.049s | 10.049s | 1006 |
| NeprofileAdmin::RolesController::edit | 4.606s | 3.027s | 2420 |

### NeprofileAdmin::RolesController::create

- **PC99 (slowest duration)**: 112.231s
- **Controller __TOTAL__ PC99**: 112.231s
- **Controller __TOTAL__ Count**: 97

| Tenant | PC99 | Count |
| --- | --- | --- |
| nttdbxo | 112.231s | 10 |
| villagemd-sb | 58.207s | 1 |
| mdlz-sb | 55.010s | 2 |
| stonybrook-sb | 46.405s | 1 |
| bcc-sb | 29.354s | 1 |

### NeprofileAdmin::RolesController::update

- **PC99 (slowest duration)**: 63.276s
- **Controller __TOTAL__ PC99**: 49.775s
- **Controller __TOTAL__ Count**: 537

| Tenant | PC99 | Count |
| --- | --- | --- |
| villagemd-sb | 63.276s | 9 |
| nttdbxo | 52.853s | 5 |
| stonybrook-sb | 28.432s | 1 |
| ucdavis-prod | 28.431s | 3 |
| southregion-nerm | 25.726s | 4 |

### NeaccessAdmin::NeaccessRolesController::update

- **PC99 (slowest duration)**: 21.922s
- **Controller __TOTAL__ PC99**: 21.922s
- **Controller __TOTAL__ Count**: 74

| Tenant | PC99 | Count |
| --- | --- | --- |
| southregion-nerm | 21.922s | 7 |
| deliveroo | 21.488s | 6 |
| 122gc-tst | 11.792s | 7 |
| royalflora | 10.252s | 12 |
| uow-preprod | 5.735s | 1 |

### Admin::ApiKeysController::edit

- **PC99 (slowest duration)**: 10.049s
- **Controller __TOTAL__ PC99**: 10.049s
- **Controller __TOTAL__ Count**: 1006

| Tenant | PC99 | Count |
| --- | --- | --- |
| telusdev | 10.049s | 23 |
| usfoods-sb | 10.049s | 6 |
| legacyhealthdev | 6.872s | 9 |
| orlandohealth | 4.252s | 17 |
| mdlz-sb | 3.412s | 60 |

### NeprofileAdmin::RolesController::edit

- **PC99 (slowest duration)**: 4.606s
- **Controller __TOTAL__ PC99**: 3.027s
- **Controller __TOTAL__ Count**: 2420

| Tenant | PC99 | Count |
| --- | --- | --- |
| wellspan | 4.606s | 11 |
| ucsf-sb | 4.085s | 8 |
| nttdbxo | 4.005s | 34 |
| chs | 3.669s | 1 |
| adnext-sb | 2.908s | 131 |

## Service: auth_service

| Service Total PC99 | Service Total Count |
| --- | --- |
| 2.579s | 288698 |

| Controller & Action | PC99 (slowest duration) | Controller __TOTAL__ PC99 | Controller __TOTAL__ Count |
| --- | --- | --- | --- |
| V1::Oauth::OAuthController::callback | 16.568s | 4.699s | 39513 |
| V1::Oauth::OAuthController::refresh_token | 4.606s | 2.381s | 39158 |
| V1::Oauth::OAuthController::login | 0.394s | 0.073s | 198889 |
| V1::Oauth::OAuthController::logout | 0.044s | 0.041s | 11077 |
| V1::Oauth::OAuthController::idn_internal_login | 0.014s | 0.014s | 61 |

### V1::Oauth::OAuthController::callback

- **PC99 (slowest duration)**: 16.568s
- **Controller __TOTAL__ PC99**: 4.699s
- **Controller __TOTAL__ Count**: 39513

| Tenant | PC99 | Count |
| --- | --- | --- |
| twint | 16.568s | 106 |
| repsol-sb | 10.886s | 124 |
| iberostar | 10.049s | 41 |
| laboralkutxa | 10.049s | 223 |
| sylvamo | 9.092s | 70 |

### V1::Oauth::OAuthController::refresh_token

- **PC99 (slowest duration)**: 4.606s
- **Controller __TOTAL__ PC99**: 2.381s
- **Controller __TOTAL__ Count**: 39158

| Tenant | PC99 | Count |
| --- | --- | --- |
| alliander | 4.606s | 144 |
| atmus | 4.338s | 75 |
| laredoute | 4.338s | 256 |
| iberostar | 4.168s | 125 |
| telkom-sb | 4.168s | 2 |

### V1::Oauth::OAuthController::login

- **PC99 (slowest duration)**: 0.394s
- **Controller __TOTAL__ PC99**: 0.073s
- **Controller __TOTAL__ Count**: 198889

| Tenant | PC99 | Count |
| --- | --- | --- |
| oldnational-sb | 0.394s | 190 |
| radial | 0.394s | 79 |
| ridgeview-sb | 0.335s | 190 |
| pvhmc-sb | 0.212s | 63 |
| ohsu | 0.195s | 350 |

### V1::Oauth::OAuthController::logout

- **PC99 (slowest duration)**: 0.044s
- **Controller __TOTAL__ PC99**: 0.041s
- **Controller __TOTAL__ Count**: 11077

| Tenant | PC99 | Count |
| --- | --- | --- |
| wsl | 0.044s | 8642 |
| mdlz-sb | 0.039s | 127 |
| skyworksinc | 0.039s | 37 |
| uchicago-sb | 0.029s | 1 |
| ucmedicine | 0.025s | 69 |

### V1::Oauth::OAuthController::idn_internal_login

- **PC99 (slowest duration)**: 0.014s
- **Controller __TOTAL__ PC99**: 0.014s
- **Controller __TOTAL__ Count**: 61

| Tenant | PC99 | Count |
| --- | --- | --- |
| mdlz-sb | 0.011s | 32 |
| costco-sb | 0.003s | 8 |
| telenet-sb | 0.003s | 14 |
| tfs-sb | 0.003s | 4 |
| aveva-sb | 0.003s | 1 |

## Service: tenant_service

| Service Total PC99 | Service Total Count |
| --- | --- |
| 0.105s | 78804869 |

| Controller & Action | PC99 (slowest duration) | Controller __TOTAL__ PC99 | Controller __TOTAL__ Count |
| --- | --- | --- | --- |
| Internal::V1::TenantsController::create | 9.850s | 9.850s | 13 |
| Internal::V1::TenantsController::destroy | 2.759s | 2.759s | 1 |
| Internal::V1::TenantsController::index | 0.160s | 0.160s | 22081917 |
| Internal::V1::TenantsController::update | 0.112s | 0.112s | 45 |
| Internal::V1::TenantsController::show | 0.078s | 0.078s | 17349057 |

### Internal::V1::TenantsController::create

- **PC99 (slowest duration)**: 9.850s
- **Controller __TOTAL__ PC99**: 9.850s
- **Controller __TOTAL__ Count**: 13

| Tenant | PC99 | Count |
| --- | --- | --- |
| (blank) | 9.850s | 13 |

### Internal::V1::TenantsController::destroy

- **PC99 (slowest duration)**: 2.759s
- **Controller __TOTAL__ PC99**: 2.759s
- **Controller __TOTAL__ Count**: 1

| Tenant | PC99 | Count |
| --- | --- | --- |
| (blank) | 2.759s | 1 |

### Internal::V1::TenantsController::index

- **PC99 (slowest duration)**: 0.160s
- **Controller __TOTAL__ PC99**: 0.160s
- **Controller __TOTAL__ Count**: 22081917

| Tenant | PC99 | Count |
| --- | --- | --- |
| (blank) | 0.160s | 22081917 |

### Internal::V1::TenantsController::update

- **PC99 (slowest duration)**: 0.112s
- **Controller __TOTAL__ PC99**: 0.112s
- **Controller __TOTAL__ Count**: 45

| Tenant | PC99 | Count |
| --- | --- | --- |
| (blank) | 0.112s | 45 |

### Internal::V1::TenantsController::show

- **PC99 (slowest duration)**: 0.078s
- **Controller __TOTAL__ PC99**: 0.078s
- **Controller __TOTAL__ Count**: 17349057

| Tenant | PC99 | Count |
| --- | --- | --- |
| (blank) | 0.078s | 17349057 |

## Service: portal

| Service Total PC99 | Service Total Count |
| --- | --- |
| 0.761s | 749091 |

| Controller & Action | PC99 (slowest duration) | Controller __TOTAL__ PC99 | Controller __TOTAL__ Count |
| --- | --- | --- | --- |
| SessionsController::new | 7.444s | 0.703s | 738496 |
| SessionsController::create | 4.168s | 1.911s | 7794 |
| SessionsController::update | 1.989s | 1.307s | 301 |
| SessionsController::edit | 1.415s | 1.049s | 305 |
| SessionsController::resend | 0.718s | 0.322s | 14 |

### SessionsController::new

- **PC99 (slowest duration)**: 7.444s
- **Controller __TOTAL__ PC99**: 0.703s
- **Controller __TOTAL__ Count**: 738496

| Tenant | PC99 | Count |
| --- | --- | --- |
| devmcprofile | 7.444s | 950 |
| adventhealthdev | 6.218s | 1358 |
| chubb-sb | 5.974s | 69 |
| franciscandev | 5.974s | 766 |
| globalcu-sb | 5.740s | 60 |

### SessionsController::create

- **PC99 (slowest duration)**: 4.168s
- **Controller __TOTAL__ PC99**: 1.911s
- **Controller __TOTAL__ Count**: 7794

| Tenant | PC99 | Count |
| --- | --- | --- |
| mbie | 4.168s | 67 |
| telkom-sb | 3.847s | 1 |
| ne-smoke-canary | 3.345s | 60 |
| telus | 2.478s | 547 |
| iberostar | 2.242s | 34 |

### SessionsController::update

- **PC99 (slowest duration)**: 1.989s
- **Controller __TOTAL__ PC99**: 1.307s
- **Controller __TOTAL__ Count**: 301

| Tenant | PC99 | Count |
| --- | --- | --- |
| mbie | 1.989s | 55 |
| ssmhc | 1.007s | 77 |
| multicare | 0.717s | 22 |
| peacehealth | 0.662s | 16 |
| 122gc-tst | 0.649s | 18 |

### SessionsController::edit

- **PC99 (slowest duration)**: 1.415s
- **Controller __TOTAL__ PC99**: 1.049s
- **Controller __TOTAL__ Count**: 305

| Tenant | PC99 | Count |
| --- | --- | --- |
| mbie | 1.415s | 54 |
| myfreseniusid | 0.674s | 1 |
| telus | 0.322s | 36 |
| ssmhc | 0.225s | 75 |
| 122gc-tst | 0.184s | 15 |

### SessionsController::resend

- **PC99 (slowest duration)**: 0.718s
- **Controller __TOTAL__ PC99**: 0.322s
- **Controller __TOTAL__ Count**: 14

| Tenant | PC99 | Count |
| --- | --- | --- |
| 122gc-tst | 0.718s | 1 |
| mbie | 0.212s | 3 |
| multicare | 0.163s | 3 |
| ssmhc | 0.145s | 2 |
| peacehealth | 0.123s | 1 |
