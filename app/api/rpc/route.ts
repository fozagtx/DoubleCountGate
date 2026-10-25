import { NextResponse } from "next/server";
import { rpcUrl } from "@/lib/chain";

export const dynamic = "force-dynamic";

const maxBodyBytes = 100 * 1024;
const readMethods = new Set([
  "eth_chainId",
  "eth_blockNumber",
  "eth_call",
  "eth_getBalance",
  "eth_getCode",
  "eth_getLogs",
  "eth_getBlockByNumber",
  "eth_getTransactionReceipt",
  "eth_getTransactionByHash",
  "eth_getTransactionCount",
  "eth_estimateGas",
  "eth_gasPrice",
  "eth_maxPriorityFeePerGas",
  "eth_feeHistory",
]);

type RpcRequest = Record<string, unknown> & { method: string; jsonrpc: "2.0" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rpcError(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

async function readLimitedBody(request: Request): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBodyBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBodyBytes) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  let body: string | null;
  try {
    body = await readLimitedBody(request);
  } catch {
    return NextResponse.json(rpcError(null, -32700, "Parse error"), { status: 400 });
  }
  if (body === null) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json(rpcError(null, -32700, "Parse error"), { status: 400 });
  }

  const isBatch = Array.isArray(payload);
  const requests: unknown[] = Array.isArray(payload) ? payload : [payload];
  if (isBatch && requests.length === 0) {
    return NextResponse.json(rpcError(null, -32600, "Invalid request"));
  }

  const forwardedRequests: RpcRequest[] = [];
  const localErrors: ReturnType<typeof rpcError>[] = [];

  for (const item of requests) {
    const id = isRecord(item) && "id" in item ? item.id : null;
    if (!isRecord(item) || item.jsonrpc !== "2.0" || typeof item.method !== "string") {
      localErrors.push(rpcError(id, -32600, "Invalid request"));
    } else if (!readMethods.has(item.method)) {
      localErrors.push(rpcError(id, -32601, "Method not allowed"));
    } else {
      forwardedRequests.push(item as RpcRequest);
    }
  }

  if (forwardedRequests.length === 0) {
    return NextResponse.json(isBatch ? localErrors : localErrors[0]);
  }

  const upstreamPayload = isBatch ? forwardedRequests : forwardedRequests[0];
  let upstream: Response;
  try {
    upstream = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(upstreamPayload),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(rpcError(null, -32000, "Upstream RPC unavailable"), { status: 502 });
  }

  const upstreamBody = await upstream.text();
  if (localErrors.length === 0) {
    return new Response(upstreamBody, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
    });
  }

  let upstreamResponses: unknown[];
  try {
    const responsePayload: unknown = JSON.parse(upstreamBody);
    upstreamResponses = Array.isArray(responsePayload) ? responsePayload : [responsePayload];
  } catch {
    return new Response(upstreamBody, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
    });
  }

  return NextResponse.json([...upstreamResponses, ...localErrors], { status: upstream.status });
}
