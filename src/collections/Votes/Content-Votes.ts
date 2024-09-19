import { CollectionConfig } from 'payload/types';
import { generateCreatedBy } from '../../utilities/GenerateMeta';
import { updateStats, validateVote } from './utilities/statsHooks';

const ContentVotes: CollectionConfig = {
  slug: 'content-votes',
  hooks: {
    beforeChange: [generateCreatedBy, validateVote],
    afterChange: [updateStats],
  },
  admin: {
    useAsTitle: 'id',
  },
  access: {
    create: () => true,
    read: () => true,
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
      access: {
        update: () => {
          return false;
        },
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'content',
      type: 'relationship',
      relationTo: ['events'],
      required: true,
      access: {
        update: () => {
          return false;
        },
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Upvote', value: 'upvote' },
        { label: 'Star', value: 'star' },
      ],
      access: {
        update: () => {
          return false;
        },
      },
    },
    {
      name: 'value',
      type: 'number',
      required: true,
      validate: value => {
        if (value < 0 || value > 5) {
          return 'Value must be between 0 and 5';
        }
        return true;
      },
    },
  ],
  endpoints: [
    {
      path: '/deleteAll',
      method: 'delete',
      handler: async (req, res) => {
        await req.payload.delete({
          collection: 'content-votes',
          where: {
            value: {
              equals: 1,
            },
          },
        });
        res.status(200).send('All votes deleted');
      },
    },
  ],
};

export default ContentVotes;
