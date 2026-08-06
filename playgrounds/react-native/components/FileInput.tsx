import type { FieldElementProps } from '@formisch/react-native';
import { clsx } from 'clsx';
import * as DocumentPicker from 'expo-document-picker';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { InputErrors } from './InputErrors.tsx';
import { InputLabel } from './InputLabel.tsx';

/**
 * File asset type.
 *
 * Hint: Unlike the DOM playgrounds files are plain asset objects, as React
 * Native has no `File` and document pickers return URI descriptors instead.
 */
export interface FileAsset {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

interface FileInputProps<TMultiple extends boolean> extends FieldElementProps {
  className?: string;
  label?: string;
  required?: boolean;
  multiple?: TMultiple;
  // Hint: The input is partial because the form store deep-partials the
  // asset objects of the schema
  input: Partial<FileAsset> | Partial<FileAsset>[] | null | undefined;
  errors: [string, ...string[]] | null;
  onValueChange: (
    input: TMultiple extends true ? FileAsset[] : FileAsset
  ) => void;
}

/**
 * File input field that users can press to select files. Various decorations
 * can be displayed in or around the field to communicate the entry
 * requirements.
 */
export function FileInput<TMultiple extends boolean = false>({
  label,
  input,
  errors,
  className,
  required,
  multiple,
  onValueChange,
  ref,
  onFocus,
}: FileInputProps<TMultiple>) {
  // Create computed value of selected files
  const files = useMemo(
    () => (input ? (Array.isArray(input) ? input : [input]) : []),
    [input]
  );

  return (
    <View className={clsx('px-8 lg:px-10', className)}>
      <InputLabel label={label} required={required} />
      <Pressable
        ref={ref}
        className="min-h-24 w-full items-center justify-center rounded-2xl border-[3px] border-dashed border-slate-200 p-8 hover:border-slate-300 active:border-slate-300 md:min-h-28 lg:min-h-32 lg:p-10 dark:border-slate-800 dark:hover:border-slate-700 dark:active:border-slate-700"
        aria-invalid={!!errors}
        onPress={async () => {
          // Mark the field as touched, as press does not trigger focus
          onFocus();

          // Open the document picker and update the field value
          const result = await DocumentPicker.getDocumentAsync({ multiple });
          if (!result.canceled && result.assets.length > 0) {
            const assets = result.assets.map(
              ({ uri, name, mimeType, size }) => ({
                uri,
                name,
                mimeType,
                size,
              })
            );
            // Hint: The cast is required because TypeScript cannot narrow
            // the generic conditional type by the runtime `multiple` check
            onValueChange(
              (multiple ? assets : assets[0]) as TMultiple extends true
                ? FileAsset[]
                : FileAsset
            );
          }
        }}
      >
        <Text
          className={clsx(
            'font-lexend text-center md:text-lg lg:text-xl',
            files.length
              ? 'text-slate-600 dark:text-slate-400'
              : 'text-slate-500'
          )}
        >
          {files.length
            ? `Selected file${multiple ? 's' : ''}: ${files
                .map((file) => file.name)
                .join(', ')}`
            : `Press to select file${multiple ? 's' : ''}`}
        </Text>
      </Pressable>
      <InputErrors errors={errors} />
    </View>
  );
}
