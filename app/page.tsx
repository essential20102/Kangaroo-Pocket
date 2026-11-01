'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Archive, Bookmark, Check, Clipboard, Copy, Link2, Moon, Plus, Search, Sparkles, Sun, Trash2, Languages } from 'lucide-react';

type Clip = {
  id: string;
  content: string;
  kind: 'text' | 'link';
  pinned: boolean;
  createdAt: number;
};

type Theme = 'light' | 'dark';
type Language = 'ko' | 'en';
const STORAGE_KEY = 'kangaroo-pocket-clips-v1';
const THEME_KEY = 'kangaroo-pocket-theme-v1';
const LANGUAGE_KEY = 'kangaroo-pocket-language-v1';

const copy = {
  ko: {
    home: 'Kangaroo Pocket 홈', language: '언어', sync: '이 기기에 저장 중',
    darkMode: '다크 모드', lightMode: '라이트 모드', switchDark: '다크 모드로 전환', switchLight: '라이트 모드로 전환',
    eyebrow: 'YOUR LITTLE DIGITAL POCKET', hero1: '필요한 순간,', hero2: '다시 꺼내 쓰세요.', intro: '자주 쓰는 문장과 링크를 한곳에 모아두세요.',
    newClip: '새로운 클립 저장', textOrLink: '텍스트 또는 링크', placeholder: '여기에 보관하고 싶은 내용을 붙여넣으세요...', shortcut: '⌘ / Ctrl + Enter 로 빠르게 저장', save: '포켓에 담기',
    myPocket: '내 포켓', clipCount: (n: number) => `${n}개의 클립이 보관되어 있어요`, all: '전체', pinned: '고정됨', search: '클립 검색하기',
    noResults: '검색 결과가 없어요', noPinned: '아직 고정한 클립이 없어요', empty: '포켓이 아직 비어 있어요', trySearch: '다른 검색어를 입력해 보세요.', addFirst: '위 입력창에 내용을 추가해 첫 클립을 만들어 보세요.',
    unpin: '고정 해제', pin: '고정', delete: '삭제', copy: '복사하기', footer: '당신의 작은 디지털 포켓',
    saved: '포켓에 저장했어요', copied: '클립보드에 복사했어요', copyError: '복사 권한을 확인해 주세요',
  },
  en: {
    home: 'Kangaroo Pocket home', language: 'Language', sync: 'Saved on this device',
    darkMode: 'Dark mode', lightMode: 'Light mode', switchDark: 'Switch to dark mode', switchLight: 'Switch to light mode',
    eyebrow: 'YOUR LITTLE DIGITAL POCKET', hero1: 'Keep what matters.', hero2: 'Find it when you need it.', intro: 'Keep your go-to notes and links in one handy place.',
    newClip: 'Save a new clip', textOrLink: 'Text or link', placeholder: 'Paste something you want to keep here...', shortcut: 'Press ⌘ / Ctrl + Enter to save', save: 'Save to pocket',
    myPocket: 'My Pocket', clipCount: (n: number) => `${n} ${n === 1 ? 'clip' : 'clips'} saved`, all: 'All', pinned: 'Pinned', search: 'Search clips',
    noResults: 'No results found', noPinned: 'Nothing pinned yet', empty: 'Your pocket is empty', trySearch: 'Try a different search term.', addFirst: 'Add something above to save your first clip.',
    unpin: 'Unpin', pin: 'Pin', delete: 'Delete', copy: 'Copy', footer: 'Your little digital pocket',
    saved: 'Saved to your pocket', copied: 'Copied to clipboard', copyError: 'Please check clipboard permissions',
  },
} as const;

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
  const [language, setLanguage] = useState<Language>('ko');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const t = copy[language];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setClips(JSON.parse(saved) as Clip[]);
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
      const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage === 'ko' || savedLanguage === 'en') setLanguage(savedLanguage);
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

  useEffect(() => {
    document.documentElement.lang = language;
    if (ready) localStorage.setItem(LANGUAGE_KEY, language);
  }, [language, ready]);

  const visible = useMemo(() => clips
    .filter(c => filter === 'all' || c.pinned)
    .filter(c => c.content.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt), [clips, filter, query]);

  function addClip() {
    const content = draft.trim();
    if (!content) return;
    setClips(prev => [{ id: crypto.randomUUID(), content, kind: detectKind(content), pinned: false, createdAt: Date.now() }, ...prev]);
    setDraft('');
    setNotice(t.saved);
    window.setTimeout(() => setNotice(''), 1800);
  }

  async function copyClip(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setNotice(t.copied);
    } catch {
      setNotice(t.copyError);
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
        <a className="brand" href="#" aria-label={t.home}>
          <span className="brandIcon"><Archive size={21} /></span>
          <span>Kangaroo <b>Pocket</b></span>
        </a>
        <div className="topbarRight">
          <label className="languagePicker" aria-label={t.language}>
            <Languages size={15} />
            <select value={language} onChange={e => setLanguage(e.target.value as Language)} aria-label={t.language}>
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </label>
          <button className="themeToggle" onClick={() => setTheme(current => current === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? t.switchDark : t.switchLight}
            title={theme === 'light' ? t.darkMode : t.lightMode}>
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            <span>{theme === 'light' ? t.darkMode : t.lightMode}</span>
          </button>
          <span className="sync"><span className="syncDot" /> {t.sync}</span>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow"><Sparkles size={14} /> {t.eyebrow}</div>
        <h1>{t.hero1}<br /><span>{t.hero2}</span></h1>
        <p>{t.intro}</p>
      </section>

      <section className="composer glass">
        <div className="composerHead">
          <div><span className="miniIcon"><Plus size={16} /></span><b>{t.newClip}</b></div>
          <span className="hint">{t.textOrLink}</span>
        </div>
        <textarea ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') addClip(); }}
          placeholder={t.placeholder} rows={3} />
        <div className="composerFoot">
          <span className="shortcut">{t.shortcut}</span>
          <button className="primaryBtn" onClick={addClip} disabled={!draft.trim()}><Plus size={17} /> {t.save}</button>
        </div>
      </section>

      <section className="library">
        <div className="sectionHead">
          <div><h2>{t.myPocket}</h2><p>{t.clipCount(clips.length)}</p></div>
          <div className="tabs">
            <button className={filter === 'all' ? 'tab active' : 'tab'} onClick={() => setFilter('all')}><Archive size={15} /> {t.all}</button>
            <button className={filter === 'pinned' ? 'tab active' : 'tab'} onClick={() => setFilter('pinned')}><Bookmark size={15} /> {t.pinned}</button>
          </div>
        </div>

        <label className="searchBox"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search} /><kbd>⌕</kbd></label>

        {visible.length === 0 ? (
          <div className="empty glass">
            <div className="emptyIcon"><Clipboard size={25} /></div>
            <h3>{query ? t.noResults : filter === 'pinned' ? t.noPinned : t.empty}</h3>
            <p>{query ? t.trySearch : t.addFirst}</p>
          </div>
        ) : (
          <div className="clipGrid">
            {visible.map(clip => (
              <article className="clipCard glass" key={clip.id}>
                <div className="clipMeta">
                  <span className="typeTag">{clip.kind === 'link' ? <Link2 size={13} /> : <Clipboard size={13} />}{clip.kind === 'link' ? 'LINK' : 'TEXT'}</span>
                  <div className="cardActions">
                    <button className={clip.pinned ? 'iconBtn pinned' : 'iconBtn'} onClick={() => togglePin(clip.id)} aria-label={clip.pinned ? t.unpin : t.pin}><Bookmark size={16} fill={clip.pinned ? 'currentColor' : 'none'} /></button>
                    <button className="iconBtn danger" onClick={() => removeClip(clip.id)} aria-label={t.delete}><Trash2 size={16} /></button>
                  </div>
                </div>
                <p className="clipContent">{clip.content}</p>
                <div className="clipBottom">
                  <span>{new Date(clip.createdAt).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}</span>
                  <button className="copyBtn" onClick={() => copyClip(clip.content)}><Copy size={15} /> {t.copy}</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer><span className="footerMark">K</span><span>Kangaroo Pocket</span><span className="footerDot">·</span><span>{t.footer}</span></footer>
      {notice && <div className="toast"><Check size={16} />{notice}</div>}
    </main>
  );
}
