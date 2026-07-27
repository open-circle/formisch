/**
 * Stateless MCP server (Model Context Protocol) that provides tools to
 * search and read our documentation. Implements the Streamable HTTP
 * transport with plain JSON responses and validates all tool inputs with
 * Valibot itself.
 *
 * https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
 */
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';
import {
  AREA_PATH_REGEX,
  CONTENT_AREAS,
  DEFAULT_FRAMEWORK,
  DOC_PATHS,
  type DocPath,
  FRAMEWORKS,
  getDocPathTitle,
  getDocUrls,
  type SearchEntry,
} from './docs';
import type { Env } from './index';
import {
  CAPABILITIES,
  INSTRUCTIONS,
  LATEST_VERSION,
  SERVER_INFO,
  SUPPORTED_VERSIONS,
} from './mcp-info';

// Valibot schemas of the arguments of our tools
const SearchDocsSchema = v.object({
  query: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(200)),
  framework: v.optional(v.picklist(FRAMEWORKS)),
  area: v.optional(v.picklist(CONTENT_AREAS)),
  limit: v.optional(
    v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(20)),
    5
  ),
});
const GetDocSchema = v.object({
  path: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.maxLength(200)),
});
const ListDocsSchema = v.object({
  framework: v.optional(v.picklist(FRAMEWORKS)),
  area: v.optional(v.picklist(CONTENT_AREAS)),
});

/**
 * Converts a Valibot schema to a JSON Schema without the `$schema` key, as
 * some MCP clients are strict about the schema format of tool inputs.
 *
 * @param schema The Valibot schema to convert.
 *
 * @returns A JSON Schema object.
 */
function toInputSchema(schema: v.GenericSchema): Record<string, unknown> {
  // Ignore the `trim` transformation as it cannot be converted to JSON
  // Schema but still runs when the arguments are validated with Valibot.
  // Warn instead of throwing for other unconvertible actions so that a
  // future addition cannot crash the entire Worker at module load.
  const jsonSchema: Record<string, unknown> = {
    ...toJsonSchema(schema, { errorMode: 'warn', ignoreActions: ['trim'] }),
  };
  delete jsonSchema.$schema;
  return jsonSchema;
}

// Definitions of our tools with input schemas derived from Valibot schemas
const TOOL_DEFINITIONS = [
  {
    name: 'search_docs',
    title: 'Search documentation',
    description:
      'Searches the Formisch documentation (framework guides, API reference and blog posts) and returns the most relevant pages with links to their Markdown version. Best for finding the right primitive, component, method or core type by name or topic. Set "framework" (angular, preact, qwik, react, solid, svelte or vue) to scope the search to one framework plus the shared form methods and core types.',
    inputSchema: toInputSchema(SearchDocsSchema),
  },
  {
    name: 'get_doc',
    title: 'Read documentation page',
    description:
      'Reads a documentation page or blog post and returns its full content as Markdown. Accepts paths like "react/api/useForm", "solid/guides/create-your-form", "methods/api/focus", "core/api/FormSchema" and "blog/one-core-six-frameworks", or a bare name like "focus". Shared form methods live under "methods/api" and core types under "core/api"; framework primitives and components require a "{framework}/api" prefix.',
    inputSchema: toInputSchema(GetDocSchema),
  },
  {
    name: 'list_docs',
    title: 'List documentation pages',
    description:
      'Lists all documentation pages and blog posts grouped by framework, area and category. Useful to get an overview of the available guides, API reference pages and blog posts. Set "framework" to list one framework plus the shared form methods and core types.',
    inputSchema: toInputSchema(ListDocsSchema),
  },
];

/**
 * A search entry with precomputed lowercase fields to avoid re-computing
 * them on every search.
 */
interface IndexedEntry extends SearchEntry {
  lower: {
    name: string;
    title: string;
    description: string;
    excerpt: string;
    headings: string[];
  };
}

// Cache search index in isolate memory to only fetch it once
let searchIndexPromise: Promise<IndexedEntry[]> | undefined;

/**
 * Returns the search index of our documentation pages.
 *
 * @param env The environment of the Worker.
 * @param requestUrl The URL of the incoming request.
 *
 * @returns The search index.
 */
function getSearchIndex(env: Env, requestUrl: string): Promise<IndexedEntry[]> {
  if (!searchIndexPromise) {
    searchIndexPromise = (async () => {
      const response = await env.ASSETS.fetch(
        new URL('/search-index.json', requestUrl).href
      );
      if (!response.ok) {
        throw new Error('Search index is not available');
      }
      const entries = (await response.json()) as SearchEntry[];
      return entries.map((entry) => ({
        ...entry,
        lower: {
          name: entry.name.toLowerCase(),
          title: entry.title.toLowerCase(),
          description: entry.description.toLowerCase(),
          excerpt: entry.excerpt.toLowerCase(),
          headings: entry.headings.map((heading) => heading.toLowerCase()),
        },
      }));
    })().catch((error) => {
      // Reset cache so that the next request can retry
      searchIndexPromise = undefined;
      throw error;
    });
  }
  return searchIndexPromise;
}

/**
 * Checks whether a search entry matches the optional framework and area
 * filters. Scoping to a framework keeps its guides and API reference as well
 * as the shared form methods and core types, but excludes other frameworks and
 * the framework-agnostic blog posts.
 *
 * @param entry The search entry to check.
 * @param framework The optional framework filter.
 * @param area The optional content area filter.
 *
 * @returns Whether the entry matches the filters.
 */
function matchesFilter(
  entry: SearchEntry,
  framework: v.InferOutput<typeof SearchDocsSchema>['framework'],
  area: v.InferOutput<typeof SearchDocsSchema>['area']
): boolean {
  if (framework) {
    if (entry.area === 'blog') {
      return false;
    }
    if (entry.framework !== null && entry.framework !== framework) {
      return false;
    }
  }
  if (area && entry.area !== area) {
    return false;
  }
  return true;
}

/**
 * Searches the documentation pages for the given query.
 *
 * @param index The search index.
 * @param input The validated tool input.
 *
 * @returns The scored search results.
 */
function searchDocs(
  index: IndexedEntry[],
  input: v.InferOutput<typeof SearchDocsSchema>
): { entry: IndexedEntry; score: number }[] {
  // Split query into lowercase search terms
  const terms = input.query.toLowerCase().split(/\s+/).filter(Boolean);

  // Score every entry of the selected framework and area against the terms
  const results: { entry: IndexedEntry; score: number }[] = [];
  for (const entry of index) {
    if (!matchesFilter(entry, input.framework, input.area)) {
      continue;
    }
    const { name, title, description, excerpt, headings } = entry.lower;
    let score = 0;
    for (const term of terms) {
      if (name === term) {
        score += 100;
      } else if (name.startsWith(term)) {
        score += 40;
      } else if (name.includes(term)) {
        score += 25;
      }
      if (title === term) {
        score += 50;
      } else if (title.includes(term)) {
        score += 20;
      }
      if (headings.some((heading) => heading.includes(term))) {
        score += 10;
      }
      // Only score one of both as the excerpt often repeats the description
      if (description.includes(term)) {
        score += 5;
      } else if (excerpt.includes(term)) {
        score += 3;
      }
    }
    if (score > 0) {
      results.push({ entry, score });
    }
  }

  // Sort results by score and limit them to the requested amount
  return results
    .sort(
      (result1, result2) =>
        result2.score - result1.score ||
        result1.entry.name.localeCompare(result2.entry.name)
    )
    .slice(0, input.limit);
}

/**
 * The result content of a tool call. Our tools intentionally return text
 * without the optional `structuredContent` field, as the text is what LLM
 * clients consume and a structured duplicate would only bloat the response.
 */
interface ToolResult {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

/**
 * Executes the search_docs tool.
 */
async function executeSearchDocs(
  env: Env,
  requestUrl: string,
  input: v.InferOutput<typeof SearchDocsSchema>
): Promise<ToolResult> {
  const index = await getSearchIndex(env, requestUrl);
  const results = searchDocs(index, input);
  if (!results.length) {
    return {
      content: [
        {
          type: 'text',
          text: `No documentation pages found for "${input.query}". Try a different query or use list_docs for a complete overview.`,
        },
      ],
    };
  }
  const origin = new URL(requestUrl).origin;
  return {
    content: [
      {
        type: 'text',
        text: results
          .map(
            ({ entry }, index_) =>
              `${index_ + 1}. ${entry.title} — ${getDocPathTitle(entry.path)}\n   Path: ${entry.path}/${entry.name}\n   ${entry.description}\n   ${getDocUrls(origin, entry.path, entry.name).markdownUrl}`
          )
          .join('\n'),
      },
    ],
  };
}

/**
 * Computes the Levenshtein edit distance between two strings.
 *
 * @param string1 The first string.
 * @param string2 The second string.
 *
 * @returns The edit distance.
 */
function getEditDistance(string1: string, string2: string): number {
  let prevRow = Array.from({ length: string2.length + 1 }, (_, index) => index);
  for (let index1 = 1; index1 <= string1.length; index1++) {
    const nextRow = [index1];
    for (let index2 = 1; index2 <= string2.length; index2++) {
      nextRow.push(
        Math.min(
          prevRow[index2] + 1,
          nextRow[index2 - 1] + 1,
          prevRow[index2 - 1] +
            (string1[index1 - 1] === string2[index2 - 1] ? 0 : 1)
        )
      );
    }
    prevRow = nextRow;
  }
  return prevRow[string2.length];
}

/**
 * Creates a not-found tool result that suggests the page names closest to the
 * requested name to catch typos anywhere in the name. Suggestions are unique
 * by name so that the same page of multiple frameworks is not repeated.
 *
 * @param path The requested path.
 * @param name The lowercase requested name.
 * @param index The search index.
 *
 * @returns The not-found tool result.
 */
function notFound(
  path: string,
  name: string,
  index: IndexedEntry[]
): ToolResult {
  const threshold = name.length > 7 ? 3 : 2;
  const seen = new Set<string>();
  const suggestions = index
    .filter(
      (entry) => Math.abs(entry.lower.name.length - name.length) <= threshold
    )
    .map((entry) => ({
      entry,
      distance: getEditDistance(name, entry.lower.name),
    }))
    .filter(({ distance }) => distance <= threshold)
    .sort(
      (result1, result2) =>
        result1.distance - result2.distance ||
        result1.entry.name.localeCompare(result2.entry.name)
    )
    .filter(({ entry }) => {
      if (seen.has(entry.lower.name)) {
        return false;
      }
      seen.add(entry.lower.name);
      return true;
    })
    .slice(0, 3)
    .map(({ entry }) => `${entry.path}/${entry.name}`)
    .join('", "');
  return {
    content: [
      {
        type: 'text',
        text: `No documentation page found for "${path}".${suggestions ? ` Did you mean: "${suggestions}"?` : ' Use search_docs or list_docs to find available pages.'}`,
      },
    ],
    isError: true,
  };
}

/**
 * Executes the get_doc tool.
 */
async function executeGetDoc(
  env: Env,
  requestUrl: string,
  input: v.InferOutput<typeof GetDocSchema>
): Promise<ToolResult> {
  // Normalize path by removing origin, fragment, query, `.md` extension and
  // extra slashes
  const cleanPath = input.path
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/[#?].*$/, '')
    .replace(/\.md$/, '')
    .replace(/^\/|\/$/g, '');

  const index = await getSearchIndex(env, requestUrl);

  // Resolve a full path like "react/api/useForm" or "methods/api/focus". The
  // path prefix is matched case-insensitively as page names are resolved to
  // their canonical casing anyway.
  const areaMatch = AREA_PATH_REGEX.exec(cleanPath);
  if (areaMatch) {
    const docPath = areaMatch[1].toLowerCase() as DocPath;
    const pageName = areaMatch[2];

    // Return the Markdown file if it exists at the exact path
    const response = await env.ASSETS.fetch(
      new URL(`/${docPath}/${pageName}.md`, requestUrl).href
    );
    if (response.ok) {
      return { content: [{ type: 'text', text: await response.text() }] };
    }

    // Otherwise, resolve the name case-insensitively within the path, as the
    // paths of our static assets are case-sensitive
    const match = index.find(
      (entry) =>
        entry.path === docPath && entry.lower.name === pageName.toLowerCase()
    );
    if (match) {
      const matchResponse = await env.ASSETS.fetch(
        new URL(`/${match.path}/${match.name}.md`, requestUrl).href
      );
      if (matchResponse.ok) {
        return {
          content: [{ type: 'text', text: await matchResponse.text() }],
        };
      }
    }

    return notFound(input.path, pageName.toLowerCase(), index);
  }

  // Resolve a bare name like "focus" or "useForm$" via the search index
  if (/^[\w$.-]+$/.test(cleanPath)) {
    const name = cleanPath.toLowerCase();
    const matches = index.filter((entry) => entry.lower.name === name);
    if (matches.length) {
      // Prefer a shared page (form method or core type), then the default
      // framework, then the first match
      const preferred =
        matches.find((entry) => entry.framework === null) ??
        matches.find((entry) => entry.framework === DEFAULT_FRAMEWORK) ??
        matches[0];
      const response = await env.ASSETS.fetch(
        new URL(`/${preferred.path}/${preferred.name}.md`, requestUrl).href
      );
      if (response.ok) {
        let text = await response.text();
        // Point to the other frameworks if the page exists for more than one
        const others = matches.filter((entry) => entry !== preferred);
        if (others.length) {
          text = `> Note: This page also exists for other frameworks. Showing \`${preferred.path}/${preferred.name}\`. Other versions: ${others
            .map((entry) => `\`${entry.path}/${entry.name}\``)
            .join(', ')}.\n\n${text}`;
        }
        return { content: [{ type: 'text', text }] };
      }
    }
    return notFound(input.path, name, index);
  }

  // Reject any other path as invalid
  return {
    content: [
      {
        type: 'text',
        text: `Invalid path "${input.path}". Use a path like "react/api/useForm", "solid/guides/create-your-form", "methods/api/focus", "core/api/FormSchema" or "blog/one-core-six-frameworks", or a bare name like "focus".`,
      },
    ],
    isError: true,
  };
}

/**
 * Executes the list_docs tool.
 */
async function executeListDocs(
  env: Env,
  requestUrl: string,
  input: v.InferOutput<typeof ListDocsSchema>
): Promise<ToolResult> {
  const index = await getSearchIndex(env, requestUrl);

  // Filter entries by the optional framework and area and sort them by path
  // prefix, as shared pages are interleaved with framework pages in the index
  const pathOrder = new Map(
    DOC_PATHS.map((docPath, order) => [docPath, order])
  );
  const entries = index
    .map((entry, order) => ({ entry, order }))
    .filter(({ entry }) => matchesFilter(entry, input.framework, input.area))
    .sort(
      (item1, item2) =>
        pathOrder.get(item1.entry.path)! - pathOrder.get(item2.entry.path)! ||
        item1.order - item2.order
    )
    .map(({ entry }) => entry);

  // Group pages by path prefix and group while keeping their order
  let text = '';
  let prevPath: string | undefined;
  let prevGroup: string | undefined;
  for (const entry of entries) {
    if (entry.path !== prevPath) {
      text += `# ${getDocPathTitle(entry.path)}\n\n`;
      prevPath = entry.path;
      prevGroup = undefined;
    }
    if (entry.group !== prevGroup) {
      text += `## ${entry.group}\n\n`;
      prevGroup = entry.group;
    }
    text += `- ${entry.path}/${entry.name} — ${entry.title}\n`;
  }

  return { content: [{ type: 'text', text: text.trim() }] };
}

/**
 * A JSON-RPC request or notification message.
 */
interface JsonRpcMessage {
  jsonrpc: '2.0';
  id?: number | string | null;
  method: string;
  params?: Record<string, unknown>;
}

/**
 * Creates a JSON-RPC error object.
 *
 * @param id The ID of the request.
 * @param code The error code.
 * @param message The error message.
 *
 * @returns A JSON-RPC error object.
 */
function createError(id: JsonRpcMessage['id'], code: number, message: string) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

/**
 * Processes a single JSON-RPC message and returns its response, or
 * `undefined` for notifications.
 *
 * @param env The environment of the Worker.
 * @param requestUrl The URL of the incoming request.
 * @param message The JSON-RPC message to process.
 *
 * @returns The JSON-RPC response.
 */
async function processMessage(
  env: Env,
  requestUrl: string,
  message: JsonRpcMessage
): Promise<Record<string, unknown> | undefined> {
  // Ignore notifications (messages without an ID field) as this server is
  // stateless and does not need to react to them
  if (!('id' in message)) {
    return undefined;
  }

  // Process initialization handshake
  if (message.method === 'initialize') {
    const requestedVersion = message.params?.protocolVersion;
    return {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        protocolVersion:
          typeof requestedVersion === 'string' &&
          (SUPPORTED_VERSIONS as readonly string[]).includes(requestedVersion)
            ? requestedVersion
            : LATEST_VERSION,
        capabilities: CAPABILITIES,
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      },
    };
  }

  // Process ping requests
  if (message.method === 'ping') {
    return { jsonrpc: '2.0', id: message.id, result: {} };
  }

  // Process tool listing requests
  if (message.method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { tools: TOOL_DEFINITIONS },
    };
  }

  // Process tool call requests
  if (message.method === 'tools/call') {
    const toolName = message.params?.name;
    const toolArgs = message.params?.arguments ?? {};

    /**
     * Validates the tool arguments with the given Valibot schema and
     * executes the tool. Execution errors are returned as tool results so
     * that the model can see and react to them.
     */
    const runTool = async <TSchema extends v.GenericSchema>(
      schema: TSchema,
      execute: (input: v.InferOutput<TSchema>) => Promise<ToolResult>
    ): Promise<Record<string, unknown>> => {
      const result = v.safeParse(schema, toolArgs);
      if (!result.success) {
        const issues = v.flatten(result.issues);
        return createError(
          message.id,
          -32602,
          `Invalid arguments for ${toolName}: ${JSON.stringify(issues.nested ?? issues)}`
        );
      }
      try {
        return {
          jsonrpc: '2.0',
          id: message.id,
          result: await execute(result.output),
        };
      } catch (error) {
        return {
          jsonrpc: '2.0',
          id: message.id,
          result: {
            content: [
              {
                type: 'text',
                text: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              },
            ],
            isError: true,
          },
        };
      }
    };

    if (toolName === 'search_docs') {
      return runTool(SearchDocsSchema, (input) =>
        executeSearchDocs(env, requestUrl, input)
      );
    }
    if (toolName === 'get_doc') {
      return runTool(GetDocSchema, (input) =>
        executeGetDoc(env, requestUrl, input)
      );
    }
    if (toolName === 'list_docs') {
      return runTool(ListDocsSchema, (input) =>
        executeListDocs(env, requestUrl, input)
      );
    }
    return createError(message.id, -32602, `Unknown tool: ${toolName}`);
  }

  // Return error for unknown methods
  return createError(message.id, -32601, `Method not found: ${message.method}`);
}

// CORS headers to support MCP clients running in the browser
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Accept, Authorization, MCP-Protocol-Version, Mcp-Session-Id, Last-Event-ID',
  'Access-Control-Max-Age': '86400',
};

/**
 * Creates a JSON response with CORS headers.
 *
 * @param body The body to serialize.
 * @param status The status code of the response.
 *
 * @returns A JSON response.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/**
 * Handles a request to our MCP endpoint.
 *
 * @param request The incoming request.
 * @param env The environment of the Worker.
 *
 * @returns The response of the MCP server.
 */
export async function handleMcpRequest(
  request: Request,
  env: Env
): Promise<Response> {
  // Answer preflight requests of browser-based clients
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Reject any other method than POST as this stateless server does not
  // support server-initiated streams
  if (request.method !== 'POST') {
    const response = jsonResponse(
      createError(null, -32600, 'Method not allowed. Use POST.'),
      405
    );
    response.headers.set('Allow', 'POST, OPTIONS');
    return response;
  }

  // Reject unsupported protocol versions as required by the specification.
  // A missing header is allowed and treated as the oldest supported version.
  const protocolVersion = request.headers.get('MCP-Protocol-Version');
  if (
    protocolVersion &&
    !(SUPPORTED_VERSIONS as readonly string[]).includes(protocolVersion)
  ) {
    return jsonResponse(
      createError(
        null,
        -32600,
        `Unsupported protocol version: ${protocolVersion}`
      ),
      400
    );
  }

  // Parse JSON body of request
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(createError(null, -32700, 'Parse error'), 400);
  }

  // Reject empty batches as required by the JSON-RPC specification
  if (Array.isArray(body) && !body.length) {
    return jsonResponse(createError(null, -32600, 'Invalid request'), 400);
  }

  // Process single message or batch of messages
  const messages = Array.isArray(body) ? body : [body];
  const responses: Record<string, unknown>[] = [];
  for (const message of messages) {
    // Validate structure of message including the type of its ID. The `jsonrpc`
    // and `method` fields are read from an untrusted record so that they are
    // checked instead of assumed to match the JSON-RPC shape.
    const record = message as Record<string, unknown>;
    const isObject = typeof message === 'object' && message !== null;
    const id =
      isObject && 'id' in record ? (message as JsonRpcMessage).id : undefined;
    const isValidId =
      id === undefined ||
      id === null ||
      typeof id === 'string' ||
      typeof id === 'number';
    if (
      !isObject ||
      !isValidId ||
      record.jsonrpc !== '2.0' ||
      typeof record.method !== 'string'
    ) {
      // Preserve valid IDs so that the client can correlate the error with
      // its request, but never echo IDs of an invalid type
      responses.push(
        createError(isValidId ? id : null, -32600, 'Invalid request')
      );
      continue;
    }
    const response = await processMessage(
      env,
      request.url,
      message as JsonRpcMessage
    );
    if (response) {
      responses.push(response);
    }
  }

  // Answer with status 202 if only notifications were sent
  if (!responses.length) {
    return new Response(null, { status: 202, headers: CORS_HEADERS });
  }

  // Otherwise, answer with single response or batch of responses
  return jsonResponse(Array.isArray(body) ? responses : responses[0]);
}
