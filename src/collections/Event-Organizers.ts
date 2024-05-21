import payload from 'payload'
import type {
  CollectionConfig,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeValidateHook
} from 'payload/types'
import { APIError } from 'payload/errors'
import { generateId } from '../utilities/GenerateMeta'
import type { Access } from 'payload/config'
import type { User, Event } from '../payload-types'

import { isAdmin } from '../access/isAdmin'

const addEventOrganizer: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') {
    return doc
  }

  const event_id = doc.event_id.id ? doc.event_id.id : doc.event_id
  const user_id = doc.user_id.id ? doc.user_id.id : doc.user_id

  const event = await req.payload.findByID({
    req,
    collection: 'events',
    id: event_id,
  }) as unknown as Event;

  // organizer objects
  if (!event.organizers) {
    event.organizers = []
  }
  const organizerIds = event.organizers.map((organizer: any) => organizer.id)
  organizerIds.push(doc.id)

  // user objects
  if (!event.organizing_users) {
    event.organizing_users = []
  }

  const organizingUserIds = event.organizing_users.map((user: any) => user.id)
  organizingUserIds.push(user_id)

  await req.payload.update({
    req,
    collection: 'events',
    id: event.id,
    data: {
      organizers: organizerIds,
      organizing_users: organizingUserIds,
    },
  })

  return doc
}

const removeEventOrganizer: CollectionAfterDeleteHook = async ({ doc, id, req }) => {

  const event_id = doc.event_id.id ? doc.event_id.id : doc.event_id
  const user_id = doc.user_id.id ? doc.user_id.id : doc.user_id


  const event = await req.payload.findByID({
    req,
    collection: 'events',
    id: event_id,
  }) as unknown as Event;

  let organizerIds = []

  event.organizing_users.forEach((organizing_users: any) => {
    if (organizing_users.id !== user_id) {
      organizerIds.push(organizing_users.id)
    }
  })

  await req.payload.update({
    req,
    collection: 'events',
    id: event.id,
    data: {
      organizing_users: organizerIds,
    },
  })

  return doc
}

const checkOrganizerRecord: CollectionBeforeValidateHook = async ({
  data, // incoming data to update or create with'
  operation, // 'create' or 'update'
  req,
}) => {
  if (operation === 'create') {
  const organizer = await req.payload.find({
    req,
    collection: 'event-organizers',
    where: {
      event_id: {
        equals: data.event_id,
      },
      user_id: {
        equals: data.user_id,
      }
    }
  })

  if (organizer.totalDocs > 0) {
    throw new APIError('You have already assigned this user for this event', 400)
  }
}

  return data
}

const isEventCreatorOrAdmin: Access = ({ req: { user } }) => {
  if (!user)
  {
    return false
  }
  // if (isAdmin) {
  //   return true
  // }
  return {
    'event_id.createdBy': {
      equals: user.id,
    },
  }
}

const EventOrganizers: CollectionConfig = {
  slug: 'event-organizers',
  labels: {
    singular: {
      zh: '活动组织者',
      en: 'Event Organizer',
    },
    plural: {
      zh: '活动组织者',
      en: 'Event Organizers',
    },
  },
  access: {
    read: () => true,
    create: isEventCreatorOrAdmin,
    update: isEventCreatorOrAdmin,
    delete: isEventCreatorOrAdmin,
  },
  hooks: {
    beforeValidate: [checkOrganizerRecord],
    afterChange: [addEventOrganizer],
    beforeChange: [],
    afterDelete: [removeEventOrganizer],
  },
  fields: [
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
        zh: '组织者ID',
        en: 'Organizer ID',
      },
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'role',
      label: {
        zh: '角色',
        en: 'Role',
      },
      type: 'select',
      required: true,
      options: [
        {
          label: {
            zh: '主办方',
            en: 'Host',
          },
          value: 'host',
        },
        {
          label: {
            zh: '特别嘉宾',
            en: 'Special Guest',
          },
          value: 'special_guest',
        },
      ],
    },
    {
      name: 'description',
      label: {
        zh: '描述',
        en: 'Description',
      },
      type: 'textarea',
    }
  ],
}

export default EventOrganizers
