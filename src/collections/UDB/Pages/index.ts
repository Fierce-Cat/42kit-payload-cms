import type { CollectionConfig } from 'payload/types';
import type { Access } from 'payload/config';
import { generateCreatedBy, generateRandomSlug } from '@/utilities/GenerateMeta';

// Access Control
import { isAdmin, isAdminFieldLevel } from '@/access/isAdmin';
import { isEditor } from '@/access/isEditor';

const isCreatedBy: Access = ({ req: { user } }) => {
  if (user) {
    return {
      createdBy: {
        equals: user.id,
      },
    };
  }
};

const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: req => {
      if (isAdmin(req)) return true;
      if (isCreatedBy(req)) return true;
      if (isEditor(req)) return true;
      return {
        status: {
          equals: 'published',
        },
      };
    },
    create: req => {
      if (isAdmin(req)) return true;
      if (isEditor(req)) return true;
      return false;
    },
    update: req => {
      if (isAdmin(req)) return true;
      if (isCreatedBy(req)) return true;
      if (isEditor(req)) return true;
      return false;
    },
    delete: req => {
      if (isAdmin(req)) return true;
      return false;
    },
  },
  hooks: {
    beforeChange: [generateCreatedBy, generateRandomSlug],
  },
  labels: {
    singular: {
      zh: '页面',
      en: 'Page',
    },
    plural: {
      zh: '页面',
      en: 'Pages',
    },
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'createdBy',
      label: {
        zh: '所有者',
        en: 'Created By',
      },
      type: 'relationship',
      relationTo: 'users',
      required: true,
      access: {
        update: req => {
          if (isAdmin(req)) {
            return true;
          }
        },
      },
      admin: { position: 'sidebar' },
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
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        // Basic Tab Start
        {
          label: {
            zh: '基础',
            en: 'Basic',
          },
          fields: [
            {
              name: 'title',
              label: {
                zh: '页面标题',
                en: 'Title',
              },
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'status',
              label: {
                zh: '状态',
                en: 'Status',
              },
              type: 'select',
              options: [
                {
                  label: {
                    zh: '草稿',
                    en: 'Draft',
                  },
                  value: 'draft',
                },
                {
                  label: {
                    zh: '已发布',
                    en: 'Published',
                  },
                  value: 'published',
                },
                {
                  label: {
                    zh: '已归档',
                    en: 'Archived',
                  },
                  value: 'archived',
                },
                {
                  label: {
                    zh: '删除',
                    en: 'Deleted',
                  },
                  value: 'deleted',
                },
              ],
              defaultValue: 'draft',
              required: true,
              admin: {
                position: 'sidebar',
              },
            },
            {
              name: 'abstract',
              label: {
                zh: '描述',
                en: 'Abstract',
              },
              type: 'textarea',
              required: true,
              localized: true,
            },
            {
              name: 'category',
              label: {
                zh: '类型',
                en: 'category',
              },
              type: 'relationship',
              relationTo: 'page-categories',
              required: true,
            },
            {
              name: 'featured_image',
              label: {
                zh: '封面图片',
                en: 'Featured Image',
              },
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'stat',
              label: {
                zh: '统计',
                en: 'Stats',
              },
              type: 'relationship',
              relationTo: 'content-stats',
              access: {
                update: isAdminFieldLevel,
              },
            },
          ],
        },
        // Basic Tab End
        // Details Tab Start
        {
          label: {
            zh: '详细内容',
            en: 'Details',
          },
          fields: [
            {
              name: 'content',
              label: {
                zh: '内容',
                en: 'Content',
              },
              type: 'json',
              localized: true,
              admin: {
                readOnly: true,
                description: "This field is automatically populated from the client-side content editor."
              }
            },
            {
              name: 'rich_content',
              label: {
                zh: '富文本内容',
                en: 'Rich Content',
              },
              type: 'richText',
              localized: true,
            },
          ],
        },
        // Details Tab End
      ],
    },
  ],
};

export default Pages;
