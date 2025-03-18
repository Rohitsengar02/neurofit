declare global {
  interface Window {
    gapi: {
      load: (
        api: string,
        options: {
          callback: () => void;
          onerror: () => void;
          timeout?: number;
          ontimeout?: () => void;
        }
      ) => void;
      auth2: {
        init: (params: {
          client_id: string;
          scope: string;
          fetch_basic_profile?: boolean;
        }) => Promise<any>;
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean;
          };
          signIn: (options?: {
            prompt?: string;
            scope?: string;
            ux_mode?: string;
          }) => Promise<any>;
        };
      };
      client: {
        init: (config: {
          apiKey: string | null;
          discoveryDocs?: string[];
          clientId: string;
          scope: string;
          plugin_name?: string;
        }) => Promise<void>;
        load: (api: string, version: string) => Promise<void>;
        request: (params: {
          path: string;
          method: string;
          body?: any;
        }) => Promise<{
          result: any;
        }>;
        fitness: {
          users: {
            dataset: {
              aggregate: (params: {
                userId: string;
                requestBody: {
                  aggregateBy: Array<{
                    dataTypeName: string;
                  }>;
                  startTimeMillis: number;
                  endTimeMillis: number;
                  bucketByTime?: {
                    durationMillis: number;
                  };
                };
              }) => Promise<{
                result: any;
              }>;
            };
          };
        };
      };
    };
  }
}

export {};
