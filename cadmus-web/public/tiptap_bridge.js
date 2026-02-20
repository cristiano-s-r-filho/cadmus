window.CadmusEditor = {
    editors: new Map(),
    callbacks: new Map(),

    async init(elementId, content, onUpdate, attempt = 0) {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (!window.tiptap || !window.tiptap.Editor) {
            // If tiptap isn't global (which is true in the React version), 
            // this bridge might be legacy. 
            // In the React version, the editor is controlled by the EditorView component.
            // This script remains for backward compatibility if needed.
            console.log("Legacy Bridge: Tiptap not found globally, assuming React control.");
            return;
        }
    }
};
