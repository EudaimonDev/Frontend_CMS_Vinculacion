import {
  cssColor,
  ctaVariantColors,
  defaultCardsColorData,
  defaultHeroColorData,
  defaultTextColorData,
  heroBackgroundStyle,
} from './block-color.util';
import {
  heroSubtitleFontSize,
  heroTitleStyle,
  heroTitleTag,
  imageAlignStyles,
} from './block-typography.util';
import {
  buildCanvaEmbedFromBlockData,
  buildCanvaViewFromBlockData,
  CANVA_IFRAME_ATTRS,
} from './canva-url.util';

const TEXT_CONTAIN =
  'max-width:100%;overflow-wrap:anywhere;word-break:break-word;overflow-x:hidden;box-sizing:border-box';

const ARTICLE_CONTENT_WRAP =
  'display:block;width:100%;max-width:860px;margin:0 auto;padding:1rem 2rem;box-sizing:border-box';

/** Convierte bloques del editor a HTML con los colores por defecto del editor visual. */
export function blocksToHtml(blocks: unknown[]): string {
  const heroDefaults = defaultHeroColorData();
  const textDefaults = defaultTextColorData();
  const cardsDefaults = defaultCardsColorData();

  return (blocks as Array<{ type: string; visible?: boolean; order?: number; data: Record<string, unknown> }>)
    .filter((b) => b.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((b) => {
      const data = b.data ?? {};
      switch (b.type) {
        case 'text': {
          const align = (data['align'] as string) ?? 'left';
          const wrapStyles = [
            TEXT_CONTAIN,
            ARTICLE_CONTENT_WRAP,
            `text-align:${align}`,
            `background-color:${cssColor(data['backgroundColor'] as string, textDefaults['backgroundColor'])}`,
            `color:${cssColor(data['textColor'] as string, textDefaults['textColor'])}`,
          ].join(';');
          const titleStyle = [
            `color:${cssColor(data['titleColor'] as string, textDefaults['titleColor'])}`,
            'overflow-wrap:anywhere;word-break:break-word',
            'font-size:1.875rem;font-weight:700;margin:0 0 0.75rem',
          ].join(';');
          const titleHtml = data['title']
            ? `<h2 style="${titleStyle}">${data['title']}</h2>`
            : '';
          const body = (data['html'] as string) ?? '';
          return `<div class="article-block article-block--text" style="${wrapStyles}">${titleHtml}${body}</div>`;
        }
        case 'video': {
          const videoId = (data['url'] as string)?.match(
            /(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/,
          )?.[1];
          if (!videoId) return '';
          const titleHtml = data['title']
            ? `<h3 class="video-embed__title" style="margin:0.5rem 0 0;font-size:1.125rem;font-weight:600;color:#1e293b;text-align:center;line-height:1.4">${data['title']}</h3>`
            : '';
          return `<div class="article-block article-block--video" style="display:block;width:70%;max-width:70%;margin:0.5rem auto;padding:0 1rem;box-sizing:border-box">
              <div class="video-embed" style="position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;background:#000">
                <iframe src="https://www.youtube.com/embed/${videoId}"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;border:0"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen></iframe>
              </div>
              ${titleHtml}
            </div>`;
        }
        case 'image': {
          const fullWidth = !!data['fullWidth'];
          const w = data['width'] ? Number(data['width']) : null;
          const h = data['height'] ? Number(data['height']) : null;
          const align = imageAlignStyles(data['align'] as string | undefined);
          const wrapClass = fullWidth
            ? 'article-block article-block--image article-block--image-full'
            : 'article-block article-block--image';
          const wrapStyles = fullWidth
            ? `margin:0;width:100%;padding:0;box-sizing:border-box;${align.figure}`
            : `margin:0 auto;width:fit-content;max-width:860px;padding:0 2rem;box-sizing:border-box;${align.figure}`;
          let imgStyles = `max-width:100%;height:auto;border-radius:8px;display:block;vertical-align:top;${align.img}`;
          if (fullWidth) {
            imgStyles += 'width:100%;';
            if (w && h) imgStyles += `aspect-ratio:${w}/${h};`;
          } else if (w) {
            imgStyles += `width:min(${w}px,100%);`;
          } else {
            imgStyles += 'width:auto;';
          }
          const captionHtml = data['caption']
            ? `<figcaption style="margin-top:0.5rem;${align.caption}font-size:0.875rem;color:#64748b">${data['caption']}</figcaption>`
            : '';
          return `<figure class="${wrapClass}" style="${wrapStyles}">
              <img src="${data['src']}" alt="${data['alt'] ?? ''}" style="${imgStyles}" />
              ${captionHtml}
            </figure>`;
        }
        case 'hero': {
          const bgStyle = heroBackgroundStyle(data);
          const titleTag = heroTitleTag(data['titleLevel'] as string | undefined);
          const titleStyle = `color:${cssColor(data['titleColor'] as string, heroDefaults['titleColor'])};${heroTitleStyle(data['titleLevel'] as string | undefined)}`;
          const subtitleStyle = [
            `color:${cssColor(data['subtitleColor'] as string, heroDefaults['subtitleColor'])};`,
            `font-size:${heroSubtitleFontSize(data['subtitleSize'] as string | undefined)};`,
            'text-shadow:0 1px 3px rgba(0,0,0,0.5);overflow-wrap:anywhere;word-break:break-word;margin:0 0 0.75rem;line-height:1.6',
          ].join('');
          const ctaStyle = [
            `background:${cssColor(data['ctaBackgroundColor'] as string, heroDefaults['ctaBackgroundColor'])};`,
            `color:${cssColor(data['ctaTextColor'] as string, heroDefaults['ctaTextColor'])};`,
            'display:inline-block;padding:0.625rem 1.5rem;border-radius:999px;text-decoration:none;font-weight:700;font-size:0.9375rem',
          ].join('');
          return `<div class="article-block article-block--hero" style="position:relative;padding:1.25rem 2rem;overflow:hidden;min-height:160px;width:100%;${TEXT_CONTAIN};${bgStyle}">
              ${data['backgroundImage'] ? `
                <img src="${data['backgroundImage']}"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0"
                  alt="hero background" />
                <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:1"></div>
              ` : ''}
              <div style="position:relative;z-index:2;max-width:100%;min-width:0">
                <${titleTag} style="${titleStyle}">${data['title'] ?? ''}</${titleTag}>
                ${data['subtitle'] ? `<p style="${subtitleStyle}">${data['subtitle']}</p>` : ''}
                ${data['ctaLabel'] ? `<a href="${data['ctaRoute'] ?? '#'}" style="${ctaStyle}">${data['ctaLabel']}</a>` : ''}
              </div>
            </div>`;
        }
        case 'cards-grid': {
          const sectionStyle = `background-color:${cssColor(data['backgroundColor'] as string, cardsDefaults['backgroundColor'])};`;
          const titleStyle = `color:${cssColor(data['titleColor'] as string, cardsDefaults['titleColor'])};`;
          const subtitleStyle = `color:${cssColor(data['subtitleColor'] as string, cardsDefaults['subtitleColor'])};`;
          const cardStyle = [
            'padding:1rem;border-radius:8px',
            `background:${cssColor(data['cardBackgroundColor'] as string, cardsDefaults['cardBackgroundColor'])};`,
            `border:1px solid ${cssColor(data['cardBorderColor'] as string, cardsDefaults['cardBorderColor'])};`,
            `color:${cssColor(data['cardTextColor'] as string, cardsDefaults['cardTextColor'])};`,
            TEXT_CONTAIN,
          ].join(';');
          const columns = Number(data['columns'] ?? 2);
          return `<div class="article-block article-block--cards" style="${sectionStyle}${TEXT_CONTAIN};${ARTICLE_CONTENT_WRAP}">
              ${data['title'] ? `<h2 style="${titleStyle}font-size:1.5rem;font-weight:700;margin:0 0 0.375rem">${data['title']}</h2>` : ''}
              ${data['subtitle'] ? `<p style="${subtitleStyle}margin:0 0 0.75rem">${data['subtitle']}</p>` : ''}
              <div class="article-block__cards-grid" style="display:grid;grid-template-columns:repeat(${columns},minmax(0,1fr));gap:1rem;margin:0.5rem 0;max-width:100%;min-width:0">
                ${((data['cards'] as Array<{ title: string; description: string }>) ?? []).map(
                  (c) => `
                  <div style="${cardStyle}">
                    <strong>${c.title}</strong>
                    <p style="margin:0.25rem 0 0;font-size:0.875rem">${c.description}</p>
                  </div>`,
                ).join('')}
              </div>
            </div>`;
        }
        case 'slides': {
          const slideData = {
            canvaUrl: data['canvaUrl'] as string | undefined,
            canvaDesignId: data['canvaDesignId'] as string | undefined,
            canvaShareToken: data['canvaShareToken'] as string | undefined,
          };
          const canvaEmbed = buildCanvaEmbedFromBlockData(slideData);
          const canvaView = buildCanvaViewFromBlockData(slideData);
          if (!canvaEmbed) return '';
          const titleHtml = data['title']
            ? `<p class="slides-block__title" style="margin:0.5rem 0 0;text-align:center;font-size:1rem;font-weight:600;color:#1e293b">${data['title']}</p>`
            : '';
          const fallbackHtml = canvaView
            ? `<p class="slides-block__link" style="margin:0.5rem 0 0;text-align:center;font-size:0.875rem"><a href="${canvaView}" target="_blank" rel="noopener noreferrer" style="color:#1e5fa8;font-weight:600">Abrir presentación en Canva</a></p>`
            : '';
          return `<div class="article-block article-block--slides" style="width:85%;max-width:780px;margin:0.75rem auto;padding:0 1.5rem;box-sizing:border-box">
              <div class="canva-embed" style="position:relative;width:100%;height:0;padding-top:56.2225%;
                box-shadow:0 2px 8px 0 rgba(63,69,81,0.16);overflow:hidden;border-radius:8px;">
              <iframe loading="lazy" style="position:absolute;width:100%;height:100%;top:0;left:0;border:none;padding:0;margin:0;"
                src="${canvaEmbed}" ${CANVA_IFRAME_ATTRS}></iframe>
            </div>${titleHtml}${fallbackHtml}</div>`;
        }
        case 'cta': {
          const variant = ctaVariantColors(data['variant'] as string | undefined);
          return `<div class="article-block article-block--cta ${variant.className}" style="padding:1.5rem 2rem;text-align:center;background:${variant.background};color:#ffffff;width:100%;${TEXT_CONTAIN}">
              <h2 style="color:#ffffff;font-size:clamp(1.5rem,3vw,2.25rem);font-weight:700;margin:0 0 0.75rem">${data['title']}</h2>
              ${data['description'] ? `<p style="color:rgba(255,255,255,0.9);font-size:1.0625rem;line-height:1.6;margin:0 0 1rem">${data['description']}</p>` : ''}
              <a href="${data['primaryRoute'] ?? '#'}" style="display:inline-block;padding:0.875rem 2rem;background:#ffffff;color:${variant.buttonText};border-radius:999px;text-decoration:none;font-weight:700;font-size:0.9375rem">${data['primaryLabel']}</a>
            </div>`;
        }
        default:
          return '';
      }
    })
    .join('\n');
}
