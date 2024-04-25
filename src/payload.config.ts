import path from 'path'
import axios from 'axios'

import { mongooseAdapter } from '@payloadcms/db-mongodb' // database-adapter-import
import { webpackBundler } from '@payloadcms/bundler-webpack' // bundler-import
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload/config'
import { oidcPlugin } from '@fiercecat/payload-plugin-oidc';
import { cloudStorage } from '@payloadcms/plugin-cloud-storage'
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'

import Users from './collections/Users'
// import Posts from './collections/Posts'
// import StarSystems from './collections/StarSystems'
import Media from './collections/Media'
import Events from './collections/Events'
import EventCategories from './collections/Event-Categories'
import EventParticipants from './collections/Event-Participants'
import EventOrganizers from './collections/Event-Organizers'
import EventContestRecords from './collections/Event-ContestRecords'
import EventContestScores from './collections/Event-ContestScores'

const cloudflareR2 = s3Adapter({
  config: {
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    region: process.env.R2_REGION,
  },
  bucket: process.env.R2_BUCKET,
})

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(), // bundler-config
    webpack: (config) => {
      return {
          ...config,
          resolve: {
              ...config.resolve,
              alias: {
                  ...config.resolve.alias,
                  // publitio_js_sdk: path.resolve(__dirname, "../mock.js"),
                  // "fs-extra": path.resolve(__dirname, "../mock.js"),
              },
              fallback: {
                  ...config.resolve.fallback,
                  fs: false,
                  stream: false,
                  constants: false,
                  assert: false,
                  util: false,
              },
          },
      };
  },
  },
  collections: [
    Users,
    // Posts,
    Events,
    EventCategories,
    EventParticipants,
    EventOrganizers,
    EventContestRecords,
    EventContestScores,
    // StarSystems,
    Media
  ],
  cors: [
    '*',
    'https://local-dev.citizenwiki.cn:3000',
    'https://42kit.citizenwiki.cn',
  ],
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
    declare: false,
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
      redirectUriCookieName: `42kit_connect_redirect_url`,
      connectPath: `/oidc/connect`,
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

        // console.log('userinfo', user);

        return {
          sub: user.sub,
          name: user.name,
          email: user.email,
          iss: process.env.OIDC_URI,
          username: user.username,
          // You can use OIDC user custom data to get the role for this app
          // role: user.custom_data?.my_app_role,

          // or you can do something like this
          // role: user.custom_data?.role ? 'admin' : 'editor',
        };
      },
    }),
    cloudStorage({
      collections: {
        media: {
          adapter: cloudflareR2,
        },
      }
    }),

  ],
  rateLimit: {
    window: 450000,
    max: 500,
    trustProxy: true,
  },
  // database-adapter-config-start
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
  upload: {
    defParamCharset: 'utf8',
  },
})
