import path from 'path'

import { payloadCloud } from '@payloadcms/plugin-cloud'
// import { mongooseAdapter } from '@payloadcms/db-mongodb' // database-adapter-import
import { postgresAdapter } from '@payloadcms/db-postgres' // Switch to Postgres
import { webpackBundler } from '@payloadcms/bundler-webpack' // bundler-import
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload/config'

import Users from './collections/Users'
import Admins from './collections/Admins'
import Posts from './collections/Posts'
import StarSystems from './collections/StarSystems'

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(), // bundler-config
  },
  collections: [Users, Admins, Posts, StarSystems],
  localization: {
    locales: [
      {
        label: {
          en: 'English',
          zh: '英语', 
        },
        code: 'en',
      },
      {
        label: {
          en: 'Simplified Chinese', 
          zh: '简体中文',
        },
        code: 'zh',
      },
    ],
    defaultLocale: 'zh',
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
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    }
  }),
  // database-adapter-config-end
})
