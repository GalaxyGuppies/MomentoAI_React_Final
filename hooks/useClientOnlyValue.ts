/**
 * Returns the client value. Used for web-only environments where native doesn't support SSR.
 * @param server - Value to use on server.
 * @param client - Value to use on client.
 * @returns The client value.
 */
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  return client;
}
