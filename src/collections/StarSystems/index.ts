import { CollectionConfig } from 'payload/types'

const StarSystems: CollectionConfig = {
  slug: 'star-systems',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      required: true,
      type: 'text', 
      localized: true,
    },
  ],
}

export default StarSystems
