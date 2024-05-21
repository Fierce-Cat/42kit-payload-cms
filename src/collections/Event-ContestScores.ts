import payload from 'payload'
import { Forbidden, APIError } from 'payload/errors'
import type { Access } from 'payload/config'
import type { CollectionConfig, CollectionBeforeValidateHook, CollectionAfterChangeHook  } from 'payload/types'

import { generateId, generateCreatedBy } from '../utilities/GenerateMeta'

import { isUser } from '../access/isUser'
import { isAdmin } from '../access/isAdmin'

// Count the number of participants in the event
const ranking: CollectionAfterChangeHook = async ({
  doc,
  operation,
}) => {
  return doc
}

const checkExistRecord: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req: { user },
}) => {
  if (operation === 'create') {
    const record = await payload.findByID({
      collection: 'event-contest-records',
      id: data.event_contest_record_id,
    })

    if (!record) {
      throw new APIError('Record not found.', 404)
    }

    const score = await payload.find({
      collection: 'event-contest-scores',
      where: {
        event_contest_record_id: {
          equals: data.event_contest_record_id,
        },
        createdBy: {
          equals: user.id,
        }
      }
    })

    if (score.totalDocs > 0) {
      throw new APIError('You have already scored this record.', 403)
    }
  }

  return data
}

const updateRecordScore: CollectionAfterChangeHook  = async ({
  doc,
  operation,
  req,
}) => {
  if (operation === 'create') {
    const record = await req.payload.findByID({
      req,
      collection: 'event-contest-records',
      id: doc.event_contest_record_id.id,
    }) as any

    const scores = await req.payload.find({
      req,
      collection: 'event-contest-scores',
      where: {
        event_contest_record_id: {
          equals: doc.event_contest_record_id.id,
        }
      }
    })

    let total = 0
    scores.docs.forEach((score: any) => {
      total += score.score_info.total
    })

    total = doc.score_info.total

    let scoredBy = []
    if (record.race.scoredBy) {
      for (let i = 0; i < record.race.scoredBy.length; i++) {
        scoredBy.push(record.race.scoredBy[i].id)
      }
    }

    scoredBy.push(doc.createdBy.id)

    record.score = total
    await req.payload.update({
      req,
      collection: 'event-contest-records',
      id: doc.event_contest_record_id.id,
      data: {
        race: {
          score: total,
          scoredBy,
        },
      },
    })
  }
  return doc
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
}
  throw new APIError('You have not register this event yet.', 403)
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

const isEventCreatorOrAdmin: Access = ({ req: { user } }) => {
  if (!user)
  {
    return false
  }
  if (isAdmin) {
    return true
  }
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

const EventContestScores: CollectionConfig = {
  slug: 'event-contest-scores',
  labels: {
    singular: {
      zh: '活动比赛分数',
      en: 'Event Contest Score',
    },
    plural: {
      zh: '活动比赛分数',
      en: 'Event Contest Scores',
    },
  },
  access: {
    create: isEventCreatorOrAdmin,
    read: () => true,
    update: isEventCreatorOrAdmin,
    delete: isEventCreatorOrAdmin,
  },
  hooks: {
    beforeValidate: [checkEventStatus, checkExistRecord],
    beforeChange: [generateCreatedBy],
    afterChange: [updateRecordScore],
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
      name: 'event_contest_record_id',
      label: {
        zh: '活动记录ID',
        en: 'Record ID',
      },
      type: 'relationship',
      relationTo: 'event-contest-records',
      required: true,
    },
    {
      name: 'score_info',
      label: {
        zh: '分数数据',
        en: 'Score',
      },
      type: 'group',
      fields: [
        {
          name: 'total',
          label: {
            zh: '总分数',
            en: 'Total',
          },
          type: 'number',
          required: true,
        },
        {
          name: 'score_schema',
          label: {
            zh: '评分标准',
            en: 'Score Schema',
          },
          type: 'array',
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
              name: 'min',
              label: {
                zh: '最小值',
                en: 'Min',
              },
              type: 'number',
            },
            {
              name: 'max',
              label: {
                zh: '最大值',
                en: 'Max',
              },
              type: 'number',
            },
            {
              name: 'score',
              label: {
                zh: '分数',
                en: 'Score',
              },
              type: 'number',
              required: true,
            }
          ]
        },
        {
          name: 'comment',
          label: {
            zh: '评语',
            en: 'Comment',
          },
          type: 'text',
        },
      ],
    },
  ],
}

export default EventContestScores
