import { CollectionConfig } from 'payload/types'
import {
  lexicalEditor
} from '@payloadcms/richtext-lexical'

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
      editor: lexicalEditor({})
    },
  ],
}

export default Posts
