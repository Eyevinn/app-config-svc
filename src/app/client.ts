import { ConfigObject, ConfigObjectList } from '@/api_config';
import { ActionResponse } from './utils';

export async function getConfigObjectList({
  apiUrl,
  offset,
  limit
}: {
  apiUrl: string;
  offset: number;
  limit: number;
}): ActionResponse<ConfigObjectList> {
  const url = new URL(`${apiUrl}/config`);
  url.searchParams.append('offset', offset.toString());
  url.searchParams.append('limit', limit.toString());
  const response = await fetch(url);
  if (!response.ok) {
    return [undefined, 'Failed to fetch config object list'];
  }
  return [await response.json()];
}

export async function updateConfigObject({
  apiUrl,
  keyId,
  value
}: {
  apiUrl: string;
  keyId: string;
  value: string;
}): ActionResponse<ConfigObject> {
  const url = new URL(`${apiUrl}/config`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key: keyId, value })
  });
  if (!response.ok) {
    return [undefined, 'Failed to update config object'];
  }
  return [await response.json()];
}

export async function createConfigObject({
  apiUrl,
  obj
}: {
  apiUrl: string;
  obj: ConfigObject;
}): ActionResponse<ConfigObject> {
  const url = new URL(`${apiUrl}/config`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(obj)
  });
  if (!response.ok) {
    return [undefined, 'Failed to create config object'];
  }
  return [await response.json()];
}

export async function deleteConfigObject({
  apiUrl,
  key
}: {
  apiUrl: string;
  key: string;
}): ActionResponse<void> {
  const url = new URL(`${apiUrl}/config/${key}`);
  const response = await fetch(url, {
    method: 'DELETE'
  });
  if (!response.ok) {
    return [undefined, 'Failed to delete config object'];
  }
  return [undefined];
}
