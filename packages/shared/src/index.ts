export const membershipStatuses = ["pending", "approved", "rejected", "suspended"] as const;
export const memberRoles = ["member", "admin"] as const;
export const rsvpStatuses = ["going", "maybe", "not_going"] as const;

export type MembershipStatus = (typeof membershipStatuses)[number];
export type MemberRole = (typeof memberRoles)[number];
export type RsvpStatus = (typeof rsvpStatuses)[number];

export const maxUploadBytes = 8 * 1024 * 1024;
export const imageCacheNamespace = "silviorats:v1";
