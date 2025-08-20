export function focusElement(element: HTMLElement | null) {
    if (element) {
        requestAnimationFrame(() => {
            element.focus();
            const len = element.textContent?.length || 0;
            try {
                if ('setSelectionRange' in element) {
                    (element as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(len, len);
                } else if ('selectionStart' in element) {
                    (element as HTMLInputElement).selectionStart = len;
                    (element as HTMLInputElement).selectionEnd = len;
                }
            } catch {
                // noop if not supported
            }
        });
    }
}
