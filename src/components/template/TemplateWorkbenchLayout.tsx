import type { CSSProperties, ReactNode } from 'react';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import './TemplateWorkbenchLayout.css';

interface TemplateWorkbenchLayoutProps {
  panel: ReactNode;
  preview: ReactNode;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  showDefaultToggle?: boolean;
}

export function TemplateWorkbenchLayout({
  panel,
  preview,
  collapsed,
  onToggleCollapsed,
  showDefaultToggle = true,
}: TemplateWorkbenchLayoutProps) {
  return (
    <section
      className={`template-workbench ${collapsed ? 'is-collapsed' : ''}`}
      style={{ '--panel-width': collapsed ? '0px' : '390px' } as CSSProperties}
    >
      {showDefaultToggle ? (
        <Button
          className="workbench-toggle"
          type="text"
          aria-label={collapsed ? '展开面板' : '收起面板'}
          icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
          onClick={onToggleCollapsed}
        />
      ) : null}
      <aside className="workbench-panel">{panel}</aside>
      <article className="workbench-preview">{preview}</article>
    </section>
  );
}
