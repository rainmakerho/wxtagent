import { DeleteOutlined, EditOutlined, StopOutlined } from "@ant-design/icons";
import { Conversations } from "@ant-design/x";
import type { ConversationsProps } from "@ant-design/x";
import { type GetProp, theme, message } from "antd";
import { Button, Space } from "antd";
import { RollbackOutlined } from "@ant-design/icons";

interface ChatSessionListProps {
  sessionList: GetProp<ConversationsProps, "items">;
  defaultActiveKey: string;
  onClose: () => void;
  onActiveChange: (key: string) => void;
  onDelete: (key: string) => void;
}

export default function ChatSessionList({
  sessionList,
  defaultActiveKey,
  onClose,
  onActiveChange,
  onDelete,
}: ChatSessionListProps) {
  const { token } = theme.useToken();

  const style = {
    width: 256,
    background: token.colorBgContainer,
    borderRadius: token.borderRadius,
  };

  const menuConfig: ConversationsProps["menu"] = (conversation) => ({
    items: [
      {
        label: "Delete",
        key: "delete",
        icon: <DeleteOutlined />,
        danger: true,
      },
    ],
    onClick: (menuInfo) => {
      menuInfo.domEvent.stopPropagation();
      if (menuInfo.key === "delete") {
        onDelete(conversation.key);
        message.success(`Deleted ${conversation.key}`);
      }
    },
  });

  return (
    <>
      <div className="chat-header">
        <div className="chat-header-title">✨ AI Copilot</div>
        <Space size={0}>
          <Button
            type="text"
            icon={<RollbackOutlined />}
            className="chat-header-button"
            title="Back to chat"
            onClick={onClose}
          />
        </Space>
      </div>
      <Conversations
        defaultActiveKey={defaultActiveKey}
        onActiveChange={onActiveChange}
        menu={menuConfig}
        items={sessionList}
        style={style}
        groupable
      />
    </>
  );
}
