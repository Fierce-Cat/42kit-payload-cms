import type { CollectionConfig } from 'payload/types';

// Access Control
import { isAdmin } from '../../access/isAdmin';

const CommunityNavsTags: CollectionConfig = {
  slug: 'community-nav-tags',
  admin: {
    useAsTitle: 'name',
  },
  labels: {
    singular: {
      zh: '导航分类',
      en: 'Community Nav Category',
    },
    plural: {
      zh: '导航分类',
      en: 'Community Nav Categories',
    },
  },
  access: {
    create: req => {
      return isAdmin(req);
    },
    read: () => true,
    update: req => {
      return isAdmin(req);
    },
    delete: req => {
      return isAdmin(req);
    },
  },
  fields: [
    {
      name: 'name',
      label: {
        zh: '名称',
        en: 'Name',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: {
        zh: '别名',
        en: 'Slug',
      },
      type: 'text',
      required: true,
      unique: true,
    },
  ],
  hooks: {
    beforeChange: [],
  },
};

export default CommunityNavsTags;
