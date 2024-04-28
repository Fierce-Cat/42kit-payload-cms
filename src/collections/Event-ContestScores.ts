import type { Access } from 'payload/config';
import type {
  CollectionAfterChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload/types';

import payload from 'payload';
import { APIError, Forbidden } from 'payload/errors';

import { isAdmin } from '../access/isAdmin';
import { generateCreatedBy } from '../utilities/GenerateMeta';

const checkExistRecord: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req: { user },
}) => {
  if (operation === 'create') {
    const record = await payload.findByID({
      id: data.event_contest_record_id,
      collection: 'event-contest-records',
    });

    if (!record) {
      throw new APIError('Record not found.', 404);
    }

    const score = await payload.find({
      collection: 'event-contest-scores',
      where: {
        createdBy: {
          equals: user.id,
        },
        event_contest_record_id: {
          equals: data.event_contest_record_id,
        },
      },
    });

    if (score.totalDocs > 0) {
      throw new APIError('You have already scored this record.', 403);
    }
  }

  return data;
};

const updateRecordScore: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create') {
    const record = (await req.payload.findByID({
      id: doc.event_contest_record_id,
      collection: 'event-contest-records',
      req,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any;

    const scores = await req.payload.find({
      collection: 'event-contest-scores',
      req,
      where: {
        event_contest_record_id: {
          equals: doc.event_contest_record_id,
        },
      },
    });

    let total = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scores.docs.forEach((score: any) => {
      total += score.score_info.total;
    });

    total = doc.score_info.total;

    const scoredBy = [];
    if (record.race.scoredBy) {
      for (let i = 0; i < record.race.scoredBy.length; i++) {
        scoredBy.push(record.race.scoredBy[i].id);
      }
    }

    scoredBy.push(doc.createdBy);

    record.score = total;
    await req.payload.update({
      id: doc.event_contest_record_id,
      collection: 'event-contest-records',
      data: {
        race: {
          score: total,
          scoredBy,
        },
      },
      req,
    });
  }
  return doc;
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

const EventContestScores: CollectionConfig = {
  slug: 'event-contest-scores',
  access: {
    create: isEventCreatorOrAdmin,
    delete: isEventCreatorOrAdmin,
    read: () => true,
    update: isEventCreatorOrAdmin,
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
      name: 'event_contest_record_id',
      type: 'relationship',
      label: {
        en: 'Record ID',
        zh: '活动记录ID',
      },
      relationTo: 'event-contest-records',
      required: true,
    },
    {
      name: 'score_info',
      type: 'group',
      fields: [
        {
          name: 'total',
          type: 'number',
          label: {
            en: 'Total',
            zh: '总分数',
          },
          required: true,
        },
        {
          name: 'score_schema',
          type: 'array',
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
            {
              name: 'score',
              type: 'number',
              label: {
                en: 'Score',
                zh: '分数',
              },
              required: true,
            },
          ],
          label: {
            en: 'Score Schema',
            zh: '评分标准',
          },
        },
        {
          name: 'comment',
          type: 'text',
          label: {
            en: 'Comment',
            zh: '评语',
          },
        },
      ],
      label: {
        en: 'Score',
        zh: '分数数据',
      },
    },
  ],
  hooks: {
    afterChange: [updateRecordScore],
    beforeChange: [generateCreatedBy],
    beforeValidate: [checkEventStatus, checkExistRecord],
  },
  labels: {
    plural: {
      en: 'Event Contest Scores',
      zh: '活动比赛分数',
    },
    singular: {
      en: 'Event Contest Score',
      zh: '活动比赛分数',
    },
  },
};

export default EventContestScores;
