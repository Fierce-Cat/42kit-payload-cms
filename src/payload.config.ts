import path from 'path'
import { oidcPlugin } from 'payload-plugin-oidc';
import axios from 'axios'

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
  plugins: [
    oidcPlugin({
      clientID: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      authorizationURL: `${process.env.OIDC_URI}/oidc/auth`,
      tokenURL: `${process.env.OIDC_URI}/oidc/token`,
      initPath: `/oidc/signin`,
      callbackPath: `/oidc/callback`,
      callbackURL: `${process.env.SELF_URL}/oidc/callback`,
      scope: 'openid offline_access profile email',
      mongoUrl: process.env.DATABASE_URI,
      userCollection: {
        slug: Users.slug,
        searchKey: 'sub',
      },
      createUserIfNotFound: true,
      async userinfo(accessToken) {
        const { data: user } = await axios.get(`${process.env.OIDC_URI}/oidc/me
        `, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log('OIDC User Info:', user);

        return {
          sub: user.sub,
          name: user.name,
          email: user.email,
          iss: process.env.DATABASE_URI,
          username: user.username,
          // You can use OIDC user custom data to get the role for this app
          // role: user.custom_data?.my_app_role,

          // or you can do something like this
          // role: user.custom_data?.role ? 'admin' : 'editor',
        };
      },
    }),
  ],
  // database-adapter-config-start
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
  // database-adapter-config-end
})
