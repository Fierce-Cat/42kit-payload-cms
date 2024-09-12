import { CollectionBeforeChangeHook } from 'payload/types'
import { CollectionAfterChangeHook } from 'payload/types'
import payload from 'payload'

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
          'createdBy': {
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
          'createdBy': {
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
}

// This hook is used to update the stats of the content after a vote is created or updated.
// The stats are stored in the ContentStats collection.
export const updateStats: CollectionAfterChangeHook = async ({ operation, doc, req }) => {
  if (operation === 'create') {
    // If a new vote is created, update the stats of the content
    const cid = doc.content.value.id ?? doc.content.value;
    const { type } = doc;

    try {
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

      if (stats.totalDocs > 0) {
        // If the stats document exists, update the stats based on the type of vote
        const stat = stats.docs[0] as any;
        // Check if the vote's type is equal to stat's type
        if (type === stat.type) {
          if (type === 'upvote') {
            // Update the total count and the sum of votes
            const countData = await payload.count({
              req,
              collection: 'content-votes',
              where: {
                'content.value': {
                  equals: cid,
                },
                type: {
                  equals: 'upvote',
                },
              },
            });
            stat.total_count = countData.totalDocs;
            stat.votes_sum = countData.totalDocs;
          } else if (type === 'star') {
            // Update the total count and the average and distribution of stars
            stat.total_count += 1;
            stat.stars_data[doc.value] += 1;
            // Weighted average
            stat.stars_average = (
              stat.stars_data['1'] * stat.stars_weight['1'] +
              stat.stars_data['2'] * stat.stars_weight['2'] +
              stat.stars_data['3'] * stat.stars_weight['3'] +
              stat.stars_data['4'] * stat.stars_weight['4'] +
              stat.stars_data['5'] * stat.stars_weight['5']
            ) / stat.total_count;
          }
          // Update the stats document
          await req.payload.update({
            req,
            collection: 'content-stats',
            id: stat.id,
            data: {
              total_count: stat.total_count,
              votes_sum: stat.votes_sum,
              star_average: stat.star_average,
              star_data: stat.star_data,
            }
          });
        } else {
          throw new Error('Type mismatch');
        }
      } else {
        throw new Error('Stats document not found');
      }
    } catch (error) {
      console.error(error);
    }
  }
};
