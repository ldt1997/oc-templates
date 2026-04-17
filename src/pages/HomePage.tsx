import { templates } from '../data/templates';
import { TemplateCard } from '../components/template/TemplateCard';

export function HomePage() {
  return (
    <section className="home-page">
      <div className="template-grid">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </section>
  );
}
