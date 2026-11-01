'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Archive, Bookmark, Check, Clipboard, Copy, Link2, Moon, Plus, Search, Sparkles, Sun, Trash2 } from 'lucide-react';

type Clip = {
  id: string;
  content: string;
  kind: 'text' | 'link';
  pinned: boolean;
  createdAt: number;
};

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'kangaroo-pocket-clips-v1';
const THEME_KEY = 'kangaroo-pocket-theme-v1';

function detectKind(value: string): 'text' | 'link' {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? 'link' : 'text';
  } catch { return 'text'; }
}

export default function Home() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState<'all' | 'pinned'>('all');
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [theme, setTheme] = useState<Theme>('light');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setClips(JSON.parse(saved) as Clip[]);
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
    } catch { /* ignore invalid local data */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(clips));
  }, [clips, ready]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#171624' : '#f5f4ff');
  }, [theme]);

  const visible = useMemo(() => clips
    .filter(c => filter === 'all' || c.pinned)
    .filter(c => c.content.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt), [clips, filter, query]);

  function addClip() {
    const content = draft.trim();
    if (!content) return;
    setClips(prev => [{ id: crypto.randomUUID(), content, kind: detectKind(content), pinned: false, createdAt: Date.now() }, ...prev]);
    setDraft('');
    setNotice('포켓에 저장했어요');
    window.setTimeout(() => setNotice(''), 1800);
  }

  async function copyClip(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setNotice('클립보드에 복사했어요');
    } catch {
      setNotice('복사 권한을 확인해 주세요');
    }
    window.setTimeout(() => setNotice(''), 1800);
  }

  function togglePin(id: string) {
    setClips(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  }

  function removeClip(id: string) {
    setClips(prev => prev.filter(c => c.id !== id));
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Kangaroo Pocket 홈">
          <span className="brandIcon"><Archive size={21} /></span>
          <span>Kangaroo <b>Pocket</b></span>
        </a>
        <div className="topbarRight">
          <button className="themeToggle" onClick={() => setTheme(current => current === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            title={theme === 'light' ? '다크 모드' : '라이트 모드'}>
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            <span>{theme === 'light' ? '다크 모드' : '라이트 모드'}</span>
          </button>
          <span className="sync"><span className="syncDot" /> 이 기기에 저장 중</span>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow"><Sparkles size={14} /> YOUR LITTLE DIGITAL POCKET</div>
        <h1>필요한 순간,<br /><span>다시 꺼내 쓰세요.</span></h1>
        <p>자주 쓰는 문장과 링크를 한곳에 모아두세요.</p>
      </section>

      <section className="composer glass">
        <div className="composerHead">
          <div><span className="miniIcon"><Plus size={16} /></span><b>새로운 클립 저장</b></div>
          <span className="hint">텍스트 또는 링크</span>
        </div>
        <textarea ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') addClip(); }}
          placeholder="여기에 보관하고 싶은 내용을 붙여넣으세요..." rows={3} />
        <div className="composerFoot">
          <span className="shortcut">⌘ / Ctrl + Enter 로 빠르게 저장</span>
          <button className="primaryBtn" onClick={addClip} disabled={!draft.trim()}><Plus size={17} /> 포켓에 담기</button>
        </div>
      </section>

      <section className="library">
        <div className="sectionHead">
          <div><h2>내 포켓</h2><p>{clips.length}개의 클립이 보관되어 있어요</p></div>
          <div className="tabs">
            <button className={filter === 'all' ? 'tab active' : 'tab'} onClick={() => setFilter('all')}><Archive size={15} /> 전체</button>
            <button className={filter === 'pinned' ? 'tab active' : 'tab'} onClick={() => setFilter('pinned')}><Bookmark size={15} /> 고정됨</button>
          </div>
        </div>

        <label className="searchBox"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="클립 검색하기" /><kbd>⌕</kbd></label>

        {visible.length === 0 ? (
          <div className="empty glass">
            <div className="emptyIcon"><Clipboard size={25} /></div>
            <h3>{query ? '검색 결과가 없어요' : filter === 'pinned' ? '아직 고정한 클립이 없어요' : '포켓이 아직 비어 있어요'}</h3>
            <p>{query ? '다른 검색어를 입력해 보세요.' : '위 입력창에 내용을 추가해 첫 클립을 만들어 보세요.'}</p>
          </div>
        ) : (
          <div className="clipGrid">
            {visible.map(clip => (
              <article className="clipCard glass" key={clip.id}>
                <div className="clipMeta">
                  <span className="typeTag">{clip.kind === 'link' ? <Link2 size={13} /> : <Clipboard size={13} />}{clip.kind === 'link' ? 'LINK' : 'TEXT'}</span>
                  <div className="cardActions">
                    <button className={clip.pinned ? 'iconBtn pinned' : 'iconBtn'} onClick={() => togglePin(clip.id)} aria-label={clip.pinned ? '고정 해제' : '고정'}><Bookmark size={16} fill={clip.pinned ? 'currentColor' : 'none'} /></button>
                    <button className="iconBtn danger" onClick={() => removeClip(clip.id)} aria-label="삭제"><Trash2 size={16} /></button>
                  </div>
                </div>
                <p className="clipContent">{clip.content}</p>
                <div className="clipBottom">
                  <span>{new Date(clip.createdAt).toLocaleDateString('ko-KR')}</span>
                  <button className="copyBtn" onClick={() => copyClip(clip.content)}><Copy size={15} /> 복사하기</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer><span className="footerMark">K</span><span>Kangaroo Pocket</span><span className="footerDot">·</span><span>당신의 작은 디지털 포켓</span></footer>
      {notice && <div className="toast"><Check size={16} />{notice}</div>}
    </main>
  );
}
