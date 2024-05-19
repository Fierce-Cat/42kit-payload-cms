import axios from 'axios';

interface token {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function getLogtoApiToken() {
  // use basic authentication with client_id and client_secret to get access token
  const clientId = process.env.LOGTO_API_CLIENT_ID;
  const clientSecret = process.env.LOGTO_API_CLIENT_SECRET;
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await axios
    .post(
      `${process.env.OIDC_URI}/oidc/token`,
      {
        grant_type: 'client_credentials',
        resource: 'https://default.logto.app/api',
        scope: 'all openid',
      },
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
    .catch(() => {
      return null;
    })
    .then(res => {
      console.log('res', res);
      return res.data;
    });
  return res.data;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
export async function updateLogtoUser(data: any) {
  // Get Logto access token
  const token = await getLogtoApiToken();
  console.log('token', token);
  if (!token || !token.access_token) {
    throw new Error('Failed to get access token');
  }
  // We only update the user's name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await axios
    .patch(
      `${process.env.OIDC_URI}/api/users/${data.sub}`,
      {
        name: data.name,
        username: data.username,
      },
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
      },
    )
    .catch(() => {
      return null;
    });

  return res;
}

export async function getLogtoUsernameAvaliable(username: string): Promise<boolean> {
  // Get Logto access token
  const token = await getLogtoApiToken();
  if (!token) {
    throw new Error('Failed to get access token');
  }

  const searchQuery = new URLSearchParams([['search.username', username]]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await axios
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    .get(`${process.env.OIDC_URI}/api/users/?${searchQuery}`, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
      },
    })
    .catch(err => {
      throw new Error('Failed to get user:' + err);
    });

  return data.length === 0;
}
