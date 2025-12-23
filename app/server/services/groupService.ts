import { prisma } from "../config/database.js";

// Types
export interface GroupResponse {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerName: string;
  memberCount: number;
  isMember: boolean;
  hasPendingRequest: boolean;
  pendingRequestCount?: number;
  createdAt: Date;
}

export interface GroupDetailResponse extends GroupResponse {
  members: Array<{
    id: string;
    name: string;
    email: string;
    joinedAt: Date;
  }>;
  pendingRequestCount: number;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  ownerId: string;
}

// Helper to format group response
async function formatGroupResponse(group: any, userId?: string): Promise<GroupResponse> {
  const memberCount = await prisma.groupMember.count({
    where: { groupId: group.id },
  });

  const isMember = userId
    ? await prisma.groupMember.findUnique({
        where: {
          userId_groupId: { userId, groupId: group.id },
        },
      })
    : false;

  const hasPendingRequest = userId
    ? await prisma.groupJoinRequest.findUnique({
        where: {
          userId_groupId: { userId, groupId: group.id },
        },
      })
    : false;

  // Count pending requests for owners
  let pendingRequestCount: number | undefined;
  if (userId && group.ownerId === userId) {
    pendingRequestCount = await prisma.groupJoinRequest.count({
      where: {
        groupId: group.id,
        status: "PENDING",
      },
    });
  }

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    ownerId: group.ownerId,
    ownerName: group.owner.name,
    memberCount,
    isMember: !!isMember,
    hasPendingRequest: !!hasPendingRequest && hasPendingRequest.status === "PENDING",
    pendingRequestCount,
    createdAt: group.createdAt,
  };
}

// Create a new study group
export async function createGroup(input: CreateGroupInput): Promise<GroupResponse> {
  const { name, description, ownerId } = input;

  // Validate input
  if (!name || name.trim().length === 0) {
    throw new Error("Group name is required");
  }

  if (name.length > 100) {
    throw new Error("Group name must be less than 100 characters");
  }

  // Create group
  const group = await prisma.studyGroup.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      ownerId,
    },
    include: {
      owner: true,
    },
  });

  // Add owner as a member
  await prisma.groupMember.create({
    data: {
      userId: ownerId,
      groupId: group.id,
    },
  });

  return formatGroupResponse(group, ownerId);
}

// Get all groups (with optional filters)
export async function getAllGroups(userId?: string): Promise<GroupResponse[]> {
  const groups = await prisma.studyGroup.findMany({
    include: {
      owner: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Promise.all(
    groups.map((group) => formatGroupResponse(group, userId))
  );
}

// Get group by ID with full details
export async function getGroupById(groupId: string, userId?: string): Promise<GroupDetailResponse> {
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
    include: {
      owner: true,
    },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: {
      user: true,
    },
    orderBy: {
      joinedAt: "asc",
    },
  });

  const formattedMembers = members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    joinedAt: member.joinedAt,
  }));

  // Count pending requests
  const pendingRequestCount = await prisma.groupJoinRequest.count({
    where: {
      groupId,
      status: "PENDING",
    },
  });

  const baseResponse = await formatGroupResponse(group, userId);

  return {
    ...baseResponse,
    members: formattedMembers,
    pendingRequestCount,
  };
}

// Join a group
export async function joinGroup(groupId: string, userId: string): Promise<void> {
  // Check if group exists
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  // Check if already a member
  const existingMember = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: { userId, groupId },
    },
  });

  if (existingMember) {
    throw new Error("Already a member of this group");
  }

  // Add as member
  await prisma.groupMember.create({
    data: {
      userId,
      groupId,
    },
  });
}

// Leave a group
export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  // Check if member exists
  const member = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: { userId, groupId },
    },
  });

  if (!member) {
    throw new Error("Not a member of this group");
  }

  // Check if user is the owner
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
  });

  if (group?.ownerId === userId) {
    throw new Error("Group owner cannot leave. Transfer ownership or delete the group first.");
  }

  // Remove membership
  await prisma.groupMember.delete({
    where: {
      userId_groupId: { userId, groupId },
    },
  });
}

// Check if user is member of group
export async function isGroupMember(groupId: string, userId: string): Promise<boolean> {
  const member = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: { userId, groupId },
    },
  });

  return !!member;
}

// Get groups where user is a member
export async function getUserGroups(userId: string): Promise<GroupResponse[]> {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          owner: true,
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  return Promise.all(
    memberships.map((membership) => formatGroupResponse(membership.group, userId))
  );
}
