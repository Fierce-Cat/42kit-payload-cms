import { CollectionConfig } from 'payload/types';

const ContentStats: CollectionConfig = {
  slug: 'content-stats',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'content',
      type: 'relationship',
      relationTo: ['events'],
      required: true,
      access: {
        update: () => { return false; }
      }
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Upvote', value: 'upvote' },
        { label: 'Star', value: 'star' },
      ],
      defaultValue: 'upvote',
    },
    {
      name: 'total_count',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'votes_sum',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'stars_average',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'stars_data',
      type: 'json',
      required: true,
      defaultValue: {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
      },
    },
    {
      name: 'stars_weight',
      type: 'json',
      required: true,
      defaultValue: {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
      },
    }
  ],
};

export default ContentStats;
