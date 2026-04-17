import type { TemplateMeta } from '../types/template';

export const templates: TemplateMeta[] = [
  {
    id: 'luoxiaohei',
    name: '罗小黑人物双色海报',
    description:
      '上传人物图后，通过双色映射、主副标题和版式参数快速生成风格统一的视觉海报。',
    cover:
      'https://images.unsplash.com/photo-1614102073832-030967418971?auto=format&fit=crop&w=1200&q=80',
    route: '/luoxiaohei',
    tags: ['海报', '人物', '双色'],
  },
  {
    id: 'coming-soon-1',
    name: '拼贴风九宫格（规划中）',
    description: '适合旅行和活动照片合集，支持边框、贴纸和随机布局。',
    cover:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    route: '/',
    tags: ['即将上线'],
  },
  {
    id: 'coming-soon-2',
    name: '社媒故事长图（规划中）',
    description: '为移动端内容准备的纵向长图模板，强调阅读节奏和信息层级。',
    cover:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    route: '/',
    tags: ['即将上线'],
  },
];
