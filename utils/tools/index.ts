import { matchPattern } from "browser-extension-url-match";

import { pageContentTool } from "./pageContentTool";
import { bizformExtractFieldsTool } from "./bizformExtractFieldsTool";
import {
  kmExtractFieldsTool,
  kmSetFieldsTool,
} from "./kmTools";

const tools = [pageContentTool];
export { tools };

const toolRules = [
  {
    matches: ["<all_urls>"], // 默認匹配
    tools: [pageContentTool],
  },
  {
    matches: ["https://bizform.vitalyun.com/*"],
    tools: [bizformExtractFieldsTool],
  },
  {
    matches: ["https://gsskm.gss.com.tw/*"],
    tools: [kmExtractFieldsTool],
  },
  {
    matches: ["https://gsskm.gss.com.tw/*"],
    tools: [kmSetFieldsTool],
  },
];

export function getToolsByUrl(url: string): any[] {
  const matchedTools = new Set<any>();
  for (const rule of toolRules) {
    const matcher = matchPattern(rule.matches);
    if (matcher.valid && matcher.match(url)) {
      console.log("match", rule.matches);
      rule.tools.forEach((tool) => matchedTools.add(tool));
    }
  }
  return Array.from(matchedTools); // 將 Set 轉換為 Array 並返回
}
