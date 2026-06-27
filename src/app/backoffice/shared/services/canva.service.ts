import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { buildCanvaEmbedUrl, buildCanvaViewUrl, parseCanvaUrl } from '../utils/canva-url.util';

import { PageBlock } from '../../../frontoffice/core/models/block.model';

export interface CanvaResolveResult {
  designId: string;
  shareToken?: string;
  embedUrl: string;
  viewUrl: string;
}

@Injectable({ providedIn: 'root' })
export class CanvaService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  async resolveUrl(url: string): Promise<CanvaResolveResult | null> {
    const trimmed = url?.trim();
    if (!trimmed) return null;

    const local = parseCanvaUrl(trimmed);
    if (local) {
      return {
        designId: local.designId,
        shareToken: local.shareToken,
        embedUrl: buildCanvaEmbedUrl(local.designId, local.shareToken),
        viewUrl: buildCanvaViewUrl(local.designId, local.shareToken),
      };
    }

    try {
      return await firstValueFrom(
        this.http.get<CanvaResolveResult>(`${this.api}/Articles/canva/resolve`, {
          params: { url: trimmed },
        }),
      );
    } catch {
      return null;
    }
  }

  async resolveSlidesInBlocks(blocks: PageBlock[]): Promise<PageBlock[]> {
    const resolved: PageBlock[] = [];
    for (const block of blocks) {
      if (block.type !== 'slides') {
        resolved.push(block);
        continue;
      }
      const data = { ...(block as any).data };
      if (data.canvaUrl?.trim() && (!data.canvaDesignId || !data.canvaShareToken)) {
        const result = await this.resolveUrl(data.canvaUrl);
        if (result) {
          data.canvaDesignId = result.designId;
          if (result.shareToken) data.canvaShareToken = result.shareToken;
        }
      }
      resolved.push({ ...block, data } as PageBlock);
    }
    return resolved;
  }
}
