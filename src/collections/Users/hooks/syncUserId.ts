import type { CollectionBeforeValidateHook } from 'payload/types';

import { v4 as uuidv4 } from 'uuid';

export const syncUserId: CollectionBeforeValidateHook = ({ data }) => {
  if (!data.id) {
    if (data.sub) {
      data.id = data.sub;
      data._id = data.sub;
    } else {
      data.id = uuidv4();
      data._id = data.id;
    }
  }
  return data;
};
