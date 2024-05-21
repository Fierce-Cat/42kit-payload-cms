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

  const event = await req.payload.findByID({
    req,
    collection: 'events',
    id: event_id,
  }) as unknown as Event;

  if (!event.organizers) {
    event.organizers = []
  }

  const organizerIds = event.organizers.map((organizer: any) => organizer.id)
  organizerIds.push(doc.id)

  await req.payload.update({
    req,
    collection: 'events',
    id: event.id,
    data: {
      organizers: organizerIds
    },
  })

  return doc
}

const removeEventOrganizer: CollectionAfterDeleteHook = async ({ doc, id, req }) => {

  const event = await req.payload.findByID({
    req,
    collection: 'events',
    id: doc.event_id.id,
  }) as unknown as Event;

  let organizerIds = []

  // event.organizers is an array of objects, but after we delete an organizer, the original object will become a string, so we need to check the type of the object, if it's an object, we push the id to the organizerIds array
  event.organizers.forEach((organizer: any) => {
    if (typeof organizer === 'object') {
      organizerIds.push(organizer.id)
    }
  })

  await req.payload.update({
    req,
    collection: 'events',
    id: event.id,
    data: {
      organizers: organizerIds
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
