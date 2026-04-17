import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { Card, ColorPicker, Form, Input, Button, Slider, Typography, Upload, message, type UploadFile, type UploadProps } from 'antd';
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import { toPng } from 'html-to-image';
import { TemplateWorkbenchLayout } from '../../components/template/TemplateWorkbenchLayout';
import { getRgbString, hexToRgb } from '../../utils/colorConverter';
import '../TemplatePage.css';
import './LuoxiaoheiPage.css';

const { Dragger } = Upload;

export function LuoxiaoheiPage() {
  // 状态管理
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [bgColor1, setBgColor1] = useState('#ff385c'); // Rausch Red
  const [bgColor2, setBgColor2] = useState('#222222'); // 深灰
  const [logoColor, setLogoColor] = useState('#ff385c');
  const [title1, setTitle1] = useState('朝');
  const [title2, setTitle2] = useState('晚');
  const [userImage, setUserImage] = useState<string>('');
  const [imageScale, setImageScale] = useState(1);
  const [canvasScale, setCanvasScale] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  // 图片上传处理
  const uploadProps: UploadProps = {
    accept: 'image/*',
    maxCount: 1,
    beforeUpload: () => false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (info: any) => {
      const file = info.fileList[0] as UploadFile | undefined;
      if (file?.originFileObj) {
        const url = URL.createObjectURL(file.originFileObj);
        setUserImage(url);
      }
    },
  };

  // 导出功能
  async function handleExport() {
    if (!canvasRef.current) {
      message.error('预览区域尚未准备好');
      return;
    }

    try {
      const dataUrl = await toPng(canvasRef.current, {
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

  // 计算渐变背景样式
  const gradientStyle = useMemo(() => {
    return {
      background: `linear-gradient(to bottom, ${bgColor1}, ${bgColor1}, white), 
                 linear-gradient(to bottom, ${bgColor2}, ${bgColor2}, white)`,
      backgroundSize: '50% 100%, 50% 100%',
      backgroundPosition: '0 0, 50% 0',
      backgroundRepeat: 'no-repeat',
    };
  }, [bgColor1, bgColor2]);

  // Logo 颜色过滤器（用 CSS filter 实现着色）
  const logoFilterStyle = useMemo(() => {
    const rgb = hexToRgb(logoColor);
    if (!rgb) return {};
    
    // 简化：将logo应用颜色，通过mix-blend-mode或filter
    // 这里用 filter 的 hue-rotate 和 saturate，实际可能需要调整
    return {
      filter: `brightness(0) saturate(100%) invert(1) sepia(1) saturate(2) hue-rotate(0deg)`,
      mixBlendMode: 'multiply' as const,
    };
  }, [logoColor]);

  // 参数面板
  const panel = (
    <Card className="control-card" bordered={false}>
      <div className="panel-head">
        <div>
          <Typography.Title level={4}>罗小黑人物双色海报</Typography.Title>
          <Typography.Paragraph className="panel-desc">
            配置背景色、标题和图片，实时生成风格统一的视觉海报。
          </Typography.Paragraph>
        </div>
      </div>

      {!panelCollapsed ? (
        <div className="panel-scroll">
          <Form layout="vertical" requiredMark={false}>
            <Form.Item label="背景色 1">
              <ColorPicker value={bgColor1} onChange={(c) => setBgColor1(c.toHexString())} showText />
            </Form.Item>

            <Form.Item label="背景色 2">
              <ColorPicker value={bgColor2} onChange={(c) => setBgColor2(c.toHexString())} showText />
            </Form.Item>

            <Form.Item label="标题 1（竖向）">
              <Input
                maxLength={5}
                value={title1}
                onChange={(e) => setTitle1(e.target.value)}
                placeholder="单个汉字"
              />
            </Form.Item>

            <Form.Item label="标题 2（竖向）">
              <Input
                maxLength={5}
                value={title2}
                onChange={(e) => setTitle2(e.target.value)}
                placeholder="单个汉字"
              />
            </Form.Item>

            <Form.Item label="上传素材图片">
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p>点击或拖拽上传</p>
              </Dragger>
            </Form.Item>

            <Form.Item label="图片缩放">
              <Slider min={0.5} max={2} step={0.1} value={imageScale} onChange={setImageScale} />
            </Form.Item>

            <Form.Item label="Logo 颜色">
              <ColorPicker value={logoColor} onChange={(c) => setLogoColor(c.toHexString())} showText />
            </Form.Item>
          </Form>
        </div>
      ) : null}
    </Card>
  );

  // 预览区：6层图层堆叠
  const preview = (
    <div className="preview-column">
      <div className="preview-toolbar" style={{ gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--palette-text-secondary)', whiteSpace: 'nowrap' }}>
          缩放
        </span>
        <Slider
          min={0.5}
          max={1.5}
          step={0.1}
          value={canvasScale}
          onChange={setCanvasScale}
          style={{ flex: 1, minWidth: '120px' }}
        />
        <span style={{ fontSize: '12px', color: 'var(--palette-text-secondary)', minWidth: '32px' }}>
          {(canvasScale * 100).toFixed(0)}%
        </span>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
          导出图片
        </Button>
      </div>

      <div
        ref={canvasRef}
        className="luoxiaohei-canvas"
        style={{
          transform: `scale(${canvasScale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease',
        }}
      >
        {/* 1. 白色背景 - 默认 */}

        {/* 2. 双色渐变背景 */}
        <div className="luoxiaohei-bg" style={gradientStyle as CSSProperties} />

        {/* 3. 竹子素材层 */}
        <div
          className="luoxiaohei-bamboo"
          style={{
            backgroundImage: 'url(/templates/luoxiaohei/photos/bamboo.png)',
          }}
        />

        {/* 4. 左上角文字块 - 背景色2色 */}
        <div className="luoxiaohei-text-block luoxiaohei-text-left" style={{ color: bgColor2 }}>
          <div className="luoxiaohei-title">{title1}</div>
          <div className="luoxiaohei-text-small">
            <div>{getRgbString(bgColor1)}</div>
            <div>{bgColor1}</div>
          </div>
        </div>

        {/* 4. 右上角文字块 - 背景色1色 */}
        <div className="luoxiaohei-text-block luoxiaohei-text-right" style={{ color: bgColor1 }}>
          <div className="luoxiaohei-title">{title2}</div>
          <div className="luoxiaohei-text-small">
            <div>{getRgbString(bgColor2)}</div>
            <div>{bgColor2}</div>
          </div>
        </div>

        {/* 5. 用户上传的图片 */}
        {userImage && (
          <img
            src={userImage}
            alt="用户上传"
            className="luoxiaohei-user-image"
            style={{
              transform: `translate(-50%, -50%) scale(${imageScale})`,
            }}
          />
        )}

        {/* 6. Logo */}
        <img
          src="/templates/luoxiaohei/photos/luoxiaoheilogo.png"
          alt="logo"
          className="luoxiaohei-logo"
          style={logoFilterStyle}
        />
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
