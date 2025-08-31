import { CollectionBeforeChangeHook } from 'payload/types';
import { randomBytes } from 'crypto';

export const generateId: CollectionBeforeChangeHook = async ({ operation, data }) => {
  if (operation === 'create') {
    // if(!data.id && !data.id) {
    //   data.id = uuidv4()
    // }
    // @Fierce-Cat: UUID is not a good choice for the id field, because it's too long.
    // We replace this with a snowflake id generator.
  }
  return data;
};

export const generateCreatedBy: CollectionBeforeChangeHook = async ({ req, operation, data }) => {
  if (operation === 'create') {
    if (!data.createdBy && req.user && req.user.id) {
      data.createdBy = req.user.id;
    }
  }
  return data;
};

export const generateRandomSlug: CollectionBeforeChangeHook = async ({ operation, data }) => {
  if (operation === 'create') {
    // Generate a random slug by using the random() function, 8 characters long
    data.slug = randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
  }
  return data;
};
