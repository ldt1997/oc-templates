import {
  Button,
  Card,
  ColorPicker,
  Form,
  Input,
  Slider,
  Typography,
  Upload,
  type UploadProps,
} from "antd";
import { InboxOutlined, SwapOutlined } from "@ant-design/icons";
import type { ColorPair } from "./colorRecommendation";

const { Dragger } = Upload;

interface LuoxiaoheiControlPanelProps {
  uploadProps: UploadProps;
  imageScale: number;
  onImageScaleChange: (value: number) => void;
  colorPairs: ColorPair[];
  selectedPairId: string;
  onPickPair: (pair: ColorPair) => void;
  bgColor1: string;
  bgColor2: string;
  onBgColor1Change: (value: string) => void;
  onBgColor2Change: (value: string) => void;
  onSwapBackgroundColors: () => void;
  title1: string;
  title2: string;
  onTitle1Change: (value: string) => void;
  onTitle2Change: (value: string) => void;
  name: string;
  onNameChange: (value: string) => void;
  logoColor: string;
  onLogoColorChange: (value: string) => void;
  isMobileMode: boolean;
}

export function LuoxiaoheiControlPanel({
  uploadProps,
  imageScale,
  onImageScaleChange,
  colorPairs,
  selectedPairId,
  onPickPair,
  bgColor1,
  bgColor2,
  onBgColor1Change,
  onBgColor2Change,
  onSwapBackgroundColors,
  title1,
  title2,
  onTitle1Change,
  onTitle2Change,
  name,
  onNameChange,
  logoColor,
  onLogoColorChange,
  isMobileMode,
}: LuoxiaoheiControlPanelProps) {
  return (
    <Card className="control-card" bordered={false}>
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
              onChange={onImageScaleChange}
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
                    onClick={() => onPickPair(pair)}
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
                onChange={(c) => onBgColor1Change(c.toHexString())}
                showText
              />
            </Form.Item>

            <div className="luoxiaohei-inline-color-swap">
              <Button
                type="default"
                shape="circle"
                icon={<SwapOutlined />}
                aria-label="对调背景色和左右标题"
                className="luoxiaohei-inline-color-swap-btn"
                onClick={onSwapBackgroundColors}
              />
            </div>

            <Form.Item
              label="背景色 2"
              className="luoxiaohei-inline-color-item"
            >
              <ColorPicker
                value={bgColor2}
                onChange={(c) => onBgColor2Change(c.toHexString())}
                showText
              />
            </Form.Item>
          </div>

          <Form.Item label="左边标题">
            <Input
              maxLength={5}
              value={title1}
              onChange={(e) => onTitle1Change(e.target.value)}
              placeholder="五个汉字以内"
            />
          </Form.Item>

          <Form.Item label="右边标题">
            <Input
              maxLength={5}
              value={title2}
              onChange={(e) => onTitle2Change(e.target.value)}
              placeholder="五个汉字以内"
            />
          </Form.Item>

          <Form.Item label="人物名称">
            <Input
              maxLength={5}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="五个汉字以内"
            />
          </Form.Item>

          {!isMobileMode ? (
            <Form.Item label="Logo 颜色">
              <ColorPicker
                value={logoColor}
                onChange={(c) => onLogoColorChange(c.toHexString())}
                showText
              />
            </Form.Item>
          ) : null}
        </Form>
      </div>
    </Card>
  );
}
