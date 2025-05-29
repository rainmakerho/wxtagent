import { Button, Space } from "antd";
import {
  PlusOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

interface ChatHeaderProps {
  onNewSession?: () => void;
  openChatConversations?: () => void;
  openSettings?: () => void;
}

export default function ChatHeader({
  onNewSession,
  openSettings,
  openChatConversations,
}: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <div className="chat-header-title">✨ AI Copilot</div>
      <Space size={0}>
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={onNewSession}
          className="chat-header-button"
          title="開啟新對話"
        />
        <Button
          type="text"
          icon={<UnorderedListOutlined />}
          onClick={openChatConversations}
          className="chat-header-button"
          title="開啟對話列表"
        />
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={openSettings}
          className="chat-header-button"
          title="開啟設定"
        />
      </Space>
    </div>
  );
}
