import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type SeoMeta = {
  title: string;
  description: string;
};

const DEFAULT_META: SeoMeta = {
  title: 'OC Templates - 在线视觉模板生成器',
  description: '上传图片并自动提取双色映射色卡，快速生成可编辑、可导出的视觉模板海报。',
};

const ROUTE_META: Record<string, SeoMeta> = {
  '/': {
    title: 'OC Templates - 在线视觉模板生成器',
    description: '上传图片并自动提取双色映射色卡，快速生成可编辑、可导出的视觉模板海报。',
  },
  '/luoxiaohei': {
    title: '罗小黑双色海报模板 - OC Templates',
    description: '上传人物图，自动提取双色并映射色卡，实时编辑标题与姓名边框，一键导出海报。',
  },
};

function ensureMetaByName(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function ensureMetaByProperty(property: string, content: string) {
  let element = document.querySelector(
    `meta[property="${property}"]`,
  ) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function ensureCanonical(url: string) {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

export function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const routeMeta = ROUTE_META[location.pathname] ?? DEFAULT_META;
    const canonicalUrl = `${window.location.origin}${location.pathname}`;

    document.title = routeMeta.title;
    ensureMetaByName('description', routeMeta.description);
    ensureMetaByName('robots', 'index,follow');

    ensureMetaByProperty('og:type', 'website');
    ensureMetaByProperty('og:title', routeMeta.title);
    ensureMetaByProperty('og:description', routeMeta.description);
    ensureMetaByProperty('og:url', canonicalUrl);

    ensureMetaByName('twitter:card', 'summary_large_image');
    ensureMetaByName('twitter:title', routeMeta.title);
    ensureMetaByName('twitter:description', routeMeta.description);

    ensureCanonical(canonicalUrl);
  }, [location.pathname]);

  return null;
}
