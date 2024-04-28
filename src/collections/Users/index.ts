import type { Access } from 'payload/config'
import type { CollectionBeforeChangeHook, CollectionBeforeDeleteHook, CollectionConfig, PayloadRequest } from 'payload/types'

import { sql } from 'drizzle-orm'
import payload from 'payload'

import type { Media } from '../../payload-types'

import { isAdmin, isAdminFieldLevel } from '../../access/isAdmin'
import { isAdminOrSelf, isAdminOrSelfFieldLevel } from '../../access/isAdminOrSelf'
import { getLogtoUsernameAvaliable } from './functions/logtoHelpers'
import { checkUsername } from './hooks/checkUsername'
import { syncLogtoUser } from './hooks/syncLogtoUser'
import { syncUserId } from './hooks/syncUserId'

const hasUserId: Access = ({ id, req }) => {
  if (req.baseUrl !== '/api/users') return true
  if (req.query && req.query.where) return true
  if (!id)
    return false
  return true
}

const updateAvatarUrl: CollectionBeforeChangeHook = async ({ data }) => {
  if (data.avatar && typeof data.avatar == 'string') {
    // If the avatar is not a media object, it's an id
    await payload.findByID({
      id: data.avatar,
      collection: 'media',
    }).then((media) => {
      data.avatar_url = (media as unknown as Media).sizes.avatar.url
    })
  } else if (data.avatar && typeof data.avatar == 'object'){
    await payload.findByID({
      id: data.avatar.id,
      collection: 'media',
    }).then((media) => {
      data.avatar_url = (media as unknown as Media).sizes.avatar.url
    })
  }
  return data

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await req.payload
    .find({
      collection: 'users',
      where: {
        username: {
          equals: usernameStr,
        },
      },
    })
    .catch(() => {
      return false
    })
  if (res.totalDocs > 0) {
    return false
  }

  // check if username exists in Logto
  const logtoRes = await getLogtoUsernameAvaliable(usernameStr)
  if (!logtoRes) {
    return false
  }
  return true
}

const deleteDBUserRoles: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.db.drizzle.execute(sql`
  DELETE FROM users_roles WHERE parent_id = ${id}
  `)
}


const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => {
      return user && user.roles.includes('admin')
    },
    create: isAdmin,
    delete: () => false,
    read: (req) => {
      return (hasUserId(req) || isAdminOrSelf(req))
    },
    update: isAdminOrSelf,
  },
  admin: {
    defaultColumns: ['username', 'name', 'id', 'roles'],
    useAsTitle: 'name',
  },
  auth: true,
  endpoints: [
    {
      // check if username is available
      handler: async (req, res) => {
        const aval = await getUsernameAval(req)
        if (aval)
          res.status(200).json({ message: 'Username is available' })
        else
          res.status(400).json({ message: 'Username is not available' })
      },
      method: 'post',
      path: '/checkUsername',
    }
  ],
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
    },
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
              access: {
                update: isAdminFieldLevel,
              },
              admin: {
                position: 'sidebar',
              },
              defaultValue: ['user'],
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
              required: true,
              saveToJWT: true,
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
          label: {
            en: 'Basic',
            zh: '基础',
          },
        },
        // Basic Tab End
        // RSI Tab Start
        {
          fields: [
            {
              name: 'rsi_handle',
              type: 'text',
              access: {
                read: isAdminOrSelfFieldLevel,
                update: isAdminFieldLevel,
              },
              label: {
                en: 'RSI Handle',
                zh: 'RSI 用户名',
              },
            },
            {
              name: 'rsi_verified',
              type: 'checkbox',
              access: {
                read: isAdminOrSelfFieldLevel,
                update: isAdminFieldLevel,
              },
              defaultValue: false,
              label: {
                en: 'RSI Verified',
                zh: 'RSI 验证',
              },
            },
            {
              name: 'rsi_verified_at',
              type: 'date',
              access: {
                read: isAdminOrSelfFieldLevel,
                update: isAdminFieldLevel,
              },
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
              label: {
                en: 'RSI Verified At',
                zh: 'RSI 验证时间',
              }
            },
            {
              name: 'rsi_verification_code',
              type: 'text',
              access: {
                read: isAdminOrSelfFieldLevel,
                update: isAdminFieldLevel,
              },
              label: {
                en: 'RSI Verification Code',
                zh: 'RSI 验证码',
              },
            }
          ],
          label: {
            en: 'RSI',
            zh: 'RSI关联',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [syncLogtoUser, updateAvatarUrl],
    beforeDelete: [deleteDBUserRoles],
    beforeValidate: [syncUserId, checkUsername],
  },
  labels: {
    plural: {
      en: 'Users',
      zh: '用户',
    },
    singular: {
      en: 'User',
      zh: '用户',
    },
  }
}

export default Users
