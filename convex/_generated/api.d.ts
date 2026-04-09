/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as groups from "../groups.js";
import type * as http from "../http.js";
import type * as reactions from "../reactions.js";
import type * as strava from "../strava.js";
import type * as users from "../users.js";
import type * as weeklyGameplans from "../weeklyGameplans.js";
import type * as weeklyNarratives from "../weeklyNarratives.js";
import type * as weeklyScores from "../weeklyScores.js";
import type * as workouts from "../workouts.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  groups: typeof groups;
  http: typeof http;
  reactions: typeof reactions;
  strava: typeof strava;
  users: typeof users;
  weeklyGameplans: typeof weeklyGameplans;
  weeklyNarratives: typeof weeklyNarratives;
  weeklyScores: typeof weeklyScores;
  workouts: typeof workouts;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
