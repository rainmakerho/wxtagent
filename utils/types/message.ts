// 定義請求的型別
export type messageRequest = {
  type: string;
  payload?: Record<string, unknown>;
};

// 定義回應的型別
export type messageResponse = {
  result?: string; // 成功時的內容
  error?: string; // 錯誤訊息
};

export const MESSAGE_TOOL_TYPES = {
  PAGE_CONTENT: {
    name: "pageContent",
    description: "取得整個網頁的純文字內容",
  },
  BIZ_EXTRACT_FIELDS: {
    name: "bizformExtractFields",
    description:
      "擷取目前頁面中所有可輸入的欄位名稱與其值（如文字欄位、下拉選單、日期等）",
  },
  KM_EXTRACT_FIELDS: {
    name: "kmExtractFields",
    description:
      "擷取目前頁面中所有可輸入的欄位id, 名稱與其值（如文字欄位、下拉選單、日期等）",
  },
  KM_SET_FIELDS: {
    name: "kmSetFields",
    description:
      "依合適的填寫內容（回傳欄位 id 對應內容, 例如:ctl00_cp_fieldRepeater_ctl02_date_A: 2024/05/23）來填寫網頁表單欄位",
  },
  TINYMCE_SET_VALUE: {
    name: "tinymceSetValue",
    description: "設定 TinyMCE 編輯器的內容",
  },
};

export const TAB_URL_CHANGED = "TAB_URL_CHANGED";
