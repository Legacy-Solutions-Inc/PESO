import { describe, it } from 'node:test';
import assert from 'node:assert';
import { fetchUserEmails } from './fetch-emails.ts';

describe('fetchUserEmails', () => {
  it('should fetch emails for given user IDs using getUserById', async () => {
    // Mock admin client
    const mockAdminClient = {
      auth: {
        admin: {
          getUserById: async (id: string) => {
            if (id === 'user1') {
              return { data: { user: { email: 'user1@example.com' } }, error: null };
            }
            if (id === 'user2') {
              return { data: { user: { email: 'user2@example.com' } }, error: null };
            }
            return { data: null, error: { message: 'User not found' } };
          },
          listUsers: async () => {
            throw new Error('Should not call listUsers');
          },
        },
      },
    };

    const userIds = ['user1', 'user2', 'user3'];
    const emails = await fetchUserEmails(mockAdminClient, userIds);

    assert.strictEqual(emails['user1'], 'user1@example.com');
    assert.strictEqual(emails['user2'], 'user2@example.com');
    assert.strictEqual(emails['user3'], undefined);
  });

  it('should handle errors gracefully', async () => {
     const mockAdminClient = {
      auth: {
        admin: {
          getUserById: async (id: string) => {
             throw new Error('API Error');
          },
        },
      },
    };

    const emails = await fetchUserEmails(mockAdminClient, ['user1']);
    assert.deepStrictEqual(emails, {});
  });
});
