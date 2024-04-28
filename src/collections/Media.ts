import type { Access } from 'payload/config';
import type { CollectionConfig } from 'payload/types';
import type { CollectionBeforeOperationHook } from 'payload/types';

import { isAdmin, isAdminFieldLevel } from '../access/isAdmin';
import { isUser } from '../access/isUser';
import { generateCreatedBy } from '../utilities/GenerateMeta';

const isCreator: Access = ({ req: { user } }) => {
  if (!user) return false;
  return {
    createdBy: {
      equals: user.id,
    },
  };
};

const hasMediaId: Access = ({ id, req }) => {
  if (req.baseUrl !== '/api/media') return true;
  if (!id) return false;
  return true;
};

// Hooks
const generateAltName: CollectionBeforeOperationHook = ({ args }) => {
  const files = args.req?.files;
  if (files && files.file && files.file.name) {
    const parts = files.file.name.split('.');
    files.file.name = `${(Math.random() + 1).toString(36).substring(2)}.${parts[parts.length - 1]}`;
  }
};

const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: req => {
      return isUser(req);
    },
    delete: req => {
      return isCreator(req) || isAdmin(req);
    },
    read: req => {
      return hasMediaId(req) || isAdmin(req) || isCreator(req);
    },
    update: req => {
      return isCreator(req) || isAdmin(req);
    },
  },
  fields: [
    {
      name: 'filename',
      type: 'text',
    },
    {
      name: 'createdBy',
      type: 'relationship',
      access: {
        create: () => false,
        update: isAdminFieldLevel,
      },
      admin: {
        readOnly: true,
      },
      relationTo: 'users',
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'original',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'credit',
      type: 'text',
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: '42Kit',
    },
    {
      name: 'license',
      type: 'select',
      options: [
        { label: 'RSI', value: 'RSI' },
        { label: 'CC-BY', value: 'CC-BY' },
        { label: 'CC-BY-SA', value: 'CC-BY-SA' },
        { label: 'CC-BY-NC', value: 'CC-BY-NC' },
        { label: 'CC-BY-NC-SA', value: 'CC-BY-NC-SA' },
        { label: 'CC-BY-NC-ND', value: 'CC-BY-NC-ND' },
        { label: 'CC0', value: 'CC0' },
        { label: 'Public Domain', value: 'Public Domain' },
        { label: 'All Rights Reserved', value: 'All Rights Reserved' },
      ],
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
  hooks: {
    beforeChange: [generateCreatedBy],
    beforeOperation: [generateAltName],
  },
  upload: {
    adminThumbnail: 'thumbnail',
    disableLocalStorage: true,
    imageSizes: [
      {
        name: 'thumbnail',
        height: 300,
        position: 'centre',
        width: 400,
      },
      {
        name: 'card',
        height: 1024,
        position: 'centre',
        width: 768,
      },
      {
        name: 'tablet',
        height: undefined,
        position: 'centre',
        width: 1024,
      },
      {
        name: 'avatar',
        height: 100,
        position: 'centre',
        width: 100,
      },
    ],
    mimeTypes: ['image/*'],
    staticDir: 'media',
    staticURL: 'https://r2-citizencat-data.citizenwiki.cn/cms-assets',
  },
};

export default Media;
