import { templates } from '../data/templates';
import { TemplateCard } from '../components/template/TemplateCard';

const categories = ['全部', '人物海报', '社媒封面', '拼贴模板', '电商主图', '品牌视觉'];

export function HomePage() {
  return (
    <section>
      <div className="hero-block">
        <p className="eyebrow">Photo Template Marketplace</p>
        <h1>像逛旅行民宿一样，挑选你的图片版式模板</h1>
        <p className="hero-desc">
          先选模板，再上传图片并调整参数。当前已开放“罗小黑人物双色海报”，其余模板将持续上线。
        </p>
      </div>

      <div className="category-strip" role="tablist" aria-label="模板分类">
        {categories.map((category, index) => (
          <button key={category} className={`category-pill ${index === 0 ? 'active' : ''}`} type="button">
            {category}
          </button>
        ))}
      </div>

      <div className="template-grid">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </section>
  );
}
