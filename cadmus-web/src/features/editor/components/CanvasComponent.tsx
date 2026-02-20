import { NodeViewWrapper } from '@tiptap/react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useState, useRef, memo } from 'react';

export const CanvasComponent = memo((props: any) => {
  const { node, updateAttributes, selected } = props;
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              updateAttributes({ src: ev.target?.result });
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <NodeViewWrapper className="my-8">
      <div 
        className={clsx(
            "relative group border-2 rounded-xl overflow-hidden transition-all duration-200",
            selected ? "border-accent shadow-hard" : "border-accent-border bg-mantle",
            !node.attrs.src && "h-64 flex items-center justify-center bg-base border-dashed"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {node.attrs.src ? (
            <>
                <img src={node.attrs.src} alt="Canvas" className="w-full h-auto object-cover" />
                {selected && (
                    <button 
                        onClick={() => updateAttributes({ src: null })}
                        className="absolute top-2 right-2 p-2 bg-crust text-terminal-red rounded-lg border border-terminal-red/20 shadow-lg hover:scale-110 transition-transform"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </>
        ) : (
            <div className="flex flex-col items-center gap-4 text-subtext">
                <div className="p-4 bg-crust rounded-full border border-accent-border group-hover:border-accent transition-colors">
                    <ImageIcon className="w-8 h-8 text-accent" />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold uppercase tracking-widest">Empty_Frame</span>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-accent hover:underline mt-2"
                    >
                        [UPLOAD_IMAGE]
                    </button>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleUpload}
                />
            </div>
        )}
      </div>

      <input
        className="w-full text-center bg-transparent text-xs font-mono font-bold text-subtext mt-2 outline-none focus:text-accent transition-colors uppercase tracking-widest placeholder:text-subtext/30"
        value={node.attrs.caption}
        onChange={(e) => updateAttributes({ caption: e.target.value })}
        placeholder="ENTER_CAPTION_HERE..."
      />
    </NodeViewWrapper>
  );
});
