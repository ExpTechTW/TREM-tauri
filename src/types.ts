export interface LastNtp {
  server: number;
  client: number;
}

export interface DefaultSettingSchema {
  api: {
    key: string;
  };
  behavior: {
    openExternal: boolean;
  };
}

export interface NtpTime {
  server: number;
  client: number;
}
