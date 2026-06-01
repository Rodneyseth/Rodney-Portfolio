import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { projects } from '../data/projects'
import ChurnDemo from '../components/ChurnDemo'
import AppleRetailDemo from '../components/AppleRetailDemo'
import PaySimDemo from '../components/PaySimDemo'
import styles from './ProjectDetailPage.module.css'

const ICONS = {
  data:    { glyph: '󰋘', color: '#60a5fa' },
  sql:     { glyph: '󰆼', color: '#a78bfa' },
  python:  { glyph: '󰌠', color: '#facc15' },
  excel:   { glyph: '󱎏', color: '#4ade80' },
  powerbi: { glyph: '󰕉', color: '#f97316' },
  chart:   { glyph: '󰄧', color: '#f472b6' },
  pdf:     { glyph: '󰈦', color: '#fb7185' },
  log:     { glyph: '󰋊', color: '#94a3b8' },
  model:   { glyph: '◉',  color: '#e879f9' },
}

function FolderIcon({ type, size = 16 }) {
  const colors = {
    data: '#60a5fa', sql: '#a78bfa', python: '#facc15',
    excel: '#4ade80', powerbi: '#f97316', chart: '#f472b6',
    pdf: '#fb7185', log: '#94a3b8', model: '#e879f9',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={colors[type] || '#94a3b8'}>
      <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H7.621a1.5 1.5 0 0 1-1.06-.44L5.5 3H1.5Z"/>
    </svg>
  )
}

function FileIcon({ name }) {
  const ext = name.split('.').pop()
  const colors = { sql: '#a78bfa', py: '#facc15', csv: '#4ade80', xlsx: '#22c55e', pdf: '#fb7185', log: '#94a3b8', md: '#60a5fa' }
  return (
    <svg width={14} height={14} viewBox="0 0 16 16" fill={colors[ext] || '#64748b'}>
      <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.414A2 2 0 0 0 13.414 3L11 .586A2 2 0 0 0 9.586 0H4Zm7 1.5v2A1.5 1.5 0 0 0 12.5 5H14v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8Z"/>
    </svg>
  )
}

function ChartLightbox({ src, label, onClose }) {
  return (
    <div className={styles.lightbox} onClick={onClose}>
      <div className={styles.lightboxInner} onClick={e => e.stopPropagation()}>
        <button className={styles.lightboxClose} onClick={onClose}>✕</button>
        <img src={src} alt={label} className={styles.lightboxImg} />
        <p className={styles.lightboxLabel}>{label}</p>
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const project = projects.find(p => p.id === id)
  const [activeFolder, setActiveFolder] = useState(project?.folders[0]?.id ?? null)
  const [lightbox, setLightbox] = useState(null)

  if (!project) return <Navigate to="/projects" />

  const folder = project.folders.find(f => f.id === activeFolder)

  return (
    <div className={styles.page}>

      {/* ── Top bar ── */}
      <div className={styles.topbar}>
        <div className="container">
          <div className={styles.topbarInner}>
            <Link to="/projects" className={styles.back}>
              ← Projects
            </Link>
            <div className={styles.breadcrumb}>
              <span className={styles.breadRoot}>portfolio</span>
              <span className={styles.sep}>/</span>
              <span className={styles.breadProject}>{project.id}</span>
              {folder && (
                <>
                  <span className={styles.sep}>/</span>
                  <span className={styles.breadFolder}>{folder.id}</span>
                </>
              )}
            </div>
            <div className={styles.projectMeta}>
              <span className={styles.metaTag} style={{ color: project.accent, borderColor: project.accent + '50', background: project.accent + '10' }}>
                {project.tag}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Explorer layout ── */}
      <div className={styles.explorer}>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <svg className={styles.sidebarChevron} viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className={styles.sidebarTitle}>{project.id}</span>
          </div>

          <ul className={styles.tree}>
            {project.folders.map((f) => (
              <li key={f.id}>
                <button
                  className={`${styles.treeItem} ${activeFolder === f.id ? styles.treeItemActive : ''}`}
                  onClick={() => setActiveFolder(f.id)}
                  style={activeFolder === f.id ? { '--item-accent': ICONS[f.icon]?.color ?? '#60a5fa' } : {}}
                >
                  <span className={styles.treeIndent} />
                  <FolderIcon type={f.icon} size={15} />
                  <span className={styles.treeName}>{f.label}</span>
                  {activeFolder === f.id && <span className={styles.treeActive} />}
                </button>
              </li>
            ))}
          </ul>

          {/* Project stats */}
          <div className={styles.sidebarStats}>
            {project.metrics.map(m => (
              <div key={m} className={styles.stat}>
                <span className={styles.statDot} style={{ background: project.accent }} />
                <span>{m}</span>
              </div>
            ))}
          </div>

          {/* GitHub link */}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubBtn}
            >
              <svg width={15} height={15} viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              View on GitHub
            </a>
          )}
        </aside>

        {/* Content panel */}
        <main className={styles.content}>
          {folder?.demo ? (
            <div className={styles.panel}>
              {folder.demoType === 'apple' ? <AppleRetailDemo /> : folder.demoType === 'paysim' ? <PaySimDemo /> : <ChurnDemo />}
            </div>
          ) : folder ? (
            <div className={styles.panel}>

              {/* Panel header */}
              <div className={styles.panelHeader}>
                <div className={styles.panelHeaderLeft}>
                  <FolderIcon type={folder.icon} size={20} />
                  <div>
                    <h2 className={styles.panelTitle}>{folder.label}</h2>
                    <span className={styles.panelPhase}>{folder.phase}</span>
                  </div>
                </div>
                <div className={styles.panelHeaderRight}>
                  <span className={styles.panelSummary}>{folder.summary}</span>
                  {project.github && folder.id !== '00_demo' && (
                    <a
                      href={`${project.github}/${folder.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.folderGithubLink}
                    >
                      <svg width={12} height={12} viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                      View folder on GitHub
                    </a>
                  )}
                </div>
              </div>

              {/* Body text */}
              <div className={styles.panelBody}>
                {folder.body.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Files list */}
              {folder.files?.length > 0 && (
                <div className={styles.fileList}>
                  <h3 className={styles.fileListTitle}>Files</h3>
                  <ul>
                    {folder.files.map(f => (
                      <li key={f.name} className={styles.fileItem}>
                        <FileIcon name={f.name} />
                        <span className={styles.fileName}>
                          {f.link
                            ? <a href={f.link} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>{f.name}</a>
                            : f.name
                          }
                        </span>
                        {f.size && <span className={styles.fileSize}>{f.size}</span>}
                        {f.note && <span className={styles.fileNote}>{f.note}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Code snippet */}
              {folder.snippet && (
                <div className={styles.snippet}>
                  <div className={styles.snippetBar}>
                    <span className={styles.snippetDot} style={{ background: '#ef4444' }} />
                    <span className={styles.snippetDot} style={{ background: '#f59e0b' }} />
                    <span className={styles.snippetDot} style={{ background: '#22c55e' }} />
                    <span className={styles.snippetLabel}>{folder.files?.[0]?.name ?? 'code'}</span>
                  </div>
                  <pre className={styles.code}><code>{folder.snippet}</code></pre>
                </div>
              )}

              {/* Charts grid */}
              {folder.charts?.length > 0 && (
                <div className={styles.chartsSection}>
                  <h3 className={styles.fileListTitle}>Chart Outputs</h3>
                  <div className={styles.chartsGrid}>
                    {folder.charts.map(c => (
                      <button
                        key={c.file}
                        className={styles.chartThumb}
                        onClick={() => setLightbox(c)}
                      >
                        <img
                          src={`/projects/${id}/${c.file}`}
                          alt={c.label}
                          className={styles.chartImg}
                        />
                        <div className={styles.chartOverlay}>
                          <span className={styles.chartLabel}>{c.label}</span>
                          <span className={styles.chartDesc}>{c.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF CTA */}
              {folder.files?.some(f => f.link) && (
                <div className={styles.pdfCta}>
                  {folder.files.filter(f => f.link).map(f => (
                    <a
                      key={f.name}
                      href={f.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.pdfBtn}
                      style={{ background: project.accent + '15', borderColor: project.accent + '50', color: project.accent }}
                    >
                      <svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor">
                        <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.414A2 2 0 0 0 13.414 3L11 .586A2 2 0 0 0 9.586 0H4Zm7 1.5v2A1.5 1.5 0 0 0 12.5 5H14v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8Z"/>
                      </svg>
                      Open {f.name} ↗
                    </a>
                  ))}
                </div>
              )}

            </div>
          ) : (
            <div className={styles.empty}>
              <span>Select a folder from the sidebar</span>
            </div>
          )}
        </main>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <ChartLightbox
          src={`/projects/${id}/${lightbox.file}`}
          label={lightbox.label}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}
