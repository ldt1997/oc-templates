import type { RefObject } from "react";
import { Button, Slider } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { getRgbString } from "@/utils/colorConverter";

interface LuoxiaoheiPreviewProps {
  canvasRef: RefObject<HTMLDivElement | null>;
  canvasScale: number;
  onCanvasScaleChange: (value: number) => void;
  onExport: () => void;
  canvasBaseFontSize: number;
  bgColor1: string;
  bgColor2: string;
  title1: string;
  title2: string;
  userImage: string;
  imageScale: number;
  logoColor: string;
  name: string;
}

export function LuoxiaoheiPreview({
  canvasRef,
  canvasScale,
  onCanvasScaleChange,
  onExport,
  canvasBaseFontSize,
  bgColor1,
  bgColor2,
  title1,
  title2,
  userImage,
  imageScale,
  logoColor,
  name,
}: LuoxiaoheiPreviewProps) {
  return (
    <div className="preview-column">
      <div className="preview-toolbar" style={{ gap: "12px", alignItems: "center" }}>
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
          onChange={onCanvasScaleChange}
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
        <Button type="primary" icon={<DownloadOutlined />} onClick={onExport}>
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

          <div
            className="luoxiaohei-bamboo"
            style={{
              backgroundImage: "url(/templates/luoxiaohei/photos/bamboo.png)",
            }}
          />

          <div className="luoxiaohei-text-block luoxiaohei-text-left" style={{ color: bgColor2 }}>
            <div className="luoxiaohei-title">{title1}</div>
            <div className="luoxiaohei-text-small">
              <div>{getRgbString(bgColor1)}</div>
              <div>{bgColor1}</div>
            </div>
          </div>

          <div className="luoxiaohei-text-block luoxiaohei-text-right" style={{ color: bgColor1 }}>
            <div className="luoxiaohei-title">{title2}</div>
            <div className="luoxiaohei-text-small">
              <div>{getRgbString(bgColor2)}</div>
              <div>{bgColor2}</div>
            </div>
          </div>

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
}
