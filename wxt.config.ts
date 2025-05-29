import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: ({ browser, manifestVersion, mode, command }) => {
    return {
      name: "WXT + Agent",
      description: "WXT + Agent",
      version: "1.0.0",
      action: {},
      permissions: ["tabs", "storage"],
      host_permissions: ["<all_urls>"],
      web_accessible_resources: [
        {
          resources: ["/tinymcetools.js"],
          matches: ["<all_urls>"],
        },
      ],
    };
  },
});
