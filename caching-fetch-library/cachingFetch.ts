import React from "react";
/**
 * Creates a caching system to manage data associated with specific keys.
 * This system is based on a JavaScript Map, providing efficient storage and retrieval operations.
 */
const createCache = () => {
  let cache = new Map();

  return {
    /**
     * Retrieves the value associated with the given key from the cache.
     * @param {string} key - The key for the cached data.
     * @returns {*} The cached value or undefined if the key is not found.
     */
    get(key: string) {
      return cache.get(key);
    },
    /**
     * Checks if the cache contains a value for the given key.
     * @param {string} key - The key to check in the cache.
     * @returns {boolean} True if the key exists, otherwise false.
     */
    has(key: string) {
      return cache.has(key);
    },
    /**
     * Stores a value in the cache with the specified key.
     * @param {string} key - The key to associate with the value.
     * @param {*} value - The value to cache.
     */
    set(key: string, value: any) {
      cache.set(key, value);
    },
    /**
     * Clears all entries from the cache.
     */
    clear() {
      cache.clear();
    },
    /**
     * Serializes the cache into a JSON string for transfer or storage.
     * @returns {string} The serialized cache data.
     */
    serialize() {
      return JSON.stringify(Array.from(cache.entries()));
    },
    /**
     * Reinitializes the cache with data from a serialized string.
     * @param {string} serializedCache - A JSON string representing cached entries.
     */
    initialize(serializedCache: string) {
      cache = new Map(JSON.parse(serializedCache));
    },
  };
};

/**
 * A singleton instance of the cache manager, used throughout the application.
 */
const cacheManager = createCache();

// You may edit this file, add new files to support this file,
// and/or add new dependencies to the project as you see fit.
// However, you must not change the surface API presented from this file,
// and you should not need to change any other files in the project to complete the challenge

type UseCachingFetch = (url: string) => {
  isLoading: boolean;
  data: unknown;
  error: Error | null;
};

/**
 * 1. Implement a caching fetch hook. The hook should return an object with the following properties:
 * - isLoading: a boolean that is true when the fetch is in progress and false otherwise
 * - data: the data returned from the fetch, or null if the fetch has not completed
 * - error: an error object if the fetch fails, or null if the fetch is successful
 *
 * This hook is called three times on the client:
 *  - 1 in App.tsx
 *  - 2 in Person.tsx
 *  - 3 in Name.tsx
 *
 * Acceptance Criteria:
 * 1. The application at /appWithoutSSRData should properly render, with JavaScript enabled, you should see a list of people.
 * 2. You should only see 1 network request in the browser's network tab when visiting the /appWithoutSSRData route.
 * 3. You have not changed any code outside of this file to achieve this.
 * 4. This file passes a type-check.
 *
 */
/**
 * A React hook that fetches data while utilizing caching to optimize performance.
 * @param {string} url - The API endpoint to fetch data from.
 * @returns {Object} An object containing loading state, fetched data, and any errors.
 */
export const useCachingFetch: UseCachingFetch = (url) => {
  const [state, setState] = React.useState({
    isLoading: true,
    data: null,
    error: null,
  });

  React.useEffect(() => {
    if (cacheManager.has(url)) {
      // Return cached data immediately
      setState({ isLoading: false, data: cacheManager.get(url), error: null });
      return;
    }

    let isMounted = true;

    setState({ isLoading: true, data: null, error: null });

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          cacheManager.set(url, data);
          setState({ isLoading: false, data, error: null });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setState({ isLoading: false, data: null, error });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  return state;
};

/**
 * 2. Implement a preloading caching fetch function. The function should fetch the data.
 *
 * This function will be called once on the server before any rendering occurs.
 *
 * Any subsequent call to useCachingFetch should result in the returned data being available immediately.
 * Meaning that the page should be completely serverside rendered on /appWithSSRData
 *
 * Acceptance Criteria:
 * 1. The application at /appWithSSRData should properly render, with JavaScript disabled, you should see a list of people.
 * 2. You have not changed any code outside of this file to achieve this.
 * 3. This file passes a type-check.
 *
 */
/**
 * Preloads data into the cache by fetching it from the specified URL.
 * @param {string} url - The API endpoint to fetch data from.
 * @returns {Promise<void>} A promise that resolves when the data is fetched and cached.
 */
export const preloadCachingFetch = async (url: string): Promise<void> => {
  if (cacheManager.has(url)) return;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  cacheManager.set(url, data);
};

/**
 * 3.1 Implement a serializeCache function that serializes the cache to a string.
 * 3.2 Implement an initializeCache function that initializes the cache from a serialized cache string.
 *
 * Together, these two functions will help the framework transfer your cache to the browser.
 *
 * The framework will call `serializeCache` on the server to serialize the cache to a string and inject it into the dom.
 * The framework will then call `initializeCache` on the browser with the serialized cache string to initialize the cache.
 *
 * Acceptance Criteria:
 * 1. The application at /appWithSSRData should properly render, with JavaScript enabled, you should see a list of people.
 * 2. You should not see any network calls to the people API when visiting the /appWithSSRData route.
 * 3. You have not changed any code outside of this file to achieve this.
 * 4. This file passes a type-check.
 *
 */
/**
 * Serializes the current state of the cache for transfer or storage.
 * @returns {string} A JSON string representing the cached data.
 */
export const serializeCache = () => {
  return cacheManager.serialize();
};

/**
 * Initializes the cache with serialized data, typically transferred from the server.
 * @param {string} serializedCache - The serialized cache string.
 */
export const initializeCache = (serializedCache: string) => {
  cacheManager.initialize(serializedCache);
};
/**
 * Clears all entries from the cache.
 */
export const wipeCache = () => {
  cacheManager.clear();
};
