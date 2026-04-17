import { Segmented } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useThemeMode } from '../../theme/theme-state';

export function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <Segmented
      value={mode}
      options={[
        { label: <SunOutlined />, value: 'light' },
        { label: <MoonOutlined />, value: 'dark' },
      ]}
      onChange={toggleMode}
      aria-label="切换明暗主题"
    />
  );
}
