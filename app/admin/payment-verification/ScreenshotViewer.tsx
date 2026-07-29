"use client";

import { useState } from "react";
import Image from "next/image";

export default function ScreenshotViewer({ url }: { url: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs text-ink-black/60 hover:text-ink-black underline underline-offset-2 text-left"
      >
        View Screenshot
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative bg-warm-parchment p-2 max-w-4xl max-h-[90vh] flex flex-col rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2 px-2 pt-2">
              <h3 className="font-bold uppercase tracking-widest text-sm text-ink-black">Payment Proof</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-ink-black hover:text-thread-red transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="relative flex-1 overflow-auto bg-ivory-mist flex items-center justify-center p-4 border border-ink-black/20">
              <img 
                src={url}
                alt="Payment Screenshot"
                className="max-w-full max-h-[75vh] object-contain"
              />
            </div>
            
            <div className="flex justify-end p-2 mt-2">
              <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold uppercase tracking-widest bg-ink-black text-ivory-mist px-4 py-2 hover:bg-ink-black/80 transition-colors"
              >
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
