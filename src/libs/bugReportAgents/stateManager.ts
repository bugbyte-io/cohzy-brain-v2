import { UpstashHandler } from "../upstash/handler";
import { ChatData, ChatDataSchema } from "../upstash/types";
import { nanoid } from "nanoid";

/**
 * @class StateManager
 * @description Manages state by fetching and storing data in Upstash
 */
export class StateManager {
  private upstashHandler: UpstashHandler;

  constructor() {
    this.upstashHandler = new UpstashHandler();
  }

  /**
   * Fetch state from Upstash
   * @param {string} key - The key to fetch the state for.
   * @returns {Promise<ChatData>}
   */
  public async fetchState(key: string): Promise<ChatData> {
    const data = await this.upstashHandler.fetchData(key);
    return data as ChatData;
  }

  /**
   * Set state in Upstash
   * @param {string} key - The key to store the state under.
   * @param {ChatData} state - The state data to store.
   * @returns {Promise<void>}
   */
  public async setState(key: string, state: ChatData): Promise<void> {
    return await this.upstashHandler.storeData(key, state);
  }

  /**
   * Create a default state
   * @returns {ChatData}
   */
  public async createDefaultState(
    userId: string,
    language = "en",
    origin = "web"
  ): Promise<ChatData> {
    const traceId = nanoid(26);
    const defaultState: ChatData = {
      language,
      messages: [],
      origin,
      plausabilityPass: false,
      traceId,
      userId,
      validationPass: false, 
    };

    await this.setState(traceId, defaultState);

    return defaultState;
  }

  public async addMessage(state: ChatData, role: "AiMessage" | "HumanMessage", content: string) {
    state.messages.push({ role: role, content })
    await this.setState(state.traceId, state)
    return state
  }
}
