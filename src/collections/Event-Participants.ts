import payload from 'payload'
import { Forbidden, APIError } from 'payload/errors'
import type { Access } from 'payload/config'
import type { CollectionConfig, CollectionAfterChangeHook, CollectionBeforeValidateHook } from 'payload/types'

import { generateId, generateCreatedBy } from '../utilities/GenerateMeta'

import { isUser } from '../access/isUser'
import { isAdmin } from '../access/isAdmin'

// Count the number of participants in the event
const countParticipants: CollectionAfterChangeHook = async ({
  doc,
  operation,
}) => {
  if (operation === 'create') {
    // Count the number of participants in the event
    await payload.find({
      collection: 'event-participants',
      where: {
        event_id: {
          equals: doc.event_id.id ?? doc.event_id,
        }
      }
    }).then((participants) => {
      payload.update({
        collection: 'events',
        id: doc.event_id.id ?? doc.event_id,
        data: {
          num_participants: participants.totalDocs,
        }
      })
    })
  } else if (operation === 'update') {
    // Count the number of participants in the event
    await payload.find({
      collection: 'event-participants',
      where: {
        event_id: {
          equals: doc.event_id.id ?? doc.event_id,
        }
      }
    }).then((participants) => {
      payload.update({
        collection: 'events',
        id: doc.event_id.id ?? doc.event_id,
        data: {
          num_participants: participants.totalDocs,
        }
      })
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

    if (event.is_registration_open !== true) {
      throw new Forbidden
    }
  }

  return data
}

const checkUserParticipation: CollectionBeforeValidateHook = async ({
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

  console.log(participant)

  if (participant.totalDocs > 0) {
    throw new APIError('You have already registered for this event', 400)
  }
}

  return data
}

const isEventCreatorOrAdmin: Access = ({ req: { user } }) => {
  if (isAdmin) {
    return true
  }
  return {
    'event_id.createdBy': {
      equals: user.id,
    },
  }
}

const EventParticipants: CollectionConfig = {
  slug: 'event-participants',
  labels: {
    singular: {
      zh: '活动参与者',
      en: 'Event Participant',
    },
    plural: {
      zh: '活动参与者',
      en: 'Event Participants',
    },
  },
  access: {
    create: isUser,
    read: () => true,
    update: isUser,
    delete: isEventCreatorOrAdmin,
  },
  hooks: {
    beforeValidate: [checkEventStatus, checkUserParticipation],
    beforeChange: [generateId, generateCreatedBy],
    afterChange: [countParticipants],
  },
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
      defaultValue: [],
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
          name: 'answer',
          label: {
            zh: '回答',
            en: 'Answer',
          },
          type: 'text',
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
            zh: '已报名',
            en: 'Registered',
          },
          value: 'registered',
        },
        {
          label: {
            zh: '已签到',
            en: 'Checked In',
          },
          value: 'checked-in',
        },
        {
          label: {
            zh: '已取消',
            en: 'Cancelled',
          },
          value: 'cancelled',
        },
      ],
      required: true,
      defaultValue: 'registered',
    },
  ],
}

export default EventParticipants