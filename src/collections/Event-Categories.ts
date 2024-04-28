import type { CollectionConfig } from 'payload/types';

// Access Control
import { isAdmin } from '../access/isAdmin';

const EventCategories: CollectionConfig = {
  slug: 'event-categories',
  access: {
    create: req => {
      return isAdmin(req);
    },
    delete: req => {
      return isAdmin(req);
    },
    read: () => true,
    update: req => {
      return isAdmin(req);
    },
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Name',
        zh: '名称',
      },
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: {
        en: 'Slug',
        zh: '别名',
      },
      required: true,
      unique: true,
    },
  ],
  hooks: {
    beforeChange: [],
  },
  labels: {
    plural: {
      en: 'Event Categories',
      zh: '活动分类',
    },
    singular: {
      en: 'Event Category',
      zh: '活动分类',
    },
  },
};

export default EventCategories;
