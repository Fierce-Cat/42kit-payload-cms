import type { Access } from 'payload/config';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload/types';

import { APIError } from 'payload/errors';

import type { Event } from '../payload-types';

import { isAdmin } from '../access/isAdmin';

const addEventOrganizer: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') {
    return doc;
  }
  const event = (await req.payload.findByID({
    id: doc.event_id.id,
    collection: 'events',
    req,
  })) as unknown as Event;

  if (!event.organizers) {
    event.organizers = [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const organizerIds = event.organizers.map((organizer: any) => organizer.id);
  organizerIds.push(doc.id);

  await req.payload.update({
    id: event.id,
    collection: 'events',
    data: {
      organizers: organizerIds,
    },
    req,
  });

  return doc;
};

const removeEventOrganizer: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const event = (await req.payload.findByID({
    id: doc.event_id.id,
    collection: 'events',
    req,
  })) as unknown as Event;

  const organizerIds = [];

  // event.organizers is an array of objects, but after we delete an organizer, the original object will become a string, so we need to check the type of the object, if it's an object, we push the id to the organizerIds array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event.organizers.forEach((organizer: any) => {
    if (typeof organizer === 'object') {
      organizerIds.push(organizer.id);
    }
  });

  await req.payload.update({
    id: event.id,
    collection: 'events',
    data: {
      organizers: organizerIds,
    },
    req,
  });

  return doc;
};

const checkOrganizerRecord: CollectionBeforeValidateHook = async ({
  data, // incoming data to update or create with'
  operation, // 'create' or 'update'
  req,
}) => {
  if (operation === 'create') {
    const organizer = await req.payload.find({
      collection: 'event-organizers',
      req,
      where: {
        event_id: {
          equals: data.event_id,
        },
        user_id: {
          equals: data.user_id,
        },
      },
    });

    if (organizer.totalDocs > 0) {
      throw new APIError('You have already assigned this user for this event', 400);
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

const EventOrganizers: CollectionConfig = {
  slug: 'event-organizers',
  access: {
    create: isEventCreatorOrAdmin,
    delete: isEventCreatorOrAdmin,
    read: () => true,
    update: isEventCreatorOrAdmin,
  },
  fields: [
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
        en: 'Organizer ID',
        zh: '组织者ID',
      },
      relationTo: 'users',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      label: {
        en: 'Role',
        zh: '角色',
      },
      options: [
        {
          label: {
            en: 'Host',
            zh: '主办方',
          },
          value: 'host',
        },
        {
          label: {
            en: 'Special Guest',
            zh: '特别嘉宾',
          },
          value: 'special_guest',
        },
      ],
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        zh: '描述',
      },
    },
  ],
  hooks: {
    afterChange: [addEventOrganizer],
    afterDelete: [removeEventOrganizer],
    beforeChange: [],
    beforeValidate: [checkOrganizerRecord],
  },
  labels: {
    plural: {
      en: 'Event Organizers',
      zh: '活动组织者',
    },
    singular: {
      en: 'Event Organizer',
      zh: '活动组织者',
    },
  },
};

export default EventOrganizers;
