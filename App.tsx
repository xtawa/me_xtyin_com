import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Badge } from './components/Badge';
import { SectionGroup } from './types';
import { 
  Globe,
  Twitter,
  Send,
  Github,
  Folder,
  ArrowUpRight
} from 'lucide-react';

interface NotionProjectItem {
  text: string;
  description?: string;
  href?: string;
  icon?: {
    type: 'emoji' | 'image';
    value: string;
  };
  date?: string; // New field for Talks
}

interface ProfileContent {
  name: string;
  headline: string;
  myself: string; // Supports raw HTML for links/formatting
  blog_url: string;
  siteTitle: string;
  photosFile: string; // Semicolon separated URLs
  projects?: NotionProjectItem[]; // Dynamic projects from Notion
  talks?: NotionProjectItem[]; // Dynamic talks from Notion
}

const DEFAULT_CONTENT: ProfileContent = {
  name: "Loading...",
  headline: "A personal homepage project made by Coisini Luo.",
  myself: `<p class="mb-6">Turning ideas into reality. 当你看到此行时，说明页面加载缓慢或者你的数据库配置失败.参考本项目README文件获得进一步支持。</p>`,
  blog_url: "https://blog.xtyin.com",
  siteTitle: "Loading...",
  photosFile: "",
  projects: [],
  talks: []
};

const App: React.FC = () => {
  const [content, setContent] = useState<ProfileContent>(DEFAULT_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'blog' | 'photos' | 'projects' | 'talks'>('home');
  const [photos, setPhotos] = useState<string[]>([]);

  const fetchProfile = useCallback(async () => {
    try {
      console.log("Fetching profile data...");
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        console.log("Received profile data:", data);
        if (Object.keys(data).length > 0) {
          setContent(prev => ({
            ...prev,
            ...data,
          }));
        } else {
          console.warn("Received empty data object from API");
        }
      } else {
        console.error("API response not ok:", res.status, res.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch profile content:", error);
    } finally {
      // Small delay to ensure smooth transition
      setTimeout(() => setIsLoading(false), 500);
    }
  }, []);

  // Effect to update document title based on content
  useEffect(() => {
    document.title = content.siteTitle;
  }, [content.siteTitle]);

  // Parse photos from content.photosFile string (semicolon separated)
  useEffect(() => {
    if (content.photosFile) {
        const urls = content.photosFile
            .split(';')
            .map(url => url.trim())
            .filter(url => url.length > 0);
        setPhotos(urls);
    }
  }, [content.photosFile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleNavigate = (view: string) => {
    if (['home', 'blog', 'photos', 'projects', 'talks'].includes(view)) {
      setCurrentView(view as any);
      if (view !== 'photos') {
          window.scrollTo(0, 0);
      }
      
      // If navigating to blog, refresh data to ensure URL is up to date
      if (view === 'blog') {
        fetchProfile();
      }
    }
  };

  const sections: SectionGroup[] = [
    {
      label: "Core team of",
      items: [
        { text: "Ybhsoft Innovation", icon: Globe, colorClass: "text-blue-400", href: "https://team.xtyin.com" },
      ]
    },
    {
      label: "Learning",
      items: [
        { text: "Python", icon: "🐍", colorClass: "text-yellow-400" },
      ]
    },
    {
      label: "Available at",
      items: [
        { text: "GitHub", icon: Github, href: "https://github.com/xtawa" },
        { text: "X (Twitter)", icon: Twitter, href: "https://x.com/Coisini_Luo" },
        { text: "Telegram", icon: Send, colorClass: "text-sky-500", href: "https://t.me/Coisini_Luo" },
      ]
    },
  ];

  // Helper to chunk photos for columns
  const getColumns = (items: string[], count: number) => {
    const cols: string[][] = Array.from({ length: count }, () => []);
    items.forEach((item, idx) => {
        cols[idx % count].push(item);
    });
    return cols;
  };

  const photoColumns = getColumns(photos.length > 0 ? photos : [], 3);

  return (
    <div className={`min-h-screen text-neutral-300 selection:bg-[#3d4d42] selection:text-white font-sans bg-[#050505] ${currentView === 'photos' ? 'overflow-hidden' : ''}`}>
      <div className="fixed inset-0 bg-dot-pattern pointer-events-none opacity-20 h-screen" />

      {/* Preloader Overlay (Mac-style Startup) */}
      <div 
        className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-700 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="flex flex-col items-center gap-8">
           {/* Progress Bar Container */}
           <div className="w-[180px] h-[6px] bg-[#333] rounded-full overflow-hidden border border-[#333]">
              {/* Animated Fill Bar */}
              <div className="h-full bg-[#ccc] rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)] animate-mac-progress origin-left" />
           </div>
        </div>
      </div>
      
      <Navbar onNavigate={handleNavigate} />

      {/* HOME VIEW */}
      {currentView === 'home' && (
        <main className="relative max-w-screen-md mx-auto px-6 pt-32 pb-20 md:pt-40">
          <section className="mb-16 animate-fade-in-up">
            <h1 className={`text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight transition-opacity duration-500`}>
              {content.name}
            </h1>
            
            <p className="text-lg md:text-xl text-neutral-400 mb-8 leading-relaxed max-w-2xl">
              {content.headline}
            </p>

            <div className="space-y-4 mb-10">
              {sections.map((group, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                  <span className="text-neutral-500 w-28 shrink-0">{group.label}</span>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item, i) => (
                      <Badge key={i} {...item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div 
              className="
                space-y-6 text-neutral-400 leading-relaxed max-w-prose whitespace-pre-wrap break-words
                [&_a]:text-white [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-blue-400 [&_a]:transition-colors
                [&_b]:font-bold [&_b]:text-neutral-200
                [&_strong]:font-bold [&_strong]:text-neutral-200
                [&_i]:italic [&_em]:italic
                [&_u]:underline
              "
              dangerouslySetInnerHTML={{ __html: content.myself }}
            />
          </section>

          <hr className="border-neutral-800 mb-12" />

          <footer className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-neutral-500 gap-4 pb-12">
              <div className="flex gap-4">
                  <a href="#" className="hover:text-neutral-300 transition-colors">Creative Commons BY-NC-SA 4.0</a>
              </div>
              <div className="text-neutral-600">
                  2024 © {content.name}
              </div>
          </footer>
        </main>
      )}

      {/* BLOG VIEW */}
      {currentView === 'blog' && (
        <main className="relative w-full h-screen pt-24 px-4 pb-4 md:px-8 md:pb-8 flex flex-col items-center">
          <div className="w-full h-full max-w-[1400px] bg-neutral-900 rounded-xl border border-neutral-800 shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            <div className="h-10 bg-[#1e1e1e] border-b border-neutral-800 flex items-center px-4 justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 font-mono opacity-80 bg-neutral-800/50 px-3 py-1 rounded-md">
                 <span className="opacity-50">https://</span>
                 <span className="text-neutral-400">{content.blog_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
              </div>

              <div className="w-12" />
            </div>
            
            <iframe 
              key={content.blog_url}
              src={content.blog_url} 
              className="flex-1 w-full border-0 bg-neutral-900" 
              title="Blog"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </main>
      )}

      {/* PROJECTS VIEW */}
      {currentView === 'projects' && (
        <main className="relative max-w-screen-lg mx-auto px-6 pt-32 pb-20 md:pt-40 animate-fade-in-up">
           <h1 className="text-4xl font-bold text-white mb-8">Projects</h1>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
              {(!content.projects || content.projects.length === 0) ? (
                 <div className="text-neutral-500 col-span-2">
                   No projects found. Add items with "Tags" = "projects" in Notion.
                 </div>
              ) : (
                content.projects.map((item, idx) => {
                  const Wrapper = item.href ? 'a' : 'div';
                  const wrapperProps = item.href ? {
                     href: item.href,
                     target: item.href.startsWith('http') ? '_blank' : undefined,
                     rel: "noopener noreferrer"
                  } : {};

                  return (
                    <Wrapper 
                      key={idx} 
                      {...wrapperProps}
                      className={`block p-6 rounded-lg bg-neutral-900 border border-neutral-800 transition-colors group relative ${item.href ? 'hover:bg-neutral-800 cursor-pointer' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                          <div className="p-2 rounded bg-neutral-800 group-hover:bg-neutral-700 transition-colors text-neutral-400">
                            {item.icon ? (
                              item.icon.type === 'emoji' ? (
                                  <span className="text-xl leading-none">{item.icon.value}</span>
                              ) : (
                                  <img src={item.icon.value} alt="icon" className="w-6 h-6 object-contain" />
                              )
                            ) : (
                              <Folder size={24} />
                            )}
                          </div>
                          {item.href && (
                            <ArrowUpRight size={20} className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-200 mb-2">{item.text}</h3>
                      {item.description && (
                        <p className="text-neutral-500 text-sm line-clamp-2">
                            {item.description}
                        </p>
                      )}
                    </Wrapper>
                  );
                })
              )}
           </div>
        </main>
      )}

      {/* TALKS VIEW */}
      {currentView === 'talks' && (
        <main className="relative max-w-screen-lg mx-auto px-6 pt-32 pb-20 md:pt-40 animate-fade-in-up">
           <h1 className="text-4xl font-bold text-white mb-10">Talks</h1>
           <div className="flex flex-col gap-6 pb-20">
              {(!content.talks || content.talks.length === 0) ? (
                 <div className="text-neutral-500">
                   No talks found. Add items with "Tags" = "talks" in Notion.
                 </div>
              ) : (
                content.talks.map((item, idx) => (
                  <a 
                    key={idx} 
                    href={item.href || '#'} 
                    target={item.href?.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="block group"
                  >
                     <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
                        <div className="text-neutral-500 font-mono text-sm shrink-0 w-32 tabular-nums">
                            {item.date || 'Unknown Date'}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-medium text-neutral-200 group-hover:text-blue-400 transition-colors leading-snug mb-1">
                                {item.text}
                            </h3>
                            {item.description && (
                                <p className="text-neutral-500 text-sm">
                                    {item.description}
                                </p>
                            )}
                        </div>
                     </div>
                  </a>
                ))
              )}
           </div>
        </main>
      )}

      {/* PHOTOS VIEW */}
      {currentView === 'photos' && (
        <main className="relative w-full h-screen overflow-hidden bg-black">
           {photos.length === 0 ? (
             <div className="flex items-center justify-center h-full text-neutral-500">
               No photos configured. Add "photosFile" to Notion.
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full w-full max-w-[1600px] mx-auto px-4">
                {/* Render 3 columns with infinite scroll */}
                {photoColumns.map((colPhotos, colIndex) => {
                  // Duplicate photos to ensure seamless loop
                  const loopPhotos = [...colPhotos, ...colPhotos, ...colPhotos, ...colPhotos]; 
                  const animationClass = colIndex % 2 === 0 ? 'animate-scroll-up' : 'animate-scroll-down';
                  
                  return (
                    <div key={colIndex} className="relative h-full overflow-hidden mask-linear-fade">
                      <div className={`flex flex-col gap-4 w-full ${animationClass}`}>
                        {loopPhotos.map((photoUrl, idx) => (
                           <div key={`${colIndex}-${idx}`} className="w-full aspect-square overflow-hidden rounded-lg bg-neutral-900 border border-neutral-800 hover:opacity-80 transition-opacity">
                              <img 
                                src={photoUrl} 
                                alt="Gallery" 
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                           </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
             </div>
           )}
        </main>
      )}
    </div>
  );
};

export default App;