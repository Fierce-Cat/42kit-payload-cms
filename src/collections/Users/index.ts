import payload from 'payload'
import { CollectionConfig, CollectionBeforeChangeHook, PayloadRequest  } from 'payload/types'
import type { Media, User } from '../../payload-types'
import type { Access } from 'payload/config'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'


import { isAdminOrSelf, isAdminOrSelfFieldLevel } from '../../access/isAdminOrSelf'
import { isAdmin, isAdminFieldLevel } from '../../access/isAdmin'

async function getM2MToken() {
  // use basic authentication with client_id and client_secret to get access token
  const clientId = process.env.LOGTO_CLIENT_ID
  const clientSecret = process.env.LOGTO_CLIENT_SECRET
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res: any = await axios.post(`${process.env.OIDC_URI}/oidc/token`, {
    grant_type: 'client_credentials',
    resource: 'https://default.logto.app/api',
    scope: 'all openid',
  }, {
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).catch((err) => {
    return null
  })
  return res.data
}

async function updateLogtoUser(data: any) {
  // Get Logto access token
  const token = await getM2MToken()
  if (!token) {
    throw new Error('Failed to get access token')
  }
  // console.log('Logto access token:', token.access_token)
  // console.log('updateOIDCUser', data.sub)
  // We only update the user's name
  const res: any = await axios.patch(`${process.env.OIDC_URI}/api/users/${data.sub}`, {
    username: data.username,
    name: data.name,
  }, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
  }).catch((err) => {
    return null
  })

  return res.data
}

const hasUserId: Access = ({ req, id }) => {
  if (req.baseUrl !== '/api/users') return true
  if (req.query && req.query.where) return true
  if (!id)
    return false
  return true
}

const syncOidcUser: CollectionBeforeChangeHook = async ({ operation, data }) => {
  // console.log('syncOidcUser', operation, data)
  if (operation === 'create')
  {
    if (!data.external_identifier && data.sub) {
      data.sub = data.sub // 同步外部标识
      data.external_provider = data.iss // 同步外部提供者
    }
    if (!data.avatar) {
      data.avatar = process.env.DEFAULT_AVATAR || null
    }
    if (!data.roles) {
      data.roles = ['user']
    }
  }
  if(operation === 'update')
  {
    // console.log('debug: update')
    if (!data.external_provider && data.sub) {
      // console.log('debug: no external_identifier')
      data.sub = data.sub // 同步外部标识
      data.external_provider = data.iss // 同步外部提供者
      return data
    }
    if (data.sub)
    {
      await updateLogtoUser(data)
    }
  }
  return data
}

const updateAvatarUrl: CollectionBeforeChangeHook = async ({ data }) => {
  if (data.avatar && typeof data.avatar == 'string') {
    // If the avatar is not a media object, it's an id
    await payload.findByID({
      collection: 'media',
      id: data.avatar,
    }).then((media) => {
      data.avatar_url = (media as unknown as Media).sizes.avatar.url
    })
  } else if (data.avatar && typeof data.avatar == 'object'){
    await payload.findByID({
      collection: 'media',
      id: data.avatar.id,
    }).then((media) => {
      data.avatar_url = (media as unknown as Media).sizes.avatar.url
    })
  }
  return data

}

const getLogtoUsernameAval = async (username: string) => {
  // Get Logto access token
  const token = await getM2MToken()
  if (!token) {
    throw new Error('Failed to get access token')
  }

  const query = new URLSearchParams([
    ['search.username', username],
    ['mode.name', 'exact'],
  ]);

  const res: any = await axios.get(`${process.env.OIDC_URI}/api/users/?${query}`, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
  }).catch((err) => {
    return null
  })

  return res.data


}

const getUsernameAval = async (req: PayloadRequest) => {
  if (!req.user) {
    //  only allow logged in user to check username
    return false
  }
  const usernameStr = req.body.username
  if (!usernameStr) {
    // invalid username
    return false
  }

  // check if username exists in Payload
  const res: any = await payload.find({
    collection: 'users',
    where: {
      username: {
        equals: usernameStr,
      },
    },
  }).catch((err) => {
    return false
  })
  if (res.totalDocs > 0) {
    return false
  }

  // check if username exists in Logto
  const logtoRes = await getLogtoUsernameAval(usernameStr)
  if (logtoRes && logtoRes.length > 0) {
    return false
  }
  return true
}

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  labels: {
    singular: {
      zh: '用户',
      en: 'User',
    },
    plural: {
      zh: '用户',
      en: 'Users',
    },
  },
  access: {
    read: (req) => {
      return (hasUserId(req) || isAdminOrSelf(req))
    },
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: ({ req: { user } }) => {
      return user && user.roles.includes('admin')
    },
  },
  fields: [
    {
      name: 'sub',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'external_provider',
      type: 'text',
      admin: { hidden: true },
    },
    {
      type: 'tabs',
      tabs: [
        // Basic Tab Start
        {
          label: {
            zh: '基础',
            en: 'Basic',
          },
          fields: [
            {
              name: 'username',
              type: 'text',
              unique: true,
            },
            {
              name: 'name',
              type: 'text',
            },
            {
              name: 'roles', // required
              type: 'select', // required
              required: true,
              saveToJWT: true,
              hasMany: true,
              options: [
                {
                  label: {
                    en: 'Admin',
                    zh: '全局管理员',
                  },
                  value: 'admin',
                },
                {
                  label: {
                    en: 'Editor',
                    zh: '编辑',
                  },
                  value: 'editor',
                },
                {
                  label: {
                    en: 'User',
                    zh: '用户',
                  },
                  value: 'user',
                },
              ],
              defaultValue: ['user'],
              admin: {
                position: 'sidebar',
              },
              access: {
                update: isAdminFieldLevel,
              },
            },
            {
              name: 'avatar',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'avatar_url',
              type: 'text',
              admin: { hidden: true },
            },
          ],
        },
        // Basic Tab End
        // RSI Tab Start
        {
          label: {
            zh: 'RSI关联',
            en: 'RSI',
          },
          fields: [
            {
              name: 'rsi_handle',
              label: {
                zh: 'RSI 用户名',
                en: 'RSI Handle',
              },
              type: 'text',
              access: {
                read: isAdminOrSelfFieldLevel,
                update: isAdminFieldLevel,
              },
            },
            {
              name: 'rsi_verified',
              label: {
                zh: 'RSI 验证',
                en: 'RSI Verified',
              },
              type: 'checkbox',
              defaultValue: false,
              access: {
                read: isAdminOrSelfFieldLevel,
                update: isAdminFieldLevel,
              },
            },
            {
              name: 'rsi_verified_at',
              label: {
                zh: 'RSI 验证时间',
                en: 'RSI Verified At',
              },
              type: 'date',
              access: {
                read: isAdminOrSelfFieldLevel,
                update: isAdminFieldLevel,
              },
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              }
            },
            {
              name: 'rsi_verification_code',
              label: {
                zh: 'RSI 验证码',
                en: 'RSI Verification Code',
              },
              type: 'text',
              access: {
                read: isAdminOrSelfFieldLevel,
                update: isAdminFieldLevel,
              },
            }
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [syncOidcUser, updateAvatarUrl],
  },
  endpoints: [
    {
      // check if username is available
      path: '/checkUsername',
      method: 'post',
      handler: async (req, res) => {
        const aval = await getUsernameAval(req)
        if (aval)
          res.status(200).json({ message: 'Username is available' })
        else
          res.status(400).json({ message: 'Username is not available' })
      },
    }
  ]
}

export default Users
