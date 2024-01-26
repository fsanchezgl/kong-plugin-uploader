export type KongMeta = {
  page: {
    total: number;
    size: number;
    number: number;
  };
};

export type PluginSchema = {
  name: string;
  lua_schema: string;
  created_at: number;
  updated_at: number;
};

export type KongDataPlane = {
  id: string;
  name: string;
  description: string;
  labels: string[];
  config: {
    control_plane_endpoint: string;
    telemetry_endpoint: string;
    cluster_type: string;
    auth_type: string;
    cloud_gateway: string;
  };
  created_at: string;
  updated_at: string;
};

export type DataPlaneResponse = {
  meta: KongMeta;
  data: [KongDataPlane];
};

export type PluginEntry = {
  name: string;
  path: string;
  schema: string;
  done: boolean;
};

export type Page = {
  total_count: number;
  has_next_page: boolean;
  next_cursor: string;
};

export type KongApiResponse = {
  items: PluginSchema[];
  page: Page;
};
