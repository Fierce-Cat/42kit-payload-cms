import type { Access } from 'payload/config';
import type {
  CollectionAfterChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload/types';

import payload from 'payload';
import { APIError, Forbidden } from 'payload/errors';

import { isAdmin } from '../access/isAdmin';
import { isUser } from '../access/isUser';
import { generateCreatedBy } from '../utilities/GenerateMeta';

// Count the number of participants in the event
const ranking: CollectionAfterChangeHook = ({ doc }) => {
  return doc;
};

const checkNumSubmissions: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req: { user },
}) => {
  if (operation === 'create') {
    const records = (await payload.find({
      collection: 'event-contest-records',
      where: {
        event_id: {
          equals: data.event_id,
        },
        user_id: {
          equals: user.id,
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any;

    const event = (await payload.findByID({
      id: data.event_id,
      collection: 'events',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any;

    if (records.totalDocs >= event.num_max_attempts) {
      throw new APIError('You have reached the maximum number of submissions.', 403);
    }

    return data;
  }

  return data;
};

// Check if the event is published and registration is open
const checkEventStatus: CollectionBeforeValidateHook = async ({
  data, // incoming data to update or create with
  operation, // 'create' or 'update'
}) => {
  if (operation === 'create') {
    const event = await payload.findByID({
      id: data.event_id,
      collection: 'events',
    });

    if (event.status !== 'published') {
      throw new Forbidden();
    }
  }

  return data;
};

// const isUserParticipated: CollectionBeforeValidateHook = async ({
//   data, // incoming data to update or create with'
//   operation, // 'create' or 'update'
// }) => {
//   if (operation === 'create') {
//   const participant = await payload.find({
//     collection: 'event-participants',
//     where: {
//       event_id: {
//         equals: data.event_id,
//       },
//       user_id: {
//         equals: data.user_id,
//       }
//     }
//   })

//   if (participant.totalDocs === 1) {
//     return data
//   }
// }
//   throw new APIError('You have not register this event yet.', 403)
// }

// Check if the posting user_id is the same as the logged in user
// const checkIsCurrentUser: CollectionBeforeValidateHook = ({
//   data, // incoming data to update or create with'
//   req: { user },
// }) => {
//   if (data.user_id !== user.id) {
//     // throw new Forbidden
//     throw new APIError('You can only register event for yourself.', 403)
//   }
//   return data
// }

const isEventCreatorOrAdmin: Access = ({ req: { user } }) => {
  if (!user) {
    return false;
  }

  if (isAdmin) {
    return true;
  }
  return {
    'event_id.createdBy': {
      equals: user.id,
    },
  };
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

const recordReadAccess: Access = req => {
  if (isEventCreatorOrAdmin(req)) return true;
  if (isCreatedBy(req)) return true;

  return {
    or: [
      {
        and: [
          {
            status: {
              in: ['submitted', 'published'],
            },
          },
          {
            'event_id.is_all_records_public': {
              equals: true,
            },
          },
        ],
      },
      {
        and: [
          {
            status: {
              in: ['published'],
            },
          },
          {
            'event_id.is_all_records_public': {
              equals: false,
            },
          },
        ],
      },
    ],
  };
};

const EventContestRecords: CollectionConfig = {
  slug: 'event-contest-records',
  access: {
    create: req => {
      return isUser(req);
    },
    delete: isEventCreatorOrAdmin,
    read: recordReadAccess,
    update: req => {
      return isEventCreatorOrAdmin(req);
    },
  },
  fields: [
    {
      name: 'createdBy',
      type: 'relationship',
      admin: { hidden: true },
      label: {
        en: 'Created By',
        zh: '所有者',
      },
      relationTo: 'users',
      required: true,
    },
    {
      name: 'event_id',
      type: 'relationship',
      label: {
        en: 'Event ID',
        zh: '活动ID',
      },
      relationTo: 'events',
      required: true,
    },
    {
      name: 'user_id',
      type: 'relationship',
      label: {
        en: 'Participant ID',
        zh: '参与者ID',
      },
      relationTo: 'users',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'submitted',
      label: {
        en: 'Status',
        zh: '状态',
      },
      options: [
        {
          label: {
            en: 'Submitted',
            zh: '已提交',
          },
          value: 'submitted',
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
            en: 'Rejected',
            zh: '已取消',
          },
          value: 'rejected',
        },
      ],
      required: true,
    },
    {
      name: 'is_validated',
      type: 'checkbox',
      defaultValue: false,
      label: {
        en: 'Validated',
        zh: '合格提交',
      },
      required: true,
    },
    {
      name: 'is_auto_validated',
      type: 'checkbox',
      admin: {
        readOnly: true,
      },
      defaultValue: false,
      label: {
        en: 'Auto Validated',
        zh: '自动验证',
      },
    },
    {
      name: 'validatedBy',
      type: 'relationship',
      label: {
        en: 'Validated By',
        zh: '验证者',
      },
      relationTo: 'users',
    },
    {
      name: 'validatedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      label: {
        en: 'Validated At',
        zh: '验证时间',
      },
    },
    {
      name: 'is_featured',
      type: 'checkbox',
      defaultValue: false,
      label: {
        en: 'Featured',
        zh: '精选',
      },
      required: true,
    },
    {
      name: 'race',
      type: 'group',
      fields: [
        {
          name: 'position',
          type: 'number',
          defaultValue: 0,
          label: {
            en: 'Position',
            zh: '排名',
          },
          required: true,
        },
        {
          name: 'time',
          type: 'text',
          defaultValue: '00:00:00',
          label: {
            en: 'Time',
            zh: '时间',
          },
        },
        {
          name: 'score',
          type: 'number',
          defaultValue: 0,
          label: {
            en: 'Score',
            zh: '分数',
          },
          required: true,
        },
        {
          name: 'is_scoreable',
          type: 'checkbox',
          defaultValue: true,
          label: {
            en: 'Scoreable',
            zh: '可评分',
          },
          required: true,
        },
        {
          name: 'is_winner',
          type: 'checkbox',
          defaultValue: false,
          label: {
            en: 'Winner',
            zh: '获胜',
          },
          required: true,
        },
        {
          name: 'file',
          type: 'upload',
          label: {
            en: 'File',
            zh: '文件',
          },
          relationTo: 'media',
        },
        {
          name: 'video_bilibili_url',
          type: 'text',
          label: {
            en: 'Bilibili Video URL',
            zh: 'Bilibili视频链接',
          },
        },
        {
          name: 'note',
          type: 'textarea',
          label: {
            en: 'Note',
            zh: '备注',
          },
        },
        {
          name: 'scoredBy',
          type: 'relationship',
          hasMany: true,
          label: {
            en: 'Scored By',
            zh: '评分者',
          },
          relationTo: 'users',
        },
      ],
      label: {
        en: 'Race',
        zh: '竞赛',
      },
    },
  ],
  hooks: {
    afterChange: [ranking],
    beforeChange: [generateCreatedBy],
    beforeValidate: [checkEventStatus, checkNumSubmissions],
  },
  labels: {
    plural: {
      en: 'Event Contest Records',
      zh: '活动比赛记录',
    },
    singular: {
      en: 'Event Contest Record',
      zh: '活动比赛记录',
    },
  },
};

export default EventContestRecords;
