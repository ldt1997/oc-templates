import { useEffect, useRef, useState } from "react";
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
} from "antd";
import {
  DownloadOutlined,
  InboxOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { TemplateWorkbenchLayout } from "../../components/template/TemplateWorkbenchLayout";
import { getRgbString } from "../../utils/colorConverter";
import { exportElementAsPng } from "../../utils/exportImage";
import {
  buildColorPairsFromImage,
  hexToRgbTuple,
  type ColorPair,
  type PaletteColor,
} from "./components/colorRecommendation";
import "../TemplatePage.css";
import "./LuoxiaoheiPage.css";

const { Dragger } = Upload;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }
      reject(new Error("图片读取失败"));
    };
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

export function LuoxiaoheiPage() {
  // 状态管理
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [bgColor1, setBgColor1] = useState("#ff385c"); // Rausch Red
  const [bgColor2, setBgColor2] = useState("#222222"); // 深灰
  const [logoColor, setLogoColor] = useState("#690f11");
  const [title1, setTitle1] = useState("朝");
  const [title2, setTitle2] = useState("晚");
  const [name, setName] = useState("名称");
  const [userImage, setUserImage] = useState<string>("");
  const [imageScale, setImageScale] = useState(1.2);
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasBaseFontSize, setCanvasBaseFontSize] = useState(10);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [colorPairs, setColorPairs] = useState<ColorPair[]>([]);
  const [selectedPairId, setSelectedPairId] = useState<string>("");
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPalette() {
      try {
        const response = await fetch("/templates/luoxiaohei/cht-color.json", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("色卡文件加载失败");
        }
        const data = (await response.json()) as Record<string, string>;
        const colors: PaletteColor[] = Object.entries(data).map(
          ([key, value]) => ({
            key,
            value: value.toUpperCase(),
            rgb: hexToRgbTuple(value),
          }),
        );

        if (!cancelled) {
          setPalette(colors);
        }
      } catch {
        message.warning("cht-color 色卡读取失败，自动配色不可用");
      }
    }

    void loadPalette();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) {
      return;
    }

    function updateBaseFontSize(width: number) {
      const nextSize = Math.max(width / 108, 1);
      setCanvasBaseFontSize((current) =>
        Math.abs(current - nextSize) > 0.02 ? nextSize : current,
      );
    }

    updateBaseFontSize(canvasElement.getBoundingClientRect().width);

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      updateBaseFontSize(entry.contentRect.width);
    });

    observer.observe(canvasElement);
    return () => {
      observer.disconnect();
    };
  }, []);

  async function applyColorPairsFromImage(imageUrl: string) {
    const pairs = await buildColorPairsFromImage(imageUrl, palette, 3);
    setColorPairs(pairs);
    if (pairs.length > 0) {
      const firstPair = pairs[0];
      setSelectedPairId(firstPair.id);
      setBgColor1(firstPair.left.value);
      setBgColor2(firstPair.right.value);
      setTitle1(firstPair.left.key);
      setTitle2(firstPair.right.key);
    } else {
      setSelectedPairId("");
    }
  }

  // 图片上传处理
  const uploadProps: UploadProps = {
    accept: "image/*",
    maxCount: 1,
    beforeUpload: () => false,
    onChange: async (info) => {
      const file = info.fileList[0] as UploadFile | undefined;
      if (file?.originFileObj) {
        try {
          const dataUrl = await fileToDataUrl(file.originFileObj);
          setUserImage(dataUrl);
          await applyColorPairsFromImage(dataUrl);
        } catch {
          message.warning("图片读取或自动配色失败，可手动调整颜色");
        }
      }
    },
  };

  // 导出功能
  async function handleExport() {
    if (!canvasRef.current) {
      message.error("预览区域尚未准备好");
      return;
    }

    try {
      await exportElementAsPng(canvasRef.current, {
        fileName: "luoxiaohei-poster.png",
        width: 1080,
        height: 1920,
        backgroundColor: "#ffffff",
        pixelRatio: 1,
        styleOverride: {
          fontSize: "10px",
        },
      });
    } catch (error) {
      console.error("图片导出失败", error);
      message.error("导出失败，请重试");
    }
  }

  // 参数面板
  const panel = (
    <Card className="control-card" bordered={false}>
      <div className="panel-head">
        <div>
          <div className="luoxiaohei-panel-title-row">
            <Typography.Title level={4}>罗小黑人物双色海报</Typography.Title>
            <Button
              className="luoxiaohei-panel-toggle"
              type="text"
              aria-label={panelCollapsed ? "展开参数" : "收起参数"}
              icon={panelCollapsed ? <RightOutlined /> : <LeftOutlined />}
              onClick={() => setPanelCollapsed((value) => !value)}
            />
          </div>
          <Typography.Paragraph className="panel-desc">
            配置背景色、标题和图片，实时生成风格统一的视觉海报。
          </Typography.Paragraph>
        </div>
      </div>

      {!panelCollapsed ? (
        <div className="panel-scroll">
          <Form layout="vertical" requiredMark={false}>
            <Form.Item label="上传素材图片">
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p>点击或拖拽上传</p>
              </Dragger>
            </Form.Item>

            <Form.Item label="图片缩放">
              <Slider
                min={0.5}
                max={2}
                step={0.1}
                value={imageScale}
                onChange={setImageScale}
              />
            </Form.Item>

            <Form.Item label="推荐色卡">
              <div className="luoxiaohei-color-pair-list">
                {colorPairs.length === 0 ? (
                  <Typography.Text type="secondary">
                    上传图片后将自动生成双色推荐
                  </Typography.Text>
                ) : (
                  colorPairs.map((pair) => (
                    <button
                      key={pair.id}
                      type="button"
                      className={`luoxiaohei-color-pair-btn ${selectedPairId === pair.id ? "is-active" : ""}`}
                      style={{
                        background: `linear-gradient(90deg, ${pair.left.value} 0 50%, ${pair.right.value} 50% 100%)`,
                      }}
                      onClick={() => {
                        setBgColor1(pair.left.value);
                        setBgColor2(pair.right.value);
                        setTitle1(pair.left.key);
                        setTitle2(pair.right.key);
                        setSelectedPairId(pair.id);
                      }}
                      aria-label={`${pair.left.key} 与 ${pair.right.key}`}
                    >
                      <span>{pair.left.key}</span>
                      <span>{pair.right.key}</span>
                    </button>
                  ))
                )}
              </div>
            </Form.Item>

            <div className="luoxiaohei-inline-color-row">
              <Form.Item
                label="背景色 1"
                className="luoxiaohei-inline-color-item"
              >
                <ColorPicker
                  value={bgColor1}
                  onChange={(c) => setBgColor1(c.toHexString())}
                  showText
                />
              </Form.Item>

              <Form.Item
                label="背景色 2"
                className="luoxiaohei-inline-color-item"
              >
                <ColorPicker
                  value={bgColor2}
                  onChange={(c) => setBgColor2(c.toHexString())}
                  showText
                />
              </Form.Item>
            </div>

            <Form.Item label="左边标题">
              <Input
                maxLength={5}
                value={title1}
                onChange={(e) => setTitle1(e.target.value)}
                placeholder="五个汉字以内"
              />
            </Form.Item>

            <Form.Item label="右边标题">
              <Input
                maxLength={5}
                value={title2}
                onChange={(e) => setTitle2(e.target.value)}
                placeholder="五个汉字以内"
              />
            </Form.Item>

            <Form.Item label="人物名称">
              <Input
                maxLength={5}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="五个汉字以内"
              />
            </Form.Item>

            <Form.Item label="Logo 颜色">
              <ColorPicker
                value={logoColor}
                onChange={(c) => setLogoColor(c.toHexString())}
                showText
              />
            </Form.Item>
          </Form>
        </div>
      ) : null}
    </Card>
  );

  // 预览区：6层图层堆叠
  const preview = (
    <div className="preview-column">
      <div
        className="preview-toolbar"
        style={{ gap: "12px", alignItems: "center" }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "var(--palette-text-secondary)",
            whiteSpace: "nowrap",
          }}
        >
          缩放
        </span>
        <Slider
          className="luoxiaohei-canvas-scale-slider"
          min={0.5}
          max={1}
          step={0.1}
          value={canvasScale}
          onChange={setCanvasScale}
          style={{ flex: 1, minWidth: "120px" }}
        />
        <span
          style={{
            fontSize: "12px",
            color: "var(--palette-text-secondary)",
            minWidth: "32px",
          }}
        >
          {(canvasScale * 100).toFixed(0)}%
        </span>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          导出
        </Button>
      </div>

      <div
        className="luoxiaohei-canvas-stage"
        style={{
          transform: `scale(${canvasScale})`,
          transformOrigin: "top center",
          transition: "transform 0.2s ease",
        }}
      >
        <div
          ref={canvasRef}
          className="luoxiaohei-canvas"
          style={{
            fontSize: `${canvasBaseFontSize}px`,
          }}
        >
        {/* 1. 白色背景 - 默认 */}

        {/* 2. 双色渐变背景 */}
        <div className="luoxiaohei-bg">
          <div
            className="luoxiaohei-bg-left"
            style={{
              background: `linear-gradient(to bottom, ${bgColor1} 0%, ${bgColor1} 38%, #ffffff 100%)`,
            }}
          />
          <div
            className="luoxiaohei-bg-right"
            style={{
              background: `linear-gradient(to bottom, ${bgColor2} 0%, ${bgColor2} 38%, #ffffff 100%)`,
            }}
          />
        </div>

        {/* 3. 竹子素材层 */}
        <div
          className="luoxiaohei-bamboo"
          style={{
            backgroundImage: "url(/templates/luoxiaohei/photos/bamboo.png)",
          }}
        />

        {/* 4. 左上角文字块 - 背景色2色 */}
        <div
          className="luoxiaohei-text-block luoxiaohei-text-left"
          style={{ color: bgColor2 }}
        >
          <div className="luoxiaohei-title">{title1}</div>
          <div className="luoxiaohei-text-small">
            <div>{getRgbString(bgColor1)}</div>
            <div>{bgColor1}</div>
          </div>
        </div>

        {/* 4. 右上角文字块 - 背景色1色 */}
        <div
          className="luoxiaohei-text-block luoxiaohei-text-right"
          style={{ color: bgColor1 }}
        >
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
          <div
            aria-label="logo"
            className="luoxiaohei-logo luoxiaohei-logo-mask"
            style={{ backgroundColor: logoColor }}
          />

          <div className="luoxiaohei-name-frame" aria-label="人物名称">
            <img
              className="luoxiaohei-name-frame-image"
              src="/templates/luoxiaohei/photos/nameframe.png"
              alt=""
              aria-hidden="true"
              draggable={false}
            />
            <div className="luoxiaohei-name-text">{name}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <TemplateWorkbenchLayout
      panel={panel}
      preview={preview}
      collapsed={false}
      onToggleCollapsed={() => undefined}
      showDefaultToggle={false}
    />
  );
}
