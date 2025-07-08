/**
 * FF14 API Configuration Module
 * Provides centralized configuration for FF14 API endpoints and settings
 */

export interface RateLimitConfig {
  requestsPerSecond: number;
  burstLimit: number;
}

export interface EndpointConfig {
  character: string;
  freeCompany: string;
  linkshell: string;
  pvpTeam: string;
  search: string;
  servers: string;
  jobs: string;
  items: string;
  achievements: string;
  quests: string;
  actions: string;
  mounts: string;
  minions: string;
  emotes: string;
  [key: string]: string;
}

export interface FF14ApiConfigType {
  baseUrl: string;
  timeout: number;
  rateLimit: RateLimitConfig;
  endpoints: EndpointConfig;
}

/**
 * Default FF14 API configuration
 * Uses XIVAPI as the primary data source
 */
export const FF14ApiConfig: FF14ApiConfigType = {
  baseUrl: process.env.FF14_API_BASE_URL || 'https://xivapi.com',
  timeout: parseInt(process.env.FF14_API_TIMEOUT || '10000', 10),
  rateLimit: {
    requestsPerSecond: parseInt(process.env.FF14_API_RATE_LIMIT_RPS || '20', 10),
    burstLimit: parseInt(process.env.FF14_API_RATE_LIMIT_BURST || '100', 10)
  },
  endpoints: {
    character: '/character',
    freeCompany: '/freecompany',
    linkshell: '/linkshell',
    pvpTeam: '/pvpteam',
    search: '/search',
    servers: '/servers',
    jobs: '/classjob',
    items: '/item',
    achievements: '/achievement',
    quests: '/quest',
    actions: '/action',
    mounts: '/mount',
    minions: '/companion',
    emotes: '/emote'
  }
};

/**
 * Validates FF14 API configuration
 * @param config - Configuration object to validate
 * @throws {Error} If configuration is invalid
 */
export function validateConfig(config: FF14ApiConfigType): void {
  // Validate baseUrl
  if (!config.baseUrl) {
    throw new Error('baseUrl is required');
  }

  try {
    new URL(config.baseUrl);
  } catch {
    throw new Error('baseUrl must be a valid URL');
  }

  // Validate timeout
  if (config.timeout !== undefined && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
    throw new Error('timeout must be a positive number');
  }

  // Validate endpoints
  if (!config.endpoints) {
    throw new Error('endpoints configuration is required');
  }

  if (typeof config.endpoints !== 'object') {
    throw new Error('endpoints must be an object');
  }

  // Validate rate limit configuration
  if (config.rateLimit) {
    if (typeof config.rateLimit !== 'object') {
      throw new Error('rateLimit must be an object');
    }

    if (config.rateLimit.requestsPerSecond !== undefined && 
        (typeof config.rateLimit.requestsPerSecond !== 'number' || config.rateLimit.requestsPerSecond <= 0)) {
      throw new Error('requestsPerSecond must be a positive number');
    }

    if (config.rateLimit.burstLimit !== undefined && 
        (typeof config.rateLimit.burstLimit !== 'number' || config.rateLimit.burstLimit <= 0)) {
      throw new Error('burstLimit must be a positive number');
    }
  }
}

/**
 * Constructs a full URL for a given endpoint
 * @param config - FF14 API configuration
 * @param endpoint - Endpoint name (e.g., 'character', 'items')
 * @param id - Optional resource ID to append to the endpoint
 * @param queryParams - Optional query parameters
 * @returns Full URL string
 */
export function getEndpointUrl(
  config: FF14ApiConfigType,
  endpoint: keyof EndpointConfig,
  id?: string,
  queryParams?: Record<string, string | number | boolean>
): string {
  if (!config.endpoints[endpoint]) {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }

  let url = config.baseUrl + config.endpoints[endpoint];

  // Append ID if provided
  if (id) {
    url += `/${id}`;
  }

  // Append query parameters if provided
  if (queryParams && Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  return url;
}

/**
 * Gets configuration with environment variable overrides
 * @param overrides - Optional configuration overrides
 * @returns Merged configuration
 */
export function getConfig(overrides?: Partial<FF14ApiConfigType>): FF14ApiConfigType {
  const config: FF14ApiConfigType = {
    ...FF14ApiConfig,
    ...overrides
  };

  validateConfig(config);
  return config;
}

/**
 * Common query parameter builders for different endpoint types
 */
export const QueryBuilders = {
  /**
   * Builds query parameters for character data requests
   */
  character: (options: {
    data?: string[];
    extended?: boolean;
    includeAchievements?: boolean;
    includeFreeCompany?: boolean;
    includeFriends?: boolean;
    includeClassJobs?: boolean;
    includePvPTeam?: boolean;
  } = {}) => {
    const params: Record<string, string> = {};

    if (options.data && options.data.length > 0) {
      params.data = options.data.join(',');
    }

    if (options.extended) {
      params.extended = '1';
    }

    return params;
  },

  /**
   * Builds query parameters for search requests
   */
  search: (options: {
    indexes?: string[];
    columns?: string[];
    limit?: number;
    page?: number;
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
  } = {}) => {
    const params: Record<string, string> = {};

    if (options.indexes && options.indexes.length > 0) {
      params.indexes = options.indexes.join(',');
    }

    if (options.columns && options.columns.length > 0) {
      params.columns = options.columns.join(',');
    }

    if (options.limit) {
      params.limit = String(options.limit);
    }

    if (options.page) {
      params.page = String(options.page);
    }

    if (options.sort_field) {
      params.sort_field = options.sort_field;
    }

    if (options.sort_order) {
      params.sort_order = options.sort_order;
    }

    return params;
  },

  /**
   * Builds query parameters for item data requests
   */
  item: (options: {
    columns?: string[];
    limit?: number;
    ids?: number[];
  } = {}) => {
    const params: Record<string, string> = {};

    if (options.columns && options.columns.length > 0) {
      params.columns = options.columns.join(',');
    }

    if (options.limit) {
      params.limit = String(options.limit);
    }

    if (options.ids && options.ids.length > 0) {
      params.ids = options.ids.join(',');
    }

    return params;
  }
};