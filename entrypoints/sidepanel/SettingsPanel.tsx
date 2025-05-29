import { Card, Input, Button, message, Form, Space } from "antd";

interface SettingsPanelProps {
  onClose: (isSaved: boolean) => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [form] = Form.useForm();
  useEffect(() => {
    chrome.storage.local.get(["apiUrl", "apiKey", "model"], (result) => {
      console.log(result);
      form.setFieldsValue({
        apiUrl: result.apiUrl || "",
        apiKey: result.apiKey || "",
        model: result.model || "gpt-4.1",
      });
    });
  }, [form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log("取得的值:", values);
      chrome.storage.local.set(values, () => {
        message.success("設定已儲存！");
        onClose(true);
      });
    } catch (errorInfo) {
      console.log("Save Error", errorInfo);
      message.error("Save Error");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    message.info("已取消變更");
    onClose(false);
  };

  return (
    <>
      <div className="chat-header">
        <div className="chat-header-title">✨ AI Copilot</div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="ant-form"
      >
        <Form.Item
          label="API URL"
          name="apiUrl"
          rules={[{ required: false, message: "請輸入 API URL" }]}
        >
          <Input placeholder="例如：https://api.example.com" />
        </Form.Item>

        <Form.Item
          label="API Key"
          name="apiKey"
          rules={[{ required: true, message: "請輸入 API Key" }]}
        >
          <Input.Password placeholder="請輸入你的 API Key" />
        </Form.Item>

        <Form.Item
          label="Model Name"
          name="model"
          rules={[{ required: true, message: "請輸入 Model" }]}
        >
          <Input placeholder="gpt-4.1" />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Button onClick={handleCancel} block>
              取消
            </Button>
            <Button type="primary" htmlType="submit" block>
              儲存設定
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </>
  );
}
