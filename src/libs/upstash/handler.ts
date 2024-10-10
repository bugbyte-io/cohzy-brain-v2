import { Redis } from "@upstash/redis";
import { ChatData } from './types'

/**
 * @class UpstashHandler
 * @description Handler class for interacting with Upstash.
 */
export class UpstashHandler {
  private redis: Redis;

  /**
   * @constructor
   * @param {string} upstashUrl - The base URL for Upstash API.
   * @param {string} apiKey - The API key for authentication.
   */
  constructor() {
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL ?? '';
    const apiKey = process.env.UPSTASH_REDIS_REST_TOKEN ?? '';

    this.redis = new Redis({
      url: upstashUrl,
      token: apiKey,
    });
  }

  /**
   * Fetch data from Upstash
   * @param {string} key - The key to fetch the data for.
   * @returns {Promise<any>} - The fetched data.
   */
  public async fetchData(key: string): Promise<any> {
      const response = await this.redis.get(key);
      console.log('fetchData:', response);
      return response;
  }

  /**
   * Store data in Upstash
   * @param {string} key - The key to store the data under.
   * @param {ChatData} data - The data to store.
   * @returns {Promise<void>}
   */
  public async storeData(key: string, data: ChatData): Promise<void> {
      const response = await this.redis.set(key, data);
      console.log('storeData response:', response);
      if (!response ) {
        throw new Error(`Error storing data in redis`);
      }
  }
}
