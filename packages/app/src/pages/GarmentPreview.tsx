import { useState } from "react";

import { requestTeePreview, TeePreviewApiError } from "../garment/api";
import { GeometrySvg } from "../garment/GeometrySvg";
import type { GeometryDocument } from "../garment/geometry";
import { parseTeePreviewRequest } from "../garment/request";

const endpoint = import.meta.env.VITE_TEE_PREVIEW_ENDPOINT ?? "/api/v1/tee/preview";

const initialRequest = JSON.stringify({ body: {}, design: {} }, null, 2);

export default function GarmentPreview() {
  const [requestText, setRequestText] = useState(initialRequest);
  const [geometry, setGeometry] = useState<GeometryDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submit() {
    setError(null);
    setGeometry(null);
    setIsLoading(true);
    try {
      const request = parseTeePreviewRequest(requestText);
      setGeometry(await requestTeePreview(request, endpoint));
    } catch (reason) {
      if (reason instanceof TeePreviewApiError) {
        setError(`${reason.message} (HTTP ${reason.status})`);
      } else if (reason instanceof Error) {
        setError(reason.message);
      } else {
        setError("The preview request failed");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <h1>Garment preview</h1>
      <p>Paste a Tee request JSON document and render the returned geometry.v1 contract.</p>
      <label htmlFor="tee-preview-request">Tee request JSON</label>
      <textarea
        id="tee-preview-request"
        onChange={(event) => setRequestText(event.target.value)}
        rows={18}
        value={requestText}
      />
      <button disabled={isLoading} onClick={submit} type="button">
        {isLoading ? "Generating…" : "Generate preview"}
      </button>
      {error && <p role="alert">{error}</p>}
      {geometry && <GeometrySvg geometry={geometry} />}
    </main>
  );
}
