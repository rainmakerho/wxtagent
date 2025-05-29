import { Bubble, Sender, BubbleProps } from "@ant-design/x";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { createChatAgent } from "@/utils/agents";
import type { GetProp } from "antd";
import ChatHeader from "./ChatHeader";
import SettingsPanel from "./SettingsPanel";
import type { Conversation } from "@ant-design/x/es/conversations";
import dayjs from "dayjs";
import markdownit from "markdown-it";
import { Typography } from "antd";
import { agentConfig } from "@/utils/types/agentConfig";
import { TAB_URL_CHANGED } from "@/utils/types/message";
import ChatSessionList from "./ChatSessionList";

const md = markdownit({ html: false, breaks: true });
const ROLE_AI = "assistant";
const ROLE_HUMAN = "user";
const DATE_FORMAT = "YYYY-MM-DD";
const NEW_SESSION_LABEL = "New session";

const renderMarkdown: BubbleProps["messageRender"] = (content) => {
  //console.log("content", content);
  return (
    <Typography>
      <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
    </Typography>
  );
};

const rolesAsObject: GetProp<typeof Bubble.List, "roles"> = {
  assistant: {
    placement: "start",
    avatar: {
      icon: <RobotOutlined />,
      style: { background: "#398eff", margin: 2 },
    },
    typing: { step: 5, interval: 20 },
    styles: {
      content: { margin: 2 },
    },
    messageRender: renderMarkdown,
  },
  user: {
    placement: "end",
    avatar: {
      icon: <UserOutlined />,
      style: { background: "#87d068", margin: 2 },
    },
    styles: {
      content: { margin: 2 },
    },
  },
};

export default function ChatUi() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [controller, setController] = useState<AbortController | null>(null);
  const [messages, setMessages] = useState<Array<BubbleProps>>([]);
  const [sessionList, setSessionList] = useState<Conversation[]>([]);
  const [curSession, setCurSession] = useState<string>();
  const [messageHistory, setMessageHistory] = useState<Record<string, any>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [apiSettings, setApiSettings] = useState<agentConfig>({
    apiUrl: "",
    apiKey: "",
    model: "",
  });
  const [showConversations, setShowConversations] = useState(false);
  const agentRef = useRef<any>(null);
  const apiSettingsRef = useRef(apiSettings);

  useEffect(() => {
    loadSettingsFromStorage();
    loadHistoryFromStorage();
    function handleMessage(message: any, sender: any, sendResponse: any) {
      if (message.type === TAB_URL_CHANGED) {
        agentRef.current = createChatAgent(apiSettingsRef.current, message.url);
      }
    }
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const loadHistoryFromStorage = () => {
    chrome.storage.local.get(["messageHistory"], (result) => {
      if (
        result.messageHistory &&
        Object.keys(result.messageHistory).length > 0
      ) {
        setMessageHistory(result.messageHistory);

        // 根據 messageHistory 初始化 sessionList 和 curSession
        const keys = Object.keys(result.messageHistory);
        setSessionList(
          keys.map((key) => ({
            key,
            label:
              result.messageHistory[key][0]?.content?.slice(0, 20) ||
              NEW_SESSION_LABEL,
            group: dayjs(Number(key)).format(DATE_FORMAT),
          }))
        );
        setCurSession(keys[0]);
      } else {
        // 沒有歷史資料才建立新 session
        newSession();
      }
    });
  };
  
  useEffect(() => {
    chrome.storage.local.set({ messageHistory });
  }, [messageHistory]);

  useEffect(() => {
    apiSettingsRef.current = apiSettings;
  }, [apiSettings]);

  useEffect(() => {
    if (sessionList.length === 0) {
      newSession();
    }
  }, [sessionList]);

  useEffect(() => {
    if (curSession) {
      setMessages(messageHistory[curSession] || []);
    }
  }, [curSession]);

  useEffect(() => {
    if (curSession && messages?.length) {
      setMessageHistory((prev) => ({
        ...prev,
        [curSession]: messages,
      }));
    }
  }, [messages]);

  const loadSettingsFromStorage = () => {
    chrome.storage.local.get(["apiUrl", "apiKey", "model"], (result) => {
      const settings = {
        apiUrl: result.apiUrl || "",
        apiKey: result.apiKey || "",
        model: result.model || "",
      };
      setApiSettings(settings);

      // 建立 agent 並存入 useRef
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url || "";
        agentRef.current = createChatAgent(settings, url);
      });
    });
  };
  const newSession = () => {
    const updatedSessionList = updatedSessions();

    const timeNow = dayjs().valueOf().toString();
    setSessionList([
      {
        key: timeNow,
        label: NEW_SESSION_LABEL,
        group: dayjs().format(DATE_FORMAT),
      },
      ...updatedSessionList,
    ]);
    setCurSession(timeNow);
    setMessages([]);

    console.log("New session created", sessionList, messageHistory);
  };

  const updatedSessions = () => {
    const prevSessionKey = curSession;
    let updatedSessionList = [...sessionList];

    // 如果有上一個 session，且有訊息
    if (prevSessionKey && messageHistory[prevSessionKey]?.length) {
      // 找到第一個 user 訊息
      const firstUserMsg = messageHistory[prevSessionKey].find(
        (msg: any) => msg.role === ROLE_HUMAN && msg.content
      );
      if (firstUserMsg) {
        console.log("firstUserMsg", firstUserMsg);
        // 更新 sessionList 中上一個 session 的 label
        updatedSessionList = sessionList.map((s) =>
          s.key === prevSessionKey
            ? {
                ...s,
                label: firstUserMsg.content.slice(0, 20) || NEW_SESSION_LABEL,
              }
            : s
        );
      }
    }
    return updatedSessionList;
  };

  const handleSubmit = async () => {
    const newController = new AbortController();

    setController(newController);
    setIsLoading(true);
    let query = input;
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        content: query,
        role: ROLE_HUMAN,
      },
    ]);

    try {
      const agentOutput = await agentRef.current.invoke(
        {
          messages: [
            {
              role: ROLE_HUMAN,
              content: query,
            },
          ],
        },
        { signal: newController.signal }
      );
      var text = agentOutput.messages[agentOutput.messages.length - 1].content;
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: text,
          role: ROLE_AI,
        },
      ]);
      console.log(text);
      setInput("");
    } catch (error) {
      console.error("Error during agent.invoke:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (controller) {
      console.log("Aborting request...");
      controller.abort(); // 中止當前請求
      setController(null); // 清除 controller
    }
  };
  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = (isSaved: boolean) => {
    if (isSaved) loadSettingsFromStorage();
    setShowSettings(false);
  };

  const handleDeleteSession = (key: string) => {
    setSessionList((prev) => {
      const newList = prev.filter((session) => session.key !== key);
      // 自動 focus 到第一個 session
      if (newList.length > 0) {
        setCurSession(newList[0].key);
      }
      return newList;
    });
    setMessageHistory((prev) => {
      const newHistory = { ...prev };
      delete newHistory[key];
      return newHistory;
    });
  };

  const mainContent = showSettings ? (
    <SettingsPanel onClose={handleCloseSettings} />
  ) : showConversations ? (
    <ChatSessionList
      sessionList={sessionList}
      defaultActiveKey={curSession!}
      onActiveChange={setCurSession}
      onClose={() => setShowConversations(false)}
      onDelete={handleDeleteSession}
    />
  ) : (
    <div className="chat-container">
      <ChatHeader
        onNewSession={newSession}
        openSettings={handleSettingsClick}
        openChatConversations={() => setShowConversations(true)}
      />
      <Bubble.List items={messages} roles={rolesAsObject}></Bubble.List>
      <Sender
        value={input}
        onChange={setInput}
        loading={isLoading}
        placeholder="請輸入訊息..."
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );

  return <>{mainContent}</>;
}
