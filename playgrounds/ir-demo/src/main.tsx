import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as v from 'valibot';
import { z } from 'zod';
import { toFormisch as toFormischValibot } from '@formisch/valibot';
import { toFormisch as toFormischZod } from '@formisch/zod';
import { useForm } from '@formisch/react';
import type { FormSchema } from '@formisch/core/react';

const valibotSchema = toFormischValibot(
  v.object({
    name: v.pipe(v.string(), v.minLength(1)),
    age: v.optional(v.number()),
    email: v.optional(v.string()),
  })
);

const zodSchema = toFormischZod(
  z.object({
    name: z.string().min(1),
    age: z.number().optional(),
    email: z.string().optional(),
  })
);

function FormDemo({ schema, label }: { schema: FormSchema; label: string }) {
  const form = useForm({
    schema,
    onSubmit: (output) => {
      console.log(`[${label}] Submitted:`, output);
    },
  });

  return (
    <div style={{ flex: 1, minWidth: 300 }}>
      <h3>{label}</h3>
      <pre>
        name (string): {(form as Record<string, unknown>).__name ?? 'N/A'}
        {'\n'}
        errors: {JSON.stringify(form.errors)}
      </pre>
    </div>
  );
}

function App() {
  const [adapter, setAdapter] = useState<'valibot' | 'zod'>('valibot');
  const schema = adapter === 'valibot' ? valibotSchema : zodSchema;

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Formisch IR POC</h1>
      <p>
        Same form shape, driven by either adapter. Toggle to re-initialize.
      </p>

      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setAdapter('valibot')}
          style={{
            fontWeight: adapter === 'valibot' ? 'bold' : 'normal',
            marginRight: 8,
            padding: '4px 12px',
          }}
        >
          Valibot adapter
        </button>
        <button
          onClick={() => setAdapter('zod')}
          style={{
            fontWeight: adapter === 'zod' ? 'bold' : 'normal',
            padding: '4px 12px',
          }}
        >
          Zod adapter
        </button>
      </div>

      <div key={adapter} style={{ display: 'flex', gap: 24 }}>
        <FormDemo schema={schema} label={`${adapter} adapter`} />
      </div>

      <div style={{ marginTop: 24, fontSize: 14, color: '#666' }}>
        <p>Open the console to see submit output.</p>
        <p>
          The <code>age</code> field has IR type <code>number</code> —
          demonstrating type info flowing through the IR from both adapters.
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
