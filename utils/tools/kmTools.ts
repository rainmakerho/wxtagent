import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { sendMessage } from "../message";
import { MESSAGE_TOOL_TYPES } from "../types/message";

const noOp = z.string().optional().describe("No-op parameter.");

export const kmExtractFieldsTool = tool(
  async () => {
    const response = await sendMessage<string>({
      type: MESSAGE_TOOL_TYPES.KM_EXTRACT_FIELDS.name,
    });
    return response;
  },
  {
    name: MESSAGE_TOOL_TYPES.KM_EXTRACT_FIELDS.name,
    description: MESSAGE_TOOL_TYPES.KM_EXTRACT_FIELDS.description,
    schema: z.object({
      noOp,
    }),
  }
);

const setFieldsSchema = z.record(z.string(), z.any());

export const kmSetFieldsTool = tool(
  async (fields) => {
    console.log("callReportSetFieldsTool fields", fields);
    const response = await sendMessage<string>({
      type: MESSAGE_TOOL_TYPES.KM_SET_FIELDS.name,
      payload: fields,
    });
    return response;
  },
  {
    name: MESSAGE_TOOL_TYPES.KM_SET_FIELDS.name,
    description: MESSAGE_TOOL_TYPES.KM_SET_FIELDS.description,
    schema: setFieldsSchema,
  }
);
