import { templates } from '../data/templates';
import { TemplateCard } from '../components/template/TemplateCard';

export function HomePage() {
  return (
    <section>
      <div className="hero-block">
        <p className="eyebrow">Image Template Studio</p>
        <h1>选择模版，上传图片，快速产出理想视觉稿</h1>
        <p className="hero-desc">
          你可以在每个模板页修改参数并实时预览结果。当前已开放“罗小黑人物双色海报”模板。
        </p>
      </div>

      <div className="template-grid">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </section>
  );
}
