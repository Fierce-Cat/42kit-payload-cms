import type { Access } from 'payload/config';
import type { CollectionConfig } from 'payload/types';

import payload from 'payload';

import type { User } from '../payload-types';

// Access Control
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin';
import { isAdminOrSelf } from '../access/isAdminOrSelf';
import { isUser } from '../access/isUser';
import { generateCreatedBy, generateRandomSlug } from '../utilities/GenerateMeta';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isOrganizer: Access<any, User> = ({ id, req: { user } }) => {
  if (!user) {
    return false;
  }
  return payload
    .find({
      collection: 'event-organizers',
      where: {
        event_id: {
          equals: id,
        },
        role: {
          equals: 'host',
        },
        user_id: {
          equals: user.id,
        },
      },
    })
    .then(organizers => {
      if (organizers.totalDocs > 0) {
        return true;
      }
      return false;
    })
    .catch(() => {
      return false;
    });
};

const isCreatedBy: Access = ({ req: { user } }) => {
  if (!user) {
    return false;
  }
  return {
    createdBy: {
      equals: user.id,
    },
  };
};

// 只有管理员/活动创建者/组织者可以查看未发布的活动，其他用户只能查看已发布的活动
const eventReadAccess: Access = req => {
  if (isAdmin(req)) {
    return true;
  }
  if (isCreatedBy(req)) {
    return true;
  }
  if (isOrganizer(req)) {
    return true;
  }
  return {
    status: {
      equals: 'published',
    },
  };
};

// 只有注册用户可以创建活动
const eventCreateAccess: Access = req => {
  return isUser(req);
};

// 允许管理员、活动创建者和组织者更新活动
const eventUpdateAccess: Access = req => {
  if (isAdmin(req)) {
    return true;
  }
  if (isCreatedBy(req)) {
    return true;
  }
  if (isOrganizer(req)) {
    return true;
  }
  return false;
};

const Events: CollectionConfig = {
  slug: 'events',
  access: {
    create: eventCreateAccess,
    delete: isAdminOrSelf,
    read: eventReadAccess,
    update: eventUpdateAccess,
  },
  admin: {
    useAsTitle: 'title',
  },
  endpoints: [
    {
      handler: async (req, res) => {
        if (!req.user) {
          return res.status(401).send('Unauthorized');
        }

        const participations = await payload.find({
          collection: 'event-participants',
          where: {
            event_id: {
              equals: req.params.id,
            },
            user_id: {
              equals: req.user.id,
            },
          },
        });

        if (participations.totalDocs > 0) {
          return res.status(200).send(participations.docs[0]);
        } else {
          return res.status(404).send({
            status: 'not_participated',
          });
        }
      },
      method: 'get',
      path: '/:id/participateStatus',
    },
  ],
  fields: [
    {
      name: 'createdBy',
      type: 'relationship',
      access: {
        update: () => false,
      },
      admin: { hidden: true },
      label: {
        en: 'Created By',
        zh: '所有者',
      },
      relationTo: 'users',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: { position: 'sidebar' },
      label: {
        en: 'Slug',
        zh: '别名',
      },
      required: true,
      unique: true,
    },
    {
      type: 'tabs',
      tabs: [
        // Basic Tab Start
        {
          fields: [
            {
              name: 'title',
              type: 'text',
              label: {
                en: 'Title',
                zh: '标题',
              },
              required: true,
            },
            {
              name: 'status',
              type: 'select',
              admin: {
                position: 'sidebar',
              },
              defaultValue: 'draft',
              label: {
                en: 'Status',
                zh: '状态',
              },
              options: [
                {
                  label: {
                    en: 'Draft',
                    zh: '草稿',
                  },
                  value: 'draft',
                },
                {
                  label: {
                    en: 'Published',
                    zh: '已发布',
                  },
                  value: 'published',
                },
                {
                  label: {
                    en: 'Archived',
                    zh: '下线',
                  },
                  value: 'archived',
                },
                {
                  label: {
                    en: 'Deleted',
                    zh: '删除',
                  },
                  value: 'deleted',
                },
              ],
              required: true,
            },
            {
              name: 'summary',
              type: 'textarea',
              label: {
                en: 'Summary',
                zh: '描述',
              },
              required: true,
            },
            {
              name: 'category',
              type: 'relationship',
              label: {
                en: 'category',
                zh: '类型',
              },
              relationTo: 'event-categories',
              required: true,
            },
            {
              name: 'featured_image',
              type: 'upload',
              label: {
                en: 'Featured Image',
                zh: '封面图片',
              },
              relationTo: 'media',
              required: true,
            },
            {
              name: 'theme_color',
              type: 'text',
              defaultValue: '#eb6888',
              label: {
                en: 'Theme Color',
                zh: '主题颜色',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'date_started',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                    width: '33%',
                  },
                  label: {
                    en: 'Start Date',
                    zh: '开始日期',
                  },
                  required: true,
                },
                {
                  name: 'date_ended',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                    width: '33%',
                  },
                  label: {
                    en: 'End Date',
                    zh: '结束日期',
                  },
                  required: true,
                },
                {
                  name: 'timezone',
                  type: 'text',
                  admin: {
                    width: '33%',
                  },
                  label: {
                    en: 'Timezone',
                    zh: '时区',
                  },
                  required: true,
                },
              ],
            },
          ],
          label: {
            en: 'Basic',
            zh: '基础',
          },
        },
        // Basic Tab End
        // Details Tab Start
        {
          fields: [
            {
              name: 'content',
              type: 'json',
              admin: {
                disabled: true,
              },
              defaultValue: {},
              label: {
                en: 'Content',
                zh: '内容',
              },
            },
            {
              name: 'geo_address',
              type: 'textarea',
              label: {
                en: 'Location',
                zh: '位置',
              },
            },
            {
              name: 'online_url',
              type: 'text',
              label: {
                en: 'URL',
                zh: '网址',
              },
            },
          ],
          label: {
            en: 'Details',
            zh: '详细内容',
          },
        },
        // Details Tab End
        // User Relationship Tab Start
        {
          fields: [
            {
              name: 'num_participants',
              type: 'number',
              admin: {
                readOnly: true,
              },
              defaultValue: 0,
              label: {
                en: 'Number of Participants',
                zh: '参与者数量',
              },
              required: true,
            },
            {
              name: 'num_max_participants',
              type: 'number',
              defaultValue: 0,
              label: {
                en: 'Max Number of Participants',
                zh: '最大参与者数量',
              },
              required: true,
            },
            {
              name: 'show_participants',
              type: 'checkbox',
              defaultValue: true,
              label: {
                en: 'Show Participants',
                zh: '显示参与者',
              },
            },
            {
              name: 'organizers',
              type: 'relationship',
              hasMany: true,
              label: {
                en: 'Organizers',
                zh: '组织者',
              },
              relationTo: 'event-organizers',
            },
            {
              name: 'show_organizers',
              type: 'checkbox',
              defaultValue: true,
              label: {
                en: 'Show Organizers',
                zh: '显示组织者',
              },
            },
            {
              name: 'register_questions',
              type: 'array',
              admin: {
                readOnly: true,
              },
              fields: [
                {
                  name: 'id',
                  type: 'text',
                  admin: { hidden: true },
                },
                {
                  name: 'question',
                  type: 'text',
                  label: {
                    en: 'Question',
                    zh: '问题',
                  },
                  required: true,
                },
                {
                  name: 'type',
                  type: 'select',
                  label: {
                    en: 'Type',
                    zh: '类型',
                  },
                  options: [
                    {
                      label: {
                        en: 'Text',
                        zh: '文本',
                      },
                      value: 'text',
                    },
                    {
                      label: {
                        en: 'Radio',
                        zh: '单选',
                      },
                      value: 'radio',
                    },
                    {
                      label: {
                        en: 'Checkbox',
                        zh: '多选',
                      },
                      value: 'checkbox',
                    },
                  ],
                  required: true,
                },
                {
                  name: 'required',
                  type: 'checkbox',
                  label: {
                    en: 'Required',
                    zh: '必填',
                  },
                },
              ],
              interfaceName: 'event_register_questions',
              label: {
                en: 'Register Questions',
                zh: '注册问题',
              },
            },
          ],
          label: {
            en: 'User Relationships',
            zh: '用户关系',
          },
        },
        // User Relationship Tab End
        // Event Settings Tab Start
        {
          fields: [
            {
              name: 'is_featured',
              type: 'checkbox',
              access: {
                update: isAdminFieldLevel,
              },
              defaultValue: false,
              label: {
                en: 'Featured',
                zh: '推荐活动',
              },
            },
            {
              name: 'is_online',
              type: 'checkbox',
              defaultValue: false,
              label: {
                en: 'Online Event',
                zh: '在线活动',
              },
            },
            {
              name: 'is_registration_open',
              type: 'checkbox',
              defaultValue: true,
              label: {
                en: 'Open Registration',
                zh: '开放注册',
              },
            },
          ],
          label: {
            en: 'Event Settings',
            zh: '活动设置',
          },
        },
        {
          fields: [
            {
              name: 'is_contest',
              type: 'checkbox',
              defaultValue: false,
              label: {
                en: 'Contest',
                zh: '比赛',
              },
            },
            {
              name: 'contest_type',
              type: 'select',
              defaultValue: 'other',
              label: {
                en: 'Contest Type',
                zh: '比赛类型',
              },
              options: [
                {
                  label: {
                    en: 'Photography Contest',
                    zh: '摄影比赛',
                  },
                  value: 'photographyContest',
                },
                {
                  label: {
                    en: 'Racing',
                    zh: '竞速',
                  },
                  value: 'racing',
                },
                {
                  label: {
                    en: 'Other',
                    zh: '其他',
                  },
                  value: 'other',
                },
              ],
            },
            {
              name: 'is_all_records_public',
              type: 'checkbox',
              defaultValue: false,
              label: {
                en: 'Public All Records',
                zh: '公开所有记录',
              },
              required: true,
            },
            {
              name: 'score_schema',
              type: 'array',
              defaultValue: [],
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
                  name: 'min',
                  type: 'number',
                  label: {
                    en: 'Min',
                    zh: '最小值',
                  },
                },
                {
                  name: 'max',
                  type: 'number',
                  label: {
                    en: 'Max',
                    zh: '最大值',
                  },
                },
              ],
              label: {
                en: 'Score Schema',
                zh: '评分标准',
              },
            },
            {
              name: 'num_max_attempts',
              type: 'number',
              defaultValue: 1,
              label: {
                en: 'Max Attempts',
                zh: '最大尝试次数',
              },
              required: true,
            },
          ],
          label: {
            en: 'Contest Settings',
            zh: '赛事设置',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [generateCreatedBy, generateRandomSlug],
  },
  labels: {
    plural: {
      en: 'events',
      zh: '活动',
    },
    singular: {
      en: 'Event',
      zh: '活动',
    },
  },
  versions: {
    drafts: false,
  },
};

export default Events;
