// Minimal ambient declarations for the host-provided modules. These are NOT
// bundled (see vite externals); the dashboard supplies them at runtime. The
// declarations exist only so the TypeScript build and the bundler resolve the
// bare specifiers.

declare module '@kirocrew/app-sdk' {
  export type AppApi = {
    raw: (path: string, init?: RequestInit) => Promise<Response>
    get: (path: string, init?: RequestInit) => Promise<any>
    post: (path: string, body?: any, init?: RequestInit) => Promise<any>
    put: (path: string, body?: any, init?: RequestInit) => Promise<any>
    patch: (path: string, body?: any, init?: RequestInit) => Promise<any>
    delete: (path: string, init?: RequestInit) => Promise<any>
    request: (path: string, init?: RequestInit) => Promise<any>
  }
  export function useAppApi(): AppApi
  export function useAppEvents(event: string, cb: (payload: any) => void): void
  export function useNotify(): (opts: { title: string; body?: string }) => void
  export function useAppInfo(): any
  export function useNavigate(): (route: string) => void
  export function useTheme(): any
  export function useNavBadge(): (count: number) => void
}

declare module '@kirocrew/app-sdk/ui' {
  import type { ComponentType, ReactNode } from 'react'
  type AnyProps = Record<string, any> & { children?: ReactNode }
  export const Card: ComponentType<AnyProps>
  export const CardTitle: ComponentType<AnyProps>
  export const Btn: ComponentType<AnyProps>
  export const SendBtn: ComponentType<AnyProps>
  export const Input: ComponentType<AnyProps>
  export const SearchInput: ComponentType<AnyProps>
  export const Badge: ComponentType<AnyProps>
  export const StatCard: ComponentType<AnyProps>
  export const Skeleton: ComponentType<AnyProps>
  export const EmptyState: ComponentType<AnyProps>
  export const PageHeader: ComponentType<AnyProps>
  export const Toggle: ComponentType<AnyProps>
  export const SegmentedControl: ComponentType<AnyProps>
  export const MarkdownRenderer: ComponentType<AnyProps>
  export const Modal: ComponentType<AnyProps>
  export const ErrorNotice: ComponentType<AnyProps>
}
