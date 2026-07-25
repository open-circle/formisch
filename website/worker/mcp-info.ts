/**
 * Constants of our MCP server that are shared between the Worker runtime and
 * our build scripts (e.g. the generation of the MCP server card). This module
 * is intentionally free of imports so that build scripts can use it without
 * pulling in runtime dependencies.
 */

// Protocol versions supported by our MCP server with the latest one first
export const SUPPORTED_VERSIONS = ['2025-06-18', '2025-03-26'] as const;
export const LATEST_VERSION = SUPPORTED_VERSIONS[0];

// Public URL and transport type of our MCP server endpoint
export const MCP_URL = 'https://formisch.dev/mcp';
export const TRANSPORT_TYPE = 'streamable-http';

// Capabilities of our MCP server
export const CAPABILITIES = { tools: { listChanged: false } } as const;

// Info about our MCP server shared with clients and our MCP server card
export const SERVER_INFO = {
  name: 'formisch-docs',
  title: 'Formisch Documentation',
  version: '1.0.0',
} as const;

// Instructions to help clients use our MCP server effectively
export const INSTRUCTIONS =
  'Formisch is the schema-based, headless and fully type-safe form library for Preact, Qwik, React, Solid, Svelte and Vue. Its API is framework-specific: every framework provides a primitive to create a form (`useForm` for Preact, React and Vue, `createForm` for Solid and Svelte and `useForm$` for Qwik), the `useField` and `useFieldArray` primitives and the `Form`, `Field` and `FieldArray` components. The form methods (e.g. `focus`, `insert`, `reset` and `validate`) and core types are shared across all frameworks and live under the paths `methods/api` and `core/api`. Form values and validation are defined with Valibot schemas. The documentation is organized by framework (`{framework}/guides` and `{framework}/api`); set the `framework` parameter of `search_docs` and `list_docs` to scope results to one framework plus the shared methods and core types. Use `search_docs` to find relevant pages, `get_doc` to read a page and `list_docs` for a complete overview. Blog posts are included as well, but prefer the guides and API reference for how to use the library, as older posts may describe previous versions of the API.';
