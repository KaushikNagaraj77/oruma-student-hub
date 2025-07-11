import { tokenManager } from '../utils/tokenManager';

export interface University {
  id: string;
  name: string;
  state: string;
  city: string;
  type: 'public' | 'private' | 'community' | 'technical' | 'hbcu' | 'tribal' | 'religious' | 'for-profit';
  searchTerms: string[];
  website?: string;
  enrollment?: number;
  established?: number;
  accreditation?: string[];
  programs?: string[];
  latitude?: number;
  longitude?: number;
}

export interface UniversitySearchResponse {
  universities: University[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface UniversityDetails extends University {
  description?: string;
  campuses?: {
    name: string;
    address: string;
    city: string;
    state: string;
  }[];
  admissions?: {
    acceptanceRate?: number;
    satScores?: {
      math: number;
      verbal: number;
    };
    actScores?: {
      composite: number;
    };
    applicationDeadline?: string;
  };
  tuition?: {
    inState?: number;
    outOfState?: number;
    international?: number;
  };
  demographics?: {
    totalStudents: number;
    undergraduateStudents: number;
    graduateStudents: number;
    internationalStudents?: number;
  };
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface WorldUniversityAPIResponse {
  domains: string[];
  country: string;
  'state-province': string | null;
  name: string;
  web_pages: string[];
  alpha_two_code: string;
}

class UniversitiesApiService {
  private baseUrl = '/api/universities';
  private worldUniversitiesUrl = 'http://universities.hipolabs.com'; // Test fallback: 'http://invalid-url.com';
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly STORAGE_KEY = 'oruma_universities_cache';
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  constructor() {
    this.loadCacheFromStorage();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async worldUniversitiesRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.worldUniversitiesUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Oruma-Student-Hub/1.0',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`World Universities API error! status: ${response.status}`);
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = tokenManager.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private getCacheKey(type: string, params: any): string {
    return `${type}_${JSON.stringify(params)}`;
  }

  private setCache<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION,
    };
    this.cache.set(key, entry);
    this.saveCacheToStorage();
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.saveCacheToStorage();
      return null;
    }
    
    return entry.data as T;
  }

  private saveCacheToStorage(): void {
    try {
      const cacheData = Array.from(this.cache.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const cacheData = JSON.parse(stored);
        this.cache = new Map(cacheData);
        
        // Clean expired entries
        const now = Date.now();
        for (const [key, entry] of this.cache) {
          if (now > entry.expiresAt) {
            this.cache.delete(key);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
      this.cache.clear();
    }
  }

  private transformWorldUniversityData(worldData: WorldUniversityAPIResponse[]): University[] {
    return worldData.map(item => {
      const type = this.determineUniversityTypeFromName(item.name);
      const state = this.extractStateFromDomain(item.domains[0]) || this.extractStateFromName(item.name);
      const city = this.extractCityFromName(item.name);
      const searchTerms = this.generateSearchTermsFromName(item.name, state, city);

      return {
        id: item.domains[0] || item.name.toLowerCase().replace(/\s+/g, '-'),
        name: item.name,
        state: state || 'Unknown',
        city: city || 'Unknown',
        type,
        searchTerms,
        website: item.web_pages[0],
        enrollment: undefined,
        established: undefined,
        latitude: undefined,
        longitude: undefined,
      };
    });
  }

  private determineUniversityTypeFromName(name: string): University['type'] {
    const lowerName = name.toLowerCase();

    // Community colleges
    if (lowerName.includes('community college') || lowerName.includes('community') && lowerName.includes('college')) {
      return 'community';
    }

    // Technical institutes
    if (lowerName.includes('technical') || lowerName.includes('institute of technology') || lowerName.includes('tech')) {
      return 'technical';
    }

    // Religious institutions
    if (lowerName.includes('christian') || lowerName.includes('catholic') || lowerName.includes('seminary') || 
        lowerName.includes('theological') || lowerName.includes('bible') || lowerName.includes('religious')) {
      return 'religious';
    }

    // State universities (likely public)
    if (lowerName.includes('state university') || lowerName.includes('state college') || 
        lowerName.includes('university of') && (lowerName.includes('california') || lowerName.includes('texas') || 
        lowerName.includes('florida') || lowerName.includes('michigan') || lowerName.includes('virginia'))) {
      return 'public';
    }

    // Default to private for most other universities
    return 'private';
  }

  private extractStateFromDomain(domain: string): string | null {
    // Common university domain patterns that indicate state
    const statePatterns: Record<string, string> = {
      'edu': null, // Generic, doesn't indicate state
      'harvard.edu': 'MA',
      'mit.edu': 'MA',
      'stanford.edu': 'CA',
      'berkeley.edu': 'CA',
      'ucla.edu': 'CA',
      'stevens.edu': 'NJ',
      'princeton.edu': 'NJ',
    };

    return statePatterns[domain] || null;
  }

  private extractStateFromName(name: string): string | null {
    const lowerName = name.toLowerCase();
    
    // State name patterns
    const stateMap: Record<string, string> = {
      'california': 'CA', 'texas': 'TX', 'florida': 'FL', 'new york': 'NY',
      'pennsylvania': 'PA', 'illinois': 'IL', 'ohio': 'OH', 'michigan': 'MI',
      'georgia': 'GA', 'north carolina': 'NC', 'virginia': 'VA', 'washington': 'WA',
      'massachusetts': 'MA', 'maryland': 'MD', 'connecticut': 'CT', 'new jersey': 'NJ',
      'wisconsin': 'WI', 'minnesota': 'MN', 'colorado': 'CO', 'arizona': 'AZ',
    };

    for (const [stateName, stateCode] of Object.entries(stateMap)) {
      if (lowerName.includes(stateName)) {
        return stateCode;
      }
    }

    return null;
  }

  private extractCityFromName(name: string): string | null {
    const lowerName = name.toLowerCase();
    
    // City patterns in university names
    const cityPatterns = [
      'los angeles', 'san diego', 'san francisco', 'berkeley', 'davis', 'irvine',
      'santa barbara', 'santa cruz', 'riverside', 'new york', 'chicago', 'boston',
      'philadelphia', 'houston', 'dallas', 'atlanta', 'miami', 'seattle', 'denver',
      'phoenix', 'las vegas', 'portland', 'detroit', 'baltimore', 'washington',
      'san antonio', 'charlotte', 'columbus', 'indianapolis', 'milwaukee', 'hoboken'
    ];

    for (const city of cityPatterns) {
      if (lowerName.includes(city)) {
        return city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
    }

    return null;
  }

  private generateSearchTermsFromName(name: string, state: string | null, city: string | null): string[] {
    const terms = [name.toLowerCase()];
    
    if (state) terms.push(state.toLowerCase());
    if (city) terms.push(city.toLowerCase());

    // Add common abbreviations
    if (name.includes('University of')) {
      const stateName = name.replace('University of ', '');
      terms.push(`u${stateName.charAt(0).toLowerCase()}`);
    }

    if (name.includes('State University')) {
      const stateName = name.replace(' State University', '');
      terms.push(`${stateName.toLowerCase()} state`);
    }

    // Add tech patterns
    if (name.includes('Institute of Technology')) {
      terms.push('tech', 'institute');
    }

    // Add community college patterns
    if (name.includes('Community College')) {
      terms.push('cc', 'community');
    }

    // Stevens specific terms
    if (name.toLowerCase().includes('stevens')) {
      terms.push('stevens', 'stevens institute', 'hoboken', 'new jersey', 'nj');
    }

    return [...new Set(terms)];
  }

  private determineUniversityType(item: any): University['type'] {
    const name = (item.institution_name || item.name || '').toLowerCase();
    const control = item.control_of_institution || item.control;
    const level = item.level_of_institution || item.level;

    // Community colleges
    if (name.includes('community college') || name.includes('community') && name.includes('college')) {
      return 'community';
    }

    // Technical institutes
    if (name.includes('technical') || name.includes('institute of technology') || name.includes('tech')) {
      return 'technical';
    }

    // HBCUs
    if (item.hbcu === 1 || item.historically_black === true) {
      return 'hbcu';
    }

    // Tribal colleges
    if (item.tribal_college === 1 || item.tribal === true) {
      return 'tribal';
    }

    // Religious institutions
    if (name.includes('christian') || name.includes('catholic') || name.includes('seminary') || 
        name.includes('theological') || name.includes('bible') || name.includes('religious')) {
      return 'religious';
    }

    // For-profit institutions
    if (control === 3 || item.for_profit === true) {
      return 'for-profit';
    }

    // Public vs Private
    if (control === 1 || item.public === true) {
      return 'public';
    }

    return 'private';
  }

  private generateSearchTerms(item: any): string[] {
    const name = item.institution_name || item.name || '';
    const terms = [
      name.toLowerCase(),
      item.city?.toLowerCase(),
      item.state?.toLowerCase(),
      item.state_abbr?.toLowerCase(),
    ].filter(Boolean);

    // Add common abbreviations
    if (name.includes('University of')) {
      const stateName = name.replace('University of ', '');
      terms.push(`u${stateName.charAt(0).toLowerCase()}`);
    }

    // Add state university patterns
    if (name.includes('State University')) {
      const stateName = name.replace(' State University', '');
      terms.push(`${stateName.toLowerCase()} state`);
    }

    // Add tech patterns
    if (name.includes('Institute of Technology')) {
      terms.push('tech', 'institute');
    }

    // Add community college patterns
    if (name.includes('Community College')) {
      terms.push('cc', 'community');
    }

    return [...new Set(terms)];
  }

  async searchUniversities(
    query: string, 
    options: {
      limit?: number;
      cursor?: string;
      state?: string;
      type?: University['type'];
      useCache?: boolean;
    } = {}
  ): Promise<UniversitySearchResponse> {
    const { limit = 50, cursor, state, type, useCache = true } = options;
    
    console.log('🔍 Searching universities:', { query, limit, state, type });
    
    // Check cache first
    const cacheKey = this.getCacheKey('search', { query, limit, cursor, state, type });
    if (useCache) {
      const cached = this.getCache<UniversitySearchResponse>(cacheKey);
      if (cached) {
        console.log('📦 Using cached data:', cached);
        return cached;
      }
    }

    try {
      // Try World Universities API first
      const worldParams = new URLSearchParams();
      worldParams.append('country', 'United States');
      
      // If no query, search for a popular university to get some results
      if (!query || !query.trim()) {
        worldParams.append('name', 'university');
      } else {
        worldParams.append('name', query.trim());
      }

      console.log('🌍 Trying World Universities API:', `/search?${worldParams}`);
      const worldResponse = await this.worldUniversitiesRequest<WorldUniversityAPIResponse[]>(`/search?${worldParams}`);
      console.log('📊 World Universities API response:', worldResponse);
      
      let universities = this.transformWorldUniversityData(worldResponse || []);
      console.log('🏫 Transformed universities:', universities);
      
      // Filter by state if specified
      if (state) {
        universities = universities.filter(uni => 
          uni.state.toLowerCase() === state.toLowerCase() ||
          uni.state === state.toUpperCase()
        );
      }

      // Filter by type if specified
      if (type) {
        universities = universities.filter(uni => uni.type === type);
      }

      // Additional client-side filtering for better search results
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        universities = universities.filter(uni => 
          uni.name.toLowerCase().includes(searchTerm) ||
          uni.city.toLowerCase().includes(searchTerm) ||
          uni.state.toLowerCase().includes(searchTerm) ||
          uni.searchTerms.some(term => term.includes(searchTerm))
        );
      }

      const response: UniversitySearchResponse = {
        universities: universities.slice(0, limit),
        total: universities.length,
        hasMore: universities.length > limit,
      };

      console.log('✅ World Universities API search complete:', response);
      
      if (useCache) {
        this.setCache(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      console.warn('❌ World Universities API failed, trying backend API:', error);
      
      try {
        // Fallback to our backend API
        const params = new URLSearchParams();
        params.append('q', query);
        params.append('limit', limit.toString());
        if (cursor) params.append('cursor', cursor);
        if (state) params.append('state', state);
        if (type) params.append('type', type);

        console.log('🚀 Trying backend API:', `/search?${params}`);
        const response = await this.request<UniversitySearchResponse>(`/search?${params}`);
        
        console.log('✅ Backend API success:', response);
        if (useCache) {
          this.setCache(cacheKey, response);
        }
        
        return response;
      } catch (backendError) {
        console.error('❌ Backend API also failed:', backendError);
        
        // Use fallback data
        console.log('🆘 Using fallback data');
        const fallbackData = this.getFallbackUniversities(query, limit);
        
        const fallbackResponse: UniversitySearchResponse = {
          universities: fallbackData,
          total: fallbackData.length,
          hasMore: false,
        };

        if (useCache && fallbackData.length > 0) {
          this.setCache(cacheKey, fallbackResponse);
        }

        return fallbackResponse;
      }
    }
  }

  async getAllUSUniversities(useCache: boolean = true): Promise<University[]> {
    const cacheKey = this.getCacheKey('all_us', {});
    
    if (useCache) {
      const cached = this.getCache<University[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      // Fetch all US universities from World Universities API
      console.log('🌍 Fetching all US universities from World Universities API');
      const worldResponse = await this.worldUniversitiesRequest<WorldUniversityAPIResponse[]>('/search?country=United+States');
      
      const universities = this.transformWorldUniversityData(worldResponse || []);
      console.log(`✅ Fetched ${universities.length} US universities`);
      
      if (useCache) {
        this.setCache(cacheKey, universities);
      }
      
      return universities;
    } catch (error) {
      console.warn('❌ World Universities API failed, using fallback data:', error);
      
      // Use comprehensive fallback data
      const fallbackData = this.getFallbackUniversities('', 1000);
      
      if (useCache && fallbackData.length > 0) {
        this.setCache(cacheKey, fallbackData);
      }
      
      return fallbackData;
    }
  }

  async getUniversityDetails(id: string, useCache: boolean = true): Promise<UniversityDetails | null> {
    const cacheKey = this.getCacheKey('details', { id });
    
    if (useCache) {
      const cached = this.getCache<UniversityDetails>(cacheKey);
      if (cached) return cached;
    }

    try {
      // Try backend API first
      const response = await this.request<UniversityDetails>(`/${id}`);
      
      if (useCache) {
        this.setCache(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      console.warn('❌ Backend API failed for university details:', error);
      
      try {
        // Try to find university in our cached data
        const allUniversities = await this.getAllUSUniversities(useCache);
        const university = allUniversities.find(uni => uni.id === id || uni.name.toLowerCase().includes(id.toLowerCase()));
        
        if (university) {
          const details: UniversityDetails = {
            ...university,
            description: `${university.name} is located in ${university.city}, ${university.state}.`,
            demographics: {
              totalStudents: 0,
              undergraduateStudents: 0,
              graduateStudents: 0,
            },
          };

          if (useCache) {
            this.setCache(cacheKey, details);
          }

          return details;
        }

        return null;
      } catch (fallbackError) {
        console.error('❌ Failed to get university details:', fallbackError);
        return null;
      }
    }
  }

  async getUniversitiesByState(state: string, useCache: boolean = true): Promise<University[]> {
    console.log(`🏛️ Searching universities by state: ${state}`);
    
    const cacheKey = this.getCacheKey('by_state', { state });
    
    if (useCache) {
      const cached = this.getCache<University[]>(cacheKey);
      if (cached) {
        console.log(`📦 Using cached data for state: ${state}`);
        return cached;
      }
    }

    try {
      // Get all US universities and filter by state
      const allUniversities = await this.getAllUSUniversities(useCache);
      const stateUniversities = allUniversities.filter(uni => 
        uni.state.toLowerCase() === state.toLowerCase() ||
        uni.state === state.toUpperCase()
      );
      
      console.log(`✅ Found ${stateUniversities.length} universities in ${state}`);
      
      if (useCache) {
        this.setCache(cacheKey, stateUniversities);
      }
      
      return stateUniversities;
    } catch (error) {
      console.error(`❌ Failed to get universities by state ${state}:`, error);
      
      // Fallback: search with empty query and state filter
      const searchResponse = await this.searchUniversities('', { 
        state, 
        limit: 1000, 
        useCache 
      });
      return searchResponse.universities;
    }
  }

  async getUniversitiesByType(type: University['type'], useCache: boolean = true): Promise<University[]> {
    console.log(`🏫 Searching universities by type: ${type}`);
    
    const cacheKey = this.getCacheKey('by_type', { type });
    
    if (useCache) {
      const cached = this.getCache<University[]>(cacheKey);
      if (cached) {
        console.log(`📦 Using cached data for type: ${type}`);
        return cached;
      }
    }

    try {
      // Get all US universities and filter by type
      const allUniversities = await this.getAllUSUniversities(useCache);
      const typeUniversities = allUniversities.filter(uni => uni.type === type);
      
      console.log(`✅ Found ${typeUniversities.length} universities of type ${type}`);
      
      if (useCache) {
        this.setCache(cacheKey, typeUniversities);
      }
      
      return typeUniversities;
    } catch (error) {
      console.error(`❌ Failed to get universities by type ${type}:`, error);
      
      // Fallback: search with empty query and type filter
      const searchResponse = await this.searchUniversities('', { 
        type, 
        limit: 1000, 
        useCache 
      });
      return searchResponse.universities;
    }
  }

  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  private getFallbackUniversities(query: string, limit: number): University[] {
    // Comprehensive fallback list of major US universities
    const fallbackUniversities: University[] = [
      // Ivy League
      { id: 'harvard', name: 'Harvard University', state: 'MA', city: 'Cambridge', type: 'private', searchTerms: ['harvard', 'cambridge', 'ivy'] },
      { id: 'yale', name: 'Yale University', state: 'CT', city: 'New Haven', type: 'private', searchTerms: ['yale', 'new haven', 'ivy'] },
      { id: 'princeton', name: 'Princeton University', state: 'NJ', city: 'Princeton', type: 'private', searchTerms: ['princeton', 'ivy'] },
      { id: 'columbia', name: 'Columbia University', state: 'NY', city: 'New York', type: 'private', searchTerms: ['columbia', 'new york', 'ivy'] },
      { id: 'upenn', name: 'University of Pennsylvania', state: 'PA', city: 'Philadelphia', type: 'private', searchTerms: ['penn', 'pennsylvania', 'philadelphia', 'ivy'] },
      { id: 'dartmouth', name: 'Dartmouth College', state: 'NH', city: 'Hanover', type: 'private', searchTerms: ['dartmouth', 'hanover', 'ivy'] },
      { id: 'brown', name: 'Brown University', state: 'RI', city: 'Providence', type: 'private', searchTerms: ['brown', 'providence', 'ivy'] },
      { id: 'cornell', name: 'Cornell University', state: 'NY', city: 'Ithaca', type: 'private', searchTerms: ['cornell', 'ithaca', 'ivy'] },

      // Top Tech Schools
      { id: 'mit', name: 'Massachusetts Institute of Technology', state: 'MA', city: 'Cambridge', type: 'private', searchTerms: ['mit', 'massachusetts institute', 'cambridge', 'tech'] },
      { id: 'stanford', name: 'Stanford University', state: 'CA', city: 'Stanford', type: 'private', searchTerms: ['stanford', 'palo alto', 'silicon valley'] },
      { id: 'caltech', name: 'California Institute of Technology', state: 'CA', city: 'Pasadena', type: 'private', searchTerms: ['caltech', 'california institute', 'pasadena', 'tech'] },
      { id: 'stevens', name: 'Stevens Institute of Technology', state: 'NJ', city: 'Hoboken', type: 'private', searchTerms: ['stevens', 'stevens institute', 'hoboken', 'tech'] },
      { id: 'georgia-tech', name: 'Georgia Institute of Technology', state: 'GA', city: 'Atlanta', type: 'public', searchTerms: ['georgia tech', 'gt', 'atlanta', 'tech'] },
      { id: 'carnegie-mellon', name: 'Carnegie Mellon University', state: 'PA', city: 'Pittsburgh', type: 'private', searchTerms: ['carnegie mellon', 'cmu', 'pittsburgh', 'tech'] },

      // UC System
      { id: 'berkeley', name: 'University of California, Berkeley', state: 'CA', city: 'Berkeley', type: 'public', searchTerms: ['uc berkeley', 'berkeley', 'cal', 'california'] },
      { id: 'ucla', name: 'University of California, Los Angeles', state: 'CA', city: 'Los Angeles', type: 'public', searchTerms: ['ucla', 'los angeles', 'california'] },
      { id: 'ucsd', name: 'University of California, San Diego', state: 'CA', city: 'San Diego', type: 'public', searchTerms: ['ucsd', 'san diego', 'california'] },
      { id: 'ucsb', name: 'University of California, Santa Barbara', state: 'CA', city: 'Santa Barbara', type: 'public', searchTerms: ['ucsb', 'santa barbara', 'california'] },
      { id: 'uci', name: 'University of California, Irvine', state: 'CA', city: 'Irvine', type: 'public', searchTerms: ['uci', 'irvine', 'california'] },
      { id: 'ucd', name: 'University of California, Davis', state: 'CA', city: 'Davis', type: 'public', searchTerms: ['ucd', 'davis', 'california'] },

      // Big State Schools
      { id: 'michigan', name: 'University of Michigan', state: 'MI', city: 'Ann Arbor', type: 'public', searchTerms: ['michigan', 'um', 'ann arbor', 'wolverines'] },
      { id: 'texas', name: 'University of Texas at Austin', state: 'TX', city: 'Austin', type: 'public', searchTerms: ['ut austin', 'texas', 'austin', 'longhorns'] },
      { id: 'florida', name: 'University of Florida', state: 'FL', city: 'Gainesville', type: 'public', searchTerms: ['florida', 'uf', 'gainesville', 'gators'] },
      { id: 'virginia', name: 'University of Virginia', state: 'VA', city: 'Charlottesville', type: 'public', searchTerms: ['virginia', 'uva', 'charlottesville', 'cavaliers'] },
      { id: 'north-carolina', name: 'University of North Carolina at Chapel Hill', state: 'NC', city: 'Chapel Hill', type: 'public', searchTerms: ['unc', 'north carolina', 'chapel hill', 'tar heels'] },
      { id: 'illinois', name: 'University of Illinois Urbana-Champaign', state: 'IL', city: 'Urbana', type: 'public', searchTerms: ['illinois', 'uiuc', 'urbana', 'champaign'] },
      { id: 'wisconsin', name: 'University of Wisconsin-Madison', state: 'WI', city: 'Madison', type: 'public', searchTerms: ['wisconsin', 'uw', 'madison', 'badgers'] },
      { id: 'washington', name: 'University of Washington', state: 'WA', city: 'Seattle', type: 'public', searchTerms: ['washington', 'uw', 'seattle', 'huskies'] },

      // More Major Universities
      { id: 'nyu', name: 'New York University', state: 'NY', city: 'New York', type: 'private', searchTerms: ['nyu', 'new york university', 'new york', 'manhattan'] },
      { id: 'usc', name: 'University of Southern California', state: 'CA', city: 'Los Angeles', type: 'private', searchTerms: ['usc', 'southern california', 'los angeles', 'trojans'] },
      { id: 'northwestern', name: 'Northwestern University', state: 'IL', city: 'Evanston', type: 'private', searchTerms: ['northwestern', 'evanston', 'chicago'] },
      { id: 'duke', name: 'Duke University', state: 'NC', city: 'Durham', type: 'private', searchTerms: ['duke', 'durham', 'blue devils'] },
      { id: 'johns-hopkins', name: 'Johns Hopkins University', state: 'MD', city: 'Baltimore', type: 'private', searchTerms: ['johns hopkins', 'jhu', 'baltimore'] },
      { id: 'chicago', name: 'University of Chicago', state: 'IL', city: 'Chicago', type: 'private', searchTerms: ['chicago', 'uchicago', 'maroons'] },
      { id: 'vanderbilt', name: 'Vanderbilt University', state: 'TN', city: 'Nashville', type: 'private', searchTerms: ['vanderbilt', 'nashville', 'commodores'] },
      { id: 'rice', name: 'Rice University', state: 'TX', city: 'Houston', type: 'private', searchTerms: ['rice', 'houston', 'owls'] },
      { id: 'emory', name: 'Emory University', state: 'GA', city: 'Atlanta', type: 'private', searchTerms: ['emory', 'atlanta', 'eagles'] },
      { id: 'georgetown', name: 'Georgetown University', state: 'DC', city: 'Washington', type: 'private', searchTerms: ['georgetown', 'washington dc', 'hoyas'] },

      // Additional State Schools
      { id: 'ohio-state', name: 'Ohio State University', state: 'OH', city: 'Columbus', type: 'public', searchTerms: ['ohio state', 'osu', 'columbus', 'buckeyes'] },
      { id: 'penn-state', name: 'Pennsylvania State University', state: 'PA', city: 'University Park', type: 'public', searchTerms: ['penn state', 'psu', 'university park', 'nittany lions'] },
      { id: 'indiana', name: 'Indiana University Bloomington', state: 'IN', city: 'Bloomington', type: 'public', searchTerms: ['indiana', 'iu', 'bloomington', 'hoosiers'] },
      { id: 'purdue', name: 'Purdue University', state: 'IN', city: 'West Lafayette', type: 'public', searchTerms: ['purdue', 'west lafayette', 'boilermakers'] },
      { id: 'minnesota', name: 'University of Minnesota', state: 'MN', city: 'Minneapolis', type: 'public', searchTerms: ['minnesota', 'umn', 'minneapolis', 'gophers'] },
      { id: 'arizona', name: 'University of Arizona', state: 'AZ', city: 'Tucson', type: 'public', searchTerms: ['arizona', 'ua', 'tucson', 'wildcats'] },
      { id: 'colorado', name: 'University of Colorado Boulder', state: 'CO', city: 'Boulder', type: 'public', searchTerms: ['colorado', 'cu', 'boulder', 'buffaloes'] },

      // CSU System
      { id: 'cal-poly', name: 'California Polytechnic State University', state: 'CA', city: 'San Luis Obispo', type: 'public', searchTerms: ['cal poly', 'slo', 'san luis obispo', 'polytechnic'] },
      { id: 'sjsu', name: 'San José State University', state: 'CA', city: 'San José', type: 'public', searchTerms: ['san jose state', 'sjsu', 'spartans'] },
      { id: 'csulb', name: 'California State University, Long Beach', state: 'CA', city: 'Long Beach', type: 'public', searchTerms: ['cal state long beach', 'csulb', 'beach'] },
      { id: 'sdsu', name: 'San Diego State University', state: 'CA', city: 'San Diego', type: 'public', searchTerms: ['san diego state', 'sdsu', 'aztecs'] },

      // Texas Universities
      { id: 'tamu', name: 'Texas A&M University', state: 'TX', city: 'College Station', type: 'public', searchTerms: ['texas a&m', 'tamu', 'college station', 'aggies'] },
      { id: 'ut-dallas', name: 'University of Texas at Dallas', state: 'TX', city: 'Richardson', type: 'public', searchTerms: ['ut dallas', 'utd', 'richardson'] },
      { id: 'houston', name: 'University of Houston', state: 'TX', city: 'Houston', type: 'public', searchTerms: ['houston', 'uh', 'cougars'] },
      { id: 'texas-tech', name: 'Texas Tech University', state: 'TX', city: 'Lubbock', type: 'public', searchTerms: ['texas tech', 'ttu', 'lubbock', 'red raiders'] },

      // Florida Universities
      { id: 'fsu', name: 'Florida State University', state: 'FL', city: 'Tallahassee', type: 'public', searchTerms: ['florida state', 'fsu', 'tallahassee', 'seminoles'] },
      { id: 'miami', name: 'University of Miami', state: 'FL', city: 'Coral Gables', type: 'private', searchTerms: ['miami', 'um', 'coral gables', 'hurricanes'] },
      { id: 'ucf', name: 'University of Central Florida', state: 'FL', city: 'Orlando', type: 'public', searchTerms: ['central florida', 'ucf', 'orlando', 'knights'] },
      { id: 'usf', name: 'University of South Florida', state: 'FL', city: 'Tampa', type: 'public', searchTerms: ['south florida', 'usf', 'tampa', 'bulls'] },

      // Community Colleges
      { id: 'miami-dade', name: 'Miami Dade College', state: 'FL', city: 'Miami', type: 'community', searchTerms: ['miami dade', 'mdc', 'community college'] },
      { id: 'valencia', name: 'Valencia College', state: 'FL', city: 'Orlando', type: 'community', searchTerms: ['valencia', 'community college', 'orlando'] },
      { id: 'santa-monica', name: 'Santa Monica College', state: 'CA', city: 'Santa Monica', type: 'community', searchTerms: ['santa monica', 'smc', 'community college'] },
    ];

    // Filter based on query
    if (!query || query.trim() === '') {
      return fallbackUniversities.slice(0, limit);
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = fallbackUniversities.filter(uni => 
      uni.name.toLowerCase().includes(searchTerm) ||
      uni.city.toLowerCase().includes(searchTerm) ||
      uni.state.toLowerCase().includes(searchTerm) ||
      uni.searchTerms.some(term => term.includes(searchTerm))
    );

    return filtered.slice(0, limit);
  }
}

export const universitiesApi = new UniversitiesApiService();