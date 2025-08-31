import { CollectionBeforeChangeHook } from 'payload/types';
import { CollectionAfterChangeHook } from 'payload/types';
import { publishToQueue } from '@/rabbitmq/publisher';

import type { ContentStat } from '@/payload-types';

// This hook is used to validate the vote before it is created or updated.
export const validateVote: CollectionBeforeChangeHook = async ({ operation, data, req }) => {
  if (operation === 'create') {
    // If a new vote is created, validate the content and the type of vote
    const cid = data.content.value.id ?? data.content.value;
    const { type, createdBy } = data;

    // Find the stats document for the content
    const stats = await req.payload.find({
      req,
      collection: 'content-stats',
      where: {
        'content.value': {
          equals: cid,
        },
      },
    });

    if (stats.totalDocs === 0) {
      throw new Error('this content is not available for voting');
    }

    const stat = stats.docs[0];

    // Check if the type of vote is valid
    if (type !== stat.type) {
      throw new Error('Vote type mismatch');
    }

    if (type === 'upvote') {
      // Check if the user has already upvoted the content
      const vote = await req.payload.find({
        req,
        collection: 'content-votes',
        where: {
          'content.value': {
            equals: cid,
          },
          createdBy: {
            equals: createdBy.id ?? createdBy,
          },
          type: {
            equals: 'upvote',
          },
        },
      });

      if (vote.totalDocs > 0) {
        throw new Error('Already upvoted');
      }
    } else if (type === 'star') {
      // Check if the user has already starred the content
      const vote = await req.payload.find({
        req,
        collection: 'content-votes',
        where: {
          'content.value': {
            equals: cid,
          },
          createdBy: {
            equals: createdBy.id ?? createdBy,
          },
          type: {
            equals: 'star',
          },
        },
      });

      if (vote.totalDocs > 0) {
        throw new Error('Already starred');
      }
    } else {
      throw new Error('Invalid type');
    }
  }
};

// This hook is used to update the stats of the content after a vote is created or updated.
// The stats are stored in the ContentStats collection.
export const updateStats: CollectionAfterChangeHook = ({ operation, doc, req }) => {
  if (operation !== 'create') return;

  const cid = doc.content.value.id ?? doc.content.value;
  const { type } = doc;

  // Find the stats document for the content
  req.payload
    .find({
      req,
      collection: 'content-stats',
      where: {
        'content.value': {
          equals: cid,
        },
      },
    })
    .then(stats => {
      if (stats.totalDocs === 0) {
        throw new Error('Stats document not found');
      }

      // If the stats document exists, update the stats based on the type of vote
      const stat = stats.docs[0] as unknown as ContentStat;

      // Check if the vote's type is equal to stat's type
      if (type !== stat.type) {
        throw new Error('Type mismatch');
      }

      if (type === 'upvote') {
        publishToQueue(
          {
            contentId: cid,
            statId: stat.id,
            voteId: doc.id,
            value: 1,
            type: 'upvote',
          },
          'upvote-queue',
        );
      } else if (type === 'star') {
        // Handle 'star' type if needed
      }
    })
    .catch(error => {
      console.error(error);
    });
};
