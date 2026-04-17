import { useMemo, useRef, useState, type CSSProperties, useEffect } from 'react';
import {
  Card,
  ColorPicker,
  Form,
  Input,
  Button,
  Slider,
  Typography,
  Upload,
  message,
  type UploadFile,
  type UploadProps,
} from 'antd';
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import { toPng } from 'html-to-image';
import { TemplateWorkbenchLayout } from '../components/template/TemplateWorkbenchLayout';
import './LuoxiaoheiPage.css';

const { Dragger } = Upload;

export function LuoxiaoheiPage() {
  const [title, setTitle] = useState('罗小黑 · 双色人像海报');
  const [subtitle, setSubtitle] = useState('LIVE ANYWHERE, DESIGN EVERYWHERE');
  const [primaryColor, setPrimaryColor] = useState('#ff385c');
  const [secondaryColor, setSecondaryColor] = useState('#222222');
  const [split, setSplit] = useState(46);
  const [scale, setScale] = useState(1);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const uploadProps: UploadProps = {
    accept: 'image/*',
    maxCount: 1,
    beforeUpload: () => false,
    onChange(info) {
      const file = info.fileList[0] as UploadFile | undefined;
      if (file?.originFileObj) {
        const url = URL.createObjectURL(file.originFileObj);
        setImageUrl(url);
      }
    },
  };

  const posterStyle = useMemo(
    () => ({
      '--primary': primaryColor,
      '--secondary': secondaryColor,
      '--split': `${split}%`,
      '--zoom': scale,
      backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
    }),
    [imageUrl, primaryColor, scale, secondaryColor, split],
  ) as CSSProperties;

  async function handleExport() {
    if (!posterRef.current) {
      message.error('预览区域尚未准备好');
      return;
    }

    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = 'luoxiaohei-poster.png';
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
          <Typography.Title level={4}>罗小黑人物双色海报</Typography.Title>
          <Typography.Paragraph className="panel-desc">
            上传图片后，调整双色分割、标题与缩放比例，实时查看最终画面。
          </Typography.Paragraph>
        </div>
      </div>

      {!panelCollapsed ? (
        <div className="panel-scroll">
          <Form layout="vertical" requiredMark={false}>
            <Form.Item label="主标题">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Form.Item>
            <Form.Item label="副标题">
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </Form.Item>
            <Form.Item label="上传人物图片">
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p>点击或拖拽上传</p>
              </Dragger>
            </Form.Item>
            <Form.Item label="主色">
              <ColorPicker value={primaryColor} onChange={(c) => setPrimaryColor(c.toHexString())} showText />
            </Form.Item>
            <Form.Item label="辅色">
              <ColorPicker
                value={secondaryColor}
                onChange={(c) => setSecondaryColor(c.toHexString())}
                showText
              />
            </Form.Item>
            <Form.Item label="双色分割比例">
              <Slider min={20} max={80} value={split} onChange={setSplit} />
            </Form.Item>
            <Form.Item label="人物缩放">
              <Slider min={0.7} max={1.3} step={0.01} value={scale} onChange={setScale} />
            </Form.Item>
          </Form>
        </div>
      ) : null}
    </Card>
  );

  const preview = (
    <div className="preview-column">
      <div className="preview-toolbar">
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
          导出图片
        </Button>
      </div>
      <div ref={posterRef} className="poster-shell">
        <div className="two-tone-poster" style={posterStyle}>
          <div className="poster-overlay" />
          <div className="poster-text">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
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
