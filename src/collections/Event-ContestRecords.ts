import payload from 'payload'
import { Forbidden, APIError } from 'payload/errors'
import type { Access } from 'payload/config'
import type { CollectionConfig, CollectionAfterChangeHook, CollectionBeforeValidateHook } from 'payload/types'

import { generateId, generateCreatedBy } from '../utilities/GenerateMeta'

import { isUser } from '../access/isUser'
import { isAdmin } from '../access/isAdmin'
import { User } from './../payload-types';

// Count the number of participants in the event
const ranking: CollectionAfterChangeHook = async ({
  doc,
  operation,
}) => {
  return doc
}

const checkNumSubmissions: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req: { user },
}) => {
  if (operation === 'create') {
    const records = await payload.find({
      collection: 'event-contest-records',
      where: {
        event_id: {
          equals: data.event_id,
        },
        user_id: {
          equals: user.id,
        },
      }
    }) as any

    const event = await payload.findByID({
      collection: 'events',
      id: data.event_id,
    }) as any

    if (records.totalDocs >= event.num_max_attempts) {
      throw new APIError('You have reached the maximum number of submissions.', 403)
    }

    return data
  }

  return data
}

// Check if the event is published and registration is open
const checkEventStatus: CollectionBeforeValidateHook = async ({
  data, // incoming data to update or create with
  operation, // 'create' or 'update'
}) => {
  if (operation === 'create') {
    const event = await payload.findByID({
      collection: 'events',
      id: data.event_id,
    })

    if (event.status !== 'published') {
      throw new Forbidden
    }
    if (event.date_started > new Date()) {
      throw new APIError('Event has not started yet.', 403)
    }
    if (event.date_ended < new Date()) {
      throw new APIError('Event has ended.', 403)
    }
  }

  return data
}

const isUserParticipated: CollectionBeforeValidateHook = async ({
  data, // incoming data to update or create with'
  operation, // 'create' or 'update'
}) => {
  if (operation === 'create') {
    const participant = await payload.find({
      collection: 'event-participants',
      where: {
        event_id: {
          equals: data.event_id,
        },
        user_id: {
          equals: data.user_id,
        }
      }
    })

    if (participant.totalDocs === 1) {
      return data
    }

    throw new APIError('User has not register this event yet.', 403)
  }
}

// Check if the posting user_id is the same as the logged in user
const checkIsCurrentUser: CollectionBeforeValidateHook = async ({
  data, // incoming data to update or create with'
  req: { user },
}) => {
  if (data.user_id !== user.id) {
    // throw new Forbidden
    throw new APIError('You can only register event for yourself.', 403)
  }
  return data
}

const isCreatedBy: Access = ({ req: { user } }) => {
  if (user) {
    return {
      or: [
        {
          createdBy: {
            equals: user.id,
          },
        },
        {
          user_id: {
            equals: user.id,
          },
        }
      ]
    }
  }
}

const isEventOrganizer: Access = ({ req: { user } }) => {
  if (user) {
    return {
      or: [
        {
          'event_id.organizing_users': {
            equals: user.id,
          }
        },
        {
          'event_id.createdBy': {
            equals: user.id,
          }
        }
      ]
    }
  }
}


const recordReadAccess: Access = ({ req: { user } }) => {

  return {
    or: [
    // all records are public
      {
        and: [
          {
            status: {
              in: ['submitted', 'published'],
            },
          },
          {
            "event_id.is_all_records_public": {
              equals: true,
            },
          }
        ]
      },
      // only published records are public
      {
        and: [
          {
            status: {
              in: ['published'],
            },
          },
          {
            "event_id.is_all_records_public": {
              equals: false,
            },
          }
        ]
      }
    ]
  }
}

const EventContestRecords: CollectionConfig = {
  slug: 'event-contest-records',
  labels: {
    singular: {
      zh: '活动比赛记录',
      en: 'Event Contest Record',
    },
    plural: {
      zh: '活动比赛记录',
      en: 'Event Contest Records',
    },
  },
  access: {
    create: isUser,
    read: (req) => {
      if (isAdmin(req)) {
        return true
      }
      if (isEventOrganizer(req)) {
        return true
      }
      if (isCreatedBy(req)) {
        return true
      }
      return recordReadAccess(req)
    },
    update: (req) => {
      if (isAdmin(req)) {
        return true
      }
      if (isCreatedBy(req)) {
        return true
      }
      return false
    },
    delete: (req) => {
      if (isAdmin(req)) {
        return true
      }
      if (isCreatedBy(req)) {
        return true
      }
      return false
    },
  },
  hooks: {
    beforeValidate: [checkEventStatus, isUserParticipated, checkNumSubmissions],
    beforeChange: [generateCreatedBy],
    afterChange: [ranking],
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
      admin: { hidden: true },
    },
    {
      name: 'event_id',
      label: {
        zh: '活动ID',
        en: 'Event ID',
      },
      type: 'relationship',
      relationTo: 'events',
      required: true,
    },
    {
      name: 'user_id',
      label: {
        zh: '参与者ID',
        en: 'Participant ID',
      },
      type: 'relationship',
      relationTo: 'users',
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
            zh: '已提交',
            en: 'Submitted',
          },
          value: 'submitted',
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
            zh: '已取消',
            en: 'Rejected',
          },
          value: 'rejected',
        },
      ],
      required: true,
      defaultValue: 'submitted',
    },
    {
      name: 'is_validated',
      label: {
        zh: '合格提交',
        en: 'Validated',
      },
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
    {
      name: 'is_auto_validated',
      label: {
        zh: '自动验证',
        en: 'Auto Validated',
      },
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'validatedBy',
      label: {
        zh: '验证者',
        en: 'Validated By',
      },
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'validatedAt',
      label: {
        zh: '验证时间',
        en: 'Validated At',
      },
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'is_featured',
      label: {
        zh: '精选',
        en: 'Featured',
      },
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
    {
      name: 'race',
      label: {
        zh: '竞赛',
        en: 'Race',
      },
      type: 'group',
      fields: [
        {
          name: 'position',
          label: {
            zh: '排名',
            en: 'Position',
          },
          type: 'number',
          required: true,
          defaultValue: 0,
        },
        {
          name: 'time',
          label: {
            zh: '时间',
            en: 'Time',
          },
          type: 'text',
          defaultValue: '00:00:00',
        },
        {
          name: 'score',
          label: {
            zh: '分数',
            en: 'Score',
          },
          type: 'number',
          required: true,
          defaultValue: 0,
        },
        {
          name: 'is_scoreable',
          label: {
            zh: '可评分',
            en: 'Scoreable',
          },
          type: 'checkbox',
          defaultValue: true,
          required: true,
        },
        {
          name: 'is_winner',
          label: {
            zh: '获胜',
            en: 'Winner',
          },
          type: 'checkbox',
          defaultValue: false,
          required: true,
        },
        {
          name: 'file',
          label: {
            zh: '文件',
            en: 'File',
          },
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'video_bilibili_url',
          label: {
            zh: 'Bilibili视频链接',
            en: 'Bilibili Video URL',
          },
          type: 'text',
        },
        {
          name: 'note',
          label: {
            zh: '备注',
            en: 'Note',
          },
          type: 'textarea',
        },
        {
          name: 'scoredBy',
          label: {
            zh: '评分者',
            en: 'Scored By',
          },
          type: 'relationship',
          relationTo: 'users',
          hasMany: true,
        }
      ],
    }
  ],
}

export default EventContestRecords
