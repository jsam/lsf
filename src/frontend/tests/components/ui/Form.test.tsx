import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Form, { FormSection, FormActions } from '../../../src/components/ui/Form'

describe('Form', () => {
  it('renders children content', () => {
    render(
      <Form>
        <input placeholder="Test input" />
      </Form>
    )

    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument()
  })

  it('renders with title', () => {
    render(
      <Form title="Test Form">
        <input placeholder="Test input" />
      </Form>
    )

    expect(screen.getByText('Test Form')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Form')
  })

  it('renders with title and description', () => {
    render(
      <Form title="Test Form" description="Form description">
        <input placeholder="Test input" />
      </Form>
    )

    expect(screen.getByText('Test Form')).toBeInTheDocument()
    expect(screen.getByText('Form description')).toBeInTheDocument()
  })

  it('handles form submission', () => {
    const handleSubmit = vi.fn()
    render(
      <Form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </Form>
    )

    fireEvent.click(screen.getByText('Submit'))
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('prevents default form submission', () => {
    const handleSubmit = vi.fn()
    const { container } = render(
      <Form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </Form>
    )

    const form = container.querySelector('form')!
    const event = new Event('submit', { bubbles: true, cancelable: true })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

    fireEvent(form, event)
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('does not call onSubmit when loading', () => {
    const handleSubmit = vi.fn()
    render(
      <Form loading onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </Form>
    )

    fireEvent.click(screen.getByText('Submit'))
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('shows loading spinner when loading', () => {
    render(
      <Form loading>
        <input placeholder="Test input" />
      </Form>
    )

    expect(screen.getByText('Processing...')).toBeInTheDocument()
  })

  it('disables fieldset when loading', () => {
    render(
      <Form loading>
        <input placeholder="Test input" />
      </Form>
    )

    const fieldset = screen.getByRole('group')
    expect(fieldset).toBeDisabled()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Form className="custom-class">
        <input placeholder="Test input" />
      </Form>
    )

    const form = container.firstChild as HTMLElement
    expect(form).toHaveClass('custom-class')
  })

  it('has noValidate attribute', () => {
    const { container } = render(
      <Form>
        <input placeholder="Test input" />
      </Form>
    )

    const form = container.querySelector('form')!
    expect(form).toHaveAttribute('noValidate')
  })
})

describe('FormSection', () => {
  it('renders children content', () => {
    render(
      <FormSection>
        <input placeholder="Section input" />
      </FormSection>
    )

    expect(screen.getByPlaceholderText('Section input')).toBeInTheDocument()
  })

  it('renders with title', () => {
    render(
      <FormSection title="Section Title">
        <input placeholder="Section input" />
      </FormSection>
    )

    expect(screen.getByText('Section Title')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Section Title')
  })

  it('renders with title and description', () => {
    render(
      <FormSection title="Section Title" description="Section description">
        <input placeholder="Section input" />
      </FormSection>
    )

    expect(screen.getByText('Section Title')).toBeInTheDocument()
    expect(screen.getByText('Section description')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <FormSection className="custom-section">
        <input placeholder="Section input" />
      </FormSection>
    )

    const section = container.firstChild as HTMLElement
    expect(section).toHaveClass('custom-section')
  })
})

describe('FormActions', () => {
  it('renders children content', () => {
    render(
      <FormActions>
        <button>Action Button</button>
      </FormActions>
    )

    expect(screen.getByText('Action Button')).toBeInTheDocument()
  })

  it('applies right alignment by default', () => {
    const { container } = render(
      <FormActions>
        <button>Action Button</button>
      </FormActions>
    )

    const actions = container.firstChild as HTMLElement
    expect(actions).toHaveClass('justify-end')
  })

  it('applies left alignment', () => {
    const { container } = render(
      <FormActions align="left">
        <button>Action Button</button>
      </FormActions>
    )

    const actions = container.firstChild as HTMLElement
    expect(actions).toHaveClass('justify-start')
  })

  it('applies center alignment', () => {
    const { container } = render(
      <FormActions align="center">
        <button>Action Button</button>
      </FormActions>
    )

    const actions = container.firstChild as HTMLElement
    expect(actions).toHaveClass('justify-center')
  })

  it('applies custom className', () => {
    const { container } = render(
      <FormActions className="custom-actions">
        <button>Action Button</button>
      </FormActions>
    )

    const actions = container.firstChild as HTMLElement
    expect(actions).toHaveClass('custom-actions')
  })

  it('has border and flex layout', () => {
    const { container } = render(
      <FormActions>
        <button>Action Button</button>
      </FormActions>
    )

    const actions = container.firstChild as HTMLElement
    expect(actions).toHaveClass('flex', 'gap-3', 'pt-6', 'border-t', 'border-neutral-200')
  })
})