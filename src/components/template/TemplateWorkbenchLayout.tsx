import type { CSSProperties, ReactNode } from 'react';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import './TemplateWorkbenchLayout.css';

interface TemplateWorkbenchLayoutProps {
  panel: ReactNode;
  preview: ReactNode;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function TemplateWorkbenchLayout({
  panel,
  preview,
  collapsed,
  onToggleCollapsed,
}: TemplateWorkbenchLayoutProps) {
  return (
    <section
      className={`template-workbench ${collapsed ? 'is-collapsed' : ''}`}
      style={{ '--panel-width': collapsed ? '0px' : '390px' } as CSSProperties}
    >
      <Button
        className="workbench-toggle"
        type="text"
        aria-label={collapsed ? '展开面板' : '收起面板'}
        icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
        onClick={onToggleCollapsed}
      />
      <aside className="workbench-panel">{panel}</aside>
      <article className="workbench-preview">{preview}</article>
    </section>
  );
}
