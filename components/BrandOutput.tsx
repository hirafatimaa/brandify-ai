'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowDown, ArrowDownToLine, ArrowLeft, ArrowRight, Check, Clipboard, FileText, Grid2X2, RotateCcw } from 'lucide-react';
import { cmyk, colorKeys, contrastPairs, filename, fonts, proportions, readableOn, recolor, rgb, similarityLimit, svgUrl, type BrandFont, type BrandResult } from '@/lib/brand/model';

const chapters = [
  ['foundation', 'Foundation'],
  ['marks', 'Marks'],
  ['color', 'Color'],
  ['typography', 'Typography'],
  ['voice', 'Voice'],
  ['applications', 'Applications'],
  ['exports', 'Exports'],
] as const;

type Format = 'guidelines' | 'assets' | 'logo-book' | 'avatar' | 'poster';
type Props = {
  result: BrandResult;
  onEdit: () => void;
  onRetry: () => void;
  onMarketing: () => void;
  busy: boolean;
  selected: number;
  onSelect: (index: number) => void;
};

const displayClasses: Record<BrandFont, string> = {
  manrope: 'guide-manrope', syne: 'guide-syne', instrument: 'guide-instrument', barlow: 'guide-barlow',
};

function Artwork({ svg, color, alt, ...props }: { svg: string; color: string; alt: string; className?: string; style?: CSSProperties }) {
  /* eslint-disable-next-line @next/next/no-img-element */
  return <img src={svgUrl(recolor(svg, color))} alt={alt} draggable={false} {...props} />;
}

function Chapter({ id, title, children }: { id: (typeof chapters)[number][0]; title: string; children: ReactNode }) {
  return (
    <section className="guide-chapter" id={id} aria-labelledby={`${id}-title`}>
      {id === 'foundation' ? <p className="guide-kicker">{title}</p> : <div className="guide-section-head">
        <h2 id={`${id}-title`}>{title}</h2>
        <span>{chapters.find((chapter) => chapter[0] === id)?.[1]}</span>
      </div>}
      {children}
    </section>
  );
}

function DownloadLink({ svg, color, file, children }: { svg: string; color: string; file: string; children: ReactNode }) {
  return <a className="guide-inline-action" download={file} href={svgUrl(recolor(svg, color))}>{children}<ArrowDownToLine size={14} aria-hidden="true" /></a>;
}

export function BrandOutput({ result, onEdit, onRetry, onMarketing, busy, selected, onSelect }: Props) {
  const [chapter, setChapter] = useState('foundation');
  const [pending, setPending] = useState<Format | null>(null);
  const [notice, setNotice] = useState('');
  const [exportError, setExportError] = useState('');
  const [sample, setSample] = useState(result.draft.voice.headline);
  const [copied, setCopied] = useState('');
  const { brief, draft, logos, source, note } = result;
  const logo = logos[selected];
  const { palette } = logo;
  const name = filename(brief.businessName);
  const sampleClass = displayClasses[logo.font];
  const accentInk = readableOn(palette.accent.hex);

  useEffect(() => {
    const sections = chapters.map(([id]) => document.getElementById(id)).filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) setChapter(visible.target.id);
    }, { rootMargin: '-14% 0px -68%' });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  async function copy(value: string, label: string) {
    setExportError('');
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setNotice(`Copied ${label}.`);
    } catch {
      setExportError('Clipboard access is unavailable here.');
    }
  }

  async function download(format: Format) {
    if (pending) return;
    setPending(format);
    setNotice('');
    setExportError('');
    let url: string | null = null;
    try {
      const response = await fetch('/api/brand-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: { brief, draft, source, note }, direction: selected, format }),
      });
      if (!response.ok) throw new Error('Export failed. Try downloading again.');
      url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name}-${format}.${format === 'assets' ? 'zip' : (format === 'avatar' || format === 'poster') ? 'png' : 'pdf'}`;
      document.body.append(link);
      link.click();
      link.remove();
      setNotice('Download started.');
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed. Try downloading again.');
    } finally {
      if (url) {
        const objectUrl = url;
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
      }
      setPending(null);
    }
  }

  const style = {
    '--identity-ink': palette.ink.hex,
    '--identity-paper': palette.paper.hex,
    '--identity-accent': palette.accent.hex,
    '--identity-on-accent': accentInk,
    '--identity-tint': palette.tint.hex,
  } as CSSProperties;

  return (
    <div className="guide-shell" style={style}>
      <header className="guide-toolbar">
        <button type="button" className="guide-plain" onClick={onEdit} disabled={busy}>
          <ArrowLeft size={16} aria-hidden="true" /> Edit brief
        </button>
        <button type="button" className="guide-plain guide-toolbar-marketing" onClick={onMarketing} disabled={busy}>
          Marketing kit <ArrowRight size={15} aria-hidden="true" />
        </button>
        <button type="button" className="guide-action guide-action-primary" onClick={() => download('guidelines')} disabled={Boolean(pending)}>
          {pending === 'guidelines' ? 'Preparing PDF…' : 'Download PDF'} <ArrowDownToLine size={15} aria-hidden="true" />
        </button>
      </header>

      <div className="guide-layout">
        <aside className="guide-rail">
          <div className="guide-index">
            <div className="guide-rail-title">Contents</div>
            <nav aria-label="Brand guideline sections">
              {chapters.map(([id, label]) => (
                <a key={id} href={`#${id}`} aria-current={id === chapter ? 'location' : undefined} onClick={() => setChapter(id)}>{label}</a>
              ))}
            </nav>
          </div>
          <div className="guide-rail-actions">
            <button className="guide-plain" type="button" onClick={() => download('assets')} disabled={Boolean(pending)}>
              <ArrowDownToLine size={15} aria-hidden="true" /> {pending === 'assets' ? 'Preparing ZIP…' : 'Asset ZIP'}
            </button>
            <button className="guide-plain" type="button" onClick={() => download('logo-book')} disabled={Boolean(pending)}>
              <Grid2X2 size={15} aria-hidden="true" /> {pending === 'logo-book' ? 'Preparing book…' : 'Logo book'}
            </button>
          </div>
        </aside>

        <article className="guide-document">
          <Chapter id="foundation" title="Brand guidelines">
            <div className="guide-heading">
              <h1 id="foundation-title">{brief.businessName}</h1>
              <p>{draft.tagline}</p>
            </div>

            {source === 'local' && (
              <div className="guide-preview-note">
                <div><strong>Local preview</strong><p>{note}</p></div>
                <button type="button" className="guide-plain" onClick={onRetry} disabled={busy}>
                  <RotateCcw size={14} aria-hidden="true" /> {busy ? 'Retrying…' : 'Retry'}
                </button>
              </div>
            )}

            <div className="guide-cover">
              <div className="guide-cover-meta"><span>{brief.industry}</span><span>Primary signature</span></div>
              <Artwork svg={logo.lockupSvg} color={palette.paper.hex} alt={`${brief.businessName} primary signature`} className="guide-cover-art" />
              <div className="guide-cover-meta guide-cover-foot"><span>{logo.title}</span><a href="#marks" aria-label="Jump to marks"><ArrowDown size={18} aria-hidden="true" /></a></div>
            </div>

            <div className="guide-description">
              <h3>Introduction</h3>
              <div><p>{draft.introduction}</p><p>{draft.positioning}</p></div>
            </div>
          </Chapter>

          <Chapter id="marks" title="Logo system">
            <fieldset className="guide-directions">
              <legend>Choose a direction</legend>
              <div className="guide-direction-grid">
                {logos.map((direction, index) => (
                  <label key={index} className={`guide-direction ${selected === index ? 'is-selected' : ''}`}>
                    <input type="radio" name="logo-direction" checked={index === selected} onChange={() => onSelect(index)} className="sr-only" />
                    <div className="guide-direction-art" style={{ background: direction.palette.tint.hex }}>
                      <Artwork svg={direction.kind === 'wordmark' ? direction.wordmarkSvg : direction.markSvg} color={direction.palette.ink.hex} alt="" />
                    </div>
                    <span>{direction.title}{selected === index && <Check size={14} aria-hidden="true" />}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="guide-description guide-direction-summary">
              <h3>{logo.title}</h3>
              <div>
                <p>{logo.idea}</p>
                {logo.kind === 'trace' && <p>Adapted from moodboard reference {logo.reference}.</p>}
                {logo.checks.referenceCount > 0 && <p className="guide-caption">{logo.checks.referenceCount} reference silhouettes compared. {logo.kind !== 'trace' && (logo.checks.nearest ?? 0) >= similarityLimit ? 'Close match found. Review before adopting.' : ''}</p>}
              </div>
            </div>
            <div className="guide-marks-grid">
              <figure>
                <div className="guide-mark-face">
                  <Artwork svg={logo.lockupSvg} color={palette.ink.hex} alt="Primary signature" />
                </div>
                <figcaption><span>Primary signature</span><DownloadLink svg={logo.lockupSvg} color={palette.ink.hex} file={`${name}-signature.svg`}>SVG</DownloadLink></figcaption>
              </figure>
              <figure>
                <div className="guide-mark-face guide-mark-reverse">
                  <Artwork svg={logo.lockupSvg} color={palette.paper.hex} alt="Reversed signature" />
                </div>
                <figcaption><span>Reversed signature</span><DownloadLink svg={logo.lockupSvg} color={palette.paper.hex} file={`${name}-signature-reverse.svg`}>SVG</DownloadLink></figcaption>
              </figure>
            </div>
            <div className="guide-marks-grid guide-mark-specs">
              <figure>
                <div className="guide-construction">
                  <div className="guide-construction-box"><Artwork svg={logo.markSvg} color={palette.ink.hex} alt="Symbol aligned on the construction grid" /></div>
                </div>
                <figcaption><span>Symbol construction</span><DownloadLink svg={logo.markSvg} color={palette.ink.hex} file={`${name}-symbol.svg`}>SVG</DownloadLink></figcaption>
              </figure>
              <figure>
                <div className="guide-scales">
                  {[16, 32, 64].map((size) => <div key={size}><Artwork svg={logo.markSvg} color={palette.ink.hex} alt="" style={{ width: size, height: size }} /><span>{size} px</span></div>)}
                </div>
                <figcaption><span>Small-size proof</span><span>{logo.checks.faviconReady ? '16 px check passed' : 'Simplify at 16 px'}</span></figcaption>
              </figure>
            </div>
            <div className="guide-description">
              <h3>Clear space</h3>
              <p>Keep half the symbol height clear around the artwork. Use the full signature at 128 px wide or more and switch to the symbol for avatars and compact navigation. Check small print on a proof at actual size.</p>
            </div>
          </Chapter>

          <Chapter id="color" title="Core palette">
            <div className="guide-swatches">
              {colorKeys.map((key) => {
                const color = palette[key];
                const value = color.hex.toUpperCase();
                return (
                  <div className="guide-swatch" key={key}>
                    <button type="button" className="guide-color-chip" style={{ background: value, color: readableOn(value) }} onClick={() => copy(value, value)} aria-label={`Copy ${color.name} hex ${value}`}>
                      {copied === value ? <Check size={16} /> : <Clipboard size={16} />}
                    </button>
                    <h3>{color.name}</h3>
                    <dl><div><dt>HEX</dt><dd>{value}</dd></div><div><dt>RGB</dt><dd>{rgb(value).join(', ')}</dd></div><div><dt>CMYK</dt><dd>{cmyk(value).join(', ')}</dd></div></dl>
                    <p>{color.use}</p>
                  </div>
                );
              })}
            </div>
            <div className="guide-subsection-heading"><h3>Color balance</h3><button type="button" className="guide-inline-action" onClick={() => copy(colorKeys.map((key) => `--brand-${key}: ${palette[key].hex};`).join('\n'), 'CSS colors')}>Copy CSS <Clipboard size={14} /></button></div>
            <div className="guide-proportions" role="img" aria-label={colorKeys.map((key) => `${palette[key].name} ${proportions[key]} percent`).join(', ')}>
              {colorKeys.map((key) => <span key={key} style={{ flex: proportions[key], background: palette[key].hex, color: readableOn(palette[key].hex) }}>{proportions[key]}%</span>)}
            </div>
            <div className="guide-subsection-heading"><h3>Readable combinations</h3></div>
            <div className="guide-contrast">
              {contrastPairs(palette).map(({ fg, bg, ratio }, index) => <div key={index}>
                <div style={{ background: bg.hex, color: fg.hex }} aria-hidden="true">Aa</div>
                <p>{fg.name} on {bg.name}<span>{ratio.toFixed(2)}:1 · {ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Below AA'}</span></p>
              </div>)}
            </div>
            <p className="guide-caption">Use AA or better for normal text. CMYK values are estimates. Confirm the print profile with your printer.</p>
          </Chapter>

          <Chapter id="typography" title="Type system">
            <figure className="guide-type-specimen">
              <figcaption><span>Display · {fonts[logo.font].name}</span><span>{fonts[logo.font].weight}</span></figcaption>
              <textarea className={`guide-type-input ${sampleClass}`} aria-label={`Try ${fonts[logo.font].name}`} value={sample} maxLength={160} rows={2} onChange={(event) => setSample(event.target.value)} />
              <div className="guide-type-actions"><button type="button" className="guide-inline-action" onClick={() => setSample(draft.voice.headline)}>Reset sample <RotateCcw size={13} /></button></div>
            </figure>
            <div className="guide-description guide-body-specimen">
              <h3>Body · Manrope</h3><p>{draft.typography}</p>
            </div>
            <dl className="guide-type-scale">
              {[['Display', '64 px / 1.05', 'Aa', 64], ['Heading', '40 px / 1.1', 'Aa', 40], ['Body', '16 px / 1.55', 'Aa', 16], ['Caption', '12 px / 1.5', 'Aa', 12]].map(([label, scale, text, size], index) => (
                <div key={label}><dt>{label}</dt><dd>{scale}</dd><dd className={index < 2 ? sampleClass : ''} style={{ fontSize: size }}>{text}</dd></div>
              ))}
            </dl>
          </Chapter>

          <Chapter id="voice" title="Tone of voice">
            <div className="guide-voice-hero">
              <p className={sampleClass}>{draft.voice.headline}</p>
              <span>{draft.voice.action}</span>
            </div>
            <div className="guide-description"><h3>How we sound</h3><p>{draft.voice.summary}</p></div>
            <div className="guide-principles">
              {draft.voice.principles.map((principle) => <div key={principle.title}>
                <h3>{principle.title}</h3><p>{principle.guidance}</p><blockquote>{principle.example}</blockquote>
              </div>)}
            </div>
          </Chapter>

          <Chapter id="applications" title="Brand in use">
            <div className="guide-app-grid">
              <figure>
                <div className="guide-poster">
                  <Artwork svg={logo.lockupSvg} color={palette.paper.hex} alt="" />
                  <p className={sampleClass}>{draft.voice.headline}</p>
                  <span>{draft.voice.action}</span>
                </div>
                <figcaption><span>Campaign layout</span><button type="button" className="guide-inline-action" onClick={() => download('poster')} disabled={Boolean(pending)}>{pending === 'poster' ? 'Preparing…' : 'PNG'} <ArrowDownToLine size={14} /></button></figcaption>
                <p>{draft.applications.poster}</p>
              </figure>
              <figure>
                <div className="guide-avatar"><Artwork svg={logo.markSvg} color={accentInk} alt={`${brief.businessName} avatar`} /></div>
                <figcaption><span>Social avatar</span><button type="button" className="guide-inline-action" onClick={() => download('avatar')} disabled={Boolean(pending)}>{pending === 'avatar' ? 'Preparing…' : 'PNG'} <ArrowDownToLine size={14} /></button></figcaption>
                <p>{draft.applications.social}</p>
              </figure>
            </div>
          </Chapter>

          <Chapter id="exports" title="Export the identity">
            <p className="guide-caption">Files follow the selected logo direction, {logo.title}.</p>
            <div className="guide-export-list">
              <ExportRow label="Brand guidelines" detail="PDF · 16:9 landscape" pending={pending} format="guidelines" download={download} />
              <ExportRow label="Logo directions" detail="PDF · six directions and small-size proofs" pending={pending} format="logo-book" download={download} />
              <ExportRow label="Production assets" detail="ZIP · SVG, PNG, ICO, color tokens and font licenses" pending={pending} format="assets" download={download} />
            </div>
          </Chapter>

          <footer className="guide-footer"><span>{brief.businessName}</span><a href="#foundation">Back to top ↑</a></footer>
        </article>
      </div>
      <div role="status" className="sr-only">{notice}</div>
      {exportError && <div role="alert" className="guide-export-error">{exportError}<button type="button" onClick={() => setExportError('')}>Dismiss</button></div>}
    </div>
  );
}

function ExportRow({ label, detail, format, pending, download }: { label: string; detail: string; format: Format; pending: Format | null; download: (format: Format) => void }) {
  return (
    <div className="guide-export-row">
      <div><h3>{label}</h3><p>{detail}</p></div>
      <button type="button" className="guide-action" aria-label={`Download ${label.toLowerCase()}`} disabled={Boolean(pending)} onClick={() => download(format)}>
        {pending === format ? 'Preparing…' : 'Download'} {format === 'assets' ? <ArrowDownToLine size={15} /> : <FileText size={15} />}
      </button>
    </div>
  );
}
