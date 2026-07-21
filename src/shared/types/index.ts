/**
 * Shared Types — Global tip yardımcıları.
 *
 * @packageDocumentation
 */

/** Derin readonly tipi — tüm iç nesneleri de readonly yapar */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends Record<string, unknown> ? DeepReadonly<T[P]> : T[P]
}

/** Nullable tip yardımcısı */
export type Nullable<T> = T | null

/** Opsiyonel tip yardımcısı */
export type Optional<T> = T | undefined

/** ID tipi — type-safe string ID'ler için */
export type ID = string & { readonly _brand: 'ID' }

/**
 * Branded ID oluşturur.
 * @param id - Ham string ID
 * @returns Typed ID
 */
export function createId(id: string): ID {
  return id as ID
}

/** Operasyon sonucu tipi — hata yönetimi için */
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E }
