import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { spawn } from "child_process";

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "httpx",
      "Scan targets with projectdiscovery/httpx CLI and return the raw output.",
      {
        target: z
          .array(z.string())
          .min(1)
          .describe("List of domains or hosts to scan (e.g., example.com)."),
        ports: z
          .array(z.number())
          .optional()
          .describe("Optional list of ports to scan (e.g., [80,443])."),
        probes: z
          .array(z.string())
          .optional()
          .describe(
            "Optional httpx probe flags like status-code, content-length, title, web-server, etc. Each entry is added as -<probe>."
          ),
      },
      async ({ target, ports, probes }) => {
        const args = ["-u", target.join(","), "-silent"];
        if (ports && ports.length > 0) {
          args.push("-p", ports.join(","));
        }
        if (probes && probes.length > 0) {
          for (const probe of probes) {
            args.push(`-${probe}`);
          }
        }

        return await new Promise((resolve, reject) => {
          const child = spawn("httpx", args, { env: process.env });
          let stdout = "";
          let stderr = "";

          child.stdout.on("data", (data) => {
            stdout += data.toString();
          });

          child.stderr.on("data", (data) => {
            stderr += data.toString();
          });

          child.on("error", (error) => {
            reject(error);
          });

          child.on("close", (code) => {
            if (code === 0) {
              resolve({
                content: [
                  {
                    type: "text",
                    text:
                      stdout.trim().length > 0
                        ? stdout.trim()
                        : "(httpx completed with no output)",
                  },
                ],
              });
            } else {
              reject(
                new Error(
                  `httpx exited with code ${code}. stderr: ${stderr || "(empty)"}`
                )
              );
            }
          });
        });
      }
    );
  },
  {
    capabilities: {
      tools: {
        httpx: {
          description: "Scan targets with projectdiscovery/httpx CLI and return the results.",
        },
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 120,
    disableSse: true,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
