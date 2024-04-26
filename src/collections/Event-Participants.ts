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
  req,
}) => {
  if (operation === 'create') {
    // Count the number of participants in the event
    await req.payload.find({
      req,
      collection: 'event-participants',
      where: {
        event_id: {
          equals: doc.event_id.id ?? doc.event_id,
        }
      }
    }).then((participants) => {
      req.payload.update({
        req,
        collection: 'events',
        id: doc.event_id.id ?? doc.event_id,
        data: {
          num_participants: participants.totalDocs,
        }
      })
    })
  } else if (operation === 'update') {
    // Count the number of participants in the event
    await req.payload.find({
      req,
      collection: 'event-participants',
      where: {
        event_id: {
          equals: doc.event_id.id ?? doc.event_id,
        }
      }
    }).then((participants) => {
      req.payload.update({
        req,
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

    if (event.max_participants !== 0 && event.num_participants >= event.max_participants) {
      throw new Forbidden
    }

    if (new Date(event.date_ended as string) < new Date()) {
      throw new APIError('Event has ended.', 400)
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

  if (participant.totalDocs > 0) {
    throw new APIError('You have already registered for this event.', 400)
  }
}

  return data
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
    'event_id.createdBy': {
      equals: user.id,
    },
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

const participantsReadAccess: Access = (req) => {
  if (isEventCreatorOrAdmin(req)) return true

  return {
    "event_id.show_participants": {
      equals: true,
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
    read: participantsReadAccess,
    update: (req) => {
      return (isCreatedBy(req) || isEventCreatorOrAdmin(req))
    },
    delete: isEventCreatorOrAdmin,
  },
  hooks: {
    beforeValidate: [checkEventStatus, checkUserParticipation, checkIsCurrentUser],
    beforeChange: [generateCreatedBy],
    afterChange: [countParticipants],
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
