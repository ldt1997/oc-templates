import { useEffect, useRef, useState } from "react";
import { message, type UploadFile, type UploadProps } from "antd";
import { TemplateWorkbenchLayout } from "@/components/template/TemplateWorkbenchLayout";
import { exportElementAsPng } from "@/utils/exportImage";
import {
  buildColorPairsFromImage,
  hexToRgbTuple,
  type ColorPair,
  type PaletteColor,
} from "./components/colorRecommendation";
import { fileToDataUrl } from "./components/fileToDataUrl";
import { LuoxiaoheiControlPanel } from "./components/LuoxiaoheiControlPanel";
import { LuoxiaoheiPreview } from "./components/LuoxiaoheiPreview";
import { useCanvasBaseFontSize } from "./components/useCanvasBaseFontSize";
import "../TemplatePage.css";
import "./index.css";

export function LuoxiaoheiPage() {
  // 状态管理
  const [bgColor1, setBgColor1] = useState("#ff385c"); // Rausch Red
  const [bgColor2, setBgColor2] = useState("#222222"); // 深灰
  const [logoColor, setLogoColor] = useState("#690f11");
  const [title1, setTitle1] = useState("朝");
  const [title2, setTitle2] = useState("晚");
  const [name, setName] = useState("名称");
  const [userImage, setUserImage] = useState<string>("");
  const [imageScale, setImageScale] = useState(1.2);
  const [canvasScale, setCanvasScale] = useState(1);
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [colorPairs, setColorPairs] = useState<ColorPair[]>([]);
  const [selectedPairId, setSelectedPairId] = useState<string>("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasBaseFontSize = useCanvasBaseFontSize(canvasRef);

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
    const mediaQuery = window.matchMedia("(max-width: 960px)");
    const updateMobileMode = () => {
      const byUa = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent || "");
      setIsMobileMode(byUa || mediaQuery.matches);
    };

    updateMobileMode();
    mediaQuery.addEventListener("change", updateMobileMode);
    window.addEventListener("resize", updateMobileMode);

    return () => {
      mediaQuery.removeEventListener("change", updateMobileMode);
      window.removeEventListener("resize", updateMobileMode);
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

  function handlePickPair(pair: ColorPair) {
    setBgColor1(pair.left.value);
    setBgColor2(pair.right.value);
    setTitle1(pair.left.key);
    setTitle2(pair.right.key);
    setSelectedPairId(pair.id);
  }

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

  const panel = (
    <LuoxiaoheiControlPanel
      uploadProps={uploadProps}
      imageScale={imageScale}
      onImageScaleChange={setImageScale}
      colorPairs={colorPairs}
      selectedPairId={selectedPairId}
      onPickPair={handlePickPair}
      bgColor1={bgColor1}
      bgColor2={bgColor2}
      onBgColor1Change={setBgColor1}
      onBgColor2Change={setBgColor2}
      title1={title1}
      title2={title2}
      onTitle1Change={setTitle1}
      onTitle2Change={setTitle2}
      name={name}
      onNameChange={setName}
      logoColor={logoColor}
      onLogoColorChange={setLogoColor}
      isMobileMode={isMobileMode}
    />
  );

  const preview = (
    <LuoxiaoheiPreview
      canvasRef={canvasRef}
      canvasScale={canvasScale}
      onCanvasScaleChange={setCanvasScale}
      onExport={handleExport}
      canvasBaseFontSize={canvasBaseFontSize}
      bgColor1={bgColor1}
      bgColor2={bgColor2}
      title1={title1}
      title2={title2}
      userImage={userImage}
      imageScale={imageScale}
      logoColor={logoColor}
      isMobileMode={isMobileMode}
      name={name}
    />
  );

  return (
    <div className="luoxiaohei-page">
      <TemplateWorkbenchLayout
        panel={panel}
        preview={preview}
        collapsed={false}
        onToggleCollapsed={() => undefined}
        showDefaultToggle={false}
      />
    </div>
  );
}
