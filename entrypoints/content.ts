import { messageRequest, messageResponse } from "../utils/types/message";
import { handlers } from "@/utils/handlers";

export default defineContentScript({
  matches: ["<all_urls>"],
  async main() {
    await injectScript("/tinymcetools.js", {
      keepInDom: true,
    });
    chrome.runtime.onMessage.addListener(
      (
        message: messageRequest,
        sender,
        sendResponse: (response: messageResponse) => void
      ) => {
        const handler = handlers[message.type];
        if (handler) {
          sendResponse(handler(message));
        } else {
          console.error("Unknown message type:", message.type);
          sendResponse({ error: "Unknown message type" });
        }
        return true;
      }
    );
  },
});
