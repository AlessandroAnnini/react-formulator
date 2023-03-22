import { DevTool } from '@hookform/devtools';
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import React from 'react';
import {
  useForm,
  useFieldArray,
  Controller,
  useFormState,
  UseFormReturn,
} from 'react-hook-form';
import { ErrorText } from './error-text';
import { IComponentMap, ISchemaItem, FormulatorProps } from './types';

// const createDefaultFieldArrayValue = (
//   item: ISchemaItem,
//   defaultValue: any = {}
// ): any => {
//   if (!item.items) {
//     return defaultValue;
//   }

//   item.items.forEach(subItem => {
//     if (subItem.type === 'field') {
//       defaultValue[subItem.rhfProps.name] = '';
//     } else if (subItem.type === 'fieldArray') {
//       defaultValue[subItem.rhfProps.name] = [
//         createDefaultFieldArrayValue(subItem),
//       ];
//     }
//   });

//   return defaultValue;
// };

const FieldArrayComponent: React.FC<{
  item: ISchemaItem;
  componentMap: IComponentMap;
  form: UseFormReturn;
  fieldNamePrefix: string;
}> = ({ item, componentMap, form, fieldNamePrefix }) => {
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${fieldNamePrefix}${item.rhfProps?.name}`,
  });

  if (!item.items || !item.items.length) {
    throw new Error('FieldArrayComponent: item.items is required');
  }

  // -- already insert an empty fieldArray obj
  // const defaultFieldArrayValue = React.useMemo(
  //   () => createDefaultFieldArrayValue(item),
  //   [item]
  // );

  // use like
  // onClick={() => append(defaultFieldArrayValue)}

  return (
    <Grid container {...item.gridProps}>
      {fields.map((_, index) => (
        <React.Fragment key={`${item.compName}-${index}`}>
          {item.items &&
            item.items
              ?.filter((i) => i.type !== 'append' && i.type !== 'remove')
              .map((subItem, subIndex) => (
                <Grid
                  {...subItem.gridProps}
                  key={`${item.compName}-${index}-${subIndex}`}>
                  {renderSchemaItem(
                    subItem,
                    componentMap,
                    form,
                    `${fieldNamePrefix}${item.rhfProps?.name}[${index}].`
                  )}
                </Grid>
              ))}
          {item.items &&
            item.items
              .filter((i) => i.type === 'remove')
              .map((i) => (
                <Grid {...i.gridProps}>
                  <Button {...i.compProps} onClick={() => remove(index)} />
                </Grid>
              ))}
        </React.Fragment>
      ))}
      {item.items
        .filter((i) => i.type === 'append')
        .map((i) => (
          <Grid {...i.gridProps}>
            <Button {...i.compProps} onClick={() => append({})} />
          </Grid>
        ))}
    </Grid>
  );
};

// Render schema items based on their type
const renderSchemaItem = (
  item: ISchemaItem,
  componentMap: IComponentMap,
  form: UseFormReturn,
  fieldNamePrefix = ''
) => {
  // Render field array items
  if (item.type === 'fieldArray') {
    return (
      <FieldArrayComponent
        item={item}
        componentMap={componentMap}
        form={form}
        fieldNamePrefix={fieldNamePrefix}
      />
    );
  }

  if (!item.compName)
    throw new Error(`compName is required! ${JSON.stringify(item)}`);

  const Component = componentMap[item.compName];

  if (!Component)
    throw new Error(
      `Component ${item.compName} not found! ${JSON.stringify(item)}`
    );

  // Render component items
  if (item.type === 'component') {
    return <Component {...item.compProps} />;
  }

  // Render field items
  if (
    item.type === 'field' &&
    item.rhfProps &&
    // if render rule does not exists or its conditional is verified true
    // then procede with the render
    (typeof item.renderIf === 'undefined' || item.renderIf)
  ) {
    const {
      control,
      formState: { errors },
    } = form;

    return (
      <>
        <Controller
          control={control}
          {...item.rhfProps}
          name={`${fieldNamePrefix}${item.rhfProps.name}`}
          render={({ field }) => <Component {...item.compProps} {...field} />}
        />
        <ErrorMessage
          errors={errors}
          name={`${fieldNamePrefix}${item.rhfProps.name}`}
          render={({ message }) => <ErrorText>{message}</ErrorText>}
        />
      </>
    );
  }

  if (
    item.type === 'field' &&
    item.rhfProps &&
    // if render rule exists and its conditional is verified false
    // then prevent the render
    typeof item.renderIf !== 'undefined' &&
    !item.renderIf
  ) {
    const { getValues, setValue } = form;

    const currentVal = getValues(`${fieldNamePrefix}${item.rhfProps.name}`);

    if (currentVal !== null)
      setValue(`${fieldNamePrefix}${item.rhfProps.name}`, null);
  }
};

const FormulatorBase: React.FC<FormulatorProps> = ({
  schema,
  componentMap,
  zodValidation,
  form,
  onSubmit,
  isDebug,
}) => {
  // Initialize useForm with zodResolver for form validation
  const rhfForm = useForm({
    resolver: zodResolver(zodValidation),
  });

  // Use the form prop if it is passed in, otherwise use the useForm hook
  const currentForm = form || rhfForm;

  const { control, handleSubmit, watch } = currentForm;

  // Add the useFormState hook to observe the form values
  const { isDirty } = useFormState({ control });

  // Watch the form values, including nested field arrays
  const watchedValues = watch();

  // Update the onSubmit function to use watchedValues instead of handleSubmit's data
  const handleFormSubmit = () => {
    if (isDirty) {
      onSubmit(watchedValues);
    }
  };

  // Render the form with schema and component map
  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container {...schema.gridProps}>
          {/* Iterate through schema items and render them */}
          {schema.items.map((item, index) => (
            <Grid {...item.gridProps} key={`${item.compName}-${index}`}>
              {renderSchemaItem(item, componentMap, currentForm, '')}
            </Grid>
          ))}
        </Grid>
      </form>
      {isDebug ? <DevTool control={control} /> : null}
    </>
  );
};

export const Formulator = React.memo(FormulatorBase);
