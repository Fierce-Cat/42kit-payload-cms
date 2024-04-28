import { webpackBundler } from '@payloadcms/bundler-webpack';
import { postgresAdapter } from '@payloadcms/db-postgres';
import axios from 'axios';
import path from 'path'; // bundler-import
import { oidcPlugin } from '@fiercecat/payload-plugin-oidc';
import { cloudStorage } from '@payloadcms/plugin-cloud-storage';
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload/config';

import EventCategories from './collections/Event-Categories';
import EventContestRecords from './collections/Event-ContestRecords';
import EventContestScores from './collections/Event-ContestScores';
import EventOrganizers from './collections/Event-Organizers';
import EventParticipants from './collections/Event-Participants';
import Events from './collections/Events';
import Media from './collections/Media';
import Users from './collections/Users';

const cloudflareR2 = s3Adapter({
  bucket: process.env.R2_BUCKET,
  config: {
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    endpoint: process.env.R2_ENDPOINT,
    region: process.env.R2_REGION,
  },
});

export default buildConfig({
  admin: {
    bundler: webpackBundler(), // bundler-config
    user: Users.slug,
    webpack: config => {
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
            assert: false,
            constants: false,
            fs: false,
            stream: false,
            util: false,
          },
        },
      };
    },
  },
  collections: [
    Users,
    Events,
    EventCategories,
    EventParticipants,
    EventOrganizers,
    EventContestRecords,
    EventContestScores,
    Media,
  ],
  cors: ['*', 'https://local-dev.citizenwiki.cn:3000', 'https://42kit.citizenwiki.cn'],
  editor: lexicalEditor({}), // editor-config
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  localization: {
    defaultLocale: 'zh',
    fallback: true,
    locales: [
      {
        code: 'en',
        label: {
          en: 'English',
          zh: '英语',
        },
      },
      {
        code: 'zh',
        label: {
          en: 'Simplified Chinese',
          zh: '简体中文',
        },
      },
    ],
  },
  plugins: [
    oidcPlugin({
      authorizationURL: `${process.env.OIDC_URI}/oidc/auth`,
      callbackPath: `/oidc/callback`,
      callbackURL: `${process.env.SELF_URL}/oidc/callback`,
      clientID: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      connectPath: `/oidc/connect`,
      createUserIfNotFound: true,
      initPath: `/oidc/signin`,
      mongoUrl: process.env.DATABASE_URI,
      redirectUriCookieName: `42kit_connect_redirect_url`,
      scope: 'openid offline_access profile email',
      tokenURL: `${process.env.OIDC_URI}/oidc/token`,
      userCollection: {
        slug: Users.slug,
        searchKey: 'sub',
      },
      async userinfo(accessToken) {
        const { data: user } = await axios.get(
          `${process.env.OIDC_URI}/oidc/me
        `,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        // console.log('userinfo', user);

        return {
          name: user.name,
          email: user.email,
          iss: process.env.OIDC_URI,
          sub: user.sub,
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
      },
    }),
  ],
  rateLimit: {
    max: 300,
    trustProxy: true,
    window: 120000,
  },
  typescript: {
    declare: false,
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  // database-adapter-config-start
  // db: mongooseAdapter({
  //   url: process.env.DATABASE_URI,
  // }),
  db: postgresAdapter({
    idType: 'uuid',
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
  debug: process.env.DEBUG_MODE === 'true',
  upload: {
    defParamCharset: 'utf8',
  },
});
