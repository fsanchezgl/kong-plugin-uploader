import fetch from 'node-fetch';
import { DataPlaneResponse, KongApiResponse, KongDataPlane, PluginSchema } from './types.js';

type CallKongOptions = {
  route: string;
  method?: string;
  body?: string;
};

class KongApi {
  private readonly BASE_URL: string = 'https://us.api.konghq.com/v2';

  private readonly kongToken: string;

  private controlPlane: string | null;

  constructor(kongToken: string, baseUrl?: string) {
    if (!kongToken) {
      throw new Error('Kong Token is required');
    }
    this.kongToken = kongToken;
    if (baseUrl) {
      this.BASE_URL = baseUrl;
    }
    this.controlPlane = null;
  }

  private async callKong(
    options: CallKongOptions = {
      route: '',
      method: 'GET',
    }
  ) {
    const { route, method, body } = options;
    const res = await fetch(`${this.BASE_URL}/${route}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.kongToken}`,
      },
      body,
    });
    if (res.ok) {
      return res.json();
    }
    return null;
  }

  public async setControlPlane(name: string): Promise<KongDataPlane> {
    const dp = await this.getControlPlane(name);
    this.controlPlane = dp.id;
    return dp;
  }

  public async getControlPlane(name: string): Promise<KongDataPlane> {
    const dataPlanes = (await this.callKong({
      route: `control-planes?filter[name]=${name}`,
    })) as DataPlaneResponse;
    if (dataPlanes.data[0]) {
      return dataPlanes.data[0];
    }
    throw new Error('Data Plane not found');
  }

  public async getPluginSchemas() {
    const data = (await this.callKong({
      route: `control-planes/${this.controlPlane}/core-entities/plugin-schemas`,
    })) as KongApiResponse;
    return data.items as PluginSchema[];
  }

  async deletePluginSchema(name: string) {
    const data = await this.callKong({
      route: `/control-planes/${this.controlPlane}/core-entities/plugin-schemas/${name}`,
      method: 'DELETE',
    });
    return data;
  }

  async upsertPluginSchema(name: string, schema: string) {
    const data = await this.callKong({
      route: `/control-planes/${this.controlPlane}/core-entities/plugin-schemas/${name}`,
      method: 'PUT',
      body: JSON.stringify({ lua_schema: schema }),
    });
    return data;
  }

  async createPluginSchema(name: string, schema: string) {
    const data = await this.callKong({
      route: `/control-planes/${this.controlPlane}/core-entities/plugin-schemas/${name}`,
      method: 'POST',
      body: JSON.stringify({ lua_schema: schema }),
    });
    return data;
  }
}

export { KongApi };
