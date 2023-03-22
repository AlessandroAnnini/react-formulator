import { Grid2Props } from '@mui/material';
import { UseFormReturn } from 'react-hook-form';

export interface IComponentMap {
  [key: string]: React.ComponentType<any>;
}

export enum ItemType {
  COMPONENT = 'component',
  FIELD = 'field',
  FIELD_ARRAY = 'fieldArray',
  APPEND = 'append',
  REMOVE = 'remove',
}

export interface ISchemaItem {
  type: ItemType | string;
  gridProps: Grid2Props;
  compName: string;
  renderIf?: boolean;
  compProps?: Record<string, any>;
  rhfProps?: Record<string, any>;
  items?: ISchemaItem[];
}

export interface ISchema {
  version: string;
  gridProps: Grid2Props;
  items: ISchemaItem[];
}

export interface FormulatorProps {
  schema: ISchema;
  componentMap: IComponentMap;
  zodValidation: any;
  form?: UseFormReturn;
  onSubmit: (data: any) => void;
  isDebug?: boolean;
}
