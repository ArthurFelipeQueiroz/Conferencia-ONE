export const DEFAULT_PUBLIC_APP_URL: string;
export function publicAppBase(value?: string): string;
export function mutationOriginAllowed(request: Request, publicUrl?: string): boolean;
export function withFrontend(request: Request, publicUrl: string | undefined, handle: () => Promise<Response>): Promise<Response>;
