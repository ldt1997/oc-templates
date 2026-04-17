import { Card, Tag, Button } from 'antd';
import { Link } from 'react-router-dom';
import type { TemplateMeta } from '../../types/template';

interface TemplateCardProps {
  template: TemplateMeta;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const isAvailable = template.route !== '/';

  return (
    <Card
      className="template-card"
      cover={<img src={template.cover} alt={template.name} loading="lazy" />}
      bordered={false}
    >
      <h3>{template.name}</h3>
      <p>{template.description}</p>
      <div className="template-tags">
        {template.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      <Link to={template.route}>
        <Button type={isAvailable ? 'primary' : 'default'} disabled={!isAvailable} block>
          {isAvailable ? '打开模板' : '敬请期待'}
        </Button>
      </Link>
    </Card>
  );
}
