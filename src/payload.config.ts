import path from 'path'

import { payloadCloud } from '@payloadcms/plugin-cloud'
import { mongooseAdapter } from '@payloadcms/db-mongodb' // database-adapter-import
import { webpackBundler } from '@payloadcms/bundler-webpack' // bundler-import
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload/config'

import Users from './collections/Users'
import Posts from './collections/Posts'
import StarSystems from './collections/StarSystems'

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(), // bundler-config
  },
  collections: [Users, Posts, StarSystems],
  localization: {
    locales: [
      {
        label: {
          en: 'English',
          'zh-CN': '英语', 
        },
        code: 'en',
      },
      {
        label: {
          en: 'Simplified Chinese', 
          'zh-CN': '简体中文',
        },
        code: 'zh-CN',
      },
    ],
    defaultLocale: 'zh-cn',
    fallback: true,
  },
  editor: lexicalEditor({}), // editor-config
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [payloadCloud()],
  // database-adapter-config-start
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
  // database-adapter-config-end
})
