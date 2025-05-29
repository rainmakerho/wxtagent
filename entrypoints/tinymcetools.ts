import { MESSAGE_TOOL_TYPES } from "../utils/types/message";
export default defineUnlistedScript(() => {
  const win = window as any;

  function setTinyMCEValue(id: string, value: string) {
    if (!win.tinyMCE) {
      console.warn("tinyMCE not found on window.");
      return;
    }
    const editor = win.tinyMCE.get(id);
    if (editor) {
      editor.setContent(value);
      editor.save();
    } else {
      console.warn(`TinyMCE editor with id ${id} not found.`);
    }
  }

  window.addEventListener("message", (event) => {
    if (
      event.data &&
      event.data.type === MESSAGE_TOOL_TYPES.TINYMCE_SET_VALUE.name &&
      typeof event.data.id === "string" &&
      typeof event.data.value === "string"
    ) {
      console.log("Setting TinyMCE value:", event.data.id, event.data.value);
      setTinyMCEValue(event.data.id, event.data.value);
    }
  });

  //DataCKeditor_staff_A
  // window.postMessage(
  //   {
  //     type: "tinymceSetValue",
  //     id: "DataCKeditor_competitordetail_A",
  //     value: "自動填值",
  //   },
  //   "*"
  // );
});
