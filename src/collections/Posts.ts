import { CollectionConfig } from 'payload/types'
import { slugField } from '../fields/slug'

const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text', 
    },
    {
      name: 'content',
      type: 'richText',
    },
    slugField(),
  ],
}

export default Posts
