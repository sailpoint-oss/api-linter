export interface Route {
    // A unique id of the route (required)
    id: string;

    // Externally exposed path of the API. API versions like v2024 should be ommitted from the path and are derived during runtime (required)
    path: string;

    // An optional array of allowed HTTP methods [""POST","PUT"], default is ["*"]
    methods?: string[];

    // service id to route the request to for example mice, ams (required)
    service: string;

    // Backend service path, if not specified the path is used including the version. (optional)
    servicePath?: string;

    // Integer version start indicates the starting version of API for example 2024. Should be set to 0 for non versionsed APIs for example /oauth (optional)
    versionStart?: number;

    // Version end indicates that the API should not be supported after a certain version (optional)
    versionEnd?: number;

    // Array of additional versions for eg. ["beta""v3"]. Default is []. (optional)
    additionalVersions?: string[];

    // Override for the latest version mapping. If set, /latest will map to this version instead of the global latestVersion. (optional)
    latestVersionOverride?: number;

    // Feature flag to check to route to another service. (optional)
    featureFlag?: string;

    // Service to route to when FeatureFlag is enabled. (optional)
    featureFlagServiceId?: string;

    // Backend service path when featureFlag is enabled. (optional)
    featureFlagServicePath?: string;

    // Can be path or prefix. When path then the route is exactly matched where as prefix matches the route starts with.
    routeType?: string;

    // strip prefix when the request is send to the backend. Default is true. (optional)
    stripPrefix?: boolean;

    // strip prefix path can be used to strip a part of the path instead of whole path. (optional and only used when stripPrefix is true)
    stripPrefixPath?: string;

    // API state can be public, private, limited-preview, public-preview (optional)
    apiState?: string;

    // Array of unauthenticated path prefixes, does not contain versions. (optional)
    unauthenticatedPaths?: string[];

    // Set in format yyyy-mm-dd, this represents deprecation date for an API.  If set API GW sends a Deprecation header to the client with the date. (optional)
    deprecation?: string;

    // Feature flag specifies end of life date of an API. (optional)
    endOfLifeDateFeatureFlag?: string;

    // Number of requests allowed per rateLimitIntervalSeconds (optional)
    rateLimit?: number;

    // Interval in seconds for rate limiting
    rateLimitIntervalSeconds?: number;

    // Extra rule where tenant specific rate limits are defined.
    rateLimitExtraRule?: string;

    // Only supported value is url that allows for url to be included in the rate limit key.
    rateLimitType?: string;

    // If specified then an encrypted client IP is sent to the backend.
    clientIPHeader?: boolean;

    // Supported client types are clientTimeout1m, clientTimeout2m, clientStreaming with different http timeouts. Default is clientTimeout1m.
    clientType?: string;

    // Boolean flag to enable/disable the circuit breaker default value is false
    circuitBreakerEnabled?: boolean;

    // Circuit breaker threshold count to check tripping condition default is 10
    circuitBreakerThresholdCount?: number;

    // Circuit breaker percentage failure to trip the circuit breaker default value is 0.3 ie 30%
    circuitBreakerPercentage?: number;

    // Circuit breaker interval in seconds default is 60 seconds
    circuitBreakerInterval?: number;

    // Circuit breaker timeout in seconds default is 60 seconds
    circuitBreakerTimeout?: number;

    // Circuit breaker max requests allowed in half open state default is 10
    circuitBreakerMaxRequests?: number;

    // Circuit breaker type, only supported values are "route" and "tenant" default is route
    circuitBreakerType?: string;

    // Licenses that are required to access this route
    licenses?: string[];

    // Properties can be overwritten for a version using this map.
    versionDetailsMap?: Map<string, VersionDetails>;

    // AccessRights is an array of rights required to access this route. (optional)
    rights?: string[];

    // Subroutes is a map of subroutes and their properties for a given route ID
    subroutes?: Map<string, Subroute>;
}

export interface VersionDetails {
    apiState?: string;
    deprecation?: string;
    // Add other VersionDetails properties as needed
}

export interface Subroute {
    rights?: string[];
    methods?: string[];
    versions?: string[];
    rateLimit?: number;
    rateLimitIntervalSeconds?: number;
}
