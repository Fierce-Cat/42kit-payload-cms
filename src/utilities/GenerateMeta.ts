import type { CollectionBeforeChangeHook } from 'payload/types';

export const generateCreatedBy: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation === 'create') {
    if (!data.createdBy) {
      data.createdBy = req.user.id;
    }
  }
  return data;
};

export const generateRandomSlug: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation === 'create') {
    if (!data.slug) {
      // Generate a random slug by using the random() function, 8 characters long
      data.slug = Math.random().toString(36).substring(2, 10).padEnd(8, '0');
    }
  }
  return data;
};
