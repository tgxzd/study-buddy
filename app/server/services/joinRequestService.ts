import { prisma } from "../config/database.js";

// Type for join request status
export type JoinRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface CreateJoinRequestParams {
  userId: string;
  groupId: string;
}

export interface UpdateJoinRequestParams {
  requestId: string;
  status: JoinRequestStatus;
}

export interface GetGroupRequestsParams {
  groupId: string;
  userId: string; // For authorization check
}

export interface GetUserRequestsParams {
  userId: string;
}

// Create a join request
export async function createJoinRequest({ userId, groupId }: CreateJoinRequestParams) {
  // Check if group exists
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  // Check if user is already a member
  const existingMember = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  });

  if (existingMember) {
    throw new Error("Already a member of this group");
  }

  // Check if there's already a pending request
  const existingRequest = await prisma.groupJoinRequest.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  });

  if (existingRequest) {
    if (existingRequest.status === "PENDING") {
      throw new Error("Join request already pending");
    }
    // If previous request was rejected, allow creating a new one
    if (existingRequest.status === "REJECTED") {
      await prisma.groupJoinRequest.delete({
        where: { id: existingRequest.id },
      });
    } else {
      throw new Error("Cannot create new request");
    }
  }

  // Create the join request
  const joinRequest = await prisma.groupJoinRequest.create({
    data: {
      userId,
      groupId,
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      group: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return joinRequest;
}

// Get all pending requests for a group (owner only)
export async function getGroupRequests({ groupId, userId }: GetGroupRequestsParams) {
  // Check if user is the owner
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
    select: { ownerId: true },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  if (group.ownerId !== userId) {
    throw new Error("Only the group owner can view join requests");
  }

  const requests = await prisma.groupJoinRequest.findMany({
    where: {
      groupId,
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return requests;
}

// Get user's pending requests
export async function getUserPendingRequests({ userId }: GetUserRequestsParams) {
  const requests = await prisma.groupJoinRequest.findMany({
    where: {
      userId,
      status: "PENDING",
    },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          description: true,
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return requests;
}

// Update join request status (accept/reject) - owner only
export async function updateJoinRequest({ requestId, status }: UpdateJoinRequestParams) {
  const request = await prisma.groupJoinRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("Join request not found");
  }

  if (request.status !== "PENDING") {
    throw new Error("Request has already been processed");
  }

  // If accepting, add user to group
  if (status === "ACCEPTED") {
    await prisma.groupMember.create({
      data: {
        userId: request.userId,
        groupId: request.groupId,
      },
    });
  }

  // Update request status
  const updatedRequest = await prisma.groupJoinRequest.update({
    where: { id: requestId },
    data: { status },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      group: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updatedRequest;
}

// Check if user has a pending request for a group
export async function checkPendingRequest({ userId, groupId }: { userId: string; groupId: string }) {
  const request = await prisma.groupJoinRequest.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  });

  if (!request) {
    return null;
  }

  return {
    id: request.id,
    status: request.status,
  };
}

// Cancel a pending request (user can cancel their own request)
export async function cancelJoinRequest({ userId, groupId }: { userId: string; groupId: string }) {
  const request = await prisma.groupJoinRequest.findUnique({
    where: {
      userId_groupId: { userId, groupId },
    },
  });

  if (!request) {
    throw new Error("Join request not found");
  }

  if (request.userId !== userId) {
    throw new Error("You can only cancel your own requests");
  }

  if (request.status !== "PENDING") {
    throw new Error("Cannot cancel a processed request");
  }

  await prisma.groupJoinRequest.delete({
    where: { id: request.id },
  });

  return { success: true };
}
