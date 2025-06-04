/**
 * Component Tests - 100% Coverage
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AppLogo } from '@/components/shared/AppLogo'
import { PageTitle } from '@/components/shared/PageTitle'

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Presentation: () => <div data-testid="presentation-icon">Presentation</div>,
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('Components - 100% Coverage', () => {
  describe('AppLogo Component', () => {
    it('should render the logo text', () => {
      render(<AppLogo />)
      const logo = screen.getByText('HallHub')
      expect(logo).toBeInTheDocument()
    })

    it('should render the presentation icon', () => {
      render(<AppLogo />)
      const icon = screen.getByTestId('presentation-icon')
      expect(icon).toBeInTheDocument()
    })

    it('should render as a link', () => {
      render(<AppLogo />)
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/')
    })

    it('should have correct text styling', () => {
      render(<AppLogo />)
      const logo = screen.getByText('HallHub')
      expect(logo).toHaveClass('text-2xl', 'font-headline', 'font-semibold')
    })

    it('should have correct link styling', () => {
      render(<AppLogo />)
      const link = screen.getByRole('link')
      expect(link).toHaveClass('flex', 'items-center', 'gap-2', 'text-primary')
    })

    it('should render consistently', () => {
      const { rerender } = render(<AppLogo />)
      expect(screen.getByText('HallHub')).toBeInTheDocument()

      rerender(<AppLogo />)
      expect(screen.getByText('HallHub')).toBeInTheDocument()
    })
  })

  describe('PageTitle Component', () => {
    it('should render children correctly', () => {
      render(<PageTitle>Test Title</PageTitle>)
      const title = screen.getByText('Test Title')
      expect(title).toBeInTheDocument()
    })

    it('should render as h1 element', () => {
      render(<PageTitle>Test Title</PageTitle>)
      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Test Title')
    })

    it('should have correct default styling', () => {
      render(<PageTitle>Test Title</PageTitle>)
      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toHaveClass('text-3xl', 'font-headline', 'font-bold', 'text-foreground', 'mb-6')
    })

    it('should apply custom className', () => {
      render(<PageTitle className="custom-class">Test Title</PageTitle>)
      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toHaveClass('custom-class')
    })

    it('should render complex children', () => {
      render(
        <PageTitle>
          <span>Complex</span> <strong>Title</strong>
        </PageTitle>
      )

      expect(screen.getByText('Complex')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
    })

    it('should handle empty children', () => {
      render(<PageTitle>{''}</PageTitle>)
      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('')
    })

    it('should combine default and custom classes', () => {
      render(<PageTitle className="extra-margin">Test Title</PageTitle>)
      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toHaveClass('text-3xl', 'font-headline', 'font-bold', 'text-foreground', 'mb-6', 'extra-margin')
    })

    it('should handle special characters', () => {
      const specialTitle = "Test & Title with <special> characters"
      render(<PageTitle>{specialTitle}</PageTitle>)
      const title = screen.getByText(specialTitle)
      expect(title).toBeInTheDocument()
    })

    it('should handle long content', () => {
      const longTitle = "This is a very long title that might wrap to multiple lines in the UI and should still work correctly"
      render(<PageTitle>{longTitle}</PageTitle>)
      const title = screen.getByText(longTitle)
      expect(title).toBeInTheDocument()
    })

    it('should render consistently across re-renders', () => {
      const { rerender } = render(<PageTitle>Original Title</PageTitle>)
      expect(screen.getByText('Original Title')).toBeInTheDocument()

      rerender(<PageTitle>Updated Title</PageTitle>)
      expect(screen.getByText('Updated Title')).toBeInTheDocument()
      expect(screen.queryByText('Original Title')).not.toBeInTheDocument()
    })
  })
})
