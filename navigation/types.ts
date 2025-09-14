// navigation/types.ts

export type TabParamList = {
  Home: undefined;
  Library: undefined;
  Camera: undefined;
  Import: undefined;
  Settings: undefined;
  'image-detail/[name]': {
    name?: string | string[];
    uri?: string;
    analysis?: any;
    uuid?: string;
  };
};
