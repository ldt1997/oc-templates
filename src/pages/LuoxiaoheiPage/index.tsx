import { useState, useRef } from 'react';
import { Card, Button, Typography, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { toPng } from 'html-to-image';
import { TemplateWorkbenchLayout } from '../../components/template/TemplateWorkbenchLayout';
import '../TemplatePage.css';

export function LuoxiaoheiPage() {
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  async function handleExport() {
    if (!previewRef.current) {
      message.error('预览区域尚未准备好');
      return;
    }

    try {
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = 'template-export.png';
      link.href = dataUrl;
      link.click();
    } catch {
      message.error('导出失败，请重试');
    }
  }

  const panel = (
    <Card className="control-card" bordered={false}>
      <div className="panel-head">
        <div>
          <Typography.Title level={4}>模板 T1</Typography.Title>
          <Typography.Paragraph className="panel-desc">
            这是一个简单的模板页面框架示例。
          </Typography.Paragraph>
        </div>
      </div>

      {!panelCollapsed ? (
        <div className="panel-scroll">
          <Typography.Paragraph style={{ color: 'var(--palette-text-secondary)' }}>
            空面板 - 可在此添加参数控制元素
          </Typography.Paragraph>
        </div>
      ) : null}
    </Card>
  );

  const preview = (
    <div className="preview-column">
      <div className="preview-toolbar">
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
          导出
        </Button>
      </div>
      <div ref={previewRef} className="poster-shell">
        <div
          style={{
            borderRadius: '20px',
            minHeight: '620px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--palette-bg-secondary), var(--palette-bg-tertiary))',
            color: 'var(--palette-text-primary)',
            fontSize: '24px',
            fontWeight: 600,
          }}
        >
          预览区域
        </div>
      </div>
    </div>
  );

  return (
    <TemplateWorkbenchLayout
      panel={panel}
      preview={preview}
      collapsed={panelCollapsed}
      onToggleCollapsed={() => setPanelCollapsed((value) => !value)}
    />
  );
}
