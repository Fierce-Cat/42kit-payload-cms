import payload from 'payload'
import type { CollectionConfig, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload/types'
import { generateId } from '../utilities/GenerateMeta'
import type { Access } from 'payload/config'
import type { User, Event } from '../payload-types'

import { isAdmin } from '../access/isAdmin'

const addEventOrganizer: CollectionAfterChangeHook = async ({ doc, operation }) => {
  if (operation !== 'create') {
    return doc
  }
  console.log('addEventOrganizer', doc)
  const event = await payload.findByID({
    collection: 'events',
    id: doc.event_id,
  }) as unknown as Event;

  if (!event.organizers) {
    event.organizers = []
  }

  const organizerIds = event.organizers.map((organizer: any) => organizer.id)
  organizerIds.push(doc.id)

  await payload.update({
    collection: 'events',
    id: event.id,
    data: {
      organizers: organizerIds
    },
  })

  return doc
}

const removeEventOrganizer: CollectionAfterDeleteHook = async ({ doc, id }) => {
  console.log('removeEventOrganizer', doc)

  const event = await payload.findByID({
    collection: 'events',
    id: doc.event_id.id,
  }) as unknown as Event;

  console.log('event', event.organizers)
  let organizerIds = []

  // event.organizers is an array of objects, but after we delete an organizer, the original object will become a string, so we need to check the type of the object, if it's an object, we push the id to the organizerIds array
  event.organizers.forEach((organizer: any) => {
    if (typeof organizer === 'object') {
      organizerIds.push(organizer.id)
    }
  })

  console.log('organizerIds', organizerIds)

  payload.update({
    collection: 'events',
    id: event.id,
    data: {
      organizers: organizerIds
    },
  })

  return doc
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
    delete: isAdmin,
  },
  hooks: {
    afterChange: [addEventOrganizer],
    beforeChange: [generateId],
    afterDelete: [removeEventOrganizer],
  },
  fields: [
    {
      name: 'id',
      type: 'text',
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
