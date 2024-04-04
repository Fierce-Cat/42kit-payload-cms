import { CollectionConfig, CollectionBeforeChangeHook } from 'payload/types'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

async function getM2MToken() {
  // use basic authentication with client_id and client_secret to get access token
  const clientId = 'flvf41w5fzsy20nkyo1wm'
  const clientSecret = 'cWKPlRm89XztuEUImfB2QSlIMHHba6pI'
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  
  const res: any = await axios.post('https://42kit-logto.olisar.space/oidc/token', {
    grant_type: 'client_credentials',
    resource: 'https://default.logto.app/api',
    scope: 'all openid',
  }, {
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).catch((err) => {
    console.error(err.response.message)
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
  const res: any = await axios.patch(`https://42kit-logto.olisar.space/api/users/${data.sub}`, {
    name: data.name,
  }, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
  }).catch((err) => {
    console.error(err.response.message)
    return null
  })

  return res.data
}

const syncOidcUser: CollectionBeforeChangeHook = async ({ operation, data }) => {
  console.log('syncOidcUser', operation, data)
  if (operation === 'create') 
  {
    if(!data._id && !data.id) {
      data._id = uuidv4()
    }
    if (!data.external_identifier && data.sub) {
      data.sub = data.sub // 同步外部标识
      data.external_provider = data.iss // 同步外部提供者
    }
  }
  if(operation === 'update')
  {
    console.log('debug: update')
    if (!data.external_provider && data.sub) {
      console.log('debug: no external_identifier')
      data.sub = data.sub // 同步外部标识
      data.external_provider = data.iss // 同步外部提供者
      return data
    }
    if (data.sub)
    {
      console.log('updateLogtoUser', data)
      await updateLogtoUser(data)
    }
  }
  return data
}

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    // User Schema
    {
      name: 'id',
      type: 'text',
      admin: { hidden: true },
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
      name: 'username',
      type: 'text',
    },
    {
      name: 'name',
      type: 'text',
    }
  ],
  hooks: {
    beforeChange: [syncOidcUser],
  },
}

export default Users
