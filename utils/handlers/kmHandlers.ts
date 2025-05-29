import { messageRequest, messageResponse, MESSAGE_TOOL_TYPES } from "../types/message";

export const kmExtractFieldsHandler = (
  message: messageRequest
): messageResponse => {
  const fields = collectFormFields();
  const jsonString = JSON.stringify(fields);
  return {
    result: jsonString,
  };
};

export interface FormFieldInfo {
  title: string;
  tag: string;
  type: string;
  name: string;
  id: string;
  value: string;
}

/**
 * 擷取網頁 tr 結構下所有 th(.attrDisplayName)+td(input/select/textarea) 欄位資訊
 */
export function collectFormFields(): FormFieldInfo[] {
  const fieldList: FormFieldInfo[] = [];
  document.querySelectorAll("tr").forEach((tr) => {
    const titleElem = tr.querySelector(".attrDisplayName");
    if (!titleElem) return;
    const title = titleElem.textContent?.trim() || "";

    // 只擷取 td 裡不是 hidden 的 input、select、textarea
    const inputs = tr.querySelectorAll(
      "td input:not([type=hidden]), td select, td textarea"
    );
    inputs.forEach((input) => {
      fieldList.push({
        title,
        tag: input.tagName.toLowerCase(),
        type: (input as HTMLInputElement).type || "", // select/textarea 沒 type 屬性
        name: input.getAttribute("name") || "",
        id: input.id || "",
        value: (input as HTMLInputElement | HTMLTextAreaElement).value || "",
      });
    });
  });
  console.log(fieldList);
  return fieldList;
}

export const kmSetFieldsHandler = (
  message: messageRequest
): messageResponse => {
  let result = "表單填寫完成, 請檢查網頁內容。";
  try {
    let payload = message.payload;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        return { result: "fields 內容不是正確的 JSON 格式。" };
      }
    }

    if (!payload || typeof payload !== "object") {
      return { result: "fields 格式錯誤。" };
    }

    const fields = payload as Record<string, string>;
    console.log("Setting fields:", fields);
    Object.entries(fields).forEach(([id, val]) => {
      const elem = document.getElementById(id);
      if (!elem) return;
      if (elem instanceof HTMLInputElement) {
        if (elem.type === "checkbox" || elem.type === "radio") {
          elem.checked = Boolean(val);
        } else {
          elem.value = val ?? "";
        }
      } else if (elem instanceof HTMLSelectElement) {
        elem.value = val ?? "";
      } else if (elem instanceof HTMLTextAreaElement) {
        elem.value = val ?? "";
        elem.dispatchEvent(new Event("input", { bubbles: true }));
        try {
          window.postMessage(
            {
              type: MESSAGE_TOOL_TYPES.TINYMCE_SET_VALUE.name,
              id: id,
              value: val ?? "",
            },
            "*"
          );
        } catch (e) {
          console.error("Error setting textarea value:", e);
        }
      }
    });
  } catch (e) {
    result = "表單填寫失敗: " + (e as Error).message;
  }

  return {
    result,
  };
};
