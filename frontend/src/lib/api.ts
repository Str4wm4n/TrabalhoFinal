type JsonRecord = Record<string, unknown>;

export interface Imovel {
  id: number;
  titulo: string;
  descricao?: string | null;
  precoVenda?: number | string | null;
  precoAluguel?: number | string | null;
  finalidade?: string | null;
  status?: string | null;
  dormitorios?: number | null;
  banheiros?: number | null;
  areaTotal?: number | string | null;
  endereco?: string | null;
  numero?: string | null;
  destaque?: boolean | null;
  tipoImovel?: { nome?: string | null } | null;
  bairro?: { nome?: string | null; cidade?: string | null } | null;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): boolean {
  return value == null || typeof value === "string";
}

function isOptionalNumber(value: unknown): boolean {
  return (
    value == null ||
    (typeof value === "number" && Number.isFinite(value)) ||
    (typeof value === "string" &&
      value.trim() !== "" &&
      Number.isFinite(Number(value)))
  );
}

function isOptionalNamedObject(value: unknown): boolean {
  return value == null || (isRecord(value) && isOptionalString(value.nome));
}

function isValidImovel(value: unknown): value is Imovel {
  if (!isRecord(value) || !Number.isInteger(value.id) || typeof value.titulo !== "string") {
    return false;
  }

  const stringFields = [
    "descricao",
    "finalidade",
    "status",
    "endereco",
    "numero",
  ];
  const numberFields = [
    "precoVenda",
    "precoAluguel",
    "dormitorios",
    "banheiros",
    "areaTotal",
  ];

  return (
    stringFields.every((field) => isOptionalString(value[field])) &&
    numberFields.every((field) => isOptionalNumber(value[field])) &&
    (value.destaque == null || typeof value.destaque === "boolean") &&
    isOptionalNamedObject(value.tipoImovel) &&
    (value.bairro == null ||
      (isRecord(value.bairro) &&
        isOptionalString(value.bairro.nome) &&
        isOptionalString(value.bairro.cidade)))
  );
}

export async function getImoveis(): Promise<Imovel[]> {
  const apiUrl = process.env.API_URL ?? "http://localhost:8080";
  let response: Response;

  try {
    response = await fetch(`${apiUrl.replace(/\/$/, "")}/imoveis`, {
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao backend Java. Confirme se a API está em execução.",
    );
  }

  if (!response.ok) {
    throw new ApiError(`A API respondeu com o erro HTTP ${response.status}.`);
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new ApiError("A API retornou uma resposta que não é um JSON válido.");
  }

  if (!Array.isArray(payload) || !payload.every(isValidImovel)) {
    throw new ApiError("A API retornou uma lista de imóveis em formato inválido.");
  }

  return payload;
}
