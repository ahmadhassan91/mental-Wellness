import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProviderCard, Provider } from '../ProviderCard';
import { MantineProvider } from '@mantine/core';

const mockProvider: Provider = {
  id: '1',
  name: 'Dr. Sarah Mitchell',
  photoUrl: '/provider-1.jpg',
  specialties: ['Anxiety', 'Depression', 'CBT'],
  modalities: ['telehealth', 'in_person'],
  acceptingNew: true,
};

const renderWithMantine = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('ProviderCard', () => {
  it('should render provider name and specialties', () => {
    renderWithMantine(
      <ProviderCard provider={mockProvider} onRequestClick={() => {}} />
    );

    expect(screen.getByText('Dr. Sarah Mitchell')).toBeInTheDocument();
    expect(screen.getByText('Anxiety')).toBeInTheDocument();
    expect(screen.getByText('Depression')).toBeInTheDocument();
  });

  it('should show "Accepting new patients" when acceptingNew is true', () => {
    renderWithMantine(
      <ProviderCard provider={mockProvider} onRequestClick={() => {}} />
    );

    expect(screen.getByText('Accepting new patients')).toBeInTheDocument();
  });

  it('should show "Not accepting new patients" when acceptingNew is false', () => {
    const notAcceptingProvider = { ...mockProvider, acceptingNew: false };
    renderWithMantine(
      <ProviderCard provider={notAcceptingProvider} onRequestClick={() => {}} />
    );

    expect(screen.getByText('Not accepting new patients')).toBeInTheDocument();
  });

  it('should disable button when acceptingNew is false', () => {
    const notAcceptingProvider = { ...mockProvider, acceptingNew: false };
    renderWithMantine(
      <ProviderCard provider={notAcceptingProvider} onRequestClick={() => {}} />
    );

    const button = screen.getByRole('button', { name: /request on portal/i });
    expect(button).toBeDisabled();
  });

  it('should call onRequestClick when button clicked and accepting', () => {
    const handleClick = vi.fn();
    renderWithMantine(
      <ProviderCard provider={mockProvider} onRequestClick={handleClick} />
    );

    const button = screen.getByRole('button', { name: /request on portal/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledWith('1');
  });

  it('should display modality icons for telehealth and in-person', () => {
    renderWithMantine(
      <ProviderCard provider={mockProvider} onRequestClick={() => {}} />
    );

    expect(screen.getByText('Telehealth')).toBeInTheDocument();
    expect(screen.getByText('In-person')).toBeInTheDocument();
  });
});
