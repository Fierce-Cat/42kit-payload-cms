import { CollectionConfig } from 'payload/types';
import { isAdmin } from '../../access/isAdmin';
import { slugField } from '../../fields/slug';

const CommunityNavs: CollectionConfig = {
  slug: 'community-navs',
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
    },
    slugField(),
    {
      name: 'abstract',
      type: 'text',
      label: {
        en: 'Abstract',
        zh: '摘要',
      },
    },
    {
      name: 'description',
      type: 'text',
      label: {
        en: 'Description',
        zh: '描述',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: {
        en: 'Image',
        zh: '图片',
      },
    },
    {
      name: 'link',
      type: 'text',
      label: {
        en: 'Link',
        zh: '链接',
      },
    },
    {
      name: 'is_sponsored',
      type: 'checkbox',
      label: {
        en: 'Sponsored',
        zh: '赞助',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'community-nav-tags',
      hasMany: true,
      required: true,
      label: {
        en: 'Tags',
        zh: '标签',
      },
    },
  ],
};

export default CommunityNavs;
