#!/usr/bin/env node
/**
 * ShareMiles Wiki — MCP Server Público
 *
 * Expõe a documentação e as capacidades do agente pm-expert-sharemiles
 * como ferramentas, recursos e prompts MCP compatíveis com:
 *   - Claude Code  (via stdio ou URL remota)
 *   - GitHub Copilot (via stdio local ou HTTP remoto)
 *
 * Modos de execução:
 *   stdio (padrão):  node dist/index.js
 *   HTTP  (público): node dist/index.js --http [--port 3000]
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "http";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Raiz da wiki: dois níveis acima de mcp/src/
const WIKI_ROOT = process.env.WIKI_ROOT ?? path.resolve(__dirname, "../../");

// ---------------------------------------------------------------------------
// Utilitários de filesystem
// ---------------------------------------------------------------------------

interface DocFile {
  fullPath: string;
  relativePath: string;
}

async function findMarkdownFiles(dir: string, baseDir: string = dir): Promise<DocFile[]> {
  const results: DocFile[] = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  const SKIP = new Set(["node_modules", "dist", ".git"]);

  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue;
    // Pula diretórios ocultos, exceto .claude (onde fica o agente)
    if (entry.name.startsWith(".") && entry.name !== ".claude") continue;

    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      results.push(...(await findMarkdownFiles(fullPath, baseDir)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push({ fullPath, relativePath });
    }
  }
  return results;
}

/** Resolve um caminho relativo garantindo que fique dentro de WIKI_ROOT. */
function safeResolve(relative: string): string | null {
  const resolved = path.resolve(WIKI_ROOT, relative);
  return resolved.startsWith(WIKI_ROOT) ? resolved : null;
}

async function readWikiFile(relative: string): Promise<string> {
  const p = safeResolve(relative);
  if (!p) throw new Error(`Caminho inválido: ${relative}`);
  return fs.readFile(p, "utf-8");
}

// ---------------------------------------------------------------------------
// Definição das ferramentas
// ---------------------------------------------------------------------------

const TOOLS: Tool[] = [
  {
    name: "list_docs",
    description: "Lista todos os documentos disponíveis na wiki do ShareMiles.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "read_doc",
    description:
      "Lê o conteúdo de um documento específico da wiki. " +
      "Use list_docs para obter o caminho correto.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description:
            "Caminho relativo do documento " +
            "(ex: visao-produto/contexto-plataforma.md, README.md)",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "search_docs",
    description:
      "Busca um termo em todos os documentos da wiki e retorna os trechos relevantes.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Termo ou frase para buscar nos documentos.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "write_doc",
    description:
      "Cria ou atualiza um documento na wiki. " +
      "Use para salvar PRDs, user stories, análises de impacto, decisões (DP-XX) e gaps (GAP-XX).",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description:
            "Caminho relativo do arquivo a criar/atualizar " +
            "(ex: visao-produto/prd-transacoes.md)",
        },
        content: {
          type: "string",
          description: "Conteúdo completo em markdown.",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "get_platform_context",
    description:
      "Retorna o contexto completo da plataforma ShareMiles: " +
      "arquitetura, stack técnico, módulos (M1–M8), fluxo central de transação e restrições.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_all_context",
    description:
      "Carrega todo o contexto da wiki de uma vez: plataforma, módulos, personas, " +
      "backlog, decisões, gaps e glossário. Ideal para inicializar um agente com contexto completo.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_agent_prompt",
    description:
      "Retorna as instruções completas do agente pm-expert-sharemiles para uso " +
      "como system prompt em outros modelos ou integrações.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "analyze_change_impact",
    description:
      "Descreve o impacto de uma mudança proposta nos módulos, personas, jornadas " +
      "e decisões documentadas na wiki ShareMiles.",
    inputSchema: {
      type: "object",
      properties: {
        change_description: {
          type: "string",
          description:
            "Descreva a mudança que pretende implementar (funcionalidade, regra de negócio, etc.).",
        },
      },
      required: ["change_description"],
    },
  },
];

// ---------------------------------------------------------------------------
// Factory: cria e configura uma instância do MCP Server
// ---------------------------------------------------------------------------

function createMcpServer(): Server {
  const server = new Server(
    { name: "sharemiles-wiki", version: "1.0.0" },
    { capabilities: { tools: {}, resources: {}, prompts: {} } }
  );

  // -- List tools --
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  // -- Call tool --
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args = {} } = req.params;

    const ok = (text: string) => ({ content: [{ type: "text" as const, text }] });
    const err = (text: string) => ({ content: [{ type: "text" as const, text }], isError: true });

    try {
      switch (name) {
        // ---- list_docs ----
        case "list_docs": {
          const files = await findMarkdownFiles(WIKI_ROOT);
          return ok(
            "Documentos disponíveis na wiki ShareMiles:\n\n" +
              files.map((f) => `- ${f.relativePath}`).join("\n")
          );
        }

        // ---- read_doc ----
        case "read_doc": {
          const content = await readWikiFile(args.path as string);
          return ok(content);
        }

        // ---- search_docs ----
        case "search_docs": {
          const query = (args.query as string).toLowerCase();
          const files = await findMarkdownFiles(WIKI_ROOT);
          const results: string[] = [];

          for (const file of files) {
            const content = await fs.readFile(file.fullPath, "utf-8");
            const lines = content.split("\n");
            const matches: string[] = [];

            lines.forEach((line, idx) => {
              if (line.toLowerCase().includes(query)) {
                matches.push(`  L${idx + 1}: ${line.trim()}`);
              }
            });

            if (matches.length > 0) {
              results.push(
                `### ${file.relativePath}\n${matches.slice(0, 8).join("\n")}`
              );
            }
          }

          return ok(
            results.length > 0
              ? `Resultados para "${args.query}":\n\n${results.join("\n\n")}`
              : `Nenhum resultado encontrado para "${args.query}".`
          );
        }

        // ---- write_doc ----
        case "write_doc": {
          const docPath = safeResolve(args.path as string);
          if (!docPath) return err("Caminho inválido ou fora da wiki.");
          await fs.mkdir(path.dirname(docPath), { recursive: true });
          await fs.writeFile(docPath, args.content as string, "utf-8");
          return ok(`Documento salvo com sucesso: ${args.path}`);
        }

        // ---- get_platform_context ----
        case "get_platform_context": {
          const sections = await Promise.allSettled([
            readWikiFile("visao-produto/contexto-plataforma.md"),
            readWikiFile("visao-produto/mapa-modulos.md"),
          ]);
          const texts = sections
            .filter((r) => r.status === "fulfilled")
            .map((r) => (r as PromiseFulfilledResult<string>).value);
          return ok(texts.join("\n\n---\n\n"));
        }

        // ---- get_all_context ----
        case "get_all_context": {
          const files = [
            "visao-produto/contexto-plataforma.md",
            "visao-produto/mapa-modulos.md",
            "visao-produto/personas-detalhadas.md",
            "visao-produto/decisoes-produto.md",
            "visao-produto/gaps-e-decisoes-abertas.md",
            "visao-produto/glossario.md",
            "visao-produto/backlog-macro.md",
          ];
          const chunks: string[] = [];
          for (const f of files) {
            try {
              const content = await readWikiFile(f);
              chunks.push(`# ${f}\n\n${content}`);
            } catch {
              // arquivo opcional
            }
          }
          return ok(chunks.join("\n\n---\n\n"));
        }

        // ---- get_agent_prompt ----
        case "get_agent_prompt": {
          const content = await readWikiFile(".claude/agents/pm-expert-sharemiles.md");
          return ok(content);
        }

        // ---- analyze_change_impact ----
        case "analyze_change_impact": {
          const change = args.change_description as string;
          const [context, modules, decisions, gaps] = await Promise.allSettled([
            readWikiFile("visao-produto/contexto-plataforma.md"),
            readWikiFile("visao-produto/mapa-modulos.md"),
            readWikiFile("visao-produto/decisoes-produto.md"),
            readWikiFile("visao-produto/gaps-e-decisoes-abertas.md"),
          ]);

          const contextText =
            context.status === "fulfilled" ? context.value : "";
          const modulesText =
            modules.status === "fulfilled" ? modules.value : "";
          const decisionsText =
            decisions.status === "fulfilled" ? decisions.value : "";
          const gapsText =
            gaps.status === "fulfilled" ? gaps.value : "";

          return ok(
            `## Contexto para Análise de Impacto\n\n` +
              `**Mudança proposta:** ${change}\n\n` +
              `Use o contexto abaixo para avaliar o impacto nos módulos, ` +
              `regras de negócio, personas e decisões existentes.\n\n` +
              `---\n\n${contextText}\n\n---\n\n${modulesText}\n\n---\n\n${decisionsText}\n\n---\n\n${gapsText}`
          );
        }

        default:
          return err(`Ferramenta desconhecida: ${name}`);
      }
    } catch (e) {
      return err(`Erro: ${e instanceof Error ? e.message : String(e)}`);
    }
  });

  // -- List resources --
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const files = await findMarkdownFiles(WIKI_ROOT);
    return {
      resources: files.map((f) => ({
        uri: `sharemiles://docs/${f.relativePath}`,
        name: f.relativePath,
        description: `ShareMiles Wiki: ${f.relativePath}`,
        mimeType: "text/markdown",
      })),
    };
  });

  // -- Read resource --
  server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
    const uri = req.params.uri;
    const relative = uri.replace("sharemiles://docs/", "");
    const content = await readWikiFile(relative);
    return {
      contents: [{ uri, mimeType: "text/markdown", text: content }],
    };
  });

  // -- List prompts --
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: [
      {
        name: "pm_expert_sharemiles",
        description:
          "Ativa o Especialista Sênior em Product Management da plataforma ShareMiles " +
          "com protocolo completo de descoberta, criação de PRDs, user stories, " +
          "jornadas e análise de impacto.",
        arguments: [],
      },
    ],
  }));

  // -- Get prompt --
  server.setRequestHandler(GetPromptRequestSchema, async (req) => {
    if (req.params.name !== "pm_expert_sharemiles") {
      throw new Error(`Prompt desconhecido: ${req.params.name}`);
    }
    const content = await readWikiFile(".claude/agents/pm-expert-sharemiles.md");
    return {
      description:
        "Especialista Sênior em Product Management da plataforma ShareMiles",
      messages: [
        {
          role: "user" as const,
          content: { type: "text" as const, text: content },
        },
      ],
    };
  });

  return server;
}

// ---------------------------------------------------------------------------
// Modo HTTP: Streamable HTTP Transport (compatível com Claude Code remoto e Copilot)
// ---------------------------------------------------------------------------

async function startHttpServer(port: number): Promise<void> {
  const { StreamableHTTPServerTransport } = await import(
    "@modelcontextprotocol/sdk/server/streamableHttp.js"
  );

  // Mapa de sessões ativas: sessionId -> transport
  const sessions = new Map<
    string,
    { transport: InstanceType<typeof StreamableHTTPServerTransport>; server: Server }
  >();

  const httpServer = createHttpServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      // CORS
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, mcp-session-id, Accept"
      );

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      // Health check
      if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", server: "sharemiles-wiki-mcp", version: "1.0.0" }));
        return;
      }

      // Endpoint MCP
      const url = req.url ?? "";
      if (!url.startsWith("/mcp")) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      // Determina sessão
      const sessionId =
        (req.headers["mcp-session-id"] as string | undefined) ?? randomUUID();

      let session = sessions.get(sessionId);

      if (!session) {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => sessionId,
        });
        const server = createMcpServer();
        await server.connect(transport);
        session = { transport, server };
        sessions.set(sessionId, session);

        // Limpa sessão ao fechar
        transport.onclose = () => {
          sessions.delete(sessionId);
        };
      }

      // Lê o body para requisições POST
      let body: unknown = undefined;
      if (req.method === "POST") {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk as Buffer);
        }
        const raw = Buffer.concat(chunks).toString("utf-8");
        if (raw) {
          try {
            body = JSON.parse(raw);
          } catch {
            res.writeHead(400);
            res.end("Invalid JSON");
            return;
          }
        }
      }

      await session.transport.handleRequest(req, res, body);
    }
  );

  httpServer.listen(port, () => {
    console.error(`\n🚀 ShareMiles Wiki MCP Server (HTTP) rodando na porta ${port}`);
    console.error(`   Endpoint MCP : http://localhost:${port}/mcp`);
    console.error(`   Health check : http://localhost:${port}/health\n`);
  });
}

// ---------------------------------------------------------------------------
// Entrypoint
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const useHttp = argv.includes("--http");
  const portIdx = argv.indexOf("--port");
  const port = portIdx !== -1 ? parseInt(argv[portIdx + 1] ?? "3000", 10) : 3000;

  if (useHttp) {
    await startHttpServer(port);
  } else {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("ShareMiles Wiki MCP Server iniciado (stdio)");
  }
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
