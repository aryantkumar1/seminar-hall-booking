/**
 * Comprehensive tests for 100% coverage CI/CD pipeline
 */

import { cn } from '@/lib/utils'

describe('Utility Functions - 100% Coverage', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle single class name', () => {
      const result = cn('single-class')
      expect(result).toBe('single-class')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden')
      expect(result).toBe('base conditional')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid')
      expect(result).toBe('base valid')
    })

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2'])
      expect(result).toBe('class1 class2')
    })

    it('should handle object with boolean values', () => {
      const result = cn({
        'active': true,
        'inactive': false,
        'visible': true
      })
      expect(result).toContain('active')
      expect(result).toContain('visible')
      expect(result).not.toContain('inactive')
    })

    it('should merge conflicting tailwind classes', () => {
      const result = cn('p-4 p-2', 'bg-red-500 bg-blue-500')
      expect(result).toContain('p-2')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle complex nested conditions', () => {
      const isActive = true
      const isDisabled = false
      const variant = 'primary'

      const result = cn(
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled',
        variant === 'primary' && 'primary-variant',
        (variant as string) === 'secondary' && 'secondary-variant'
      )

      expect(result).toContain('base-class')
      expect(result).toContain('active')
      expect(result).toContain('primary-variant')
      expect(result).not.toContain('disabled')
      expect(result).not.toContain('secondary-variant')
    })

    it('should handle mixed input types', () => {
      const result = cn(
        'string-class',
        ['array-class1', 'array-class2'],
        { 'object-class': true, 'hidden-class': false },
        undefined,
        null,
        'final-class'
      )

      expect(result).toContain('string-class')
      expect(result).toContain('array-class1')
      expect(result).toContain('array-class2')
      expect(result).toContain('object-class')
      expect(result).toContain('final-class')
      expect(result).not.toContain('hidden-class')
    })
  })
})
