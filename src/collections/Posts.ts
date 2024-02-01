import { CollectionConfig } from 'payload/types'

const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text', 
    },
    {
      name: 'content',
      type: 'richtext', 
    },
  ],
}

export default Posts
