import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { createJoinRequest, getGroupRequests, updateJoinRequest, cancelJoinRequest } from "../server/services/joinRequestService.js";
import { verifyToken } from "../server/config/jwt.js";
import { getCookieName } from "../server/utils/cookie.js";

// Helper function to create JSON responses
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Get pending requests for a group (owner only)
export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const authCookie = cookies.find((c) => c.startsWith(`${getCookieName()}=`));

  if (!authCookie) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const token = authCookie.split("=")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const groupId = url.searchParams.get("groupId");

  if (!groupId) {
    return jsonResponse({ error: "Group ID required" }, 400);
  }

  try {
    const requests = await getGroupRequests({ groupId, userId: payload.userId });
    return jsonResponse({ requests });
  } catch (error) {
    if (error instanceof Error) {
      return jsonResponse({ error: error.message }, 400);
    }
    return jsonResponse({ error: "Failed to fetch requests" }, 500);
  }
}

// Create, update, or cancel join requests
export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return jsonResponse({ success: false, message: "Unauthorized" }, 401);
  }

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const authCookie = cookies.find((c) => c.startsWith(`${getCookieName()}=`));

  if (!authCookie) {
    return jsonResponse({ success: false, message: "Unauthorized" }, 401);
  }

  const token = authCookie.split("=")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return jsonResponse({ success: false, message: "Unauthorized" }, 401);
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    switch (intent) {
      case "create": {
        const groupId = formData.get("groupId") as string;
        if (!groupId) {
          return jsonResponse({ success: false, message: "Group ID required" }, 400);
        }

        const request = await createJoinRequest({
          userId: payload.userId,
          groupId,
        });

        return jsonResponse({ success: true, request });
      }

      case "accept":
      case "reject": {
        const requestId = formData.get("requestId") as string;
        if (!requestId) {
          return jsonResponse({ success: false, message: "Request ID required" }, 400);
        }

        const updatedRequest = await updateJoinRequest({
          requestId,
          status: intent === "accept" ? "ACCEPTED" : "REJECTED",
        });

        return jsonResponse({ success: true, request: updatedRequest });
      }

      case "cancel": {
        const groupId = formData.get("groupId") as string;
        if (!groupId) {
          return jsonResponse({ success: false, message: "Group ID required" }, 400);
        }

        await cancelJoinRequest({
          userId: payload.userId,
          groupId,
        });

        return jsonResponse({ success: true });
      }

      default:
        return jsonResponse({ success: false, message: "Invalid intent" }, 400);
    }
  } catch (error) {
    if (error instanceof Error) {
      return jsonResponse({ success: false, message: error.message }, 400);
    }
    return jsonResponse({ success: false, message: "An error occurred" }, 500);
  }
}
