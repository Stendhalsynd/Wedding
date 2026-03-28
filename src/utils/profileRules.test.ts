import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getInitial,
  getRoleLabel,
  getResolvedProfileImageUrl,
  shouldRequireRoleSetup,
  toAuthorDisplay,
} from './profileRules';

test('requires role setup only when role is missing and dismiss flag is absent', () => {
  assert.equal(shouldRequireRoleSetup({ role: null, roleSetupDismissedAt: null }), true);
  assert.equal(shouldRequireRoleSetup({ role: null, roleSetupDismissedAt: '2026-03-29T00:00:00Z' }), false);
  assert.equal(shouldRequireRoleSetup({ role: 'bride', roleSetupDismissedAt: null }), false);
});

test('resolves static profile image from role when current url is missing or legacy', () => {
  assert.equal(getResolvedProfileImageUrl({ role: 'bride' }), '/예비신부.png');
  assert.equal(
    getResolvedProfileImageUrl({ role: 'groom', profileImageUrl: 'https://picsum.photos/200' }),
    '/예비신랑.png'
  );
  assert.equal(
    getResolvedProfileImageUrl({ role: 'groom', profileImageUrl: '/custom.png' }),
    '/예비신랑.png'
  );
  assert.equal(getResolvedProfileImageUrl({ role: null, profileImageUrl: undefined }), undefined);
});

test('builds image author display when role exists', () => {
  assert.deepEqual(
    toAuthorDisplay({
      authorName: '지훈',
      userRole: 'groom',
      profileImageUrl: '/예비신랑.png',
    }),
    {
      kind: 'image',
      label: '예랑',
      imageUrl: '/예비신랑.png',
      name: '지훈',
      initial: '지',
    }
  );
});

test('falls back to initial display when role is missing', () => {
  assert.deepEqual(
    toAuthorDisplay({
      authorName: '민지',
      userRole: null,
      profileImageUrl: undefined,
    }),
    {
      kind: 'initial',
      label: undefined,
      imageUrl: undefined,
      name: '민지',
      initial: '민',
    }
  );
});

test('uses sane fallback values for missing author names', () => {
  assert.equal(getInitial(undefined), '나');
  assert.equal(getRoleLabel('bride'), '예신');
  assert.equal(getRoleLabel('groom'), '예랑');
  assert.equal(getRoleLabel(null), undefined);
});
