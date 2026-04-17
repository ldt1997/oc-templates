import type { ReactNode } from 'react';

interface TemplateWorkbenchLayoutProps {
  panel: ReactNode;
  preview: ReactNode;
}

export function TemplateWorkbenchLayout({ panel, preview }: TemplateWorkbenchLayoutProps) {
  return (
    <section className="template-workbench">
      <aside className="workbench-panel">{panel}</aside>
      <article className="workbench-preview">{preview}</article>
    </section>
  );
}
