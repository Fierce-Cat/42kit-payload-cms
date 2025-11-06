import type { Access, FieldAccess } from 'payload/types';

import type { User } from '@/payload-types';

import { checkRole } from '@/collections/Users/checkRole';

export const isEditor: Access<
  any, // eslint-disable-line @typescript-eslint/no-explicit-any
  User
> = ({ req: { user } }) => {
  // Return true or false based on if the user has an editor role
  return checkRole(['editor'], user);
};

export const isEditorFieldLevel: FieldAccess<{ id: string }, unknown, User> = ({
  req: { user },
}) => {
  // Return true or false based on if the user has an editor role
  return checkRole(['editor'], user);
};
