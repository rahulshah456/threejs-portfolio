import {
  PlayCircleOutlined,
  InfoCircleOutlined,
  ExperimentOutlined,
  PictureOutlined,
  FileTextOutlined,
  BuildOutlined,
  DashboardOutlined,
  TeamOutlined,
  PlaySquareOutlined,
  CloudUploadOutlined,
  DollarOutlined,
  EyeOutlined,
  BookOutlined,
  MobileOutlined,
  AppstoreOutlined,
  ExportOutlined,
  RocketOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

export function getIconComponent(iconName: string): ReactNode {
  const iconMap: Record<string, ReactNode> = {
    'play-circle': <PlayCircleOutlined />,
    'info-circle': <InfoCircleOutlined />,
    experiment: <ExperimentOutlined />,
    picture: <PictureOutlined />,
    'file-text': <FileTextOutlined />,
    build: <BuildOutlined />,
    dashboard: <DashboardOutlined />,
    team: <TeamOutlined />,
    'play-square': <PlaySquareOutlined />,
    'cloud-upload': <CloudUploadOutlined />,
    dollar: <DollarOutlined />,
    eye: <EyeOutlined />,
    book: <BookOutlined />,
    mobile: <MobileOutlined />,
    appstore: <AppstoreOutlined />,
    export: <ExportOutlined />,
    rocket: <RocketOutlined />,
    phone: <PhoneOutlined />,
  };

  return iconMap[iconName] || null;
}

export function getAvailableIconNames(): string[] {
  return [
    'play-circle',
    'info-circle',
    'experiment',
    'picture',
    'file-text',
    'build',
    'dashboard',
    'team',
    'play-square',
    'cloud-upload',
    'dollar',
    'eye',
    'book',
    'mobile',
    'appstore',
    'export',
    'rocket',
    'phone',
  ];
}
