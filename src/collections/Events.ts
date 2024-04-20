import payload from 'payload'
import type { CollectionConfig, CollectionBeforeReadHook } from 'payload/types'
import type { Access } from 'payload/config'
import type { User } from '../payload-types'
import { generateId, generateCreatedBy, generateRandomSlug } from '../utilities/GenerateMeta'

// Access Control
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'
import { isAdminOrSelf } from '../access/isAdminOrSelf'
import { isUser } from '../access/isUser'

const isOrganizer: Access< any, User > = ({req: {user}, id}) => {
  if (!user)
  {
    return false
  }
  return payload.find({
    collection: 'event-organizers',
    where: {
      user_id: {
        equals: user.id
      },
      event_id: {
        equals: id
      },
      role: {
        equals: 'host'
      }
    }
  }).then((organizers) => {
    if (organizers.totalDocs > 0)
    {
      return true
    }
    return false
  }).catch(() => {
    return false
  })
}

const isCreatedBy: Access = ({ req: { user } }) => {
  if (!user)
  {
    return false
  }
  return {
    createdBy: {
      equals: user.id,
    },
  }
}

// 只有管理员/活动创建者/组织者可以查看未发布的活动，其他用户只能查看已发布的活动
const eventReadAccess: Access = (req) => {
  if (isAdmin(req))
  {
    return true
  }
  if (isCreatedBy(req))
  {
    return true
  }
  if (isOrganizer(req))
  {
    return true
  }
  return {
    status: {
      equals: 'published',
    }
  }
}

// 只有注册用户可以创建活动
const eventCreateAccess: Access = (req) => {
  return isUser(req)
}

// 允许管理员、活动创建者和组织者更新活动
const eventUpdateAccess: Access = (req) => {
  return (isAdmin(req) || isCreatedBy(req) || isOrganizer(req))
}


const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: eventReadAccess,
    create: eventCreateAccess,
    update: eventUpdateAccess,
    delete: isAdminOrSelf,
  },
  hooks: {
    beforeChange: [generateId, generateCreatedBy, generateRandomSlug],
  },
  labels: {
    singular: {
      zh: '活动',
      en: 'Event',
    },
    plural: {
      zh: '活动',
      en: 'events',
    },
  },
  endpoints: [
    {
      path: '/:id/participateStatus',
      method: 'get',
      handler: async (req, res, next) => {
        if (!req.user) {
          return res.status(401).send('Unauthorized')
        }

        const participations = await payload.find({
          collection: 'event-participants',
          where: {
            user_id: {
              equals: req.user.id
            },
            event_id: {
              equals: req.params.id
            }
          }
        })

        if (participations.totalDocs > 0) {
          return res.status(200).send(participations.docs[0])
        } else {
          return res.status(404).send({
            status: 'not_participated'
          })
        }
      },
    },
  ],
  fields: [
    {
      name: 'id',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'createdBy',
      label: {
        zh: '所有者',
        en: 'Created By',
      },
      type: 'relationship',
      relationTo: 'users',
      required: true,
      access:{
        update: () => false,
      },
      admin: { hidden: true },
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
                zh: '标题',
                en: 'Title',
              },
              type: 'text',
              required: true,
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
                    zh: '下线',
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
                }
              ],
              defaultValue: 'draft',
              required: true,
              admin: {
                position: 'sidebar',
              }
            },
            {
              name: 'summary',
              label: {
                zh: '描述',
                en: 'Summary',
              },
              type: 'textarea',
              required: true,
            },
            {
              name: 'category',
              label: {
                zh: '类型',
                en: 'category',
              },
              type: 'relationship',
              relationTo: 'event-categories',
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
              name: 'theme_color',
              label: {
                zh: '主题颜色',
                en: 'Theme Color',
              },
              type: 'text',
              defaultValue: '#eb6888',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'date_started',
                  label: {
                    zh: '开始日期',
                    en: 'Start Date',
                  },
                  type: 'date',
                  required: true,
                  admin: {
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                    width: '33%',
                  }
                },
                {
                  name: 'date_ended',
                  label: {
                    zh: '结束日期',
                    en: 'End Date',
                  },
                  type: 'date',
                  required: true,
                  admin: {
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                    width: '33%',
                  }
                },
                {
                  name: 'timezone',
                  label: {
                    zh: '时区',
                    en: 'Timezone',
                  },
                  type: 'text',
                  required: true,
                  admin: {
                    width: '33%',
                  }
                }
              ]
            },
          ]
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
              defaultValue: {},
              admin: {
                disabled: true,
              }
            },
            {
              name: 'geo_address',
              label: {
                zh: '位置',
                en: 'Location',
              },
              type: 'textarea',
            },
            {
              name: 'online_url',
              label: {
                zh: '网址',
                en: 'URL',
              },
              type: 'text',
            },
          ]
        },
        // Details Tab End
        // User Relationship Tab Start
        {
          label: {
            zh: '用户关系',
            en: 'User Relationships',
          },
          fields: [
            {
              name: 'num_participants',
              label: {
                zh: '参与者数量',
                en: 'Number of Participants',
              },
              type: 'number',
              defaultValue: 0,
              required: true,
              admin: {
                readOnly: true,
              }
            },
            {
              name: 'num_max_participants',
              label: {
                zh: '最大参与者数量',
                en: 'Max Number of Participants',
              },
              type: 'number',
              required: true,
              defaultValue: 0,

            },
            {
              name: 'show_participants',
              label: {
                zh: '显示参与者',
                en: 'Show Participants',
              },
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'organizers',
              label: {
                zh: '组织者',
                en: 'Organizers',
              },
              type: 'relationship',
              relationTo: 'event-organizers',
              hasMany: true,
            },
            {
              name: 'show_organizers',
              label: {
                zh: '显示组织者',
                en: 'Show Organizers',
              },
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'register_questions',
              label: {
                zh: '注册问题',
                en: 'Register Questions',
              },
              type: 'array',
              interfaceName: 'event_register_questions',
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
                  label: {
                    zh: '问题',
                    en: 'Question',
                  },
                  type: 'text',
                  required: true,
                },
                {
                  name: 'type',
                  label: {
                    zh: '类型',
                    en: 'Type',
                  },
                  type: 'select',
                  required: true,
                  options: [
                    {
                      label: {
                        zh: '文本',
                        en: 'Text',
                      },
                      value: 'text',
                    },
                    {
                      label: {
                        zh: '单选',
                        en: 'Radio',
                      },
                      value: 'radio',
                    },
                    {
                      label: {
                        zh: '多选',
                        en: 'Checkbox',
                      },
                      value: 'checkbox',
                    },
                  ],
                },
                {
                  name: 'required',
                  label: {
                    zh: '必填',
                    en: 'Required',
                  },
                  type: 'checkbox',
                },
              ]
            }
          ]
        },
        // User Relationship Tab End
        // Event Settings Tab Start
        {
          label: {
            zh: '活动设置',
            en: 'Event Settings',
          },
          fields: [
            {
              name: 'is_featured',
              label: {
                zh: '推荐活动',
                en: 'Featured',
              },
              type: 'checkbox',
              defaultValue: false,
              access: {
                update: isAdminFieldLevel,
              },
            },
            {
              name: 'is_online',
              label: {
                zh: '在线活动',
                en: 'Online Event',
              },
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'is_registration_open',
              label: {
                zh: '开放注册',
                en: 'Open Registration',
              },
              type: 'checkbox',
              defaultValue: true,
            },
          ]
        },
        {
          label: {
            zh: '赛事设置',
            en: 'Contest Settings',
          },
          fields: [
            {
              name: 'is_contest',
              label: {
                zh: '比赛',
                en: 'Contest',
              },
              type: 'checkbox',
              defaultValue: false,
            }
          ]
        }
      ],

    }
  ],
}

export default Events
