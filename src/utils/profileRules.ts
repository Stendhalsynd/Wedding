import { DEFAULT_PROFILE_IMAGES } from '../constants/profileImages';

export type UserRole = 'bride' | 'groom';

const LEGACY_PROFILE_URL_PATTERNS = [
  'picsum.photos',
  'dicebear.com/7.x',
  'fun-emoji',
  'adventurer',
  'avataaars',
];

export function getInitial(name?: string | null) {
  const trimmedName = name?.trim();
  if (!trimmedName) {
    return '나';
  }

  return Array.from(trimmedName)[0] ?? '나';
}

export function getRoleLabel(role?: UserRole | null) {
  if (role === 'bride') {
    return '예신';
  }

  if (role === 'groom') {
    return '예랑';
  }

  return undefined;
}

export function isLegacyProfileImageUrl(profileImageUrl?: string | null) {
  if (!profileImageUrl) {
    return false;
  }

  return LEGACY_PROFILE_URL_PATTERNS.some((pattern) => profileImageUrl.includes(pattern));
}

export function getResolvedProfileImageUrl({
  role,
  profileImageUrl,
}: {
  role?: UserRole | null;
  profileImageUrl?: string | null;
}) {
  if (!role) {
    return profileImageUrl ?? undefined;
  }

  return DEFAULT_PROFILE_IMAGES[role];
}

export function shouldRequireRoleSetup({
  role,
  roleSetupDismissedAt,
}: {
  role?: UserRole | null;
  roleSetupDismissedAt?: unknown;
}) {
  return !role && !roleSetupDismissedAt;
}

export function toAuthorDisplay({
  authorName,
  userRole,
  profileImageUrl,
}: {
  authorName?: string | null;
  userRole?: UserRole | null;
  profileImageUrl?: string | null;
}) {
  const name = authorName?.trim() || '나';
  const initial = getInitial(name);
  const resolvedProfileImageUrl = getResolvedProfileImageUrl({
    role: userRole,
    profileImageUrl,
  });

  if (userRole && resolvedProfileImageUrl) {
    return {
      kind: 'image' as const,
      label: getRoleLabel(userRole),
      imageUrl: resolvedProfileImageUrl,
      name,
      initial,
    };
  }

  return {
    kind: 'initial' as const,
    label: undefined,
    imageUrl: undefined,
    name,
    initial,
  };
}
