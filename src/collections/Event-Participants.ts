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
const countParticipants: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create') {
    // Count the number of participants in the event
    await req.payload
      .find({
        collection: 'event-participants',
        req,
        where: {
          event_id: {
            equals: doc.event_id.id ?? doc.event_id,
          },
        },
      })
      .then(async participants => {
        await req.payload
          .update({
            id: doc.event_id.id ?? doc.event_id,
            collection: 'events',
            data: {
              num_participants: participants.totalDocs,
            },
            req,
          })
          .catch(error => {
            throw new APIError('Error updating event participants count:' + error, 400);
          });
      });
  } else if (operation === 'update') {
    // Count the number of participants in the event
    await req.payload
      .find({
        collection: 'event-participants',
        req,
        where: {
          event_id: {
            equals: doc.event_id.id ?? doc.event_id,
          },
        },
      })
      .then(async participants => {
        await req.payload
          .update({
            id: doc.event_id.id ?? doc.event_id,
            collection: 'events',
            data: {
              num_participants: participants.totalDocs,
            },
            req,
          })
          .catch(error => {
            throw new APIError('Error updating event participants count:' + error, 400);
          });
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

    if (event.is_registration_open !== true) {
      throw new Forbidden();
    }

    if (event.max_participants !== 0 && event.num_participants >= event.max_participants) {
      throw new Forbidden();
    }

    if (new Date(event.date_ended as string) < new Date()) {
      throw new APIError('Event has ended.', 400);
    }
  }

  return data;
};

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
        },
      },
    });

    if (participant.totalDocs > 0) {
      throw new APIError('You have already registered for this event.', 400);
    }
  }

  return data;
};

// Check if the posting user_id is the same as the logged in user
const checkIsCurrentUser: CollectionBeforeValidateHook = ({
  data, // incoming data to update or create with'
  req: { user },
}) => {
  if (data.user_id !== user.id) {
    // throw new Forbidden
    throw new APIError('You can only register event for yourself.', 403);
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

const participantsReadAccess: Access = req => {
  if (isEventCreatorOrAdmin(req)) return true;

  return {
    'event_id.show_participants': {
      equals: true,
    },
  };
};

const EventParticipants: CollectionConfig = {
  slug: 'event-participants',
  access: {
    create: isUser,
    delete: isEventCreatorOrAdmin,
    read: participantsReadAccess,
    update: req => {
      return isCreatedBy(req) || isEventCreatorOrAdmin(req);
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
      name: 'register_questions',
      type: 'array',
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
          type: 'text',
          label: {
            en: 'Question',
            zh: '问题',
          },
          required: true,
        },
        {
          name: 'answer',
          type: 'text',
          label: {
            en: 'Answer',
            zh: '回答',
          },
        },
        {
          name: 'type',
          type: 'select',
          label: {
            en: 'Type',
            zh: '类型',
          },
          options: [
            {
              label: {
                en: 'Text',
                zh: '文本',
              },
              value: 'text',
            },
            {
              label: {
                en: 'Radio',
                zh: '单选',
              },
              value: 'radio',
            },
            {
              label: {
                en: 'Checkbox',
                zh: '多选',
              },
              value: 'checkbox',
            },
          ],
          required: true,
        },
        {
          name: 'required',
          type: 'checkbox',
          label: {
            en: 'Required',
            zh: '必填',
          },
        },
      ],
      interfaceName: 'event_register_questions',
      label: {
        en: 'Register Questions',
        zh: '注册问题',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'registered',
      label: {
        en: 'Status',
        zh: '状态',
      },
      options: [
        {
          label: {
            en: 'Registered',
            zh: '已报名',
          },
          value: 'registered',
        },
        {
          label: {
            en: 'Checked In',
            zh: '已签到',
          },
          value: 'checked-in',
        },
        {
          label: {
            en: 'Cancelled',
            zh: '已取消',
          },
          value: 'cancelled',
        },
      ],
      required: true,
    },
  ],
  hooks: {
    afterChange: [countParticipants],
    beforeChange: [generateCreatedBy],
    beforeValidate: [checkEventStatus, checkUserParticipation, checkIsCurrentUser],
  },
  labels: {
    plural: {
      en: 'Event Participants',
      zh: '活动参与者',
    },
    singular: {
      en: 'Event Participant',
      zh: '活动参与者',
    },
  },
};

export default EventParticipants;
