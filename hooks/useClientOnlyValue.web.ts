import React from 'react';

/**
 * Returns the client value after hydration. Used for SSR compatibility in web builds.
 * @param server - Value to use on server.
 * @param client - Value to use on client.
 * @returns The client value after hydration.
 */
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  const [value, setValue] = React.useState<S | C>(server);
  React.useEffect(() => {
    setValue(client);
  }, [client]);

  return value;
}
