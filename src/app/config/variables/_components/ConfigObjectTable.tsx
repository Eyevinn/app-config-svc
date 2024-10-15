'use client';

import { ConfigObject, ConfigObjectList } from '@/api_config';
import { ActionResponse } from '@/app/utils';
import { useApiUrl } from '@/hooks/useApiUrl';
import {
  Button,
  Input,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@nextui-org/react';
import { IconCheck, IconPencil, IconTrash } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';

export interface ConfigObjectTableProps {
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

async function getConfigObjectList({
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

async function updateConfigObject({
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

export default function ConfigObjectTable({
  pageSize = DEFAULT_PAGE_SIZE
}: ConfigObjectTableProps) {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ConfigObjectList | undefined>(undefined);
  const [editKeyId, setEditKeyId] = useState<string | undefined>(undefined);
  const [editValue, setEditValue] = useState<string | undefined>(undefined);

  const apiUrl = useApiUrl();

  const handleSaveEdit = (keyId: string) => {
    if (editValue === undefined) {
      return;
    }

    if (!apiUrl) {
      return;
    }

    updateConfigObject({ apiUrl, keyId, value: editValue })
      .then(([data, error]) => {
        if (error) {
          console.error(error);
          return;
        }
        setEditValue(data?.value);
      })
      .finally(() => {
        setEditKeyId(undefined);
        updateTableContents();
      });
  };

  const updateTableContents = () => {
    if (!apiUrl) {
      return;
    }
    setIsLoading(true);
    getConfigObjectList({
      apiUrl,
      offset: (page - 1) * pageSize,
      limit: pageSize
    })
      .then(([data, error]) => {
        if (error) {
          console.error(error);
          return;
        }
        setData(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    updateTableContents();
  }, [page, pageSize, apiUrl]);

  const pages = useMemo(() => {
    return data?.total ? Math.ceil(data.total / pageSize) : 0;
  }, [data?.total, pageSize]);

  const loadingState =
    isLoading || data?.items.length === 0 ? 'loading' : 'idle';

  return (
    <Table
      bottomContent={
        pages > 0 ? (
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        ) : null
      }
    >
      <TableHeader>
        <TableColumn key="configKey">KEY</TableColumn>
        <TableColumn key="configValue">VALUE</TableColumn>
        <TableColumn key="configActions">ACTIONS</TableColumn>
      </TableHeader>
      <TableBody
        items={
          data?.items.map((obj) => {
            return { keyId: obj.key, value: obj.value };
          }) ?? []
        }
        loadingContent={<Spinner />}
        loadingState={loadingState}
      >
        {(item) => (
          <TableRow key={item.keyId}>
            <TableCell>{item.keyId}</TableCell>
            <TableCell>
              {editKeyId === item.keyId ? (
                <Input
                  value={editValue ?? item.value}
                  onValueChange={setEditValue}
                />
              ) : (
                item.value
              )}
            </TableCell>
            <TableCell>
              {editKeyId !== item.keyId && (
                <Button
                  isIconOnly
                  color="primary"
                  size="sm"
                  onPress={() => setEditKeyId(item.keyId)}
                >
                  <IconPencil />
                </Button>
              )}
              {editKeyId === item.keyId && (
                <Button
                  isIconOnly
                  color="primary"
                  size="sm"
                  onPress={() => handleSaveEdit(item.keyId)}
                >
                  <IconCheck />
                </Button>
              )}
              <Button isIconOnly color="danger" size="sm">
                <IconTrash />
              </Button>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
