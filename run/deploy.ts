import { createReadStream, existsSync, readdirSync, readFileSync } from 'fs';
import * as readline from 'readline';
import { KongApi } from './kong/KongApi.js';
import { PluginEntry } from './kong/types.js';

const CONTROL_PLANE_NAME = process.env.KONG_CONTROL_PLANE || 'devint01';

const stats = {
  updated: 0,
  created: 0,
  deleted: 0,
};

async function loadSchema(name) {
  return readFileSync(name).toString();
}

async function uploadSchemas(pluginData: PluginEntry[], kongToken: string) {
  console.log('uploadSchemas', pluginData);
  const api = new KongApi(kongToken);
  await api.setControlPlane(CONTROL_PLANE_NAME);
  const pluginSchemas = await api.getPluginSchemas();
  if (pluginSchemas) {
    for (const plugin of pluginSchemas) {
      console.log(`Processing ${plugin.name}`);
      const newPlugin = pluginData.find((p) => p.name === plugin.name);
      if (!newPlugin) {
        // delete plugin
        console.log(`delete plugin schema for ${plugin.name}`);
        api
          .deletePluginSchema(plugin.name)
          .catch((err) => {
            console.error(err);
          });

        stats.deleted += 1;
      } else {
        // upsert plugin
        console.log(`upsert plugin schema for ${newPlugin.name}`);
        api
          .upsertPluginSchema(newPlugin.name, await loadSchema(newPlugin.schema))
          .catch((err) => {
            console.error(err);
          });
        stats.updated += 1;
        newPlugin.done = true;
      }
    }
  }
  for (const plugin of pluginData) {
    if (!plugin.done) {
      // create plugin
      console.log(`create plugin schema for ${plugin.path}`, plugin.name);
      await api.upsertPluginSchema(plugin.name, await loadSchema(plugin.schema));
      stats.created += 1;
    }
  }

  console.log('\n\nResults:', stats);
  console.log('\n---- Done');
}

async function getPluginData() {
  const dirents = readdirSync('kong/plugins', { withFileTypes: true });
  const entries = dirents
    .filter((dirent) => {
      return dirent.isDirectory() && existsSync(`${dirent.path}/${dirent.name}/schema.lua`);
    })
    .map((dirent) => {
      return {
        name: dirent.name,
        path: dirent.path,
        schema: `${dirent.path}/${dirent.name}/schema.lua`,
        done: false,
      } as PluginEntry;
    });
  return entries;
}

async function readKeyAndValues(filePath) {
  const fileStream = createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const result = {};

  for await (const line of rl) {
    const [key, value] = line.split(': ');
    result[key] = value;
  }

  return result;
}
async function getKongPrivateToken(): Promise<string> {
  const envKongToken = process.env.KPAT;
  if (envKongToken) {
    return envKongToken;
  }
  const homedir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
  const deckYaml = await readKeyAndValues(`${homedir}/.deck.yaml`);
  if (deckYaml && deckYaml['konnect-token']) {
    return deckYaml['konnect-token'];
  }
  throw Error('konnect-token not found in .deck.yaml');
}
async function main() {
  console.log(`---- Loading plugin schema files from kong/plugins`);
  console.log('CONTROL_PLANE_NAME', CONTROL_PLANE_NAME);
  const token = await getKongPrivateToken();
  await getPluginData().then(async (data) => {
    await uploadSchemas(data, token);
  });

  console.log(`---- Updating schema files in control plane ${CONTROL_PLANE_NAME}`);
  console.log(`---- Done`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
