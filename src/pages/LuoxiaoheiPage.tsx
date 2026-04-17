import { useMemo, useState, type CSSProperties, useEffect } from 'react';
import {
  Card,
  ColorPicker,
  Form,
  Input,
  Slider,
  Typography,
  Upload,
  type UploadFile,
  type UploadProps,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { TemplateWorkbenchLayout } from '../components/template/TemplateWorkbenchLayout';

const { Dragger } = Upload;

export function LuoxiaoheiPage() {
  const [title, setTitle] = useState('罗小黑 · 双色人像海报');
  const [subtitle, setSubtitle] = useState('YOUR STORY, IN TWO TONES');
  const [primaryColor, setPrimaryColor] = useState('#02492a');
  const [secondaryColor, setSecondaryColor] = useState('#f8cc65');
  const [split, setSplit] = useState(46);
  const [scale, setScale] = useState(1);
  const [imageUrl, setImageUrl] = useState<string>('');

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

  const panel = (
    <Card className="control-card" bordered={false}>
      <Typography.Title level={4}>模板参数</Typography.Title>
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
    </Card>
  );

  const preview = (
    <div className="poster-shell">
      <div className="two-tone-poster" style={posterStyle}>
        <div className="poster-overlay" />
        <div className="poster-text">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
    </div>
  );

  return <TemplateWorkbenchLayout panel={panel} preview={preview} />;
}
