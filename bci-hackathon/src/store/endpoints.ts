import { emptySplitApi as api } from "./emptyApi";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    rootGet: build.query<RootGetApiResponse, RootGetApiArg>({
      query: () => ({ url: `/` }),
    }),
    registerDeviceRegisterPost: build.mutation<
      RegisterDeviceRegisterPostApiResponse,
      RegisterDeviceRegisterPostApiArg
    >({
      query: (queryArg) => ({
        url: `/register/`,
        method: "POST",
        body: queryArg.device,
      }),
    }),
    getLastSession: build.query<
      GetLastSessionApiResponse,
      GetLastSessionApiArg
    >({
      query: (minutes) => ({
        url: `/last/session/${minutes}`,
      }),
    }),
  }),
  overrideExisting: false,
});

export { injectedRtkApi as enhancedApi };

// Istniejące typy
export type RootGetApiResponse = /** status 200 Successful Response */ any;
export type RootGetApiArg = void;

export type RegisterDeviceRegisterPostApiResponse =
  /** status 200 Successful Response */ ConnectionDetails;
export type RegisterDeviceRegisterPostApiArg = {
  device: Device;
};

// Nowe typy dla getLastSession
export type GetLastSessionApiResponse =
  /** status 200 Successful Response */ SessionData;
export type GetLastSessionApiArg = number;

// Typy dla odpowiedzi
export interface SessionData {
  scores: Score[];
  raw: Raw[];
}

export interface Score {
  timestamp: string;
  coef_min: number;
  coef_max: number;
  coef_avg: number;
  is_focused: boolean;
}

export interface Raw {
  timestamp: string;
  f4: number;
  f3: number;
  c4: number;
  c3: number;
  p4: number;
  p3: number;
  o1: number;
  o2: number;
}

// Pozostałe typy
export type ConnectionDetails = {
  connected: boolean;
  battery: number;
};

export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};

export type HttpValidationError = {
  detail?: ValidationError[];
};

export type Device = {
  serialNumber: string;
  model: string;
};

// Eksport hooki dla wygody
export const {
  useRootGetQuery,
  useRegisterDeviceRegisterPostMutation,
  useGetLastSessionQuery,
} = injectedRtkApi;
