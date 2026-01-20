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

| Controller & Action | PC99 (slowest duration) | Controller __TOTAL__ PC99 | Controller __TOTAL__ Count | Tenants (slowest→fastest) |
| --- | --- | --- | --- | --- |
| NeprofileAdmin::RolesController::create | 112.231s | 112.231s | 97 | nttdbxo: 112.231s, count 10<br/>villagemd-sb: 58.207s, count 1<br/>mdlz-sb: 55.010s, count 2<br/>stonybrook-sb: 46.405s, count 1<br/>bcc-sb: 29.354s, count 1 |
| NeprofileAdmin::RolesController::update | 63.276s | 49.775s | 537 | villagemd-sb: 63.276s, count 9<br/>nttdbxo: 52.853s, count 5<br/>stonybrook-sb: 28.432s, count 1<br/>ucdavis-prod: 28.431s, count 3<br/>southregion-nerm: 25.726s, count 4 |
| NeaccessAdmin::NeaccessRolesController::update | 21.922s | 21.922s | 74 | southregion-nerm: 21.922s, count 7<br/>deliveroo: 21.488s, count 6<br/>122gc-tst: 11.792s, count 7<br/>royalflora: 10.252s, count 12<br/>uow-preprod: 5.735s, count 1 |
| Admin::ApiKeysController::edit | 10.049s | 10.049s | 1006 | telusdev: 10.049s, count 23<br/>usfoods-sb: 10.049s, count 6<br/>legacyhealthdev: 6.872s, count 9<br/>orlandohealth: 4.252s, count 17<br/>mdlz-sb: 3.412s, count 60 |
| NeprofileAdmin::RolesController::edit | 4.606s | 3.027s | 2420 | wellspan: 4.606s, count 11<br/>ucsf-sb: 4.085s, count 8<br/>nttdbxo: 4.005s, count 34<br/>chs: 3.669s, count 1<br/>adnext-sb: 2.908s, count 131 |

## Service: auth_service

| Service Total PC99 | Service Total Count |
| --- | --- |
| 2.579s | 288698 |

| Controller & Action | PC99 (slowest duration) | Controller __TOTAL__ PC99 | Controller __TOTAL__ Count | Tenants (slowest→fastest) |
| --- | --- | --- | --- | --- |
| V1::Oauth::OAuthController::callback | 16.568s | 4.699s | 39513 | twint: 16.568s, count 106<br/>repsol-sb: 10.886s, count 124<br/>iberostar: 10.049s, count 41<br/>laboralkutxa: 10.049s, count 223<br/>sylvamo: 9.092s, count 70 |
| V1::Oauth::OAuthController::refresh_token | 4.606s | 2.381s | 39158 | alliander: 4.606s, count 144<br/>atmus: 4.338s, count 75<br/>laredoute: 4.338s, count 256<br/>iberostar: 4.168s, count 125<br/>telkom-sb: 4.168s, count 2 |
| V1::Oauth::OAuthController::login | 0.394s | 0.073s | 198889 | oldnational-sb: 0.394s, count 190<br/>radial: 0.394s, count 79<br/>ridgeview-sb: 0.335s, count 190<br/>pvhmc-sb: 0.212s, count 63<br/>ohsu: 0.195s, count 350 |
| V1::Oauth::OAuthController::logout | 0.044s | 0.041s | 11077 | wsl: 0.044s, count 8642<br/>mdlz-sb: 0.039s, count 127<br/>skyworksinc: 0.039s, count 37<br/>uchicago-sb: 0.029s, count 1<br/>ucmedicine: 0.025s, count 69 |
| V1::Oauth::OAuthController::idn_internal_login | 0.014s | 0.014s | 61 | mdlz-sb: 0.011s, count 32<br/>costco-sb: 0.003s, count 8<br/>telenet-sb: 0.003s, count 14<br/>tfs-sb: 0.003s, count 4<br/>aveva-sb: 0.003s, count 1 |

## Service: tenant_service

| Service Total PC99 | Service Total Count |
| --- | --- |
| 0.105s | 78804869 |

| Controller & Action | PC99 (slowest duration) | Controller __TOTAL__ PC99 | Controller __TOTAL__ Count | Tenants (slowest→fastest) |
| --- | --- | --- | --- | --- |
| Internal::V1::TenantsController::create | 9.850s | 9.850s | 13 | (blank): 9.850s, count 13 |
| Internal::V1::TenantsController::destroy | 2.759s | 2.759s | 1 | (blank): 2.759s, count 1 |
| Internal::V1::TenantsController::index | 0.160s | 0.160s | 22081917 | (blank): 0.160s, count 22081917 |
| Internal::V1::TenantsController::update | 0.112s | 0.112s | 45 | (blank): 0.112s, count 45 |
| Internal::V1::TenantsController::show | 0.078s | 0.078s | 17349057 | (blank): 0.078s, count 17349057 |

## Service: portal

| Service Total PC99 | Service Total Count |
| --- | --- |
| 0.761s | 749091 |

| Controller & Action | PC99 (slowest duration) | Controller __TOTAL__ PC99 | Controller __TOTAL__ Count | Tenants (slowest→fastest) |
| --- | --- | --- | --- | --- |
| SessionsController::new | 7.444s | 0.703s | 738496 | devmcprofile: 7.444s, count 950<br/>adventhealthdev: 6.218s, count 1358<br/>chubb-sb: 5.974s, count 69<br/>franciscandev: 5.974s, count 766<br/>globalcu-sb: 5.740s, count 60 |
| SessionsController::create | 4.168s | 1.911s | 7794 | mbie: 4.168s, count 67<br/>telkom-sb: 3.847s, count 1<br/>ne-smoke-canary: 3.345s, count 60<br/>telus: 2.478s, count 547<br/>iberostar: 2.242s, count 34 |
| SessionsController::update | 1.989s | 1.307s | 301 | mbie: 1.989s, count 55<br/>ssmhc: 1.007s, count 77<br/>multicare: 0.717s, count 22<br/>peacehealth: 0.662s, count 16<br/>122gc-tst: 0.649s, count 18 |
| SessionsController::edit | 1.415s | 1.049s | 305 | mbie: 1.415s, count 54<br/>myfreseniusid: 0.674s, count 1<br/>telus: 0.322s, count 36<br/>ssmhc: 0.225s, count 75<br/>122gc-tst: 0.184s, count 15 |
| SessionsController::resend | 0.718s | 0.322s | 14 | 122gc-tst: 0.718s, count 1<br/>mbie: 0.212s, count 3<br/>multicare: 0.163s, count 3<br/>ssmhc: 0.145s, count 2<br/>peacehealth: 0.123s, count 1 |
