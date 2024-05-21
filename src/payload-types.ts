/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "event_register_questions".
 */
export type EventRegisterQuestions =
  | {
      id?: string | null;
      question: string;
      answer?: string | null;
      type: 'text' | 'radio' | 'checkbox';
      required?: boolean | null;
    }[]
  | null;

export interface Config {
  collections: {
    users: User;
    events: Event;
    'event-categories': EventCategory;
    'event-participants': EventParticipant;
    'event-organizers': EventOrganizer;
    'event-contest-records': EventContestRecord;
    'event-contest-scores': EventContestScore;
    media: Media;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  globals: {};
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users".
 */
export interface User {
  id: string;
  sub?: string | null;
  external_provider?: string | null;
  username?: string | null;
  name?: string | null;
  roles: ('admin' | 'editor' | 'user')[];
  avatar?: string | Media | null;
  avatar_url?: string | null;
  rsi_handle?: string | null;
  rsi_verified?: boolean | null;
  rsi_verified_at?: string | null;
  rsi_verification_code?: string | null;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media".
 */
export interface Media {
  id: string;
  createdBy?: (string | null) | User;
  title?: string | null;
  original?: boolean | null;
  credit?: string | null;
  source?: string | null;
  license?:
    | (
        | 'RSI'
        | 'CC-BY'
        | 'CC-BY-SA'
        | 'CC-BY-NC'
        | 'CC-BY-NC-SA'
        | 'CC-BY-NC-ND'
        | 'CC0'
        | 'Public Domain'
        | 'All Rights Reserved'
      )
    | null;
  caption?: string | null;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  sizes?: {
    thumbnail?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
    card?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
    tablet?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
    avatar?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "events".
 */
export interface Event {
  id: string;
  createdBy: string | User;
  slug: string;
  title: string;
  status: 'draft' | 'published' | 'archived' | 'deleted';
  summary: string;
  category: string | EventCategory;
  featured_image: string | Media;
  theme_color?: string | null;
  date_started: string;
  date_ended: string;
  timezone: string;
  content?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  geo_address?: string | null;
  online_url?: string | null;
  num_participants: number;
  num_max_participants: number;
  show_participants?: boolean | null;
  organizers?: (string | EventOrganizer)[] | null;
  organizing_users?: (string | User)[] | null;
  show_organizers?: boolean | null;
  register_questions?: EventRegisterQuestions;
  is_featured?: boolean | null;
  is_online?: boolean | null;
  is_registration_open?: boolean | null;
  is_contest?: boolean | null;
  contest_type?: ('photographyContest' | 'racing' | 'other') | null;
  is_all_records_public: boolean;
  score_schema?:
    | {
        name: string;
        min?: number | null;
        max?: number | null;
        id?: string | null;
      }[]
    | null;
  num_max_attempts: number;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "event-categories".
 */
export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "event-organizers".
 */
export interface EventOrganizer {
  id: string;
  event_id: string | Event;
  user_id: string | User;
  role: 'host' | 'special_guest';
  description?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "event-participants".
 */
export interface EventParticipant {
  id: string;
  createdBy: string | User;
  event_id: string | Event;
  user_id: string | User;
  register_questions?: EventRegisterQuestions;
  status: 'registered' | 'checked-in' | 'cancelled';
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "event-contest-records".
 */
export interface EventContestRecord {
  id: string;
  createdBy: string | User;
  event_id: string | Event;
  user_id: string | User;
  status: 'submitted' | 'published' | 'rejected';
  is_validated: boolean;
  is_auto_validated?: boolean | null;
  validatedBy?: (string | null) | User;
  validatedAt?: string | null;
  is_featured: boolean;
  race: {
    position: number;
    time?: string | null;
    score: number;
    is_scoreable: boolean;
    is_winner: boolean;
    file?: string | Media | null;
    video_bilibili_url?: string | null;
    note?: string | null;
    scoredBy?: (string | User)[] | null;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "event-contest-scores".
 */
export interface EventContestScore {
  id: string;
  createdBy: string | User;
  event_id: string | Event;
  event_contest_record_id: string | EventContestRecord;
  score_info: {
    total: number;
    score_schema?:
      | {
          name: string;
          min?: number | null;
          max?: number | null;
          score: number;
          id?: string | null;
        }[]
      | null;
    comment?: string | null;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences".
 */
export interface PayloadPreference {
  id: string;
  user: {
    relationTo: 'users';
    value: string | User;
  };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations".
 */
export interface PayloadMigration {
  id: string;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}
