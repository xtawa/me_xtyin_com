import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Badge } from './components/Badge';
import { SectionGroup } from './types';
import { 
  Globe,
  Twitter,
  Send,
  Github
} from 'lucide-react';

interface ProfileContent {
  name: string;
  headline: string;
  myself: string; // Supports raw HTML for links/formatting
  blog_url: string;
  siteTitle: string;
}

const DEFAULT_CONTENT: ProfileContent = {
  name: "Loading...",
  headline: "A homepage project made by Coisini Luo. -Turning ideas into reality,one pixel at one time.",
  myself: `
    <p>
       If you see this content,it means your Notion database or serverless deploy platforms' config file didn't work properly.Check the project's README file for more information.
    </p>
  `,
  blog_url: "",
  siteTitle: "Personal homepage"
};

const App: React.FC = () => {
  const [content, setContent] = useState<ProfileContent>(DEFAULT_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'blog' | 'photos'>('home');
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

  useEffect(() => {
    async function fetchPhotos() {
        try {
            const res = await fetch('/api/photos');
            if (res.ok) {
                const files = await res.json();
                setPhotos(files);
            }
        } catch (error) {
            console.error("Failed to fetch photos:", error);
        }
    }

    fetchProfile();
    fetchPhotos();
  }, [fetchProfile]);

  const handleNavigate = (view: string) => {
    if (view === 'home' || view === 'blog' || view === 'photos') {
      setCurrentView(view as 'home' | 'blog' | 'photos');
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
    <div className="min-h-screen text-neutral-300 selection:bg-[#3d4d42] selection:text-white font-sans bg-[#050505] overflow-hidden">
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
        <main className="relative max-w-screen-md mx-auto px-6 pt-32 pb-20 md:pt-40 md:px-0 overflow-y-auto h-screen no-scrollbar">
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
              className="space-y-6 text-neutral-400 leading-relaxed max-w-prose"
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

      {/* PHOTOS VIEW */}
      {currentView === 'photos' && (
        <main className="relative w-full h-screen overflow-hidden bg-black">
           {photos.length === 0 ? (
             <div className="flex items-center justify-center h-full text-neutral-500">
               No photos found in /photos directory.
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
                        {loopPhotos.map((photo, idx) => (
                           <div key={`${colIndex}-${idx}`} className="w-full aspect-square overflow-hidden rounded-lg bg-neutral-900 border border-neutral-800 hover:opacity-80 transition-opacity">
                              <img 
                                src={`/photos/${photo}`} 
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
