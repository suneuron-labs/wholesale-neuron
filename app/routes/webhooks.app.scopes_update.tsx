import type { ActionFunctionArgs } from "react-router";
import { complianceWebhookAction } from "../compliance-webhook.server";

export const action = (args: ActionFunctionArgs) => complianceWebhookAction(args);
